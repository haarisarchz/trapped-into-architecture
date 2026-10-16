/**
 * Standardize and club job positions across Trapped Into Architecture.
 * Clubs variant spellings, abbreviations, and composite titles:
 * - Draft / Draught variations -> "Architectural Drafts Person"
 * - Intern variations -> "Architectural Intern"
 * - Jr. / Junior / Fresher Architect variations -> "Junior Architect"
 * - Architect / Designer & General Architect variations -> "Architect"
 * - Site Manager & Project Manager remain separate.
 */

export function normalizePosition(raw?: string | null): string {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s) return "";
  const lower = s.toLowerCase();

  // 1. Draft / Draught variations -> "Architectural Drafts Person"
  // Covers: Draftsman, 2D Draftsman, Draftman, Draughtsman, Draftsperson, Draughtsperson, Draftspersons, etc.
  if (lower.includes("draft") || lower.includes("draught")) {
    return "Architectural Drafts Person";
  }

  // 2. Intern variations -> "Architectural Intern"
  // Covers: Architectural Intern, Intern Architect, Intern, Architecture Intern, Interns, Intern Architects
  if (lower.includes("intern")) {
    return "Architectural Intern";
  }

  // 3. Junior Architect (including Fresher Architect and Jr. variations)
  // Covers: Junior Architect, Junior Architects, Jr. Architect, Jr Architect, Fresher Architect, Fresher architect, Freshers Architect
  if (
    /^(?:jr\.?|junior|freshers?)\s+architects?$/i.test(lower) ||
    (lower.includes("fresher") && lower.includes("architect"))
  ) {
    return "Junior Architect";
  }

  // 4. Senior Architect
  if (/^(?:sr\.?|senior)\s+architects?$/i.test(lower)) {
    return "Senior Architect";
  }

  // 5. Junior Interior Designer
  if (/^(?:jr\.?|junior)\s+interior\s+designers?$/i.test(lower)) {
    return "Junior Interior Designer";
  }

  // 6. Senior Interior Designer
  if (/^(?:sr\.?|senior)\s+interior\s+designers?$/i.test(lower)) {
    return "Senior Interior Designer";
  }

  // 7. Interior Designer
  if (/^interior\s+designers?$/i.test(lower)) {
    return "Interior Designer";
  }

  // 8. 3D Visualizer / Visualiser
  if (/^3d\s+visuali[sz]er$/i.test(lower)) {
    return "3D Visualizer";
  }

  // 9. Architect (including Architect/Designer and plural Architects)
  // Covers: Architect, Architects, Architect / Designer, Architect/Designer, Architect & Designer, Architect and Designer, Designer / Architect
  if (
    /^architects?$/i.test(lower) ||
    /^architects?\s*[\/\\&+\-]\s*designers?$/i.test(lower) ||
    /^architects?\s+and\s+designers?$/i.test(lower) ||
    /^designers?\s*[\/\\&+\-]\s*architects?$/i.test(lower)
  ) {
    return "Architect";
  }

  // 10. Project Architect
  if (/^project\s+architects?$/i.test(lower)) {
    return "Project Architect";
  }

  // 11. Site Architect
  if (/^site\s+architects?$/i.test(lower)) {
    return "Site Architect";
  }

  // 12. Team Lead Architect
  if (/^team\s+lead\s+architects?$/i.test(lower)) {
    return "Team Lead Architect";
  }

  // 13. MEP Designer
  if (/^mep\s+designers?$/i.test(lower)) {
    return "MEP Designer";
  }

  // 14. Quantity Surveyor
  if (/^quantity\s+surveyors?$/i.test(lower)) {
    return "Quantity Surveyor";
  }

  // 15. Billing Engineer
  if (/^billing\s+engineers?$/i.test(lower)) {
    return "Billing Engineer";
  }

  // 16. Civil Engineer
  if (/^civil\s+engineers?$/i.test(lower)) {
    return "Civil Engineer";
  }

  // 17. Site Engineer
  if (/^site\s+engineers?$/i.test(lower)) {
    return "Site Engineer";
  }

  // 18. Site Supervisor
  if (/^site\s+supervisors?$/i.test(lower)) {
    return "Site Supervisor";
  }

  // 19. Site Manager (Kept separate as requested)
  if (/^site\s+managers?$/i.test(lower)) {
    return "Site Manager";
  }

  // 20. Project Manager (Kept separate as requested)
  if (/^project\s+managers?$/i.test(lower)) {
    return "Project Manager";
  }

  // 21. Graphic Designer
  if (/^graphic\s+designers?$/i.test(lower)) {
    return "Graphic Designer";
  }

  // Default: Preserve original string in Title Case / clean trim
  return s
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
