import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type CeoNotificationType =
  | "USER_REGISTRATION"
  | "USER_VERIFIED"
  | "USER_PHONE_VERIFIED"
  | "STUDIO_CLAIM_REQUEST"
  | "NEW_STUDIO_REGISTERED";

interface NotifyCeoParams {
  type: CeoNotificationType;
  data: {
    fullName?: string;
    username?: string;
    email?: string;
    phone?: string;
    profession?: string;
    userId?: string;
    // Studio / Claim fields
    studioName?: string;
    studioSlug?: string;
    requesterName?: string;
    workEmail?: string;
    phoneNumber?: string;
    designation?: string;
    verificationNotes?: string;
    city?: string;
    state?: string;
    website?: string;
    notes?: string;
  };
}

export async function notifyCeo({ type, data }: NotifyCeoParams): Promise<{ success: boolean; emailSent: boolean; message: string }> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trappedintoarchitecture.com";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Trapped Into Architecture <notifications@trappedintoarchitecture.com>";
  
  // 1. Determine CEO / Admin Email
  let ceoEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin.ti2a@gmail.com";
  try {
    const { data: settings } = await supabase
      .from("site_settings")
      .select("email")
      .eq("id", "global")
      .maybeSingle();
    if (settings?.email && settings.email.trim()) {
      ceoEmail = settings.email.trim();
    }
  } catch (e) {
    // fallback to admin.ti2a@gmail.com
  }

  let subjectLine = "";
  let auditSubject = "";
  let auditMessage = "";
  let bodyContentHtml = "";
  let actionBtnText = "Open Admin Dashboard";
  let actionBtnLink = `${siteUrl}/admin`;

  const nowIst = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST";

  switch (type) {
    case "USER_REGISTRATION": {
      const name = data.fullName || data.username || "New User";
      const userEmail = data.email || "No email";
      const userPhone = data.phone || "Not provided";
      const profession = data.profession || "Architect";
      const username = data.username ? `@${data.username}` : "";

      subjectLine = `[Ti2A Alert] 👤 New User Registered: ${name} (${profession})`;
      auditSubject = "NEW_USER_REGISTERED";
      auditMessage = `New user registered: ${name} ${username} - ${userEmail} (${profession}). Phone: ${userPhone}`;
      actionBtnText = "View User in Admin";
      actionBtnLink = `${siteUrl}/admin/users`;

      bodyContentHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 18px 0;">
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px; color: #334155;">
            <tr>
              <td style="width: 140px; font-weight: 700; color: #0f172a;">Full Name:</td>
              <td>${name}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #0f172a;">Username:</td>
              <td>${data.username ? `@${data.username}` : "Not set"}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #0f172a;">Email:</td>
              <td><a href="mailto:${userEmail}" style="color: #2563eb; text-decoration: none;">${userEmail}</a></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #0f172a;">Phone / WhatsApp:</td>
              <td>${userPhone}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #0f172a;">Profession:</td>
              <td><span style="background-color: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 12px;">${profession}</span></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #0f172a;">Registered At:</td>
              <td>${nowIst}</td>
            </tr>
          </table>
        </div>
      `;
      break;
    }

    case "USER_VERIFIED": {
      const name = data.fullName || data.username || "User";
      const userEmail = data.email || "No email";
      const username = data.username ? `@${data.username}` : "";

      subjectLine = `[Ti2A Alert] 🔒 User Email Verified: ${name} (${userEmail})`;
      auditSubject = "USER_VERIFIED";
      auditMessage = `User email verified: ${name} ${username} (${userEmail}). Verified badge (+5% score) activated.`;
      actionBtnText = "View User Profile";
      actionBtnLink = data.username ? `${siteUrl}/profile/${data.username}` : `${siteUrl}/admin/users`;

      bodyContentHtml = `
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 14px; padding: 18px; margin: 18px 0;">
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px; color: #065f46;">
            <tr>
              <td style="width: 140px; font-weight: 700; color: #064e3b;">User:</td>
              <td><strong>${name}</strong> ${username}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #064e3b;">Verified Email:</td>
              <td><a href="mailto:${userEmail}" style="color: #047857; text-decoration: none; font-weight: 600;">${userEmail}</a></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #064e3b;">Status:</td>
              <td><span style="background-color: #059669; color: #ffffff; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 12px;">✓ Verified (+5% Score)</span></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #064e3b;">Verified At:</td>
              <td>${nowIst}</td>
            </tr>
          </table>
        </div>
      `;
      break;
    }

    case "USER_PHONE_VERIFIED": {
      const name = data.fullName || data.username || "User";
      const userPhone = data.phone || data.phoneNumber || "No phone";
      const userEmail = data.email || "No email";

      subjectLine = `[Ti2A Alert] 📱 User Phone Verified: ${name} (${userPhone})`;
      auditSubject = "USER_PHONE_VERIFIED";
      auditMessage = `User phone verified: ${userPhone} for ${name} (${userEmail}). +5% verification badge activated.`;
      actionBtnText = "View User in Admin";
      actionBtnLink = `${siteUrl}/admin/users`;

      bodyContentHtml = `
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 18px; margin: 18px 0;">
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px; color: #1e40af;">
            <tr>
              <td style="width: 140px; font-weight: 700; color: #1e3a8a;">User:</td>
              <td><strong>${name}</strong></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #1e3a8a;">Verified Phone:</td>
              <td><strong>${userPhone}</strong></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #1e3a8a;">Email:</td>
              <td>${userEmail}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #1e3a8a;">Badge:</td>
              <td><span style="background-color: #2563eb; color: #ffffff; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 12px;">📱 Phone Verified (+5% Score)</span></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #1e3a8a;">Verified At:</td>
              <td>${nowIst}</td>
            </tr>
          </table>
        </div>
      `;
      break;
    }

    case "STUDIO_CLAIM_REQUEST": {
      const studioName = data.studioName || "Practice Studio";
      const reqName = data.requesterName || "Studio Representative";
      const workEmail = data.workEmail || "Not provided";
      const phone = data.phoneNumber || "Not provided";
      const designation = data.designation || "Architect / Principal";
      const notes = data.verificationNotes || "None provided";

      subjectLine = `[Ti2A Alert] 🏛️ Studio Claim Request: "${studioName}" by ${reqName}`;
      auditSubject = "STUDIO_CLAIM_REQUEST";
      auditMessage = `Claim request submitted for "${studioName}" by ${reqName} (${designation}) - ${workEmail}, Phone: ${phone}. Review in /admin/claims.`;
      actionBtnText = "Review Claim Requests in Admin";
      actionBtnLink = `${siteUrl}/admin/claims`;

      bodyContentHtml = `
        <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 14px; padding: 18px; margin: 18px 0;">
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px; color: #713f12;">
            <tr>
              <td style="width: 140px; font-weight: 700; color: #422006;">Target Studio:</td>
              <td><strong>${studioName}</strong></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #422006;">Requester:</td>
              <td>${reqName}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #422006;">Designation:</td>
              <td>${designation}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #422006;">Official Work Email:</td>
              <td><a href="mailto:${workEmail}" style="color: #ca8a04; font-weight: 600;">${workEmail}</a></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #422006;">Phone:</td>
              <td>${phone}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #422006;">Verification Notes:</td>
              <td style="white-space: pre-wrap;">${notes}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #422006;">Submitted At:</td>
              <td>${nowIst}</td>
            </tr>
          </table>
        </div>
      `;
      break;
    }

    case "NEW_STUDIO_REGISTERED": {
      const firmName = data.studioName || "New Architecture Studio";
      const city = data.city || "";
      const state = data.state || "";
      const location = [city, state].filter(Boolean).join(", ") || "India";
      const email = data.email || "Not provided";
      const phone = data.phone || "Not provided";
      const website = data.website || "Not provided";
      const slug = data.studioSlug || "";

      subjectLine = `[Ti2A Alert] 🏢 New Studio Registered: "${firmName}" (${location})`;
      auditSubject = "NEW_STUDIO_REGISTERED";
      auditMessage = `New studio registered: "${firmName}" (${location}) - Email: ${email}, Phone: ${phone}. Pending verification.`;
      actionBtnText = "Manage Companies in Admin";
      actionBtnLink = slug ? `${siteUrl}/companies/${slug}` : `${siteUrl}/admin/companies`;

      bodyContentHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 18px 0;">
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px; color: #334155;">
            <tr>
              <td style="width: 140px; font-weight: 700; color: #0f172a;">Studio Name:</td>
              <td><strong>${firmName}</strong></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #0f172a;">Location:</td>
              <td>${location}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #0f172a;">Official Email:</td>
              <td><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #0f172a;">Phone:</td>
              <td>${phone}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #0f172a;">Website:</td>
              <td>${website}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #0f172a;">Submitted At:</td>
              <td>${nowIst}</td>
            </tr>
          </table>
        </div>
      `;
      break;
    }
  }

  // 2. Insert into contact_inquiries so it instantly appears in CEO's Navbar bell and Admin Mails
  try {
    await supabase.from("contact_inquiries").insert([
      {
        name: data.fullName || data.requesterName || data.studioName || "Ti2A Activity",
        email: data.email || data.workEmail || "system@trappedintoarchitecture.com",
        phone: data.phone || data.phoneNumber || null,
        subject: auditSubject,
        message: auditMessage,
        is_read: false,
      },
    ]);
  } catch (err: any) {
    console.warn("Could not insert CEO notification into contact_inquiries:", err.message);
  }

  // 3. Dispatch Email Alert to CEO via Resend
  let emailSent = false;
  if (resend && ceoEmail) {
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subjectLine}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          
          <div style="margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <a href="${siteUrl}" style="font-size: 18px; font-weight: 900; color: #000000; text-decoration: none; letter-spacing: -0.03em;">
              Trapped Into Architecture
            </a>
            <span style="font-size: 11px; font-weight: 800; color: #ffffff; background: #000000; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
              CEO Alert
            </span>
          </div>

          <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; line-height: 1.3;">
            ${subjectLine.replace(/^\[Ti2A Alert\]\s*/, "")}
          </h2>
          <p style="font-size: 13px; color: #64748b; margin: 0 0 18px 0;">
            A key user activity was recorded on <strong>trappedintoarchitecture.com</strong>.
          </p>

          ${bodyContentHtml}

          <div style="margin: 24px 0 16px 0;">
            <a href="${actionBtnLink}" style="display: block; text-align: center; background: #000000; color: #ffffff !important; padding: 13px 20px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none;">
              ${actionBtnText} →
            </a>
          </div>

          <div style="padding-top: 18px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
            &copy; ${new Date().getFullYear()} Trapped Into Architecture • Administrative Notification System<br>
            Dispatched to CEO at ${ceoEmail}
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const res = await resend.emails.send({
        from: fromEmail,
        to: ceoEmail,
        subject: subjectLine,
        html: fullHtml,
      });
      if (res.data?.id) {
        emailSent = true;
      } else if (res.error) {
        console.warn("Resend email error notifying CEO:", res.error.message);
      }
    } catch (e: any) {
      console.warn("Exception sending CEO notification email:", e.message);
    }
  }

  return {
    success: true,
    emailSent,
    message: `CEO notification processed for ${type}`,
  };
}
