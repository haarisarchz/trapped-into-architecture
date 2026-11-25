import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const { companyId, companySlug, requesterUserId, requesterEmail } = await req.json();

    if (!companyId && !companySlug) {
      return NextResponse.json({ error: "Company identifier required." }, { status: 400 });
    }

    // 1. Fetch official company details from database
    let query = supabase.from("companies").select("id, firm_name, email, phone, website, slug");
    if (companyId) {
      query = query.eq("id", companyId);
    } else {
      query = query.eq("slug", companySlug);
    }
    const { data: company, error: compErr } = await query.maybeSingle();

    if (compErr || !company) {
      return NextResponse.json({ error: "Company not found in directory." }, { status: 404 });
    }

    const officialEmail = (company.email || "").trim().toLowerCase();
    const cleanRequesterEmail = (requesterEmail || "").trim().toLowerCase();

    // Determine destination email:
    // Either the registered studio email, OR the requester's work email if domain matches website
    let targetEmail = officialEmail;
    let isDomainMatch = false;

    if (company.website && cleanRequesterEmail) {
      try {
        const urlStr = company.website.startsWith("http") ? company.website : `https://${company.website}`;
        const domain = new URL(urlStr).hostname.replace(/^www\./, "").toLowerCase();
        const reqDomain = cleanRequesterEmail.split("@")[1]?.toLowerCase();
        if (domain && reqDomain && (reqDomain === domain || reqDomain.endsWith("." + domain))) {
          targetEmail = cleanRequesterEmail;
          isDomainMatch = true;
        }
      } catch (e) {
        // invalid url, fallback
      }
    }

    if (!targetEmail) {
      return NextResponse.json({
        error: "This studio does not have an official email on file. Please submit a manual verification claim for admin review."
      }, { status: 400 });
    }

    // 2. Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    // 3. Store OTP in database on company_claim_requests
    const { data: claimReq, error: insertErr } = await supabase
      .from("company_claim_requests")
      .insert([
        {
          company_id: company.id,
          company_slug: company.slug,
          company_name: company.firm_name,
          user_id: requesterUserId || null,
          work_email: targetEmail,
          verification_notes: JSON.stringify({ otp: code, expires_at: expiresAt, is_domain_match: isDomainMatch }),
          status: "otp_sent",
        }
      ])
      .select("id")
      .single();

    if (insertErr) {
      console.warn("Could not record claim OTP:", insertErr.message);
    }

    // Mask target email for UI display (e.g., s****a@morphogenesis.org)
    const [userPart, domainPart] = targetEmail.split("@");
    const maskedUser = userPart.length > 2 
      ? userPart[0] + "*".repeat(userPart.length - 2) + userPart[userPart.length - 1]
      : userPart[0] + "*";
    const maskedEmail = `${maskedUser}@${domainPart}`;

    // 4. Send Email via Resend if available
    if (resend) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || "Trapped Into Architecture <notifications@trappedintoarchitecture.com>";
      await resend.emails.send({
        from: fromEmail,
        to: targetEmail,
        subject: `Studio Ownership Verification Code: ${code} - Trapped Into Architecture`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px;">
            <div style="margin-bottom: 20px; text-align: center;">
              <span style="background: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">Studio Ownership Claim</span>
              <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 10px;">Verification Code for ${company.firm_name}</h2>
              <p style="font-size: 14px; color: #64748b; line-height: 1.5;">An architect has requested to claim and manage the official studio profile for <strong>${company.firm_name}</strong> on Trapped Into Architecture.</p>
            </div>
            
            <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #000000; font-family: monospace;">${code}</span>
              <p style="font-size: 12px; color: #94a3b8; margin-top: 8px; margin-bottom: 0;">This code expires in 15 minutes.</p>
            </div>

            <p style="font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
              If you or someone on your team initiated this, enter the code above into the claim modal to confirm studio ownership. If not, you can safely ignore this email.
            </p>
          </div>
        `
      });
    }

    return NextResponse.json({
      success: true,
      requestId: claimReq?.id,
      maskedEmail,
      isDomainMatch,
      code: !resend ? code : undefined // fallback for dev
    });
  } catch (err: any) {
    console.error("Error sending claim OTP:", err);
    return NextResponse.json({ error: err.message || "Failed to dispatch verification code." }, { status: 500 });
  }
}
