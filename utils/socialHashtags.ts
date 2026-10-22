import { GoogleGenAI } from "@google/genai";

/**
 * Converts a raw string (e.g. "Studio Coherent", "New Delhi", "Tamil Nadu", "B.Arch")
 * into a clean PascalCase hashtag token without spaces or invalid punctuation.
 */
export function cleanHashtagWord(str: string): string {
  if (!str) return "";
  const cleaned = str
    .replace(/&/g, "And")
    .replace(/[/\\+]/g, " ")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
  return cleaned;
}

/**
 * Case-insensitively deduplicates and cleans hashtags, strictly enforcing max limit.
 */
export function deduplicateAndLimitHashtags(tags: string[], maxLimit: number): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of tags) {
    if (!raw) continue;
    let tag = raw.trim();
    if (!tag.startsWith("#")) {
      tag = "#" + tag;
    }
    // Remove unwanted characters except alphanumeric
    const token = tag.slice(1).replace(/[^a-zA-Z0-9]/g, "");
    if (!token) continue; // skip bare '#'

    const formatted = `#${token}`;
    const lower = formatted.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(formatted);
      if (result.length >= maxLimit) break;
    }
  }

  return result;
}

/**
 * Analyzes the batch of jobs to determine advertised disciplines and levels.
 */
export function analyzeBatch(jobs: any[], company?: any) {
  const mainJob = jobs[0] || {};
  const firmName = mainJob.firm_name || company?.name || company?.firm_name || "";
  const city = mainJob.city || company?.city || "";
  const state = mainJob.state || company?.state || "";
  const country = mainJob.country || company?.country || "India";

  const isIndia = (() => {
    if (!country) return true;
    const c = country.trim().toLowerCase();
    if (c === "india" || c === "in") return true;
    if (c !== "" && c !== "india" && c !== "in") return false;
    return true;
  })();

  let hasArchitecture = false;
  let hasInterior = false;
  let hasInternship = false;
  let hasJuniorFresher = false;
  let hasCivil = false;
  let hasLandscape = false;
  let hasUrban = false;

  const positions: string[] = [];

  for (const job of jobs) {
    const pos = (job.position || "").toLowerCase();
    const empType = (job.employment_type || "").toLowerCase();
    const exp = Array.isArray(job.experience)
      ? job.experience.join(" ").toLowerCase()
      : String(job.experience || "").toLowerCase();

    if (job.position) positions.push(job.position);

    if (pos.includes("interior")) {
      hasInterior = true;
    }
    if (
      pos.includes("architect") ||
      pos.includes("architecture") ||
      pos.includes("b.arch") ||
      pos.includes("m.arch") ||
      pos.includes("draftsman") ||
      pos.includes("cad") ||
      pos.includes("revit") ||
      pos.includes("bim")
    ) {
      hasArchitecture = true;
    }
    if (pos.includes("civil") || pos.includes("structural") || pos.includes("construction")) {
      hasCivil = true;
    }
    if (pos.includes("landscape")) {
      hasLandscape = true;
    }
    if (pos.includes("urban")) {
      hasUrban = true;
    }
    if (
      empType.includes("intern") ||
      pos.includes("intern") ||
      pos.includes("internship") ||
      pos.includes("trainee")
    ) {
      hasInternship = true;
    }
    if (
      pos.includes("junior") ||
      pos.includes("fresher") ||
      exp.includes("0-") ||
      exp.includes("0 to") ||
      exp.includes("fresher") ||
      exp.includes("entry")
    ) {
      hasJuniorFresher = true;
    }
  }

  // Default to architecture if neither architecture nor interior/civil explicitly triggered
  if (!hasArchitecture && !hasInterior && !hasCivil) {
    hasArchitecture = true;
  }

  return {
    firmName,
    city,
    state,
    country,
    isIndia,
    hasArchitecture,
    hasInterior,
    hasInternship,
    hasJuniorFresher,
    hasCivil,
    hasLandscape,
    hasUrban,
    positions
  };
}

/**
 * Deterministic hashtag generator based on structured job fields.
 * Generates up to 15 relevant hashtags for Facebook and 5 for Instagram.
 */
export function generateDeterministicHashtags(jobs: any[], platform: string, company?: any): string[] {
  const maxLimit = platform === "facebook" ? 15 : platform === "instagram" ? 5 : platform === "x" ? 4 : 5;
  const analysis = analyzeBatch(jobs, company);

  const cleanFirm = cleanHashtagWord(analysis.firmName);
  const cleanCity = cleanHashtagWord(analysis.city);
  const cleanState = cleanHashtagWord(analysis.state);
  const cleanCountry = cleanHashtagWord(analysis.country);

  const tier1Specific: string[] = [];
  const tier2Recruitment: string[] = [];
  const tier3Discovery: string[] = [];

  // ==========================================
  // TIER 1: The first 5–6 specific hashtags
  // ==========================================

  // 1. Company / Firm
  if (cleanFirm && cleanFirm.toLowerCase() !== "unknownfirm" && cleanFirm.length > 2) {
    tier1Specific.push(`#${cleanFirm}`);
  }

  // 2. City-specific
  if (cleanCity) {
    tier1Specific.push(`#${cleanCity}Jobs`);
    if (analysis.hasArchitecture) {
      tier1Specific.push(`#ArchitectJobs${cleanCity}`);
      tier1Specific.push(`#${cleanCity}Architects`);
    }
    if (analysis.hasInterior) {
      tier1Specific.push(`#InteriorDesignerJobs${cleanCity}`);
      tier1Specific.push(`#${cleanCity}InteriorDesigners`);
    }
    if (analysis.hasInternship) {
      tier1Specific.push(`#ArchitectureInternship${cleanCity}`);
    }
  }

  // 3. State-specific
  if (cleanState && cleanState.toLowerCase() !== cleanCity.toLowerCase()) {
    tier1Specific.push(`#${cleanState}Jobs`);
  }

  // 4. Role-specific specific tags
  if (analysis.hasInternship) {
    tier1Specific.push("#ArchitectureInternship");
  }
  if (analysis.hasJuniorFresher && analysis.hasArchitecture) {
    tier1Specific.push("#JuniorArchitectJobs");
  }
  if (analysis.hasInterior) {
    tier1Specific.push("#InteriorDesignerJobs");
  }
  if (analysis.hasArchitecture) {
    tier1Specific.push("#ArchitectJobs");
  }

  // ==========================================
  // TIER 2: Category & Recruitment Hashtags
  // ==========================================

  // Architecture jobs category
  if (analysis.hasArchitecture) {
    tier2Recruitment.push("#ArchitectureJobs");
    if (analysis.isIndia) {
      tier2Recruitment.push("#ArchitectJobsIndia");
      tier2Recruitment.push("#ArchitectureJobsIndia");
    } else if (cleanCountry) {
      tier2Recruitment.push(`#ArchitectJobs${cleanCountry}`);
      tier2Recruitment.push(`#ArchitectureJobs${cleanCountry}`);
    }
    tier2Recruitment.push("#HiringArchitects");
    tier2Recruitment.push("#ArchitectHiring");
    tier2Recruitment.push("#ArchitectureHiring");
    tier2Recruitment.push("#ArchitectureCareers");
  }

  // Interior design jobs category
  if (analysis.hasInterior) {
    tier2Recruitment.push("#InteriorDesignJobs");
    if (analysis.isIndia) {
      tier2Recruitment.push("#InteriorDesignerJobsIndia");
    } else if (cleanCountry) {
      tier2Recruitment.push(`#InteriorDesignerJobs${cleanCountry}`);
    }
    tier2Recruitment.push("#HiringInteriorDesigners");
    tier2Recruitment.push("#InteriorDesignCareers");
  }

  // Internships and entry-level opportunities category
  if (analysis.hasInternship || analysis.hasJuniorFresher) {
    tier2Recruitment.push("#ArchitecturalInternship");
    if (analysis.isIndia) {
      tier2Recruitment.push("#ArchitectureInternshipsIndia");
    }
    tier2Recruitment.push("#ArchitectureFreshers");
    tier2Recruitment.push("#FreshersJobs");
    tier2Recruitment.push("#EntryLevelArchitectureJobs");
  }

  // Engineering / Landscape / Urban if applicable
  if (analysis.hasCivil) {
    tier2Recruitment.push("#CivilEngineeringJobs");
  }
  if (analysis.hasLandscape) {
    tier2Recruitment.push("#LandscapeArchitectureJobs");
  }
  if (analysis.hasUrban) {
    tier2Recruitment.push("#UrbanPlanningJobs");
  }

  // ==========================================
  // TIER 3: Broader Discovery & General Recruitment
  // ==========================================

  if (analysis.isIndia) {
    tier3Discovery.push("#IndiaJobs");
    tier3Discovery.push("#JobsInIndia");
    tier3Discovery.push("#HiringInIndia");
  } else if (cleanCountry) {
    tier3Discovery.push(`#${cleanCountry}Jobs`);
    tier3Discovery.push(`#JobsIn${cleanCountry}`);
  }

  tier3Discovery.push("#HiringNow");
  tier3Discovery.push("#NowHiring");
  tier3Discovery.push("#JobOpenings");
  tier3Discovery.push("#JobVacancies");

  // Combine and deduplicate
  const allCandidates = [...tier1Specific, ...tier2Recruitment, ...tier3Discovery];
  return deduplicateAndLimitHashtags(allCandidates, maxLimit);
}

/**
 * AI-powered hashtag generator using Gemini with timeout and error handling.
 * Returns null if AI generation fails so the caller can fall back.
 */
async function generateAiHashtags(jobs: any[], platform: string, company?: any): Promise<string[] | null> {
  const envKey =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    "";
  const apiKey = envKey.split(",")[0]?.trim();
  if (!apiKey) return null;

  const maxLimit = platform === "facebook" ? 15 : platform === "instagram" ? 5 : platform === "x" ? 4 : 5;
  const analysis = analyzeBatch(jobs, company);

  const prompt = `You are an expert social media manager for the architecture and design job portal "Trapped Into Architecture".
Generate relevant hashtags for a ${platform === "facebook" ? "Facebook" : "Instagram"} job posting based ONLY on this advertisement:

Company / Firm: ${analysis.firmName || "Architecture Firm"}
Location: ${analysis.city ? analysis.city + ", " : ""}${analysis.state ? analysis.state + ", " : ""}${analysis.country}
Positions Advertised:
${analysis.positions.map((p, i) => `${i + 1}. ${p}`).join("\n")}

STRICT RULES:
1. Return between ${maxLimit >= 15 ? "12 and 15" : "4 and 5"} relevant hashtags separated by spaces.
2. Under no circumstance exceed ${maxLimit} hashtags.
3. The first 5-6 hashtags MUST be highly specific to the advertisement (e.g. firm name if meaningful, city-specific like #${cleanHashtagWord(analysis.city)}Jobs, state-specific, specific role titles).
4. The remaining hashtags MUST strictly match the advertised positions:
   ${analysis.hasArchitecture ? "- Include architecture recruitment hashtags (e.g. #ArchitectJobs, #ArchitectureJobs, #HiringArchitects)." : "- Do NOT include architect hashtags."}
   ${analysis.hasInterior ? "- Include interior design recruitment hashtags (e.g. #InteriorDesignerJobs, #InteriorDesignJobs, #HiringInteriorDesigners)." : "- Do NOT include interior design hashtags because no interior roles are advertised."}
   ${analysis.hasInternship || analysis.hasJuniorFresher ? "- Include internship/fresher hashtags (e.g. #ArchitectureInternship, #FreshersJobs)." : "- Do NOT include internship hashtags."}
   ${analysis.isIndia ? "- Include India recruitment hashtags (e.g. #ArchitectJobsIndia, #JobsInIndia)." : `- Include ${cleanHashtagWord(analysis.country)} recruitment hashtags. Do NOT use India hashtags.`}
   - Include general recruitment hashtags (e.g. #HiringNow, #JobOpenings).
5. All hashtags must start with '#' and contain ONLY letters and numbers (no spaces, no punctuation).
6. Return ONLY the hashtags separated by spaces. No markdown, no explanations, no quotes.`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    // 5-second timeout to prevent any delay during job publishing
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI generation timeout")), 5000)
    );

    const generatePromise = ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{ text: prompt }]
    });

    const res = await Promise.race([generatePromise, timeoutPromise]);
    const output = (res as any)?.text || "";

    const matches = output.match(/#[a-zA-Z0-9]+/g);
    if (!matches || matches.length < (platform === "facebook" ? 6 : 3)) {
      return null;
    }

    // Filter AI tags to make sure they obey position relevance
    const filteredAiTags = matches.filter((tag: string) => {
      const lower = tag.toLowerCase();
      if (!analysis.hasInterior && lower.includes("interior")) return false;
      if (!analysis.hasInternship && !analysis.hasJuniorFresher && (lower.includes("intern") || lower.includes("fresher"))) return false;
      if (!analysis.isIndia && lower.includes("india")) return false;
      return true;
    });

    // Supplement with deterministic specific tags to guarantee city/firm relevance at the front
    const deterministic = generateDeterministicHashtags(jobs, platform, company);
    const combined = [...deterministic.slice(0, 4), ...filteredAiTags, ...deterministic];

    return deduplicateAndLimitHashtags(combined, maxLimit);
  } catch (err: any) {
    console.warn("AI hashtag generation failed, falling back to deterministic:", err?.message || err);
    return null;
  }
}

/**
 * Main entry point: Generates relevant, deduplicated hashtags for social media publishing.
 * Prioritizes AI generation with automated deterministic fallback.
 * Strictly enforces platform limits (up to 15 for Facebook, max 5 for Instagram).
 */
export async function generateSocialHashtags(jobs: any[], platform: string, company?: any): Promise<string[]> {
  try {
    const aiTags = await generateAiHashtags(jobs, platform, company);
    if (aiTags && aiTags.length > 0) {
      return aiTags;
    }
  } catch (err) {
    console.warn("Error in generateSocialHashtags AI step:", err);
  }

  return generateDeterministicHashtags(jobs, platform, company);
}
