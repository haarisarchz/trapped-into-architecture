/**
 * Unified formatters for social media posts across Trapped Into Architecture.
 */

export interface SocialJobItem {
  id?: string;
  firm_name?: string;
  area?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  position?: string;
  experience?: any;
  employment_type?: string;
}

/**
 * Normalizes and validates an Instagram username / handle.
 * Handles inputs like "@gayatriarchitects", "gayatriarchitects", or profile URLs.
 * Returns clean username string without "@", or null if invalid/missing.
 */
export function sanitizeInstagramHandle(raw?: string | null): string | null {
  if (!raw || typeof raw !== "string") return null;
  let handle = raw.trim();
  if (!handle) return null;

  // Strip queries, hashes, and trailing slashes
  handle = handle.split("?")[0].split("#")[0].replace(/\/+$/, "");

  // If a full URL was provided, extract the path segment
  if (handle.includes("instagram.com/")) {
    const parts = handle.split("instagram.com/")[1].split("/").filter(Boolean);
    handle = parts[0] || "";
  } else if (handle.includes("/")) {
    const parts = handle.split("/").filter(Boolean);
    handle = parts[parts.length - 1] || "";
  }

  // Remove all leading '@' characters
  handle = handle.replace(/^@+/, "").trim();

  // Validate Instagram username specification:
  // 1-30 characters, letters, numbers, periods, and underscores
  // Cannot start or end with a period, cannot contain consecutive periods
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(handle)) {
    return null;
  }
  if (handle.startsWith(".") || handle.endsWith(".") || handle.includes("..")) {
    return null;
  }

  return handle;
}

/**
 * Shared formatter for WhatsApp job postings (used by public ShareButtons,
 * AdminActionMenu, AdminShareButton, and WhatsApp Channel workflows).
 */
function formatExperienceText(rawExp: any, isIntern: boolean): string {
  if (isIntern || !rawExp) return "";
  const arr = Array.isArray(rawExp) ? rawExp : [rawExp];
  const clean = Array.from(new Set(arr.map(x => String(x).trim()).filter(Boolean)));
  if (clean.length === 0) return "";
  return ` (${clean.join(", ")})`;
}

export function formatWhatsAppPost(jobs: SocialJobItem[], jobUrl: string): string {
  const mainJob = jobs[0] || {};
  const firmName = mainJob.firm_name || "Unknown Firm";
  const locParts = [mainJob.area || mainJob.neighborhood, mainJob.city, mainJob.state].filter(Boolean);
  const location = locParts.length > 0 ? locParts.join(", ") : "Remote";

  let text = "";

  if (jobs.length > 1) {
    text = `🏢 FIRM: ${firmName}\n📍 LOCATION: ${location}\n💼 POSITIONS:\n`;
    jobs.forEach((job, index) => {
      const isIntern = job.employment_type === "Internship" || job.position?.toLowerCase().includes("intern");
      const expText = formatExperienceText(job.experience, !!isIntern);
      text += `${index + 1}. ${job.position || "Position"}${expText}\n`;
    });
  } else {
    const isIntern = mainJob.employment_type === "Internship" || mainJob.position?.toLowerCase().includes("intern");
    const expText = formatExperienceText(mainJob.experience, !!isIntern);
    text = `🏢 FIRM: ${firmName}\n📍 LOCATION: ${location}\n💼 POSITIONS: ${mainJob.position || "Position"}${expText}\n`;
  }

  text += `\n🔗 For more details and to apply, visit:\n${jobUrl}`;
  text += `\n\n🌐 Visit www.trappedintoarchitecture.com for more job updates.`;

  return text;
}

/**
 * Shared formatter for automatic Instagram post captions.
 * Moves '@handle is hiring!' to the beginning and removes trailing mention line.
 */
export function formatInstagramCaption(
  jobs: SocialJobItem[],
  hashtags: string[],
  companyInstagram?: string | null
): string {
  const mainJob = jobs[0] || {};
  const firmName = mainJob.firm_name || "Unknown Firm";
  const locParts = [mainJob.area || mainJob.neighborhood, mainJob.city, mainJob.state].filter(Boolean);
  const location = locParts.length > 0 ? locParts.join(", ") : "Remote / Not specified";

  let caption = "";

  // 1. Move Instagram mention to beginning if a valid handle is supplied
  const handle = sanitizeInstagramHandle(companyInstagram);
  if (handle) {
    caption += `@${handle} is hiring!\n\n`;
  }

  // 2. Firm & Location
  caption += `🏢 FIRM: ${firmName}\n📍 LOCATION: ${location}\n💼 POSITIONS:\n`;

  // 3. Positions
  jobs.forEach((job, index) => {
    const isIntern = job.employment_type === "Internship" || job.position?.toLowerCase().includes("intern");
    const expText = formatExperienceText(job.experience, !!isIntern);
    const prefix = jobs.length === 1 ? "1. " : `${index + 1}. `;
    caption += `${prefix}${job.position || "Position"}${expText}\n`;
  });

  // 4. Instructions & Promotion
  caption += `\n🔗 For more details and to apply, visit the link in our bio!\n`;
  caption += `\n🌐 Visit www.trappedintoarchitecture.com for more job updates.\n\n`;

  // 5. Hashtags (preserved at the original position)
  if (hashtags && hashtags.length > 0) {
    caption += hashtags.join(" ");
  }

  return caption.trim();
}
