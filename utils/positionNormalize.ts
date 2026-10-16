/**
 * Standardize and club job positions across Trapped Into Architecture.
 * Clubs variant spellings and abbreviations (e.g. "Jr. Architect" -> "Junior Architect",
 * draft/draught variations -> "Architectural Drafts Person", intern variations -> "Architectural Intern").
 */

export function normalizePosition(raw?: string | null): string {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s) return "";
  const lower = s.toLowerCase();

  // 1. Draft / Draught variations -> "Architectural Drafts Person"
  // Covers: Draftsman, 2D Draftsman, Draftman, Draughtsman, Draftsperson, Draughtsperson, etc.
  if (lower.includes("draft") || lower.includes("draught")) {
    return "Architectural Drafts Person";
  }

  // 2. Intern variations -> "Architectural Intern"
  // Covers: Architectural Intern, Intern Architect, Intern, Architecture Intern, Interns, Intern Architects
  if (lower.includes("intern")) {
    return "Architectural Intern";
  }

  // 3. Junior Architect
  if (/^(?:jr\.?|junior)\s+architects?$/i.test(lower)) {
    return "Junior Architect";
  }

  // 4. Senior Architect
  if (/^(?:sr\.?|senior)\s+architects?$/i.test(lower)) {
    return "Senior Architect";
  }

  // 5. Fresher Architect
  if (/^fresher\s+architects?$/i.test(lower)) {
    return "Fresher Architect";
  }

  // 6. Junior Interior Designer
  if (/^(?:jr\.?|junior)\s+interior\s+designers?$/i.test(lower)) {
    return "Junior Interior Designer";
  }

  // 7. Senior Interior Designer
  if (/^(?:sr\.?|senior)\s+interior\s+designers?$/i.test(lower)) {
    return "Senior Interior Designer";
  }

  // 8. Interior Designer
  if (/^interior\s+designers?$/i.test(lower)) {
    return "Interior Designer";
  }

  // 9. 3D Visualizer / Visualiser
  if (/^3d\s+visuali[sz]er$/i.test(lower)) {
    return "3D Visualizer";
  }

  // 10. General Architect
  if (/^architects?$/i.test(lower)) {
    return "Architect";
  }

  // 11. Project Architect
  if (/^project\s+architects?$/i.test(lower)) {
    return "Project Architect";
  }

  // 12. Site Architect
  if (/^site\s+architects?$/i.test(lower)) {
    return "Site Architect";
  }

  // 13. Team Lead Architect
  if (/^team\s+lead\s+architects?$/i.test(lower)) {
    return "Team Lead Architect";
  }

  // 14. MEP Designer
  if (/^mep\s+designers?$/i.test(lower)) {
    return "MEP Designer";
  }

  // 15. Quantity Surveyor
  if (/^quantity\s+surveyors?$/i.test(lower)) {
    return "Quantity Surveyor";
  }

  // 16. Billing Engineer
  if (/^billing\s+engineers?$/i.test(lower)) {
    return "Billing Engineer";
  }

  // 17. Civil Engineer
  if (/^civil\s+engineers?$/i.test(lower)) {
    return "Civil Engineer";
  }

  // 18. Site Engineer
  if (/^site\s+engineers?$/i.test(lower)) {
    return "Site Engineer";
  }

  // 19. Site Supervisor
  if (/^site\s+supervisors?$/i.test(lower)) {
    return "Site Supervisor";
  }

  // 20. Site Manager
  if (/^site\s+managers?$/i.test(lower)) {
    return "Site Manager";
  }

  // 21. Project Manager
  if (/^project\s+managers?$/i.test(lower)) {
    return "Project Manager";
  }

  // 22. Graphic Designer
  if (/^graphic\s+designers?$/i.test(lower)) {
    return "Graphic Designer";
  }

  // Default: Preserve original string in Title Case / clean trim
  return s
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
