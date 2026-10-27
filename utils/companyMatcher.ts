/**
 * Utility for normalizing company names and detecting duplicates/fuzzy matches
 * to prevent duplicate architecture practices from being published.
 */

const TYPOLOGY_NOISE_WORDS = [
  "architects",
  "architect",
  "architecture",
  "associates",
  "associate",
  "studio",
  "studios",
  "firm",
  "design",
  "designs",
  "group",
  "partners",
  "partner",
  "atelier",
  "consultants",
  "consultant",
  "planners",
  "planner",
  "interiors",
  "interior",
  "pvt",
  "ltd",
  "private",
  "limited",
  "co",
  "company",
  "llp",
  "inc",
];

/**
 * Normalizes a company name by removing brackets, punctuation, and common typology suffixes.
 * E.g., "Priyank Gupta Architects (PGA)" -> "priyank gupta"
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return "";

  // 1. Remove anything inside parentheses or brackets
  let clean = name.replace(/\([^)]*\)/g, " ").replace(/\[[^\]]*\]/g, " ");

  // 2. Remove all non-alphanumeric characters except spaces
  clean = clean.replace(/[^a-zA-Z0-9\s]/g, " ").toLowerCase();

  // 3. Tokenize words and strip common typology noise words
  const tokens = clean
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !TYPOLOGY_NOISE_WORDS.includes(token));

  return tokens.join(" ").trim();
}

/**
 * Extracts initials/acronym from a company name (e.g., "Priyank Gupta Architects" -> "pga").
 */
export function getCompanyInitials(name: string): string {
  if (!name) return "";
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  return words.map((w) => w[0].toLowerCase()).join("");
}

/**
 * Extracts any bracketed acronym (e.g. "Priyank Gupta Architects (PGA)" -> "pga")
 */
export function extractBracketAcronym(name: string): string | null {
  const match = name.match(/\(([^)]+)\)/);
  if (match && match[1]) {
    return match[1].toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  return null;
}

/**
 * Bigram-based Sørensen–Dice coefficient similarity between two strings (0.0 to 1.0).
 */
export function calculateDiceSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/\s+/g, "");
  const s2 = str2.toLowerCase().replace(/\s+/g, "");

  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const getBigrams = (str: string): Map<string, number> => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bigram = str.substring(i, i + 2);
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }
    return bigrams;
  };

  const bigrams1 = getBigrams(s1);
  const bigrams2 = getBigrams(s2);

  let intersection = 0;
  for (const [bigram, count1] of bigrams1.entries()) {
    if (bigrams2.has(bigram)) {
      intersection += Math.min(count1, bigrams2.get(bigram)!);
    }
  }

  const total = (s1.length - 1) + (s2.length - 1);
  return (2.0 * intersection) / total;
}

export interface MatchResult {
  matchedCompany: any;
  similarity: number;
  isExact: boolean;
  reason: string;
}

/**
 * Checks a typed firm name against a list of existing companies.
 * Returns the best matching company if similarity exceeds the threshold or if normalized names match.
 */
export function findMatchingCompany(
  inputName: string,
  existingCompanies: any[],
  threshold = 0.75
): MatchResult | null {
  if (!inputName || !inputName.trim() || !existingCompanies || existingCompanies.length === 0) {
    return null;
  }

  const rawInput = inputName.trim().toLowerCase();
  const normInput = normalizeCompanyName(inputName);
  const inputAcronym = extractBracketAcronym(inputName);
  const inputInitials = getCompanyInitials(inputName);

  let bestMatch: MatchResult | null = null;
  let highestScore = 0;

  for (const comp of existingCompanies) {
    const rawComp = (comp.firm_name || "").trim().toLowerCase();
    const normComp = normalizeCompanyName(comp.firm_name || "");
    const compAcronym = extractBracketAcronym(comp.firm_name || "");
    const compInitials = getCompanyInitials(comp.firm_name || "");

    // 1. Direct exact match (case-insensitive)
    if (rawInput === rawComp) {
      return {
        matchedCompany: comp,
        similarity: 1.0,
        isExact: true,
        reason: "Exact name match",
      };
    }

    // 2. Normalized name match (e.g. "Priyank Gupta Architects" vs "Priyank Gupta Architecture Firm")
    if (normInput.length >= 3 && normComp.length >= 3 && normInput === normComp) {
      return {
        matchedCompany: comp,
        similarity: 0.98,
        isExact: true,
        reason: "Normalized name match",
      };
    }

    // 3. Acronym in brackets matches (e.g., "(PGA)" matches initials of "Priyank Gupta Architects")
    if (
      (inputAcronym && (inputAcronym === compInitials || inputAcronym === compAcronym)) ||
      (compAcronym && (compAcronym === inputInitials || compAcronym === inputAcronym))
    ) {
      // If one string starts with the other's base
      if (normInput.length >= 3 && normComp.length >= 3 && (normInput.includes(normComp) || normComp.includes(normInput))) {
        return {
          matchedCompany: comp,
          similarity: 0.95,
          isExact: false,
          reason: "Acronym & studio name match",
        };
      }
    }

    // 4. Substring containment on normalized names (if one is at least 4 chars long)
    if (normInput.length >= 4 && normComp.length >= 4) {
      if (normInput.startsWith(normComp) || normComp.startsWith(normInput)) {
        const sim = Math.min(normInput.length, normComp.length) / Math.max(normInput.length, normComp.length);
        if (sim >= 0.70 && sim > highestScore) {
          highestScore = sim;
          bestMatch = {
            matchedCompany: comp,
            similarity: sim,
            isExact: false,
            reason: "Similar studio prefix",
          };
        }
      }
    }

    // 5. Dice Bigram Similarity on normalized names
    if (normInput && normComp) {
      const diceScore = calculateDiceSimilarity(normInput, normComp);
      if (diceScore >= threshold && diceScore > highestScore) {
        highestScore = diceScore;
        bestMatch = {
          matchedCompany: comp,
          similarity: diceScore,
          isExact: false,
          reason: `${Math.round(diceScore * 100)}% name similarity`,
        };
      }
    }
  }

  return bestMatch;
}
