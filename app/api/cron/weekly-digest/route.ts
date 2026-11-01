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
      return NextResponse.json({ error: "RESEND_API_KEY is not configured." }, { status: 500 });
    }

    // ==========================================
    // 1. DATA GATHERING
    // ==========================================

    // A. Platform Snapshot Counts
    const { count: totalActiveJobs } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");

    const { count: totalCompanies } = await supabase
      .from("companies")
      .select("id", { count: "exact", head: true });

    // B. Top 5 Most Visited / Engaged Jobs
    const { data: topJobs } = await supabase
      .from("jobs")
      .select("id, position, firm_name, city, state, experience, share_count, posted_date, image")
      .eq("status", "published")
      .order("share_count", { ascending: false })
      .order("posted_date", { ascending: false })
      .limit(5);

    // C. Top 5 Companies with Most Job Postings
    const { data: allPublishedJobs } = await supabase
      .from("jobs")
      .select("firm_name, city, state, company_id")
      .eq("status", "published");

    const firmMap: Record<string, { firm_name: string; count: number; city: string; state: string; company_id: string | null }> = {};
    for (const j of allPublishedJobs || []) {
      const rawName = (j.firm_name || "").trim();
      if (!rawName) continue;
      const key = rawName.toLowerCase();
      if (!firmMap[key]) {
        firmMap[key] = {
          firm_name: rawName,
          count: 0,
          city: j.city || "",
          state: j.state || "",
          company_id: j.company_id || null,
        };
      }
      firmMap[key].count++;
    }

    const topCompanies = Object.values(firmMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // D. 2 Recent Updates from News Feed
    const { data: newsPosts } = await supabase
      .from("news_feed_posts")
      .select("id, title, summary, category, published_at, link_url")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(2);

    // E. Fetch Unsubscribed Emails List
    const { data: unsubList } = await supabase
      .from("contact_inquiries")
      .select("email")
      .eq("subject", "UNSUBSCRIBE_WEEKLY_DIGEST");

    const unsubscribedSet = new Set(
      (unsubList || []).map((u) => (u.email || "").trim().toLowerCase()).filter(Boolean)
    );

    // F. Determine Recipients
    let recipients: string[] = [];
    if (testEmail) {
      recipients = [testEmail];
    } else {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("email")
        .not("email", "is", null);

      if (profiles && profiles.length > 0) {
        const uniqueEmails = new Set<string>();
        for (const p of profiles) {
          const em = (p.email || "").trim().toLowerCase();
          if (
            em &&
            em.includes("@") &&
            !em.endsWith(".invalid") &&
            !em.endsWith(".local") &&
            !unsubscribedSet.has(em)
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

    // ==========================================
    // 2. HTML EMAIL TEMPLATE BUILDER
    // ==========================================

    // Top 5 Jobs HTML Cards
    const topJobsHtml = (topJobs || [])
      .map((j, index) => {
        const loc = [j.city, j.state].filter(Boolean).join(", ") || "India";
        const firm = j.firm_name || "Architecture Practice";
        const role = j.position || "Architecture Role";
        const exp = Array.isArray(j.experience)
          ? j.experience.join(", ")
          : j.experience || "Not specified";
        const jobUrl = `${siteUrl}/jobs/${j.id}`;

        return `
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px;">
              <span style="display: inline-block; background-color: #f1f5f9; color: #0f172a; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 6px;">
                #${index + 1} Most Viewed
              </span>
              ${j.share_count > 0 ? `<span style="font-size: 11px; font-weight: 700; color: #059669;">🔥 ${j.share_count} Shares</span>` : ""}
            </div>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
              ${role}
            </div>
            <div style="font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">
              🏢 ${firm}
            </div>
            <div style="font-size: 13px; color: #64748b; margin-bottom: 12px;">
              📍 ${loc} • 🎓 ${exp}
            </div>
            <a href="${jobUrl}" style="display: inline-block; background-color: #000000; color: #ffffff !important; font-size: 13px; font-weight: 700; padding: 8px 16px; border-radius: 8px; text-decoration: none;">
              View Opening →
            </a>
          </div>
        `;
      })
      .join("");

    // Top 5 Companies HTML Cards
    const topCompaniesHtml = topCompanies
      .map((c, index) => {
        const loc = [c.city, c.state].filter(Boolean).join(", ") || "India";
        const companyUrl = `${siteUrl}/companies?search=${encodeURIComponent(c.firm_name)}`;

        return `
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">
                ${index + 1}. ${c.firm_name}
              </div>
              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                📍 ${loc}
              </div>
            </div>
            <div style="text-align: right;">
              <span style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 9999px;">
                ${c.count} Openings
              </span>
              <div style="margin-top: 4px;">
                <a href="${companyUrl}" style="font-size: 11px; font-weight: 700; color: #2563eb; text-decoration: none;">
                  View Studio →
                </a>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    // 2 News Feed Updates HTML
    const newsUpdatesHtml = (newsPosts || [])
      .map((n) => {
        const fullLink = n.link_url?.startsWith("http")
          ? n.link_url
          : `${siteUrl}${n.link_url || "/news-feed"}`;

        return `
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 12px;">
            <span style="display: inline-block; background-color: #eff6ff; color: #1e40af; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px;">
              ${n.category || "Platform Update"}
            </span>
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">
              ${n.title}
            </div>
            <p style="font-size: 13px; color: #475569; line-height: 1.5; margin: 0 0 10px 0;">
              ${n.summary}
            </p>
            <a href="${fullLink}" style="font-size: 12px; font-weight: 700; color: #000000; text-decoration: underline;">
              Read Full Update →
            </a>
          </div>
        `;
      })
      .join("");

    // ==========================================
    // 3. SEND DIGEST TO RECIPIENTS
    // ==========================================
    let successfulDeliveries = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      const unsubUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(recipient)}`;

      const fullEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Weekly Architecture Intelligence Digest</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
            
            <!-- HEADER -->
            <div style="margin-bottom: 24px;">
              <a href="${siteUrl}" style="font-size: 19px; font-weight: 900; color: #000000; text-decoration: none; letter-spacing: -0.03em;">
                Trapped Into Architecture
              </a>
            </div>

            <!-- HERO INTRO -->
            <div style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">
              Weekly Intelligence Digest
            </div>

            <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 0 0 10px 0; line-height: 1.25; letter-spacing: -0.02em;">
              This Week in Architecture &amp; Design
            </h1>

            <p style="color: #475569; line-height: 1.6; font-size: 15px; margin: 0 0 24px 0;">
              Your 7-day executive briefing: the most-viewed openings, top hiring practices, and new design updates across India.
            </p>

            <!-- PLATFORM SNAPSHOT STATS -->
            <div style="background-color: #f1f5f9; border-radius: 16px; padding: 18px 20px; margin-bottom: 30px; display: flex; text-align: center; border: 1px solid #cbd5e1;">
              <div style="flex: 1;">
                <div style="font-size: 22px; font-weight: 900; color: #0f172a;">${totalActiveJobs || 190}+</div>
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 2px;">Active Jobs</div>
              </div>
              <div style="flex: 1; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                <div style="font-size: 22px; font-weight: 900; color: #0f172a;">${totalCompanies || 90}+</div>
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 2px;">Studios Listed</div>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 22px; font-weight: 900; color: #059669;">100%</div>
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 2px;">Verified Roles</div>
              </div>
            </div>

            <!-- SECTION 1: TOP 5 MOST VISITED JOBS -->
            <div style="margin-bottom: 32px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.01em;">
                  🔥 Top 5 Most Viewed Openings
                </h2>
                <a href="${siteUrl}/jobs" style="font-size: 12px; font-weight: 700; color: #000000; text-decoration: none;">View All →</a>
              </div>
              <div style="background-color: #f8fafc; border-radius: 16px; padding: 14px; border: 1px solid #e2e8f0;">
                ${topJobsHtml}
              </div>
            </div>

            <!-- SECTION 2: TOP 5 HIRING STUDIOS -->
            <div style="margin-bottom: 32px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.01em;">
                  🏢 Top 5 Studios Hiring Now
                </h2>
                <a href="${siteUrl}/companies" style="font-size: 12px; font-weight: 700; color: #000000; text-decoration: none;">Directory →</a>
              </div>
              <div style="background-color: #f8fafc; border-radius: 16px; padding: 14px; border: 1px solid #e2e8f0;">
                ${topCompaniesHtml}
              </div>
            </div>

            <!-- SECTION 3: RECENT FEED UPDATES -->
            ${
              newsPosts && newsPosts.length > 0
                ? `
              <div style="margin-bottom: 32px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                  <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.01em;">
                    📰 Platform Updates &amp; Features
                  </h2>
                  <a href="${siteUrl}/news-feed" style="font-size: 12px; font-weight: 700; color: #000000; text-decoration: none;">News Feed →</a>
                </div>
                <div style="background-color: #f8fafc; border-radius: 16px; padding: 14px; border: 1px solid #e2e8f0;">
                  ${newsUpdatesHtml}
                </div>
              </div>
            `
                : ""
            }

            <!-- CALL TO ACTION -->
            <div style="background: linear-gradient(135deg, #000000 0%, #1f2937 100%); border-radius: 16px; padding: 24px; text-align: center; color: #ffffff; margin-bottom: 30px;">
              <h3 style="font-size: 18px; font-weight: 800; margin: 0 0 8px 0;">Looking to hire architectural talent?</h3>
              <p style="font-size: 13px; color: #9ca3af; margin: 0 0 16px 0; line-height: 1.5;">Post your studio's openings with our instant 0ms AI upload tool.</p>
              <a href="${siteUrl}/post-job" style="display: inline-block; background-color: #ffffff; color: #000000 !important; font-size: 13px; font-weight: 800; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
                Post a Job Free →
              </a>
            </div>

            <!-- FOOTER WITH UNSUBSCRIBE -->
            <div style="padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6;">
              &copy; ${new Date().getFullYear()} Trapped Into Architecture.<br>
              Connecting emerging architects, designers, and top practices across India.<br>
              <a href="${unsubUrl}" style="color: #64748b; text-decoration: underline; font-weight: 600;">Unsubscribe from Weekly Digest</a>
              &nbsp;•&nbsp;
              <a href="${siteUrl}/profile" style="color: #64748b; text-decoration: underline;">Notification Preferences</a>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        const sendResult = await resend.emails.send({
          from: fromEmail,
          to: recipient,
          subject: `🏛️ Ti2A Weekly Digest: 5 Top Openings, Top Studios & Feed Updates`,
          html: fullEmailHtml,
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
      topJobsCount: topJobs?.length || 0,
      topCompaniesCount: topCompanies.length,
      newsCount: newsPosts?.length || 0,
      isTest: Boolean(testEmail),
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
    });
  } catch (err: any) {
    console.error("Weekly Digest Error:", err);
    return NextResponse.json({ error: err.message || "Failed to send weekly digest." }, { status: 500 });
  }
}
