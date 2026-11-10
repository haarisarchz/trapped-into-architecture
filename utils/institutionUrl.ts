export function generateInstitutionSlug(name: string, coaCode?: string): string {
  if (!name && !coaCode) return "institution";
  const base = name ? name.toLowerCase().trim() : (coaCode || "").toLowerCase().trim();
  const clean = base
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  
  // If we have a COA code, we can suffix it to guarantee unique URLs across states if names overlap
  if (coaCode && !clean.includes(coaCode.toLowerCase())) {
    return `${clean}-${coaCode.toLowerCase()}`.replace(/-+/g, "-");
  }
  return clean;
}

export function normalizeInstitutionName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
