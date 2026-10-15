import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

function displayRole(role: string): string {
  if (!role) return "User";
  const r = role.toLowerCase().replace(/[\s_]+/g, "");
  if (r === "ceo") return "CEO";
  if (r === "superadmin") return "Super Admin";
  if (r === "jobadmin") return "Job Admin";
  if (r === "admin") return "Job Admin";
  return "User";
}

export async function POST(req: Request) {
  try {
    const { userId, oldRole, newRole } = await req.json();

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "userId and newRole are required." },
        { status: 400 }
      );
    }

    // Fetch user profile from database
    const { data: profile, error: fetchErr } = await supabase
      .from("profiles")
      .select("id, username, display_name, full_name, email, role")
      .eq("id", userId)
      .single();

    if (fetchErr || !profile) {
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 404 }
      );
    }

    const recipientEmail = (profile.email || "").trim().toLowerCase();
    const recipientName = profile.display_name || profile.full_name || profile.username || "Admin";
    const formattedOldRole = displayRole(oldRole);
    const formattedNewRole = displayRole(newRole);

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn("RESEND_API_KEY is not configured. Email notification skipped.");
      return NextResponse.json({
        success: true,
        message: "Role updated. (Email notification skipped: RESEND_API_KEY not configured)",
        emailSent: false,
      });
    }

    if (!recipientEmail || !recipientEmail.includes("@")) {
      return NextResponse.json({
        success: true,
        message: "Role updated. (Email notification skipped: No valid email on profile)",
        emailSent: false,
      });
    }

    const resend = new Resend(apiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Trapped Into Architecture <onboarding@resend.dev>";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 36px; border: 1px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
          .logo { font-size: 20px; font-weight: 800; color: #000000; text-decoration: none; display: inline-block; margin-bottom: 24px; letter-spacing: -0.02em; }
          h1 { font-size: 24px; font-weight: 800; color: #111827; margin: 0 0 12px; letter-spacing: -0.02em; }
          p { color: #4b5563; line-height: 1.6; font-size: 15px; margin: 0 0 18px; }
          .role-box { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0; }
          .role-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; font-weight: 700; margin-bottom: 6px; }
          .role-badge { display: inline-block; font-size: 20px; font-weight: 800; color: #000000; padding: 6px 16px; border-radius: 10px; background: #ffffff; border: 1px solid #d1d5db; }
          .role-transition { font-size: 13px; color: #6b7280; margin-top: 8px; font-weight: 500; }
          .permissions-card { background: #f9fafb; border-radius: 12px; padding: 18px 20px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .permissions-title { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
          .perm-item { font-size: 14px; color: #374151; margin: 6px 0; display: flex; align-items: center; }
          .btn { display: inline-block; width: 100%; box-sizing: border-box; text-align: center; background: #000000; color: #ffffff !important; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 15px; text-decoration: none; margin-top: 16px; transition: background 0.2s; }
          .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <a href="https://www.trappedintoarchitecture.com" class="logo">Trapped Into Architecture</a>
          <h1>Account Role Update</h1>
          <p>Hello <strong>${recipientName}</strong>,</p>
          <p>Your administrative account role on Trapped Into Architecture has been updated by the administrator:</p>
          
          <div class="role-box">
            <div class="role-label">Your New Role</div>
            <div class="role-badge">${formattedNewRole}</div>
            <div class="role-transition">Updated from ${formattedOldRole} to ${formattedNewRole}</div>
          </div>

          <div class="permissions-card">
            <div class="permissions-title">Your Access &amp; Responsibilities</div>
            <div class="perm-item">✓ Full access to create, publish, and edit job listings</div>
            <div class="perm-item">✓ Manage company and studio directory profiles</div>
            <div class="perm-item">✓ Access admin activity logs and dashboard analytics</div>
            <div class="perm-item">✓ Utilize Smart Job Upload with 0ms AI extraction</div>
          </div>

          <p style="font-size: 14px; color: #6b7280;">You can log in to your dashboard at any time to continue managing listings and platform operations.</p>

          <a href="https://www.trappedintoarchitecture.com/admin" class="btn">Open Admin Dashboard</a>

          <div class="footer">
            &copy; ${new Date().getFullYear()} Trapped Into Architecture. All rights reserved.<br>
            If you have questions regarding this change, please reach out to your administrator.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const sendResult = await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject: `Account Role Update: You are now a ${formattedNewRole} on Trapped Into Architecture`,
        html: emailHtml,
      });

      console.log("Role update email sent to:", recipientEmail, sendResult);
      return NextResponse.json({
        success: true,
        message: `Role updated to ${formattedNewRole}. Email notification sent to ${recipientEmail}.`,
        emailSent: true,
      });
    } catch (sendErr: any) {
      console.error("Resend send error:", sendErr);
      return NextResponse.json({
        success: true,
        message: `Role updated to ${formattedNewRole}, but email notification could not be delivered (${sendErr.message}).`,
        emailSent: false,
        emailError: sendErr.message,
      });
    }
  } catch (err: any) {
    console.error("Notify role change route error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process role change notification." },
      { status: 500 }
    );
  }
}
