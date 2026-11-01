import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const { job_id } = await req.json();

    if (!job_id) {
      return NextResponse.json({ error: "job_id is required." }, { status: 400 });
    }

    // 1. Fetch job details
    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .select("id, position, firm_name, city, state, experience, application_email, company_id, image, status")
      .eq("id", job_id)
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    // 2. Determine company email
    let recipientEmail = (job.application_email || "").trim();
    let companySlug = "";

    if (job.company_id) {
      const { data: company } = await supabase
        .from("companies")
        .select("email, slug, firm_name")
        .eq("id", job.company_id)
        .maybeSingle();

      if (company) {
        if (company.email && company.email.trim()) {
          recipientEmail = company.email.trim();
        }
        if (company.slug) {
          companySlug = company.slug;
        }
      }
    }

    if (!recipientEmail || !recipientEmail.includes("@")) {
      console.log(`[Company Notification] Skipped for job ${job.id}: No valid company email found.`);
      return NextResponse.json({
        success: true,
        message: "No valid company email found. Notification skipped.",
        emailSent: false,
      });
    }

    if (!resend) {
      console.warn("[Company Notification] RESEND_API_KEY is not configured.");
      return NextResponse.json({
        success: true,
        message: "Email skipped: RESEND_API_KEY not configured.",
        emailSent: false,
      });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trappedintoarchitecture.com";
    const jobUrl = `${siteUrl}/jobs/${job.id}`;
    const companyUrl = companySlug ? `${siteUrl}/companies/${companySlug}` : `${siteUrl}/companies`;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Trapped Into Architecture <onboarding@resend.dev>";
    const firmName = job.firm_name || "Architecture Firm";
    const positionTitle = job.position || "Architecture Role";
    const location = [job.city, job.state].filter(Boolean).join(", ") || "India";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Job Listing is Live</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #111827;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 36px; border: 1px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <div style="margin-bottom: 24px;">
            <a href="${siteUrl}" style="font-size: 18px; font-weight: 800; color: #000000; text-decoration: none; letter-spacing: -0.02em;">
              Trapped Into Architecture
            </a>
          </div>

          <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
            Listing Published &amp; Live
          </div>

          <h1 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 12px 0; line-height: 1.3;">
            Your job posting for ${firmName} is now live!
          </h1>

          <p style="color: #4b5563; line-height: 1.6; font-size: 15px; margin: 0 0 20px 0;">
            Hello from the Trapped Into Architecture team. We are pleased to notify you that your opening for <strong>${positionTitle}</strong> has been published to our platform and syndicated across our architecture community channels.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin: 20px 0;">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
              Listing Overview
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
              ${positionTitle}
            </div>
            <div style="font-size: 14px; color: #475569; margin-bottom: 6px;">
              🏢 <strong>Firm:</strong> ${firmName}
            </div>
            <div style="font-size: 14px; color: #475569; margin-bottom: 6px;">
              📍 <strong>Location:</strong> ${location}
            </div>
            ${job.experience ? `<div style="font-size: 14px; color: #475569;">🎓 <strong>Experience:</strong> ${job.experience}</div>` : ""}
          </div>

          <div style="margin: 28px 0 16px 0;">
            <a href="${jobUrl}" style="display: block; text-align: center; background: #000000; color: #ffffff !important; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 15px; text-decoration: none;">
              View Live Job Listing →
            </a>
          </div>

          <div style="text-align: center; margin-top: 14px;">
            <a href="${companyUrl}" style="font-size: 13px; color: #4b5563; text-decoration: underline;">
              View or update ${firmName}'s studio directory profile
            </a>
          </div>

          <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
            &copy; ${new Date().getFullYear()} Trapped Into Architecture.<br>
            The dedicated network connecting architects, designers, and top studios across India.<br>
            If you did not request this listing or need assistance, reply directly to this email.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const sendResult = await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject: `[Live on Ti2A] Job Listing Published: ${positionTitle} at ${firmName}`,
        html: emailHtml,
      });

      // Handle Resend testing restriction gracefully
      if (sendResult.error) {
        console.warn("[Company Notification] Resend error:", sendResult.error.message);
        return NextResponse.json({
          success: true,
          message: `Notification skipped: ${sendResult.error.message}`,
          emailSent: false,
        });
      }

      console.log(`[Company Notification] Successfully sent to ${recipientEmail} for job ${job.id}`);
      return NextResponse.json({
        success: true,
        message: `Notification email sent to ${recipientEmail}.`,
        emailSent: true,
      });
    } catch (sendErr: any) {
      console.warn("[Company Notification] Resend send exception:", sendErr.message);
      return NextResponse.json({
        success: true,
        message: `Email delivery failed: ${sendErr.message}`,
        emailSent: false,
      });
    }
  } catch (err: any) {
    console.error("[Company Notification] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to send company notification." },
      { status: 500 }
    );
  }
}
