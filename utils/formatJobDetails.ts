/**
 * Utility functions to format salary and experience consistently across
 * the job details page, job cards, company listings, and social share posts.
 */

/**
 * Formats a salary string so that if the minimum and maximum numbers are identical
 * (e.g. "20k - 20k Per Month", "20k to 20k", "4 LPA - 4 LPA"), it collapses to a single value
 * (e.g. "20k Per Month", "4 LPA").
 */
export function formatSalary(rawSalary?: string | null): string {
  if (!rawSalary) return "";
  const str = String(rawSalary).trim();
  if (!str) return "";

  const lower = str.toLowerCase();
  if (
    [
      "not disclosed",
      "not specified",
      "negotiable",
      "-",
      "null",
      "as per industry standards",
      "as per industry standard",
    ].includes(lower)
  ) {
    return str;
  }

  // Match range formats: "X - Y", "X to Y", "X – Y", "X — Y"
  const match = str.match(/^(.+?)\s*(?:-|–|—|\bto\b)\s*(.+)$/i);
  if (match) {
    const part1 = match[1].trim();
    const part2 = match[2].trim();

    // Extract leading/main number from each part (ignoring commas)
    const n1Match = part1.replace(/,/g, "").match(/[\d.]+/);
    const n2Match = part2.replace(/,/g, "").match(/[\d.]+/);

    if (n1Match && n2Match && parseFloat(n1Match[0]) === parseFloat(n2Match[0])) {
      const hasUnit2 = /(?:lpa|per month|month|pm|\/mo|k)\b/i.test(part2);
      const hasUnit1 = /(?:lpa|per month|month|pm|\/mo|k)\b/i.test(part1);
      const prefix =
        (part1.startsWith("₹") || str.startsWith("₹")) && !part2.startsWith("₹")
          ? "₹"
          : "";

      if (hasUnit2) {
        return prefix + part2;
      } else if (hasUnit1) {
        return prefix + part1;
      } else {
        return prefix + part2;
      }
    }
  }

  return str;
}

/**
 * Formats a single experience string (e.g. "2-2 Years" -> "2 Years", "0-0 Years" -> "Fresher").
 */
function cleanSingleExp(str?: string | null): string {
  if (!str) return "";
  const s = String(str).trim();
  const lower = s.toLowerCase();
  if (lower === "not disclosed" || lower === "not specified" || lower === "null") {
    return "";
  }

  // Match range formats: "X - Y Years", "X to Y", etc.
  const match = s.match(/^(.+?)\s*(?:-|–|—|\bto\b)\s*(.+)$/i);
  if (match) {
    const part1 = match[1].trim();
    const part2 = match[2].trim();

    const n1Match = part1.match(/\d+/);
    const n2Match = part2.match(/\d+/);

    if (n1Match && n2Match && parseInt(n1Match[0], 10) === parseInt(n2Match[0], 10)) {
      const val = parseInt(n1Match[0], 10);
      if (val === 0) return "Fresher";
      if (val === 1) return "1 Year";
      return `${val} Years`;
    }
  }

  return s;
}

/**
 * Formats experience values (strings or arrays).
 * Normalizes ranges like "2-2 Years" to "2 Years" and "0-0 Years" to "Fresher".
 */
export function formatExperience(rawExp?: any): string {
  if (!rawExp) return "";
  if (Array.isArray(rawExp)) {
    const cleaned = rawExp
      .filter(Boolean)
      .map((e) => cleanSingleExp(e))
      .filter((e) => e.length > 0);
    if (cleaned.length > 0) {
      return Array.from(new Set(cleaned)).join(", ");
    }
    return "";
  }
  return cleanSingleExp(rawExp);
}
