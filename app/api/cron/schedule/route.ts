import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    // Check Authorization header for Vercel Cron Secret (if configured)
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all scheduled jobs whose posted_date is past or now
    const now = new Date().toISOString();
    const { data: scheduledJobs, error } = await supabase
      .from("jobs")
      .select("id, posted_date, status, firm_name, image, scheduled_at")
      .eq("status", "scheduled")
      .lte("posted_date", now);

    if (error) {
      console.error("Error fetching scheduled jobs:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!scheduledJobs || scheduledJobs.length === 0) {
      return NextResponse.json({ message: "No scheduled jobs to publish at this time." });
    }

    // 1. Bulk update status to published for all due jobs
    const allIds = scheduledJobs.map((j) => j.id);
    const { error: updateError } = await supabase
      .from("jobs")
      .update({ status: "published" })
      .in("id", allIds);

    if (updateError) {
      console.error("Failed to update status for scheduled jobs:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 2. Group jobs into distinct batches (same firm, same image, same posted_date)
    // Multi-position flyers share the same flyer image, firm, and schedule date.
    // They must be published to social media as a single grouped post, never once per position!
    const batchMap = new Map<string, any[]>();
    for (const job of scheduledJobs) {
      const normFirm = (job.firm_name || "").trim().toLowerCase();
      const normImg = (job.image || "").trim();
      const normDate = (job.posted_date || "").trim();
      const batchKey = `${normFirm}___${normImg}___${normDate}`;

      if (!batchMap.has(batchKey)) {
        batchMap.set(batchKey, []);
      }
      batchMap.get(batchKey)!.push(job);
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trappedintoarchitecture.com";
    const triggeredBatchJobIds: string[] = [];

    // 3. Trigger social publish EXACTLY ONCE per batch
    for (const [batchKey, batchJobs] of batchMap.entries()) {
      // Check if any job in this batch was already marked as published
      const alreadyPublished = batchJobs.some((j) => j.scheduled_at !== null);
      if (alreadyPublished) {
        console.log(`Cron: Batch ${batchKey} was already published to social media. Skipping.`);
        continue;
      }

      const triggerJobId = batchJobs[0].id;
      triggeredBatchJobIds.push(triggerJobId);

      try {
        await fetch(`${baseUrl}/api/publish/social`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_id: triggerJobId }),
        });
      } catch (fetchErr) {
        console.error(`Failed to trigger social publish for batch ${batchKey} (job ${triggerJobId}):`, fetchErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully published ${allIds.length} job(s) across ${batchMap.size} distinct batch(es). Triggered ${triggeredBatchJobIds.length} social post(s).`,
      published_jobs: allIds,
      triggered_batch_job_ids: triggeredBatchJobIds
    });
  } catch (err: any) {
    console.error("Cron Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}