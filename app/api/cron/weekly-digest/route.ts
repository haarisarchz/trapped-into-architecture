import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function GET(req: Request) {
  return handleWeeklyDigest(req);
}

export async function POST(req: Request) {
  return handleWeeklyDigest(req);
}

async function handleWeeklyDigest(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get("authorization");

    // Check Authorization header if CRON_SECRET is configured
    if (process.env.CRON_SECRET && authHeader && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testEmail = searchParams.get("test_email")?.trim();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trappedintoarchitecture.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Trapped Into Architecture <onboarding@resend.dev>";

    if (!resend) {
      return NextResponse.json({
        error: "RESEND_API_KEY is not configured.",
      }, { status: 500 });
    }

    // 1. Fetch recent jobs posted in the last 7 days (or top 8 most recent if few)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysIso = sevenDaysAgo.toISOString();

    let { data: jobs, error: jobErr } = await supabase
      .from("jobs")
      .select("id, position, firm_name, city, state, experience, salary, posted_date, image")
      .eq("status", "published")
      .gte("posted_date", sevenDaysIso)
      .order("posted_date", { ascending: false })
      .limit(10);

    // Fallback: If less than 2 jobs in the last 7 days, get the 6 latest active jobs
    if (!jobs || jobs.length < 2) {
      const { data: latestJobs } = await supabase
        .from("jobs")
        .select("id, position, firm_name, city, state, experience, salary, posted_date, image")
        .eq("status", "published")
        .order("posted_date", { ascending: false })
        .limit(6);

      if (latestJobs && latestJobs.length > 0) {
        jobs = latestJobs;
      }
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        message: "No published jobs available to include in the digest.",
        sent: 0,
      });
    }

    // 2. Fetch unsubscribed emails list
    const { data: unsubList } = await supabase
      .from("contact_inquiries")
      .select("email")
      .eq("subject", "UNSUBSCRIBE_WEEKLY_DIGEST");

    const unsubscribedSet = new Set(
      (unsubList || []).map((u) => (u.email || "").trim().toLowerCase()).filter(Boolean)
    );

    // 3. Determine recipients
    let recipients: string[] = [];

    if (testEmail) {
      recipients = [testEmail];
    } else {
      // Fetch registered users with valid emails from profiles
      const { data: profiles, error: profErr } = await supabase
        .from("profiles")
        .select("email")
        .not("email", "is", null);

      if (profErr) {
        console.error("Error fetching user emails:", profErr);
      }

      if (profiles && profiles.length > 0) {
        const uniqueEmails = new Set<string>();
        for (const p of profiles) {
          const em = (p.email || "").trim().toLowerCase();
          if (
            em &&
            em.includes("@") &&
            !em.endsWith(".invalid") &&
            !em.endsWith(".local") &&
            !unsubscribedSet.has(em) // Exclude unsubscribed users
          ) {
            uniqueEmails.add(em);
          }
        }
        recipients = Array.from(uniqueEmails);
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json({
        message: "No eligible recipients found (or all opted out).",
        sent: 0,
      });
    }

    // 4. Build job cards HTML
    const jobCardsHtml = jobs
      .map((j) => {
        const loc = [j.city, j.state].filter(Boolean).join(", ") || "India";
        const firm = j.firm_name || "Architecture Firm";
        const role = j.position || "Architecture Role";
        const exp = j.experience ? `• ${j.experience}` : "";
        const jobUrl = `${siteUrl}/jobs/${j.id}`;

        return `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 14px;">
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
              ${role}
            </div>
            <div style="font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">
              🏢 ${firm}
            </div>
            <div style="font-size: 13px; color: #64748b; margin-bottom: 12px;">
              📍 ${loc} ${exp}
            </div>
            <a href="${jobUrl}" style="display: inline-block; background-color: #000000; color: #ffffff !important; font-size: 13px; font-weight: 700; padding: 8px 16px; border-radius: 8px; text-decoration: none;">
              View Opening →
            </a>
          </div>
        `;
      })
      .join("");

    // 5. Send individually with custom unsubscribe link per recipient
    let successfulDeliveries = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      const unsubUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(recipient)}`;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Weekly Architecture Opportunities Digest</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
          <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
            <div style="margin-bottom: 24px;">
              <a href="${siteUrl}" style="font-size: 19px; font-weight: 900; color: #000000; text-decoration: none; letter-spacing: -0.03em;">
                Trapped Into Architecture
              </a>
            </div>

            <div style="display: inline-block; background-color: #f1f5f9; color: #334155; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
              Weekly Opportunities Digest
            </div>

            <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; line-height: 1.3; letter-spacing: -0.02em;">
              Latest Architecture Openings This Week
            </h1>

            <p style="color: #475569; line-height: 1.6; font-size: 15px; margin: 0 0 24px 0;">
              Here is your curated weekly summary of new architecture, interior, and design job openings posted on <strong>Trapped Into Architecture</strong>:
            </p>

            <div style="margin: 20px 0;">
              ${jobCardsHtml}
            </div>

            <div style="margin: 28px 0 16px 0; text-align: center;">
              <a href="${siteUrl}/jobs" style="display: block; text-align: center; background: #000000; color: #ffffff !important; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 15px; text-decoration: none;">
                Explore All Jobs on Ti2A →
              </a>
            </div>

            <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6;">
              &copy; ${new Date().getFullYear()} Trapped Into Architecture.<br>
              You received this digest because you are registered on Trapped Into Architecture.<br>
              <a href="${unsubUrl}" style="color: #64748b; text-decoration: underline; font-weight: 600;">Unsubscribe from Weekly Job Digest</a>
              &nbsp;•&nbsp;
              <a href="${siteUrl}/profile" style="color: #64748b; text-decoration: underline;">Account Settings</a>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        const sendResult = await resend.emails.send({
          from: fromEmail,
          to: recipient,
          subject: `🏛️ Ti2A Weekly Digest: ${jobs.length} New Architecture Openings`,
          html: emailHtml,
          headers: {
            "List-Unsubscribe": `<${siteUrl}/api/unsubscribe?email=${encodeURIComponent(recipient)}>`,
          },
        });

        if (sendResult.error) {
          errors.push(`${recipient}: ${sendResult.error.message}`);
        } else {
          successfulDeliveries++;
        }
      } catch (err: any) {
        errors.push(`${recipient}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      recipientsTotal: recipients.length,
      delivered: successfulDeliveries,
      jobsCount: jobs.length,
      isTest: Boolean(testEmail),
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
    });
  } catch (err: any) {
    console.error("Weekly Digest Error:", err);
    return NextResponse.json({ error: err.message || "Failed to send weekly digest." }, { status: 500 });
  }
}
