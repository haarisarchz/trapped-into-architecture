export function generateInstitutionSlug(name: string, city?: string): string {
  if (!name) return "institution";
  let target = name.trim();
  if (city && !target.toLowerCase().includes(city.toLowerCase().trim())) {
    target = `${target} ${city.trim()}`;
  }
  return target
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeInstitutionName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
