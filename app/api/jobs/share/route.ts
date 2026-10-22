import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { jobId, userId, userName, userEmail, userRole, platform } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    // 1. Log real-time share event to job_shares
    try {
      await supabase.from("job_shares").insert({
        job_id: jobId,
        user_id: userId || null,
        user_name: userName || null,
        user_email: userEmail || null,
        user_role: userRole || "guest",
        platform: platform || "whatsapp",
      });
    } catch (logErr) {
      console.warn("Failed to log in job_shares table:", logErr);
    }

    // 2. Try RPC increment_share_count in case it exists in database
    const { error: rpcErr } = await supabase.rpc("increment_share_count", { job_id: jobId });

    // 3. Fallback to direct update if RPC is missing or fails
    if (rpcErr) {
      const { data: job, error: fetchErr } = await supabase
        .from("jobs")
        .select("share_count")
        .eq("id", jobId)
        .single();

      if (!fetchErr && job) {
        const nextCount = (job.share_count || 0) + 1;
        await supabase
          .from("jobs")
          .update({ share_count: nextCount })
          .eq("id", jobId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating share count:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
