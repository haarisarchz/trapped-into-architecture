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
const isConfirmed = args.includes("--confirm");

async function run() {
  console.log("=================================================");
  console.log("   Ti2A Targeted / On-Demand Verification Tool   ");
  console.log("=================================================");
  console.log(`Note: Per platform design, verification is ON-DEMAND.`);
  console.log(`Users request their own code via their Profile tab ("Verify Email").`);
  console.log("-------------------------------------------------");

  if (!targetEmail && !isConfirmed && !isDryRun) {
    console.log("SAFETY GUARD ACTIVE: Automatic mass-emailing is disabled.");
    console.log("To target an individual user:   node scripts/send_verification_to_existing_users.js --email <user@domain.com>");
    console.log("To inspect unverified accounts: node scripts/send_verification_to_existing_users.js --dry-run");
    return;
  }

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

  console.log(`Found ${unverified.length} pending unverified user(s).`);

  for (const user of unverified) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const displayName = user.full_name || user.username || "Architect";
    const siteUrl = "https://www.trappedintoarchitecture.com";

    console.log(`User: ${displayName} <${user.email}>`);

    if (isDryRun) {
      console.log(`   -> DRY-RUN: Verification code would be ${code}`);
      continue;
    }

    // Update Supabase profile with verification token
    const { error: tokenErr } = await supabase
      .from("profiles")
      .update({
        verification_token: code,
        verification_token_expires: expiresAt,
      })
      .eq("id", user.id);

    if (tokenErr) {
      console.error(`   -> Failed to save token: ${tokenErr.message}`);
      continue;
    }

    if (!resend) {
      console.log(`   -> Token saved (${code}), but RESEND_API_KEY not configured.`);
      continue;
    }

    try {
      const sendResult = await resend.emails.send({
        from: "Trapped Into Architecture <onboarding@resend.dev>",
        to: user.email,
        subject: `Your Ti2A Verification Code: ${code}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
            <h2 style="margin: 0 0 12px 0;">Ti2A Email Verification</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello ${displayName}, here is your requested 6-digit verification code to verify your profile on Trapped Into Architecture:</p>
            <div style="background: #f1f5f9; padding: 18px; text-align: center; font-size: 32px; font-weight: 900; letter-spacing: 6px; border-radius: 12px; margin: 16px 0;">
              ${code}
            </div>
            <p style="font-size: 12px; color: #64748b;">Enter this code on your Ti2A profile to activate your Verified Badge (+5% score).</p>
          </div>
        `,
      });

      console.log(`   -> Email dispatched successfully! (ID: ${sendResult.data?.id || "ok"})`);
    } catch (e) {
      console.error(`   -> Exception sending to ${user.email}:`, e.message);
    }
  }
}

run();
