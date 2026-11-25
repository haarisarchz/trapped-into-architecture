import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    // Check Authorization header for Vercel Cron Secret (if configured)
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all scheduled jobs whose posted_date is past or now
    const now = new Date().toISOString();
    const { data: scheduledJobs, error } = await supabaseAdmin
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

    // 1. Bulk update status to published and record scheduled_at for all due jobs
    const allIds = scheduledJobs.map((j) => j.id);
    const { data: updatedRows, error: updateError } = await supabaseAdmin
      .from("jobs")
      .update({ 
        status: "published",
        scheduled_at: now
      })
      .in("id", allIds)
      .select("id");

    if (updateError) {
      console.error("Failed to update status for scheduled jobs:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // CRITICAL SAFEGUARD: Verify that database rows were actually updated.
    // If Supabase RLS blocked the update, abort immediately to prevent infinite duplicate publishing loops!
    if (!updatedRows || updatedRows.length === 0) {
      console.error("CRITICAL: Failed to transition scheduled jobs to 'published' (0 rows updated). Aborting social publish to prevent duplicate loop.");
      return NextResponse.json({
        error: "Database RLS prevented updating job status to 'published'. Publishing aborted to prevent duplicate posts.",
        scheduled_job_ids: allIds
      }, { status: 500 });
    }

    const successfullyUpdatedIds = new Set(updatedRows.map(r => r.id));
    const eligibleJobs = scheduledJobs.filter(j => successfullyUpdatedIds.has(j.id));

    // 2. Group jobs into distinct batches (same firm, same image, same posted_date)
    // Multi-position flyers share the same flyer image, firm, and schedule date.
    // They must be published to social media as a single grouped post, never once per position!
    const batchMap = new Map<string, any[]>();
    for (const job of eligibleJobs) {
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

      // Trigger company email notification for the published batch
      try {
        await fetch(`${baseUrl}/api/notify/company-job-published`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_id: triggerJobId }),
        });
      } catch (notifyErr) {
        console.error(`Failed to trigger company notification for job ${triggerJobId}:`, notifyErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully published ${updatedRows.length} job(s) across ${batchMap.size} distinct batch(es). Triggered ${triggeredBatchJobIds.length} social post(s).`,
      published_jobs: updatedRows.map(r => r.id),
      triggered_batch_job_ids: triggeredBatchJobIds
    });
  } catch (err: any) {
    console.error("Cron Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
