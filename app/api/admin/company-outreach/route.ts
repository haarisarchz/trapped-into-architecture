import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trappedintoarchitecture.com";
const fromEmail = process.env.RESEND_FROM_EMAIL || "Trapped Into Architecture <notifications@trappedintoarchitecture.com>";

// GET campaign status & next batch
export async function GET() {
  try {
    // 1. Fetch already notified company emails from contact_inquiries
    const { data: notifiedRecords } = await supabase
      .from("contact_inquiries")
      .select("email, name, created_at")
      .eq("subject", "NOTIFIED_COMPANY_JOB_POSTING");

    const notifiedEmails = new Set(
      (notifiedRecords || []).map((r) => (r.email || "").trim().toLowerCase())
    );

    // 2. Fetch all published jobs
    const { data: jobs, error: jobsErr } = await supabase
      .from("jobs")
      .select("id, firm_name, position, city, state, experience, job_type, salary_range, email, company_id, posted_date, status")
      .eq("status", "published");

    if (jobsErr) {
      return NextResponse.json({ error: jobsErr.message }, { status: 500 });
    }

    // 3. Fetch companies with emails
    const { data: companies } = await supabase
      .from("companies")
      .select("id, firm_name, email, slug, logo_url, city, state");

    const companyMap = new Map();
    (companies || []).forEach((c) => {
      if (c.firm_name) {
        companyMap.set(c.firm_name.trim().toLowerCase(), c);
      }
    });

    // 4. Group jobs by company
    const grouped = new Map<string, { firmName: string; email: string | null; slug: string; logoUrl: string | null; jobs: any[] }>();

    (jobs || []).forEach((job) => {
      const firmKey = (job.firm_name || "").trim().toLowerCase();
      if (!firmKey) return;

      const comp = companyMap.get(firmKey);
      const email = comp?.email || job.email || null;
      const slug = comp?.slug || job.firm_name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const logoUrl = comp?.logo_url || null;

      if (!grouped.has(firmKey)) {
        grouped.set(firmKey, {
          firmName: job.firm_name.trim(),
          email: email ? email.trim().toLowerCase() : null,
          slug,
          logoUrl,
          jobs: [],
        });
      }

      grouped.get(firmKey)!.jobs.push(job);
    });

    const allFirms = Array.from(grouped.values());
    const validEmailFirms = allFirms.filter((f) => f.email && f.email.includes("@"));
    const pendingFirms = validEmailFirms.filter((f) => !notifiedEmails.has(f.email!));
    const completedFirms = validEmailFirms.filter((f) => notifiedEmails.has(f.email!));

    return NextResponse.json({
      success: true,
      stats: {
        totalFirmsWithJobs: allFirms.length,
        totalWithValidEmail: validEmailFirms.length,
        alreadyNotifiedCount: completedFirms.length,
        pendingCount: pendingFirms.length,
        dailyRate: 15,
        estimatedDaysRemaining: Math.ceil(pendingFirms.length / 15),
      },
      nextBatch: pendingFirms.slice(0, 15).map((f) => ({
        firmName: f.firmName,
        email: f.email,
        jobCount: f.jobs.length,
        positions: f.jobs.map((j) => j.position).slice(0, 3),
        slug: f.slug,
      })),
      recentlyNotified: completedFirms.slice(-5).map((f) => ({
        firmName: f.firmName,
        email: f.email,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST trigger next batch dispatch (10-15 companies)
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const limit = body.limit ? parseInt(body.limit, 10) : 15;
    const isDryRun = Boolean(body.dryRun);

    // 1. Fetch already notified
    const { data: notifiedRecords } = await supabase
      .from("contact_inquiries")
      .select("email")
      .eq("subject", "NOTIFIED_COMPANY_JOB_POSTING");

    const notifiedEmails = new Set(
      (notifiedRecords || []).map((r) => (r.email || "").trim().toLowerCase())
    );

    // 2. Fetch published jobs
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, firm_name, position, city, state, experience, job_type, salary_range, email, company_id")
      .eq("status", "published");

    const { data: companies } = await supabase
      .from("companies")
      .select("id, firm_name, email, slug, logo_url, city, state");

    const companyMap = new Map();
    (companies || []).forEach((c) => {
      if (c.firm_name) companyMap.set(c.firm_name.trim().toLowerCase(), c);
    });

    const grouped = new Map<string, { firmName: string; email: string; slug: string; jobs: any[] }>();

    (jobs || []).forEach((job) => {
      const firmKey = (job.firm_name || "").trim().toLowerCase();
      if (!firmKey) return;
      const comp = companyMap.get(firmKey);
      const email = comp?.email || job.email;
      if (!email || !email.includes("@")) return;

      const cleanEmail = email.trim().toLowerCase();
      if (notifiedEmails.has(cleanEmail)) return; // already notified

      if (!grouped.has(cleanEmail)) {
        grouped.set(cleanEmail, {
          firmName: comp?.firm_name || job.firm_name.trim(),
          email: cleanEmail,
          slug: comp?.slug || job.firm_name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          jobs: [],
        });
      }
      grouped.get(cleanEmail)!.jobs.push(job);
    });

    const pendingQueue = Array.from(grouped.values());
    const batch = pendingQueue.slice(0, limit);

    if (batch.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All hiring companies have already been notified! Zero pending.",
        count: 0,
      });
    }

    if (isDryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: `Dry-run preview: Next batch contains ${batch.length} studios.`,
        batch: batch.map((b) => ({ firm: b.firmName, email: b.email, jobCount: b.jobs.length })),
      });
    }

    let dispatchedCount = 0;
    const sentList: any[] = [];

    for (const item of batch) {
      const claimUrl = `${siteUrl}/companies/${item.slug}?claim=true`;
      const isMulti = item.jobs.length > 1;

      const jobsCardsHtml = item.jobs
        .slice(0, 4)
        .map(
          (j) => `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px 18px; margin-bottom: 10px;">
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
              ${j.position}
            </div>
            <div style="font-size: 12px; color: #64748b;">
              📍 ${j.city || "India"} &bull; 💼 ${j.job_type || "Full Time"} &bull; ⏱ ${j.experience || "Experience required"}
            </div>
          </div>
        `
        )
        .join("");

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
          <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px; border: 1px solid #e2e8f0;">
            <div style="margin-bottom: 24px;">
              <a href="${siteUrl}" style="font-size: 19px; font-weight: 900; color: #000000; text-decoration: none;">Trapped Into Architecture</a>
            </div>
            <div style="display: inline-block; background-color: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
              ${isMulti ? `🏢 ${item.jobs.length} Openings Featured` : "🏢 Job Opening Featured"}
            </div>
            <h1 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0 0 10px 0;">
              Your hiring openings are live on Trapped Into Architecture!
            </h1>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Hello <strong>${item.firmName}</strong> Team,<br>
              We have featured your active architectural openings on <strong>Trapped Into Architecture</strong> to connect you with premier design talent across India.
            </p>
            <div style="margin: 20px 0;">
              ${jobsCardsHtml}
            </div>
            <!-- CLAIM CALLOUT -->
            <div style="background-color: #0f172a; border-radius: 18px; padding: 24px; text-align: center; margin: 26px 0; color: #ffffff;">
              <h2 style="font-size: 17px; font-weight: 800; color: #ffffff; margin: 0 0 6px 0;">
                Want to edit your jobs or add more details?
              </h2>
              <p style="color: #cbd5e1; font-size: 13px; line-height: 1.5; margin: 0 0 18px 0;">
                Claim your studio profile to review applications, edit requirements, or post upcoming openings for free.
              </p>
              <a href="${claimUrl}" style="display: inline-block; background: #ffffff; color: #000000 !important; font-weight: 800; font-size: 13px; padding: 12px 24px; border-radius: 12px; text-decoration: none;">
                Claim Your Studio Profile & Edit Jobs →
              </a>
            </div>
            <div style="padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center;">
              &copy; ${new Date().getFullYear()} Trapped Into Architecture. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `;

      if (resend) {
        try {
          const sendResult = await resend.emails.send({
            from: fromEmail,
            to: item.email,
            subject: `[Ti2A] Your jobs at ${item.firmName} are live — Claim your studio to manage`,
            html: emailHtml,
          });

          // In test mode, fallback gracefully if test restriction occurs
          if (sendResult.error) {
            const match = sendResult.error.message?.match(/only send testing emails to your own email address \(([^)]+)\)/i);
            if (match && match[1]) {
              await resend.emails.send({
                from: fromEmail,
                to: match[1].trim(),
                subject: `[Test Fallback for ${item.firmName}] Your jobs at ${item.firmName} are live`,
                html: emailHtml,
              });
            }
          }
        } catch (e) {
          console.warn(`Error sending to ${item.email}:`, e);
        }
      }

      // Log in contact_inquiries so it is tracked in the Sent folder and never emailed twice
      await supabase.from("contact_inquiries").insert([
        {
          name: item.firmName,
          email: item.email,
          subject: "NOTIFIED_COMPANY_JOB_POSTING",
          message: `Outreach notification sent for ${item.jobs.length} job(s): ${item.jobs.map((j) => j.position).join(", ")}. Claim link: ${claimUrl}`,
          is_read: true,
        },
      ]);

      dispatchedCount++;
      sentList.push({ firm: item.firmName, email: item.email, jobs: item.jobs.length });

      // Gentle pause
      await new Promise((r) => setTimeout(r, 400));
    }

    return NextResponse.json({
      success: true,
      count: dispatchedCount,
      sentList,
      message: `Dispatched today's batch of ${dispatchedCount} studio outreach emails successfully!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
