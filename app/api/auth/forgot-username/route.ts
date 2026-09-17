import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Look up username from profiles
    const { data: profile, error: dbError } = await supabase
      .from("profiles")
      .select("username, full_name")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (dbError) {
      console.error("Database lookup error:", dbError);
    }

    // Only attempt to send if account exists and Resend key is configured
    const apiKey = process.env.RESEND_API_KEY;

    if (profile?.username && apiKey) {
      const resend = new Resend(apiKey);
      const displayName = profile.full_name || "there";

      // By default with test key or unverified domain, Resend sends from onboarding@resend.dev
      // Once custom domain is added in Resend, can use: support@trappedintoarchitecture.com
      const fromEmail = process.env.RESEND_FROM_EMAIL || "Trapped Into Architecture <onboarding@resend.dev>";

      const { data: sendData, error: sendError } = await resend.emails.send({
        from: fromEmail,
        to: cleanEmail,
        subject: "Your Trapped Into Architecture Username",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
              .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 36px; border: 1px solid #e5e7eb; }
              .logo { font-size: 20px; font-weight: 800; color: #000000; text-decoration: none; display: inline-block; margin-bottom: 24px; }
              h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 12px; }
              p { color: #4b5563; line-height: 1.6; font-size: 15px; margin: 0 0 18px; }
              .username-box { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
              .username-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; font-weight: 600; margin-bottom: 6px; }
              .username-text { font-size: 24px; font-weight: 800; color: #000000; letter-spacing: -0.02em; }
              .btn { display: inline-block; width: 100%; box-sizing: border-box; text-align: center; background: #000000; color: #ffffff !important; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 15px; text-decoration: none; margin-top: 10px; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af; }
            </style>
          </head>
          <body>
            <div class="container">
              <a href="https://www.trappedintoarchitecture.com" class="logo">Trapped Into Architecture</a>
              <h1>Hello, ${displayName}!</h1>
              <p>You recently requested to retrieve the username associated with this email address.</p>
              
              <div class="username-box">
                <div class="username-label">Your Username</div>
                <div class="username-text">@${profile.username}</div>
              </div>

              <a href="https://www.trappedintoarchitecture.com" class="btn">Log In to Your Account</a>

              <p style="margin-top: 24px; font-size: 13px; color: #6b7280;">If you did not request this, you can safely ignore this email.</p>
              
              <div class="footer">
                &copy; ${new Date().getFullYear()} Trapped Into Architecture. All rights reserved.
              </div>
            </div>
          </body>
          </html>
        `,
      });
    }

    // Always return success for security (prevents user enumeration)
    return NextResponse.json({
      success: true,
      message:
        "If an account exists with this email address, we've sent your username. Please check your inbox.",
    });
  } catch (err: any) {
    console.error("Forgot username route error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process request." },
      { status: 500 }
    );
  }
}
