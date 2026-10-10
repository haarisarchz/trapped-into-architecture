import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateJobUrl } from "@/utils/jobUrl";

const PLATFORMS = ["whatsapp", "telegram", "facebook", "instagram", "x", "linkedin"];


function generatePostText(jobs: any[], platform: string, jobUrl: string, company: any) {
  const firmName = jobs[0].firm_name || "Unknown Firm";
  const locParts = [jobs[0].area || jobs[0].neighborhood, jobs[0].city, jobs[0].state].filter(Boolean);
  const location = locParts.length > 0 ? locParts.join(", ") : "Remote / Not specified";

  let msg = `🏢 FIRM: ${firmName}\n📍 LOCATION: ${location}\n💼 POSITIONS:\n`;
  
  jobs.forEach((job, index) => {
    const exp = Array.isArray(job.experience) ? job.experience.join(', ') : job.experience;
    const expText = exp && String(exp).trim() && job.employment_type !== "Internship" && !job.position?.toLowerCase().includes("intern") ? ` (${exp})` : '';
    const prefix = jobs.length === 1 ? '1. ' : `${index + 1}. `;
    msg += `${prefix}${job.position}${expText}\n`;
  });

  if (platform === "whatsapp" || platform === "telegram") {
    msg += `\n🔗 For more details and to apply, visit:\n${jobUrl}`;
    return msg;
  }

  if (platform === "instagram") {
    msg += `\n🔗 For more details and to apply, visit the link in our bio!\n`;
  } else {
    msg += `\n🔗 For more details and to apply, visit:\n${jobUrl}\n`;
  }
  msg += `\n🌐 Visit www.trappedintoarchitecture.com for more job updates.\n\n`;

  const mainJob = jobs[0];
  const city = (mainJob.city || "Architecture").replace(/[^a-zA-Z0-9]/g, '');
  const rawPosition = mainJob.position || "Architecture";
  const isIntern = rawPosition.toLowerCase().includes("intern");
  const positionTag = isIntern ? "ArchitectureIntern" : "Architect";
  
  let tags = [];
  if (city) {
    tags.push(`#${city}Jobs`);
    tags.push(`#${city}${positionTag}Jobs`);
    tags.push(`#${positionTag}sIn${city}`);
  }
  tags.push(`#${positionTag}JobsIndia`);
  
  if (rawPosition.toLowerCase().includes("interior")) tags.push("#InteriorDesignJobs");
  if (rawPosition.toLowerCase().includes("civil")) tags.push("#CivilEngineeringJobs");
  
  msg += [...new Set(tags)].join(" ");
  return msg;
}

export async function POST(req: Request) {
  try {
    const { job_id, retry_platform } = await req.json();

    if (!job_id) return NextResponse.json({ error: "Missing job_id" }, { status: 400 });

    // 1. Fetch the trigger job
    const { data: triggerJob, error: jobError } = await supabase.from("jobs").select("*").eq("id", job_id).single();
    if (jobError || !triggerJob) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    // 2. Fetch all siblings in this exact batch (same firm, same posted_date, same image)
    let query = supabase.from("jobs").select("*")
      .eq("firm_name", triggerJob.firm_name);
    
    if (triggerJob.posted_date) query = query.eq("posted_date", triggerJob.posted_date);
    else query = query.is("posted_date", null);

    if (triggerJob.image) query = query.eq("image", triggerJob.image);

    const { data: siblings } = await query;
    const batchJobs = siblings && siblings.length > 0 ? siblings : [triggerJob];

    // 3. Fetch company data to get the social media usernames/handles
    let companyData = null;
    if (batchJobs[0].company_id) {
      const { data: comp } = await supabase.from("companies").select("*").eq("id", batchJobs[0].company_id).maybeSingle();
      companyData = comp;
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trappedintoarchitecture.com";
    // For the URL, link to the first job (which displays company info anyway)
    const jobUrl = `${baseUrl}${generateJobUrl(batchJobs[0])}`;

    const platformsToProcess = retry_platform ? [retry_platform] : PLATFORMS;

    const publishTasks = platformsToProcess.map(async (platform) => {
      // Check if this batch has already been published on this platform
      let existingLog = null;
      try {
        const { data, error } = await supabase
          .from("social_publishing_logs")
          .select("*")
          .eq("job_id", triggerJob.id)
          .eq("platform", platform)
          .maybeSingle();
        if (error && error.code !== "PGRST205") console.warn(error);
        if (data) existingLog = data;
      } catch (err) {}

      if (existingLog?.status === "published" && !retry_platform) {
        return { platform, status: "skipped", reason: "Already published for this batch" };
      }
      
      try {
        const { error: upsertError } = await supabase.from("social_publishing_logs").upsert({
            id: existingLog?.id || undefined,
            job_id: triggerJob.id,
            platform,
            status: "publishing",
            attempt_count: (existingLog?.attempt_count || 0) + 1,
            updated_at: new Date().toISOString(),
        }, { onConflict: "job_id, platform" });
        if (upsertError && upsertError.code !== "PGRST205") console.warn(upsertError);
      } catch(err) {}

      let success = false;
      let errorMsg = "";

      try {
        // Generate the post text, passing the companyData so it can pull the username handle
        const postText = generatePostText(batchJobs, platform, jobUrl, companyData);

        switch (platform) {
          case "x": {
            if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_ACCESS_TOKEN) throw new Error("Missing X/Twitter credentials.");
            const xRes = await fetch("https://api.twitter.com/2/tweets", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${process.env.TWITTER_ACCESS_TOKEN}`,
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
            if (!pageId || !token) throw new Error("Missing Facebook credentials.");
            
            let fbMessage = postText;
            if (companyData && companyData.facebook) {
              let fbHandle = companyData.facebook.trim().split("?")[0].replace(/^@/, '');
              if (fbHandle.includes("/")) {
                const parts = fbHandle.split("/").filter(Boolean);
                fbHandle = parts[parts.length - 1];
              }
              if (fbHandle) {
                fbMessage += `\n\nDesign Firm: @${fbHandle}`;
              }
            }
            
            const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: fbMessage, link: jobUrl, access_token: token })
            });
            if (!fbRes.ok) throw new Error(await fbRes.text());
            success = true;
            break;
          }
          case "instagram": {
            const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID;
            const token = process.env.FACEBOOK_ACCESS_TOKEN;
            if (!igAccountId || !token) throw new Error("Missing Instagram credentials.");
            if (!triggerJob.image) throw new Error("Instagram requires an image URL.");
            
            let igCaption = postText;
            if (companyData && companyData.instagram) {
              let igHandle = companyData.instagram.trim().split("?")[0].replace(/^@/, '');
              if (igHandle.includes("/")) {
                const parts = igHandle.split("/").filter(Boolean);
                igHandle = parts[parts.length - 1];
              }
              if (igHandle) {
                igCaption += `\n\nDesign Firm: @${igHandle}`;
              }
            }

            const createContainer = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image_url: triggerJob.image, caption: igCaption, access_token: token })
            });
            if (!createContainer.ok) throw new Error(await createContainer.text());
            const { id: containerId } = await createContainer.json();
            
            // Wait 8 seconds before publishing to prevent Meta's "Media ID is not available" (9007) error for large images
            await new Promise(r => setTimeout(r, 8000));
            
            let publishMedia = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media_publish`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ creation_id: containerId, access_token: token })
            });
            
            // If it still fails with 9007, try one more time after 5 seconds
            if (!publishMedia.ok) {
              const errText = await publishMedia.text();
              if (errText.includes("9007")) {
                await new Promise(r => setTimeout(r, 5000));
                publishMedia = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media_publish`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ creation_id: containerId, access_token: token })
                });
                if (!publishMedia.ok) throw new Error(await publishMedia.text());
              } else {
                throw new Error(errText);
              }
            }
            if (!publishMedia.ok) throw new Error(await publishMedia.text());
            success = true;
            break;
          }
          case "linkedin": {
            const urn = process.env.LINKEDIN_ORGANIZATION_URN || process.env.LINKEDIN_PERSON_URN;
            const token = process.env.LINKEDIN_ACCESS_TOKEN;
            if (!urn || !token) throw new Error("Missing LinkedIn credentials.");

            const titleText = batchJobs.length === 1 
              ? `${batchJobs[0].position} at ${batchJobs[0].firm_name}` 
              : `Multiple Roles at ${batchJobs[0].firm_name}`;

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
                    media: [{ status: "READY", description: { text: titleText }, originalUrl: jobUrl, title: { text: titleText } }]
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
        console.error(`Meta API Error for ${platform}:`, err.message);
      }

      await supabase.from("social_publishing_logs").update({
        status: success ? "published" : "failed",
        error_message: success ? null : errorMsg,
        updated_at: new Date().toISOString(),
      }).eq("job_id", triggerJob.id).eq("platform", platform);

      // Important: Mark ALL siblings as published for this platform to prevent duplicate cron triggers
      if (success && batchJobs.length > 1) {
        const siblingLogs = batchJobs.map(job => ({
          job_id: job.id,
          platform,
          status: "published",
          attempt_count: 1,
          updated_at: new Date().toISOString()
        }));
        try { await supabase.from("social_publishing_logs").upsert(siblingLogs, { onConflict: "job_id, platform" }); } catch(err) {}
      }

      return { platform, status: success ? "published" : "failed", error: errorMsg };
    });

    const results = await Promise.allSettled(publishTasks);
    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("Publish Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}