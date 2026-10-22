import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateJobUrl } from "@/utils/jobUrl";
import { generateSocialHashtags } from "@/utils/socialHashtags";
import { formatWhatsAppPost, formatInstagramCaption, sanitizeInstagramHandle } from "@/utils/socialFormats";

const PLATFORMS = ["whatsapp", "telegram", "facebook", "instagram", "instagram_story", "x", "linkedin"];

async function generatePostText(jobs: any[], platform: string, jobUrl: string, company: any) {
  if (platform === "instagram_story") {
    return "";
  }
  if (platform === "whatsapp" || platform === "telegram") {
    return formatWhatsAppPost(jobs, jobUrl);
  }

  if (platform === "instagram") {
    const igTags = await generateSocialHashtags(jobs, "instagram", company);
    return formatInstagramCaption(jobs, igTags, company?.instagram);
  }

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

  msg += `\n🔗 For more details and to apply, visit:\n${jobUrl}\n`;
  msg += `\n🌐 Visit www.trappedintoarchitecture.com for more job updates.\n\n`;

  const tags = await generateSocialHashtags(jobs, platform, company);
  msg += tags.join(" ");
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
    const batchIds = batchJobs.map(j => j.id);

    // 3. Batch-level deduplication check
    // Multi-position jobs share the same flyer image and firm. 
    // If not a manual retry, check if ANY job in this batch was already published to social media.
    const alreadyPublishedJob = batchJobs.find(j => j.scheduled_at !== null);
    if (!retry_platform && alreadyPublishedJob) {
      console.log(`Social Publish: Batch for job ${triggerJob.id} (${triggerJob.firm_name}) already published at ${alreadyPublishedJob.scheduled_at}. Skipping.`);
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Batch already published to social media.",
        published_at: alreadyPublishedJob.scheduled_at,
        batch_ids: batchIds
      });
    }

    // 4. Fetch company data to get the social media usernames/handles
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
      // Check if ANY job in this batch has already been published on this platform
      let existingLog = null;
      try {
        const { data, error } = await supabase
          .from("social_publishing_logs")
          .select("*")
          .in("job_id", batchIds)
          .eq("platform", platform)
          .eq("status", "published")
          .limit(1);
        if (error && error.code !== "PGRST205") console.warn(error);
        if (data && data.length > 0) existingLog = data[0];
      } catch (err) {}

      if (existingLog && !retry_platform) {
        return { platform, status: "skipped", reason: "Already published for this batch" };
      }
      
      try {
        const { error: upsertError } = await supabase.from("social_publishing_logs").upsert({
            job_id: triggerJob.id,
            platform,
            status: "publishing",
            attempt_count: 1,
            updated_at: new Date().toISOString(),
        }, { onConflict: "job_id, platform" });
        if (upsertError && upsertError.code !== "PGRST205") console.warn(upsertError);
      } catch(err) {}

      let success = false;
      let errorMsg = "";

      try {
        // Generate the post text, passing the companyData so it can pull the username handle
        const postText = await generatePostText(batchJobs, platform, jobUrl, companyData);

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
            
            const igCaption = postText;

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
          case "instagram_story": {
            const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID;
            const token = process.env.FACEBOOK_ACCESS_TOKEN;
            if (!igAccountId || !token) throw new Error("Missing Instagram credentials.");
            if (!triggerJob.image) throw new Error("Instagram Story requires an image URL.");

            const storyPayload: any = {
              image_url: triggerJob.image,
              media_type: "STORIES",
              access_token: token
            };

            // If the hiring company has an Instagram handle, tag them in the story!
            // This triggers an IG notification/DM to the firm so they can easily reshare to their followers.
            if (companyData && companyData.instagram) {
              const cleanHandle = sanitizeInstagramHandle(companyData.instagram);
              if (cleanHandle) {
                storyPayload.user_tags = JSON.stringify([
                  {
                    username: cleanHandle,
                    x: 0.5,
                    y: 0.85
                  }
                ]);
              }
            }

            let createContainer = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(storyPayload)
            });

            // If creation failed with user_tags (e.g. handle doesn't exist on Meta), retry once without user_tags
            if (!createContainer.ok && storyPayload.user_tags) {
              console.warn("Retrying story creation without user_tags...");
              delete storyPayload.user_tags;
              createContainer = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(storyPayload)
              });
            }

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
          case "telegram": {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            if (!botToken) throw new Error("Missing TELEGRAM_BOT_TOKEN.");

            // 1. Target Channels Configuration:
            // - Main Channel: Always receives every job (All India / Architecture & Interior Design)
            // - State Channels: Specific to the job's state/location
            const mainChannel = process.env.TELEGRAM_MAIN_CHANNEL_ID || process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_CHAT_ID;
            const tnChannel = process.env.TELEGRAM_TN_CHANNEL_ID;
            const klChannel = process.env.TELEGRAM_KL_CHANNEL_ID;
            const kaChannel = process.env.TELEGRAM_KA_CHANNEL_ID;
            const apTsChannel = process.env.TELEGRAM_AP_TS_CHANNEL_ID;

            // Combine location text across all jobs in batch for state matching
            const locText = batchJobs.map(j => `${j.state || ""} ${j.city || ""} ${j.area || ""} ${j.neighborhood || ""}`).join(" ").toLowerCase();

            const isTN = /tamil\s*nadu|\btn\b|chennai|coimbatore|madurai|trichy|tiruchirappalli|salem|tiruppur|erode|vellore|tirunelveli|thoothukudi|tuticorin|dindigul|thanjavur|ranipet|sivakasi|karur|hosur|nagercoil|kanchipuram|kumarakonam|karaikudi|neyveli|cuddalore|tiruvannamalai|pollachi|rajapalayam|pudukkottai/i.test(locText);

            const isKL = /kerala|\bkl\b|kochi|cochin|ernakulam|thiruvananthapuram|trivandrum|kozhikode|calicut|thrissur|kollam|palakkad|alappuzha|alleppey|kannur|kottayam|malappuram|manjeri|thalassery|kasaragod|pathanamthitta|idukki|wayanad/i.test(locText);

            const isKA = /karnataka|\bka\b|bengaluru|bangalore|mysuru|mysore|mangaluru|mangalore|hubballi|hubli|belagavi|belgaum|kalaburagi|gulbarga|dharwad|udupi|bellary|ballari|shimoga|shivamogga|tumakuru|tumkur|davangere|hassan|bidar|hospet|manipal/i.test(locText);

            const isAP_TS = /andhra|telangana|\bap\b|\bts\b|hyderabad|secunderabad|visakhapatnam|vizag|vijayawada|guntur|warangal|nellore|kurnool|rajahmundry|tirupati|kakinada|kadapa|anantapur|nizamabad|karimnagar|khammam|ramagundam|mahbubnagar|nalgonda|eluru|ongole|amaravati/i.test(locText);

            const targets: { id: string; name: string; tag: string }[] = [];
            if (mainChannel) targets.push({ id: mainChannel, name: "Main Channel", tag: "main" });
            if (tnChannel && isTN) targets.push({ id: tnChannel, name: "Tamil Nadu", tag: "tamil_nadu" });
            if (klChannel && isKL) targets.push({ id: klChannel, name: "Kerala", tag: "kerala" });
            if (kaChannel && isKA) targets.push({ id: kaChannel, name: "Karnataka", tag: "karnataka" });
            if (apTsChannel && isAP_TS) targets.push({ id: apTsChannel, name: "Andhra & Telangana", tag: "ap_telangana" });

            if (targets.length === 0) {
              throw new Error("No Telegram target channels configured or matched for this job.");
            }

            // Format Telegram HTML Base Message
            const firmName = batchJobs[0].firm_name || "Unknown Firm";
            const locParts = [batchJobs[0].area || batchJobs[0].neighborhood, batchJobs[0].city, batchJobs[0].state].filter(Boolean);
            const location = locParts.length > 0 ? locParts.join(", ") : "Remote / Not specified";

            let baseTeleMsg = `🏛️ <b>HIRING: ${batchJobs.length === 1 ? batchJobs[0].position : 'Multiple Positions'}</b>\n\n`;
            baseTeleMsg += `🏢 <b>Firm:</b> ${firmName}\n`;
            baseTeleMsg += `📍 <b>Location:</b> ${location}\n\n`;
            baseTeleMsg += `💼 <b>Positions:</b>\n`;

            batchJobs.forEach((job, index) => {
              const exp = Array.isArray(job.experience) ? job.experience.join(', ') : job.experience;
              const expText = exp && String(exp).trim() && job.employment_type !== "Internship" && !job.position?.toLowerCase().includes("intern") ? ` (${exp})` : '';
              const prefix = batchJobs.length === 1 ? '• ' : `${index + 1}. `;
              baseTeleMsg += `${prefix}<b>${job.position || 'Position'}</b>${expText}\n`;
            });

            if (batchJobs[0].salary && String(batchJobs[0].salary).toLowerCase() !== "not disclosed") {
              baseTeleMsg += `\n💰 <b>Compensation:</b> ${batchJobs[0].salary}\n`;
            }

            const teleTags = await generateSocialHashtags(batchJobs, "telegram", companyData);

            // Broadcast to each matched target channel
            const channelResults: string[] = [];
            for (const target of targets) {
              const teleJobUrl = jobUrl.includes("?") 
                ? `${jobUrl}&utm_source=telegram&utm_medium=${target.tag}` 
                : `${jobUrl}?utm_source=telegram&utm_medium=${target.tag}`;

              let channelMsg = `${baseTeleMsg}\n🔗 <b>Direct Link:</b> <a href="${teleJobUrl}">Apply on Website</a>\n`;
              if (teleTags && teleTags.length > 0) {
                channelMsg += `\n${teleTags.slice(0, 5).join(" ")}\n`;
              }

              const inlineKeyboard = {
                inline_keyboard: [
                  [
                    { text: "🚀 View & Apply Now", url: teleJobUrl }
                  ]
                ]
              };

              try {
                if (triggerJob.image) {
                  // Telegram photo captions are limited to 1024 chars
                  const caption = channelMsg.length > 1020 ? channelMsg.slice(0, 1017) + "..." : channelMsg;
                  const teleRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      chat_id: target.id,
                      photo: triggerJob.image,
                      caption,
                      parse_mode: "HTML",
                      reply_markup: inlineKeyboard
                    })
                  });
                  if (!teleRes.ok) {
                    const errText = await teleRes.text();
                    console.error(`Telegram publish error to ${target.name} (${target.id}):`, errText);
                    channelResults.push(`${target.name}: Failed (${errText})`);
                  } else {
                    channelResults.push(`${target.name}: Success`);
                  }
                } else {
                  const teleRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      chat_id: target.id,
                      text: channelMsg,
                      parse_mode: "HTML",
                      reply_markup: inlineKeyboard
                    })
                  });
                  if (!teleRes.ok) {
                    const errText = await teleRes.text();
                    console.error(`Telegram publish error to ${target.name} (${target.id}):`, errText);
                    channelResults.push(`${target.name}: Failed (${errText})`);
                  } else {
                    channelResults.push(`${target.name}: Success`);
                  }
                }
              } catch (targetErr: any) {
                console.error(`Telegram error to ${target.name}:`, targetErr);
                channelResults.push(`${target.name}: ${targetErr.message}`);
              }
            }

            const anySuccess = channelResults.some(r => r.includes("Success"));
            if (!anySuccess) {
              throw new Error(`Telegram broadcast failed across all channels: ${channelResults.join("; ")}`);
            }

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

      try {
        await supabase.from("social_publishing_logs").update({
          status: success ? "published" : "failed",
          error_message: success ? null : errorMsg,
          updated_at: new Date().toISOString(),
        }).eq("job_id", triggerJob.id).eq("platform", platform);
      } catch (err) {}

      // Mark ALL siblings as published for this platform in social_publishing_logs
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

    // If at least one platform succeeded, update scheduled_at across ALL jobs in this batch
    // This acts as a permanent, infallible deduplication mark in the jobs table
    const anySuccess = results.some(r => r.status === "fulfilled" && (r.value as any)?.status === "published");
    if (anySuccess) {
      const nowIso = new Date().toISOString();
      await supabase
        .from("jobs")
        .update({ scheduled_at: nowIso })
        .in("id", batchIds);
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("Publish Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}