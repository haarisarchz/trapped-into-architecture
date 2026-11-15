import { BadgeTier } from "./profileCompletion";

export interface SmartApplyDocStatus {
  hasDocs: boolean;
  hasResume: boolean;
  hasPortfolio: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean; // within 24 hours
  expiresAt: Date | null;
  daysRemaining: number;
  hoursRemaining: number;
  validityDurationDays: number;
  statusLabel: string;
  statusColor: "emerald" | "amber" | "red" | "gray";
}

/**
 * Calculates document validity duration in days based on candidate's badge tier:
 * - Silver: 7 days (1 week)
 * - Gold: 14 days (2 weeks)
 * - Platinum & Diamond: 30 days (1 month)
 * - Bronze (<50%): 7 days default
 */
export function getValidityDaysForTier(tier: BadgeTier): number {
  switch (tier) {
    case "diamond":
    case "platinum":
      return 30; // 1 month
    case "gold":
      return 14; // 2 weeks
    case "silver":
    case "bronze":
    default:
      return 7; // 1 week
  }
}

/**
 * Inspects a user's uploaded documents and calculates their live expiration status.
 */
export function getSmartApplyDocStatus(user: any): SmartApplyDocStatus {
  const hasResume = Boolean(user?.resume_url);
  const hasPortfolio = Boolean(user?.portfolio_file_url);
  const hasDocs = hasResume || hasPortfolio;

  const tier: BadgeTier = (user?.badge_tier as BadgeTier) || "bronze";
  const validityDays = getValidityDaysForTier(tier);

  if (!hasDocs || !user?.docs_expires_at) {
    return {
      hasDocs: false,
      hasResume,
      hasPortfolio,
      isExpired: false,
      isExpiringSoon: false,
      expiresAt: null,
      daysRemaining: 0,
      hoursRemaining: 0,
      validityDurationDays: validityDays,
      statusLabel: "No documents uploaded",
      statusColor: "gray",
    };
  }

  const now = new Date().getTime();
  const expiresAt = new Date(user.docs_expires_at);
  const diffMs = expiresAt.getTime() - now;

  const isExpired = diffMs <= 0;
  const hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const daysRemaining = Math.max(0, Math.floor(hoursRemaining / 24));
  const isExpiringSoon = !isExpired && hoursRemaining <= 24;

  let statusLabel = `Active • ${daysRemaining > 0 ? `${daysRemaining} days left` : `${hoursRemaining}h left`}`;
  let statusColor: "emerald" | "amber" | "red" | "gray" = "emerald";

  if (isExpired) {
    statusLabel = "Expired • Please re-upload";
    statusColor = "red";
  } else if (isExpiringSoon) {
    statusLabel = `Expiring soon • ${hoursRemaining}h left`;
    statusColor = "amber";
  }

  return {
    hasDocs,
    hasResume,
    hasPortfolio,
    isExpired,
    isExpiringSoon,
    expiresAt,
    daysRemaining,
    hoursRemaining,
    validityDurationDays: validityDays,
    statusLabel,
    statusColor,
  };
}

/**
 * Dynamic Template Placeholders
 */
export const TEMPLATE_COMPONENTS = [
  { tag: "{{position}}", label: "Job Position", icon: "🎯", desc: "e.g. Junior Architect" },
  { tag: "{{firm_name}}", label: "Hiring Firm", icon: "🏢", desc: "e.g. Studio Lotus" },
  { tag: "{{name}}", label: "Applicant Name", icon: "👤", desc: "Your full name" },
  { tag: "{{city}}", label: "City", icon: "📍", desc: "Your current city" },
  { tag: "{{experience}}", label: "Total Experience", icon: "⏱️", desc: "e.g. 2 years and 4 months" },
  { tag: "{{degree}}", label: "Degree & College", icon: "🎓", desc: "e.g. B.Arch from SPA Delhi" },
  { tag: "{{graduation_year}}", label: "Graduation Year", icon: "📅", desc: "e.g. 2024" },
  { tag: "{{previous_firms}}", label: "Previous Firms", icon: "🏛️", desc: "Firms you worked at" },
  { tag: "{{coa_number}}", label: "COA Registration", icon: "🛡️", desc: "Council registration number" },
  { tag: "{{resume_link}}", label: "Resume Link", icon: "📄", desc: "Direct download link for resume" },
  { tag: "{{portfolio_link}}", label: "Portfolio Link", icon: "📁", desc: "Direct download link for portfolio" },
  { tag: "{{certificates_links}}", label: "Experience Certificates", icon: "📜", desc: "Links to uploaded certificates" },
  { tag: "{{profile_link}}", label: "TI2A Profile Link", icon: "🔗", desc: "Your public TI2A profile" },
  { tag: "{{phone}}", label: "Phone Number", icon: "📞", desc: "Your contact number" },
  { tag: "{{email}}", label: "Email Address", icon: "✉️", desc: "Your registered email" },
];

/**
 * Returns human-written default email subject
 */
export function getDefaultSubject(): string {
  return "Application for the position of {{position}}";
}

/**
 * Returns authentic, human-written default email body
 */
export function getDefaultBody(): string {
  return `Dear Hiring Team,

I am {{name}} from {{city}}. I completed my {{degree}} in the year {{graduation_year}}. I have a cumulative experience of {{experience}} and have previously worked with firms like {{previous_firms}}. {{coa_number}}

I would like to apply for the position of {{position}} in your esteemed firm. I have attached my resume, portfolio, and experience certificates below for your kind consideration:

• Resume: {{resume_link}}
• Portfolio: {{portfolio_link}}
• Experience Certificates: {{certificates_links}}

You can also view my complete verified profile at: {{profile_link}}

Thank you for your time and consideration.

Sincerely,
{{name}}
Contact: {{phone}} | {{email}}`;
}

/**
 * Replaces dynamic placeholders in a template with actual candidate and job data.
 */
export function compileEmailTemplate(
  template: { subject?: string; body?: string },
  context: {
    user: any;
    job: { position?: string; firm_name?: string };
    totalExpFormatted?: string;
    educations?: any[];
    experiences?: any[];
  }
): { subject: string; body: string } {
  const { user, job, totalExpFormatted, educations = [], experiences = [] } = context;

  const rawSubject = template.subject || getDefaultSubject();
  const rawBody = template.body || getDefaultBody();

  // 1. Gather values
  const position = job?.position || "Architect";
  const firmName = job?.firm_name || "Esteemed Firm";
  const name = user?.fullName || user?.display_name || user?.username || "Applicant";
  const city = user?.city || educations[0]?.city || "India";
  const experience = totalExpFormatted || "Fresher";

  // Highest degree
  const primaryEdu = educations[0];
  const degree = primaryEdu
    ? `${primaryEdu.degree_name || "Architecture"}${primaryEdu.college_name ? ` from ${primaryEdu.college_name}` : ""}`
    : "Architecture Degree";

  const gradYear = primaryEdu?.end_date
    ? new Date(primaryEdu.end_date).getFullYear().toString()
    : "recent";

  // Previous firms
  const firmList = experiences
    .map((e) => e.firm_name)
    .filter(Boolean)
    .slice(0, 3);
  const previousFirms = firmList.length > 0 ? firmList.join(", ") : "reputed practices";

  // COA text
  const coaText =
    user?.coa_number && user.coa_is_active
      ? `I am a registered architect with Council of Architecture (COA) registration number ${user.coa_number}.`
      : "";

  // Document Links
  const resumeLink = user?.resume_url ? user.resume_url : "(Resume not attached)";
  const portfolioLink = user?.portfolio_file_url ? user.portfolio_file_url : "(Portfolio not attached)";

  const certUrls = experiences
    .filter((e) => e.certificate_url)
    .map((e) => `${e.firm_name}: ${e.certificate_url}`);
  const certificatesLinks = certUrls.length > 0 ? certUrls.join("\n• ") : "(No certificates attached)";

  const profileLink = user?.username
    ? `https://trappedintoarchitecture.com/profile/${user.username}`
    : "https://trappedintoarchitecture.com";

  const phone = user?.phone || "";
  const email = user?.email || "";

  const replacements: Record<string, string> = {
    "{{position}}": position,
    "{{firm_name}}": firmName,
    "{{name}}": name,
    "{{city}}": city,
    "{{experience}}": experience,
    "{{degree}}": degree,
    "{{graduation_year}}": gradYear,
    "{{previous_firms}}": previousFirms,
    "{{coa_number}}": coaText,
    "{{resume_link}}": resumeLink,
    "{{portfolio_link}}": portfolioLink,
    "{{certificates_links}}": certificatesLinks,
    "{{profile_link}}": profileLink,
    "{{phone}}": phone,
    "{{email}}": email,
  };

  let compiledSubject = rawSubject;
  let compiledBody = rawBody;

  for (const [key, val] of Object.entries(replacements)) {
    // Replace all occurrences
    compiledSubject = compiledSubject.split(key).join(val);
    compiledBody = compiledBody.split(key).join(val);
  }

  // Clean up any double spaces or empty lines caused by missing optional fields
  compiledBody = compiledBody.replace(/ +/g, " ");

  return {
    subject: compiledSubject.trim(),
    body: compiledBody.trim(),
  };
}
