import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateJobUrl } from "@/utils/jobUrl";

// List of platforms to attempt publishing on
const PLATFORMS = ["whatsapp", "telegram", "facebook", "instagram", "x", "linkedin"];

export async function POST(req: Request) {
  try {
    const { job_id, retry_platform } = await req.json();

    if (!job_id) {
      return NextResponse.json({ error: "Missing job_id" }, { status: 400 });
    }

    // 1. Fetch the job details
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", job_id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Determine platforms to process
    const platformsToProcess = retry_platform ? [retry_platform] : PLATFORMS;

    // 2. Fetch or create publishing records for this job
    for (const platform of platformsToProcess) {
      // Check if already published successfully
      const { data: existingLog } = await supabase
        .from("social_publishing_logs")
        .select("*")
        .eq("job_id", job_id)
        .eq("platform", platform)
        .maybeSingle();

      if (existingLog && existingLog.status === "published" && !retry_platform) {
        continue; // Skip already published platforms unless explicitly retrying (though we shouldn't retry published ones anyway)
      }

      if (existingLog && existingLog.status === "published" && retry_platform) {
        return NextResponse.json({ error: "Platform already published successfully." }, { status: 400 });
      }

      // Upsert tracking log indicating we are attempting
      const { data: logRecord, error: upsertError } = await supabase
        .from("social_publishing_logs")
        .upsert(
          {
            id: existingLog?.id || undefined,
            job_id,
            platform,
            status: "publishing",
            attempt_count: (existingLog?.attempt_count || 0) + 1,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "job_id, platform" }
        )
        .select()
        .single();

      if (upsertError) {
        console.error(`Failed to upsert log for ${platform}:`, upsertError);
        continue;
      }

      // 3. ATTEMPT PUBLISHING TO PLATFORM (MOCKED GRACEFULLY)
      // Since no API credentials exist in .env.local, we safely fail with "Not Configured"
      // Wait to simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const isConfigured = false; // Check specific env variables here if they existed (e.g. process.env.TWITTER_API_KEY)

      if (!isConfigured) {
        await supabase
          .from("social_publishing_logs")
          .update({
            status: "not_configured",
            error_message: `Missing official API credentials for ${platform}.`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", logRecord.id);
      } else {
        // ACTUAL API LOGIC WOULD GO HERE
        // For example:
        // if (platform === 'whatsapp') { const res = await fetch(...) }
      }
    }

    return NextResponse.json({ success: true, message: "Social publishing completed (or skipped missing credentials)." });
  } catch (err: any) {
    console.error("Social Publish Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
