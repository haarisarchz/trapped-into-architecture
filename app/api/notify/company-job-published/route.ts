import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("job_id");
  const testEmail = searchParams.get("test_email");
  return sendNotification({ jobId, testEmail });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const jobId = body.job_id;
    const testEmail = body.test_email;
    return sendNotification({ jobId, testEmail });
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

async function sendNotification({ jobId, testEmail }: { jobId: string | null; testEmail?: string | null }) {
  try {
    if (!jobId) {
      return NextResponse.json({ error: "job_id is required." }, { status: 400 });
    }

    // 1. Fetch job details
    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .select("id, position, firm_name, city, state, experience, application_email, company_id, image, status")
      .eq("id", jobId)
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    // 2. Determine company email and slug
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

    // Override with test_email if specified for testing
    if (testEmail && testEmail.trim()) {
      recipientEmail = testEmail.trim();
    }

    const firmName = job.firm_name || "Architecture Practice";
    const positionTitle = job.position || "Architecture Role";

    if (!recipientEmail || !recipientEmail.includes("@")) {
      console.log(`[Company Notification] Skipped for job ${job.id}: No valid company email found.`);
      try {
        await supabase.from("contact_inquiries").insert([{
          name: firmName,
          email: "unspecified@company",
          subject: "COMPANY_JOB_EMAIL_PENDING",
          message: `Job "${positionTitle}" at "${firmName}" posted — No company email on file (Mail pending)`,
          is_read: false,
        }]);
      } catch (e) {}

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
    const claimUrl = companySlug ? `${siteUrl}/companies/${companySlug}?claim=true` : `${siteUrl}/companies`;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Trapped Into Architecture <notifications@trappedintoarchitecture.com>";
    const location = [job.city, job.state].filter(Boolean).join(", ") || "India";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Job Listing is Live on Ti2A</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(0,0,0,0.05);">
          
          <!-- BRAND HEADER -->
          <div style="margin-bottom: 24px;">
            <a href="${siteUrl}" style="font-size: 19px; font-weight: 900; color: #000000; text-decoration: none; letter-spacing: -0.03em;">
              Trapped Into Architecture
            </a>
          </div>

          <!-- STATUS BADGE -->
          <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
            ● Active &amp; Live on Platform
          </div>

          <h1 style="font-size: 23px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; line-height: 1.3; letter-spacing: -0.02em;">
            Your job posting for ${firmName} is now live!
          </h1>

          <p style="color: #475569; line-height: 1.6; font-size: 15px; margin: 0 0 24px 0;">
            Greetings from <strong>Trapped Into Architecture</strong>. We have featured your firm's opening for <strong>${positionTitle}</strong> on our platform and syndicated it across our verified architecture community to thousands of active architects and designers.
          </p>

          <!-- JOB PREVIEW CARD -->
          <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 16px; padding: 22px; margin: 20px 0;">
            <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">
              Published Position
            </div>
            <div style="font-size: 19px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">
              ${positionTitle}
            </div>
            <div style="font-size: 14px; color: #334155; margin-bottom: 6px;">
              🏢 <strong>Firm:</strong> ${firmName}
            </div>
            <div style="font-size: 14px; color: #334155; margin-bottom: 6px;">
              📍 <strong>Location:</strong> ${location}
            </div>
            ${job.experience ? `<div style="font-size: 14px; color: #334155;">🎓 <strong>Experience:</strong> ${job.experience}</div>` : ""}

            <div style="margin-top: 18px;">
              <a href="${jobUrl}" style="display: block; text-align: center; background: #000000; color: #ffffff !important; padding: 12px 20px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">
                View Live Job Listing →
              </a>
            </div>
          </div>

          <!-- PROFILE COMPLETION & HIRING PRIVILEGES -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 22px 0;">
            <div style="margin-bottom: 8px;">
              <span style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">
                Studio Profile Completeness:
              </span>
              <span style="font-size: 12px; font-weight: 800; color: #2563eb; margin-left: 6px;">
                ~40% Configured
              </span>
            </div>
            <div style="background-color: #e2e8f0; border-radius: 9999px; height: 8px; width: 100%; overflow: hidden; margin-bottom: 12px;">
              <div style="background-color: #2563eb; width: 40%; height: 100%; border-radius: 9999px;"></div>
            </div>
            <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0;">
              ✨ <strong>Unlock Direct Job Posting:</strong> Your initial practice details have been configured. Claiming your studio and completing your profile to <strong>66%+</strong> (adding portfolio projects, leadership info, and office contacts) unlocks direct job &amp; internship publishing privileges for your firm!
            </p>
          </div>

          <!-- EDIT YOUR JOBS / CLAIM STUDIO CARD -->
          <div style="background: linear-gradient(135deg, #09090b 0%, #18181b 100%); border-radius: 18px; padding: 26px; margin: 28px 0; color: #ffffff;">
            <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">
              Claim Practice &amp; Hiring Privileges
            </div>
            
            <h2 style="font-size: 18px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0; line-height: 1.3;">
              Want to edit your jobs or post new openings? Claim your studio.
            </h2>
            
            <p style="color: #a1a1aa; font-size: 13px; line-height: 1.6; margin: 0 0 18px 0;">
              We featured your opening so qualified architects across India can discover it right away. Claiming your official studio profile is completely free and unlocks:
            </p>

            <ul style="color: #d4d4d8; font-size: 13px; line-height: 1.7; margin: 0 0 20px 0; padding-left: 20px;">
              <li><strong>Direct Job Posting:</strong> Post future architect, interior designer, and intern vacancies</li>
              <li><strong>Edit Your Postings:</strong> Update job descriptions, salary brackets, and deadlines</li>
              <li><strong>Instant Future Uploads:</strong> Post new openings with 0ms AI extraction</li>
              <li><strong>Studio Showcase:</strong> Add your principal architects, awards, and portfolio</li>
              <li><strong>Verified Practice Badge:</strong> Establish trust with top design talent</li>
            </ul>

            <a href="${claimUrl}" style="display: block; text-align: center; background: #ffffff; color: #000000 !important; padding: 13px 20px; border-radius: 10px; font-weight: 800; font-size: 14px; text-decoration: none;">
              Claim ${firmName} &amp; Unlock Job Posting →
            </a>
          </div>

          <!-- FOOTER -->
          <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6;">
            &copy; ${new Date().getFullYear()} Trapped Into Architecture.<br>
            Connecting emerging architects, designers, and premier studios across India.<br>
            Have questions or need assistance? Reply directly to this email to reach our team.
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

      if (sendResult.error) {
        console.warn("[Company Notification] Resend error:", sendResult.error.message);
        return NextResponse.json({
          success: true,
          message: `Notification skipped: ${sendResult.error.message}`,
          emailSent: false,
        });
      }

      console.log(`[Company Notification] Successfully sent to ${recipientEmail} for job ${job.id}`);
      try {
        await supabase.from("contact_inquiries").insert([{
          name: firmName,
          email: recipientEmail,
          subject: "COMPANY_JOB_EMAIL_SENT",
          message: `Job "${positionTitle}" at "${firmName}" posted — Mail sent successfully to ${recipientEmail}`,
          is_read: false,
        }]);
      } catch (e) {}
      return NextResponse.json({
        success: true,
        message: `Notification email sent to ${recipientEmail}.`,
        emailSent: true,
        recipient: recipientEmail,
        jobId: job.id,
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
