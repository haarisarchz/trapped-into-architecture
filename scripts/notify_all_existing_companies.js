// scripts/notify_all_existing_companies.js
// Automated daily company outreach: Sends 10 to 15 emails per day to firms with published jobs,
// inviting them to claim their studio profile and edit their listings.
// Automatically tracks notified companies in the database to prevent duplicate emails.

const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");
const fs = require("fs");
const path = require("path");

// Read .env.local
const envPath = path.resolve(__dirname, "../.env.local");
let env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx !== -1) {
      env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const resendApiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
const siteUrl = env.NEXT_PUBLIC_SITE_URL || "https://www.trappedintoarchitecture.com";
const fromEmail = env.RESEND_FROM_EMAIL || "Trapped Into Architecture <onboarding@resend.dev>";

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Parse CLI flags
const isDryRun = process.argv.includes("--dry-run");
const dailyFlagIdx = process.argv.indexOf("--daily");
const limitFlagIdx = process.argv.indexOf("--limit");
const batchLimit = dailyFlagIdx !== -1 
  ? parseInt(process.argv[dailyFlagIdx + 1], 10) 
  : (limitFlagIdx !== -1 ? parseInt(process.argv[limitFlagIdx + 1], 10) : 15);

const testEmailFlagIdx = process.argv.indexOf("--test-email");
const testEmail = testEmailFlagIdx !== -1 ? process.argv[testEmailFlagIdx + 1] : null;

async function run() {
  console.log("==================================================");
  console.log("Ti2A: Scheduled Daily Company Outreach (10-15/day)");
  console.log(`Mode: ${isDryRun ? "DRY RUN (Preview Only)" : "LIVE SEND"}`);
  console.log(`Daily Quota Target: ${batchLimit} companies per run`);
  if (testEmail) console.log(`Test Email Override: ${testEmail}`);
  console.log("==================================================\n");

  // 1. Fetch already-notified companies from contact_inquiries
  const { data: alreadyNotifiedList, error: historyErr } = await supabase
    .from("contact_inquiries")
    .select("email")
    .eq("subject", "NOTIFIED_COMPANY_JOB_POSTING");

  if (historyErr) {
    console.warn("Could not check notification history:", historyErr.message);
  }

  const notifiedSet = new Set(
    (alreadyNotifiedList || []).map((item) => (item.email || "").trim().toLowerCase()).filter(Boolean)
  );

  console.log(`Historical Tracking: ${notifiedSet.size} companies previously notified.`);

  // 2. Fetch published jobs
  const { data: jobs, error: jobErr } = await supabase
    .from("jobs")
    .select("id, position, firm_name, city, state, experience, application_email, company_id")
    .eq("status", "published");

  if (jobErr) {
    console.error("Failed to fetch jobs:", jobErr);
    process.exit(1);
  }

  // 3. Fetch companies directory
  const { data: companies } = await supabase
    .from("companies")
    .select("id, firm_name, email, slug, is_claimed");

  const compMap = new Map();
  for (const c of companies || []) {
    compMap.set(c.id, c);
  }

  // 4. Group jobs by company/firm
  const grouped = new Map();
  for (const j of jobs || []) {
    const fn = (j.firm_name || "").trim();
    if (!fn) continue;
    const key = fn.toLowerCase();

    let email = (j.application_email || "").trim();
    let comp = j.company_id ? compMap.get(j.company_id) : null;
    if (comp?.email && comp.email.trim()) {
      email = comp.email.trim();
    }

    if (!grouped.has(key)) {
      grouped.set(key, {
        firm_name: fn,
        email: email,
        slug: comp?.slug || "",
        is_claimed: Boolean(comp?.is_claimed),
        jobs: [],
      });
    }

    grouped.get(key).jobs.push({
      id: j.id,
      position: j.position || "Architecture Role",
      city: j.city || "",
      state: j.state || "",
      experience: j.experience,
    });
  }

  // 5. Filter out already-notified firms & invalid emails
  let pendingFirms = [];
  for (const [_, item] of grouped.entries()) {
    const cleanEmail = (item.email || "").trim().toLowerCase();
    if (cleanEmail && cleanEmail.includes("@")) {
      if (!notifiedSet.has(cleanEmail) || testEmail) {
        pendingFirms.push(item);
      }
    }
  }

  console.log(`Remaining Unnotified Companies: ${pendingFirms.length}`);

  if (pendingFirms.length === 0) {
    console.log("All hiring firms have already been notified! No emails needed today.");
    return;
  }

  // Take today's quota (e.g. 15 companies)
  const todaysBatch = pendingFirms.slice(0, batchLimit);
  console.log(`Queueing ${todaysBatch.length} companies for today's outreach.\n`);

  if (isDryRun) {
    console.log("--- TODAY'S QUEUED BATCH (DRY RUN) ---");
    todaysBatch.forEach((t, i) => {
      console.log(
        `[${i + 1}/${todaysBatch.length}] "${t.firm_name}" -> ${t.email} (${t.jobs.length} opening${t.jobs.length > 1 ? "s" : ""})`
      );
    });
    console.log(`\nRemaining for upcoming days after this batch: ${pendingFirms.length - todaysBatch.length}`);
    console.log("To execute this batch, run with: node scripts/notify_all_existing_companies.js --send");
    return;
  }

  if (!resend) {
    console.error("RESEND_API_KEY is not configured.");
    process.exit(1);
  }

  // 6. Live Send Loop with Safety Throttle
  let sentCount = 0;
  let errorCount = 0;

  for (let i = 0; i < todaysBatch.length; i++) {
    const item = todaysBatch[i];
    const recipient = testEmail || item.email;
    const firmName = item.firm_name;
    const jobCount = item.jobs.length;
    const claimUrl = item.slug ? `${siteUrl}/companies/${item.slug}?claim=true` : `${siteUrl}/companies`;

    const subject =
      jobCount > 1
        ? `[Live on Ti2A] ${jobCount} Job Listings Published for ${firmName}`
        : `[Live on Ti2A] Job Listing Published: ${item.jobs[0].position} at ${firmName}`;

    // Positions list HTML
    const positionsHtml = item.jobs
      .map((j, idx) => {
        const loc = [j.city, j.state].filter(Boolean).join(", ") || "India";
        const jobUrl = `${siteUrl}/jobs/${j.id}`;
        return `
          <div style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">
              ${jobCount > 1 ? `${idx + 1}. ` : ""}${j.position}
            </div>
            <div style="font-size: 12px; color: #64748b; margin: 2px 0 4px 0;">
              📍 ${loc}
            </div>
            <a href="${jobUrl}" style="font-size: 12px; font-weight: 700; color: #000000; text-decoration: underline;">
              View Listing →
            </a>
          </div>
        `;
      })
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
          <div style="margin-bottom: 24px;">
            <a href="${siteUrl}" style="font-size: 19px; font-weight: 900; color: #000000; text-decoration: none;">
              Trapped Into Architecture
            </a>
          </div>

          <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
            ● ${jobCount} ${jobCount > 1 ? "Openings" : "Opening"} Live on Platform
          </div>

          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; line-height: 1.3;">
            ${jobCount > 1 ? `${jobCount} job postings` : "Your job posting"} for ${firmName} ${jobCount > 1 ? "are" : "is"} now live!
          </h1>

          <p style="color: #475569; line-height: 1.6; font-size: 14px; margin: 0 0 20px 0;">
            Greetings from <strong>Trapped Into Architecture</strong>. We have featured your firm's current architectural hiring opportunities across our platform and verified community channels:
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 18px 0;">
            ${positionsHtml}
          </div>

          <!-- EDIT YOUR JOBS & CLAIM STUDIO INVITATION -->
          <div style="background: linear-gradient(135deg, #09090b 0%, #18181b 100%); border-radius: 18px; padding: 26px; color: #ffffff; margin: 26px 0;">
            <span style="display: inline-block; background-color: rgba(255,255,255,0.15); color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 10px;">
              Manage &amp; Edit Listings
            </span>
            
            <h2 style="font-size: 18px; font-weight: 800; margin: 0 0 8px 0; color: #ffffff; line-height: 1.3;">
              Want to edit your jobs or add more details? Claim your studio.
            </h2>
            
            <p style="color: #a1a1aa; font-size: 13px; line-height: 1.6; margin: 0 0 18px 0;">
              We published this listing so qualified architects across India can discover it right away. Claiming your official studio profile is completely free and unlocks:
            </p>

            <ul style="color: #d4d4d8; font-size: 13px; line-height: 1.7; margin: 0 0 20px 0; padding-left: 20px;">
              <li><strong>Edit Your Postings:</strong> Update job descriptions, salary brackets, and deadlines</li>
              <li><strong>Instant Future Uploads:</strong> Post new openings with 0ms AI extraction</li>
              <li><strong>Studio Showcase:</strong> Add your principal architects, awards, and portfolio</li>
              <li><strong>Verified Badge:</strong> Establish trust with top design talent</li>
            </ul>

            <a href="${claimUrl}" style="display: block; text-align: center; background: #ffffff; color: #000000 !important; padding: 13px 20px; border-radius: 10px; font-weight: 800; font-size: 14px; text-decoration: none;">
              Claim ${firmName} &amp; Edit Your Jobs →
            </a>
          </div>

          <div style="padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center;">
            &copy; ${new Date().getFullYear()} Trapped Into Architecture • India's Dedicated Architecture Network
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      console.log(`[${i + 1}/${todaysBatch.length}] Sending to ${firmName} (${recipient})...`);
      const res = await resend.emails.send({
        from: fromEmail,
        to: recipient,
        subject: subject,
        html: emailHtml,
      });

      if (res.error) {
        console.warn(`  ↳ Resend error: ${res.error.message}`);
        errorCount++;
      } else {
        console.log(`  ↳ Sent successfully! (ID: ${res.data?.id})`);
        sentCount++;

        // Record tracking in database so this firm is never emailed again in future runs
        if (!testEmail) {
          await supabase.from("contact_inquiries").insert([
            {
              name: firmName,
              email: item.email.trim().toLowerCase(),
              subject: "NOTIFIED_COMPANY_JOB_POSTING",
              message: `Outreach notification sent on ${new Date().toISOString()} for ${item.jobs.length} jobs: ${item.jobs.map(j => j.position).join(", ")}`,
              is_read: true,
            },
          ]);
        }
      }
    } catch (err) {
      console.error(`  ↳ Exception: ${err.message}`);
      errorCount++;
    }

    // Safety pause: 1.5 seconds between emails
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log("\n==================================================");
  console.log(`Today's Outreach Complete!`);
  console.log(`Batch Processed: ${todaysBatch.length}`);
  console.log(`Successfully Sent: ${sentCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Remaining for Next Runs: ${pendingFirms.length - sentCount}`);
  console.log("==================================================");
}

run();
