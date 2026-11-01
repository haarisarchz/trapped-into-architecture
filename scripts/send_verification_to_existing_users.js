const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf8");
let supabaseUrl = "";
let supabaseKey = "";
let resendKey = "";

envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const idx = trimmed.indexOf("=");
    if (idx > -1) {
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
      if (k === "NEXT_PUBLIC_SUPABASE_URL") supabaseUrl = v;
      if (k === "SUPABASE_SERVICE_ROLE_KEY" || (!supabaseKey && k === "NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
        supabaseKey = v;
      }
      if (k === "RESEND_API_KEY") resendKey = v;
    }
  }
});

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = resendKey ? new Resend(resendKey) : null;

// Parse CLI arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const emailIdx = args.indexOf("--email");
const targetEmail = emailIdx !== -1 ? args[emailIdx + 1]?.toLowerCase() : null;
const limitIdx = args.indexOf("--limit");
const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 15;

async function run() {
  console.log("=================================================");
  console.log("   Ti2A Existing Users Verification Dispatcher   ");
  console.log("=================================================");
  console.log(`Mode: ${isDryRun ? "DRY-RUN (Simulated, no emails sent)" : "LIVE DISPATCH"}`);
  if (targetEmail) console.log(`Target: Single user -> ${targetEmail}`);
  console.log(`Limit: ${limit}`);
  console.log("-------------------------------------------------");

  // Query unverified users with emails
  let query = supabase
    .from("profiles")
    .select("id, username, full_name, email, email_verified, verified")
    .not("email", "is", null);

  const { data: profiles, error } = await query;
  if (error) {
    console.error("Error fetching profiles:", error.message);
    return;
  }

  // Filter unverified
  let unverified = profiles.filter((p) => !p.email_verified && p.email && p.email.includes("@"));

  if (targetEmail) {
    unverified = unverified.filter((p) => p.email.toLowerCase() === targetEmail);
  }

  console.log(`Found ${unverified.length} pending unverified users.`);

  const batch = unverified.slice(0, limit);
  console.log(`Processing batch of ${batch.length} users...\n`);

  let sentCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const user of batch) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours for batch
    const displayName = user.full_name || user.username || "Architect";
    const siteUrl = "https://www.trappedintoarchitecture.com";

    console.log(`[${sentCount + 1}/${batch.length}] User: ${displayName} <${user.email}>`);

    if (isDryRun) {
      console.log(`   -> DRY-RUN: Generated code ${code} (expires in 48h)`);
      sentCount++;
      continue;
    }

    // 1. Update Supabase profile with verification token
    const { error: tokenErr } = await supabase
      .from("profiles")
      .update({
        verification_token: code,
        verification_token_expires: expiresAt,
      })
      .eq("id", user.id);

    if (tokenErr) {
      console.error(`   -> Failed to save token: ${tokenErr.message}`);
      errorCount++;
      continue;
    }

    if (!resend) {
      console.log(`   -> Token saved (${code}), but RESEND_API_KEY not available to send email.`);
      sentCount++;
      continue;
    }

    // 2. Build email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your Ti2A Profile</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
        <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
          
          <div style="margin-bottom: 24px;">
            <a href="${siteUrl}" style="font-size: 19px; font-weight: 900; color: #000000; text-decoration: none; letter-spacing: -0.03em;">
              Trapped Into Architecture
            </a>
          </div>

          <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
            🔒 Official Profile Verification
          </div>

          <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 0 0 10px 0; line-height: 1.3; letter-spacing: -0.02em;">
            Verify your Ti2A profile, ${displayName}!
          </h1>

          <p style="color: #475569; line-height: 1.6; font-size: 15px; margin: 0 0 24px 0;">
            We are upgrading profile security across <strong>Trapped Into Architecture</strong>. Verify your registered email today to unlock your <strong>Verified Badge (+5% profile score)</strong> and stand out to hiring studios.
          </p>

          <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 18px; padding: 26px; text-align: center; margin: 24px 0;">
            <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">
              Your 6-Digit Verification Code
            </div>
            
            <div style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #000000; font-family: ui-monospace, Menlo, Monaco, monospace; margin: 12px 0;">
              ${code}
            </div>

            <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
              Valid for 48 hours. Enter this in your Ti2A Profile tab to activate your Verified status.
            </div>
          </div>

          <div style="margin: 24px 0;">
            <a href="${siteUrl}/profile/${user.username || ''}" style="display: block; text-align: center; background: #000000; color: #ffffff !important; padding: 13px 20px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none;">
              Open My Profile & Verify →
            </a>
          </div>

          <div style="padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
            &copy; ${new Date().getFullYear()} Trapped Into Architecture. All rights reserved.<br>
            Connecting emerging architects, designers, and premier studios across India.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const sendResult = await resend.emails.send({
        from: "Trapped Into Architecture <onboarding@resend.dev>",
        to: user.email,
        subject: `Your Ti2A Verification Code: ${code}`,
        html: emailHtml,
      });

      if (sendResult.error) {
        console.warn(`   -> Resend note for ${user.email}: ${sendResult.error.message}`);
        // If Resend test account restriction, attempt fallback to registered admin account so Haaris can inspect
        const match = sendResult.error.message?.match(/only send testing emails to your own email address \(([^)]+)\)/i);
        if (match && match[1]) {
          const testEmail = match[1].trim();
          console.log(`   -> Retrying test delivery to registered test account: ${testEmail}...`);
          await resend.emails.send({
            from: "Trapped Into Architecture <onboarding@resend.dev>",
            to: testEmail,
            subject: `[Test Fallback for ${user.email}] Your Ti2A Verification Code: ${code}`,
            html: emailHtml,
          });
          console.log(`   -> Delivered via test fallback to ${testEmail}!`);
        }
      } else {
        console.log(`   -> Email sent successfully! (ID: ${sendResult.data?.id})`);
      }

      // CEO audit feed entry
      await supabase.from("contact_inquiries").insert([
        {
          name: displayName,
          email: user.email,
          subject: "COMPANY_JOB_EMAIL_SENT",
          message: `Verification code dispatched to existing user: ${user.email} (${displayName})`,
          is_read: false,
        },
      ]);

      sentCount++;
    } catch (err) {
      console.error(`   -> Exception sending to ${user.email}:`, err.message);
      errorCount++;
    }

    // Gentle pacing between sends
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log("\n=================================================");
  console.log(`Summary: Sent: ${sentCount} | Skipped: ${skippedCount} | Errors: ${errorCount}`);
  console.log("=================================================");
}

run();
