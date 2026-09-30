import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateJobUrl } from "@/utils/jobUrl";

const PLATFORMS = ["whatsapp", "telegram", "facebook", "instagram", "x", "linkedin"];

export async function POST(req: Request) {
  try {
    const { job_id, retry_platform } = await req.json();

    if (!job_id) return NextResponse.json({ error: "Missing job_id" }, { status: 400 });

    const { data: job, error: jobError } = await supabase.from("jobs").select("*").eq("id", job_id).single();
    if (jobError || !job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trappedintoarchitecture.com";
    const jobUrl = `${baseUrl}${generateJobUrl(job)}`;
    
    // Construct the text payload for the social posts
    const postText = `New Job Opportunity: ${job.position} at ${job.firm_name}\n\n📍 Location: ${job.city || 'Remote'}, ${job.state || ''}\n💼 Experience: ${Array.isArray(job.experience) ? job.experience.join(', ') : job.experience || 'Not specified'}\n\nApply now: ${jobUrl}\n\n#ArchitectureJobs #Hiring #${job.position.replace(/\s+/g, '')}`;

    const platformsToProcess = retry_platform ? [retry_platform] : PLATFORMS;

    const publishTasks = platformsToProcess.map(async (platform) => {
      const { data: existingLog } = await supabase.from("social_publishing_logs").select("*").eq("job_id", job_id).eq("platform", platform).maybeSingle();
      if (existingLog?.status === "published" && !retry_platform) return { platform, status: "skipped" };
      
      const { data: logRecord, error: upsertError } = await supabase.from("social_publishing_logs").upsert({
          id: existingLog?.id || undefined,
          job_id, platform, status: "publishing",
          attempt_count: (existingLog?.attempt_count || 0) + 1,
          updated_at: new Date().toISOString(),
      }, { onConflict: "job_id, platform" }).select().single();
      
      if (upsertError) throw upsertError;

      let success = false;
      let errorMsg = "";

      try {
        switch (platform) {
          case "x": {
            if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_ACCESS_TOKEN) throw new Error("Missing X/Twitter credentials.");
            
            // X (Twitter) API v2 Integration (simplified representation for OAuth 1.0a or OAuth 2.0 User Context)
            const xRes = await fetch("https://api.twitter.com/2/tweets", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${process.env.TWITTER_ACCESS_TOKEN}`, // Simplification for OAuth2 Bearer token
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ text: postText })
            });
            if (!xRes.ok) throw new Error(await xRes.text());
            success = true;
            break;
          }
          case "facebook": {
            const pageId = process.env.FACEBOOK_PAGE_ID;
            const token = process.env.FACEBOOK_ACCESS_TOKEN;
            if (!pageId || !token) throw new Error("Missing Facebook Page credentials.");
            
            // Facebook Graph API Integration
            const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: postText, link: jobUrl, access_token: token })
            });
            if (!fbRes.ok) throw new Error(await fbRes.text());
            success = true;
            break;
          }
          case "instagram": {
            const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID;
            const token = process.env.FACEBOOK_ACCESS_TOKEN;
            if (!igAccountId || !token) throw new Error("Missing Instagram credentials.");
            if (!job.image) throw new Error("Instagram requires an image URL.");
            
            // Instagram Graph API requires 2 steps: Create Container, then Publish
            const createContainer = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image_url: job.image, caption: postText, access_token: token })
            });
            if (!createContainer.ok) throw new Error(await createContainer.text());
            const { id: containerId } = await createContainer.json();
            
            const publishMedia = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media_publish`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ creation_id: containerId, access_token: token })
            });
            if (!publishMedia.ok) throw new Error(await publishMedia.text());
            success = true;
            break;
          }
          case "linkedin": {
            const urn = process.env.LINKEDIN_ORGANIZATION_URN || process.env.LINKEDIN_PERSON_URN;
            const token = process.env.LINKEDIN_ACCESS_TOKEN;
            if (!urn || !token) throw new Error("Missing LinkedIn credentials.");

            // LinkedIn Posts API (UGC)
            const liRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${token}`,
                "X-Restli-Protocol-Version": "2.0.0",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                author: `urn:li:organization:${urn}`,
                lifecycleState: "PUBLISHED",
                specificContent: {
                  "com.linkedin.ugc.ShareContent": {
                    shareCommentary: { text: postText },
                    shareMediaCategory: "ARTICLE",
                    media: [{ status: "READY", description: { text: job.position }, originalUrl: jobUrl, title: { text: `${job.position} at ${job.firm_name}` } }]
                  }
                },
                visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
              })
            });
            if (!liRes.ok) throw new Error(await liRes.text());
            success = true;
            break;
          }
          default:
            throw new Error("Platform API not implemented yet.");
        }
      } catch (err: any) {
        errorMsg = err.message;
      }

      await supabase.from("social_publishing_logs").update({
        status: success ? "published" : "failed",
        error_message: success ? null : errorMsg,
        updated_at: new Date().toISOString(),
      }).eq("id", logRecord.id);

      return { platform, status: success ? "published" : "failed", error: errorMsg };
    });

    const results = await Promise.allSettled(publishTasks);
    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("Publish Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}