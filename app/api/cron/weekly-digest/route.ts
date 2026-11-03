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
    // 1. DATA GATHERING (ONLY WEEK'S UPDATES)
    // ==========================================

    // A. Top 5 Most Viewed / Engaged Jobs
    const { data: topJobs } = await supabase
      .from("jobs")
      .select("id, position, firm_name, city, state, experience, share_count, posted_date")
      .eq("status", "published")
      .order("share_count", { ascending: false })
      .order("posted_date", { ascending: false })
      .limit(5);

    // B. Top 5 Companies with Most Job Postings
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

    // C. 2 Recent Updates from News Feed
    const { data: newsPosts } = await supabase
      .from("news_feed_posts")
      .select("id, title, summary, category, published_at, link_url")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(2);

    // D. Fetch Unsubscribed Emails List
    const { data: unsubList } = await supabase
      .from("contact_inquiries")
      .select("email")
      .eq("subject", "UNSUBSCRIBE_WEEKLY_DIGEST");

    const unsubscribedSet = new Set(
      (unsubList || []).map((u) => (u.email || "").trim().toLowerCase()).filter(Boolean)
    );

    // E. Determine Recipients
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
    // 2. COMPACT VERTICAL COLUMNS BUILDER
    // ==========================================

    // Column 1: Top 5 Jobs (Compact Rows)
    const topJobsRows = (topJobs || [])
      .map((j, idx) => {
        const loc = [j.city, j.state].filter(Boolean).join(", ") || "India";
        const firm = j.firm_name || "Practice";
        const role = j.position || "Role";
        const jobUrl = `${siteUrl}/jobs/${j.id}`;

        return `
          <div style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.3;">
              <span style="color: #64748b; font-size: 11px; margin-right: 4px;">#${idx + 1}</span>
              ${role}
            </div>
            <div style="font-size: 12px; color: #475569; margin: 2px 0 4px 0;">
              🏢 ${firm} • <span style="color: #64748b;">${loc}</span>
            </div>
            <a href="${jobUrl}" style="font-size: 11px; font-weight: 700; color: #000000; text-decoration: underline;">
              View Opening →
            </a>
          </div>
        `;
      })
      .join("");

    // Column 2: Top 5 Studios (Compact Rows)
    const topCompaniesRows = topCompanies
      .map((c, idx) => {
        const loc = [c.city, c.state].filter(Boolean).join(", ") || "India";
        const companyUrl = `${siteUrl}/companies?search=${encodeURIComponent(c.firm_name)}`;

        return `
          <div style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 13px; font-weight: 700; color: #0f172a;">
                <span style="color: #64748b; font-size: 11px; margin-right: 4px;">#${idx + 1}</span>
                ${c.firm_name}
              </span>
              <span style="background-color: #ecfdf5; color: #065f46; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px;">
                ${c.count} Roles
              </span>
            </div>
            <div style="font-size: 12px; color: #64748b; margin: 2px 0 4px 0;">
              📍 ${loc}
            </div>
            <a href="${companyUrl}" style="font-size: 11px; font-weight: 700; color: #2563eb; text-decoration: underline;">
              View Studio →
            </a>
          </div>
        `;
      })
      .join("");

    // Feed Updates (Compact 2-Column Split)
    const feedUpdatesColumns = (newsPosts || [])
      .map((n) => {
        const fullLink = n.link_url?.startsWith("http")
          ? n.link_url
          : `${siteUrl}${n.link_url || "/news-feed"}`;

        return `
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 8px;">
            <span style="background-color: #eff6ff; color: #1e40af; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 9999px; text-transform: uppercase;">
              ${n.category || "Update"}
            </span>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 6px 0 4px 0; line-height: 1.3;">
              ${n.title}
            </div>
            <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0; line-height: 1.4;">
              ${n.summary}
            </p>
            <a href="${fullLink}" style="font-size: 11px; font-weight: 700; color: #000000; text-decoration: underline;">
              Read Update →
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
          <title>Ti2A Fortnightly Briefing</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 16px; color: #0f172a;">
          <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 28px 24px; border: 1px solid #e2e8f0; box-shadow: 0 2px 16px rgba(0,0,0,0.03);">
            
            <!-- HEADER -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px;">
              <tr>
                <td>
                  <a href="${siteUrl}" style="font-size: 17px; font-weight: 900; color: #000000; text-decoration: none; letter-spacing: -0.02em;">
                    Trapped Into Architecture
                  </a>
                </td>
                <td align="right">
                  <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
                    Fortnightly Briefing
                  </span>
                </td>
              </tr>
            </table>

            <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.02em;">
              Ti2A Fortnightly Briefing — Top Openings &amp; Updates
            </h1>
            <p style="color: #64748b; font-size: 13px; margin: 0 0 20px 0;">
              A quick 2-minute overview of the top architectural demand, hiring studios, and latest platform updates.
            </p>

            <!-- VERTICAL DIVIDED 2-COLUMN SECTION -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
              <tr>
                <!-- LEFT COLUMN: TOP 5 VIEWED OPENINGS -->
                <td width="48%" valign="top" style="background-color: #fafafa; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px;">
                  <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                    🔥 Most Viewed Openings
                  </div>
                  ${topJobsRows}
                  <div style="padding-top: 10px; text-align: center;">
                    <a href="${siteUrl}/jobs" style="font-size: 11px; font-weight: 800; color: #000000; text-decoration: none;">
                      Explore All Openings →
                    </a>
                  </div>
                </td>

                <!-- SPACER -->
                <td width="4%"></td>

                <!-- RIGHT COLUMN: TOP 5 HIRING STUDIOS -->
                <td width="48%" valign="top" style="background-color: #fafafa; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px;">
                  <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                    🏢 Top Hiring Studios
                  </div>
                  ${topCompaniesRows}
                  <div style="padding-top: 10px; text-align: center;">
                    <a href="${siteUrl}/companies" style="font-size: 11px; font-weight: 800; color: #000000; text-decoration: none;">
                      Browse Studio Directory →
                    </a>
                  </div>
                </td>
              </tr>
            </table>

            <!-- SECTION 2: 2 RECENT FEED UPDATES -->
            ${
              newsPosts && newsPosts.length > 0
                ? `
              <div style="margin-bottom: 22px;">
                <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
                  📰 Fortnightly Feed &amp; Feature Drops
                </div>
                <div>
                  ${feedUpdatesColumns}
                </div>
              </div>
            `
                : ""
            }

            <!-- COMPACT FOOTER WITH ONE-CLICK UNSUBSCRIBE -->
            <div style="padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
              &copy; ${new Date().getFullYear()} Trapped Into Architecture • India's Architecture Community<br>
              <a href="${unsubUrl}" style="color: #64748b; text-decoration: underline; font-weight: 600;">Unsubscribe from this Fortnightly Briefing</a>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        const sendResult = await resend.emails.send({
          from: fromEmail,
          to: recipient,
          subject: `🏛️ Ti2A Fortnightly Briefing: Top Openings, Studios & Latest Architecture Updates`,
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
      isTest: Boolean(testEmail),
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
    });
  } catch (err: any) {
    console.error("Weekly Digest Error:", err);
    return NextResponse.json({ error: err.message || "Failed to send weekly digest." }, { status: 500 });
  }
}
