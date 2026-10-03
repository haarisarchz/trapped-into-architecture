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
      .select("id, posted_date, status")
      .eq("status", "scheduled")
      .lte("posted_date", now);

    if (error) {
      console.error("Error fetching scheduled jobs:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!scheduledJobs || scheduledJobs.length === 0) {
      return NextResponse.json({ message: "No scheduled jobs to publish at this time." });
    }

    const publishedIds = [];

    // Process each job
    for (const job of scheduledJobs) {
      // Update status to published
      const { error: updateError } = await supabase
        .from("jobs")
        .update({ status: "published" })
        .eq("id", job.id);

      if (updateError) {
        console.error(`Failed to publish job ${job.id}:`, updateError);
        continue;
      }
      
      publishedIds.push(job.id);

      // Trigger social publishing
      // We do a fire-and-forget or await depending on requirements.
      // Doing await fetch to our own endpoint to keep logic centralized.
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trappedintoarchitecture.com";
        await fetch(`${baseUrl}/api/publish/social`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_id: job.id })
        });
      } catch (fetchErr) {
        console.error(`Failed to trigger social publish for ${job.id}:`, fetchErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully published ${publishedIds.length} jobs.`,
      published_jobs: publishedIds
    });
  } catch (err: any) {
    console.error("Cron Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}