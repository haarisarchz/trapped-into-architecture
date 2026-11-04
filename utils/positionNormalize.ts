/**
 * Standardize and club job positions across Trapped Into Architecture.
 * Clubs variant spellings, abbreviations, and composite titles:
 * - Draft / Draught variations -> "Architectural Drafts Person"
 * - Intern variations -> "Architectural Intern"
 * - Jr. / Junior / Fresher / Assistant Architect variations -> "Junior Architect"
 * - Architect / Designer & General Architect variations -> "Architect"
 * - Site Manager & Project Manager remain separate.
 */

export interface PositionClub {
  canonical: string;
  synonyms: string[];
  description: string;
}

export const POSITION_CLUBS: Record<string, PositionClub> = {
  "Architectural Drafts Person": {
    canonical: "Architectural Drafts Person",
    synonyms: [
      "Draftsperson",
      "Draftsmen",
      "Draftsman",
      "Draftmens",
      "Draftswoman",
      "Draftswomen",
      "Draughtsman",
      "Draughtsmen",
      "Draughtsperson",
      "Draftspersons",
      "2D Draftsman",
      "3D Draftsman",
      "Architectural Draftsperson",
      "CAD Draftsman",
      "AutoCAD Draftsman",
      "Senior Draftsman",
      "Draftperson",
      "Draftman",
      "Drafts person",
      "Drafting",
    ],
    description: "Architectural & CAD drafting roles (Draftsperson, Draftsmen, Draftsman, Draftswomen, Draughtsman)",
  },
  "Junior Architect": {
    canonical: "Junior Architect",
    synonyms: [
      "Junior Architect",
      "Jr. Architect",
      "Jr Architect",
      "Fresher Architect",
      "Fresher architect",
      "Fresh Architect",
      "Freshers Architect",
      "Assistant Architect",
      "Architecture Assistant",
      "Graduate Architect",
      "Junior / Mid Architect",
      "Junior Architects",
    ],
    description: "Entry-level, fresher, and junior architect roles (Junior Architect, Assistant Architect, Fresher Architect)",
  },
  "Architectural Intern": {
    canonical: "Architectural Intern",
    synonyms: [
      "Architectural Intern",
      "Architecture Intern",
      "Intern Architect",
      "Intern",
      "Interns",
      "Architectural Interns",
      "Architecture Interns",
      "Intern Architects",
      "Architecture Trainee",
      "Design Intern",
      "Trainee Architect",
    ],
    description: "Student internships and architectural trainee roles",
  },
  "Senior Architect": {
    canonical: "Senior Architect",
    synonyms: [
      "Senior Architect",
      "Senior architect",
      "Sr. Architect",
      "Sr Architect",
      "Lead Architect",
      "Principal Architect",
      "Associate Architect",
      "Team Lead Architect",
    ],
    description: "Senior and leadership architectural roles",
  },
  "Interior Designer": {
    canonical: "Interior Designer",
    synonyms: [
      "Interior Designer",
      "Interior designer",
      "Interior Designers",
      "Interior Architect",
      "Interior Decorator",
      "Architect / Interior Designer",
      "Architecture & Interior Design",
    ],
    description: "Interior design and decoration positions",
  },
  "Junior Interior Designer": {
    canonical: "Junior Interior Designer",
    synonyms: [
      "Junior Interior Designer",
      "Jr. Interior Designer",
      "Jr Interior Designer",
      "Junior Designer",
      "Fresher Interior Designer",
    ],
    description: "Junior and entry-level interior design roles",
  },
  "Senior Interior Designer": {
    canonical: "Senior Interior Designer",
    synonyms: [
      "Senior Interior Designer",
      "Sr. Interior Designer",
      "Sr Interior Designer",
      "Lead Interior Designer",
    ],
    description: "Senior interior designer and project lead roles",
  },
  "3D Visualizer": {
    canonical: "3D Visualizer",
    synonyms: [
      "3D Visualizer",
      "3D Visualiser",
      "3D Modeller",
      "3D Artist",
      "Architectural Visualizer",
      "Render Artist",
      "CGI Artist",
    ],
    description: "3D visualization, modeling, and rendering roles",
  },
  "Architect": {
    canonical: "Architect",
    synonyms: [
      "Architect",
      "Architects",
      "Architect / Designer",
      "Architect & Designer",
      "Architectural Designer",
      "Design Associate",
      "Design Architect",
    ],
    description: "General and design architect positions",
  },
  "Site Engineer": {
    canonical: "Site Engineer",
    synonyms: [
      "Site Engineer",
      "Site Supervisor",
      "Site supervisor",
      "Site Co-ordinator",
      "Site Architect",
    ],
    description: "Site engineering, coordination, and supervision roles",
  },
  "Project Architect": {
    canonical: "Project Architect",
    synonyms: [
      "Project Architect",
      "Project Architect / Coordinator",
    ],
    description: "Project management and project architect positions",
  },
};

export function normalizePosition(raw?: string | null): string {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s) return "";
  const lower = s.toLowerCase();

  // 1. Draft / Draught variations -> "Architectural Drafts Person"
  // Covers: Draftsman, 2D Draftsman, Draftman, Draughtsman, Draftsperson, Draughtsperson, Draftspersons, Draftswoman, Draftswomen, Draftmens, etc.
  if (lower.includes("draft") || lower.includes("draught")) {
    return "Architectural Drafts Person";
  }

  // 2. Intern variations -> "Architectural Intern"
  // Covers: Architectural Intern, Intern Architect, Intern, Architecture Intern, Interns, Intern Architects
  if (lower.includes("intern")) {
    return "Architectural Intern";
  }

  // 3. Junior Architect (including Fresher Architect, Assistant Architect, and Jr. variations)
  // Covers: Junior Architect, Junior Architects, Jr. Architect, Jr Architect, Fresher Architect, Fresher architect, Freshers Architect, Assistant Architect, Architecture Assistant
  if (
    /^(?:jr\.?|junior|freshers?|assistant)\s+architects?$/i.test(lower) ||
    (lower.includes("fresher") && lower.includes("architect")) ||
    (lower.includes("assistant") && lower.includes("architect"))
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

/**
 * Finds the clubbed position record for any query or title.
 * Matches by exact canonical title, normalization, or synonym inclusion.
 */
export function getClubbedPositionInfo(query?: string | null): PositionClub | null {
  if (!query) return null;
  const q = String(query).trim().toLowerCase();
  if (!q || q.length < 2) return null;

  // 1. Direct normalization match
  const norm = normalizePosition(q);
  if (POSITION_CLUBS[norm]) {
    return POSITION_CLUBS[norm];
  }

  // 2. Check if query matches any club's canonical title
  for (const club of Object.values(POSITION_CLUBS)) {
    if (club.canonical.toLowerCase() === q || club.canonical.toLowerCase().includes(q) || q.includes(club.canonical.toLowerCase())) {
      return club;
    }
  }

  // 3. Check if query matches any synonym
  for (const club of Object.values(POSITION_CLUBS)) {
    const synMatch = club.synonyms.some(s => {
      const sLower = s.toLowerCase();
      return sLower === q || sLower.includes(q) || q.includes(sLower);
    });
    if (synMatch) return club;
  }

  return null;
}

/**
 * Checks whether a job's position matches a user's search query,
 * fully taking into account normalized canonical positions and all clubbed synonyms.
 */
export function matchesPosition(jobPosition?: string | null, searchQuery?: string | null): boolean {
  if (!jobPosition || !searchQuery) return false;
  const jRaw = String(jobPosition).trim().toLowerCase();
  const q = String(searchQuery).trim().toLowerCase();
  if (!q) return true;

  // 1. Raw substring match
  if (jRaw.includes(q)) return true;

  // 2. Normalized job position match
  const normJob = normalizePosition(jobPosition);
  if (normJob && normJob.toLowerCase().includes(q)) return true;

  // 3. Normalized query match against normalized job
  const normQuery = normalizePosition(searchQuery);
  if (normQuery && normJob && normJob.toLowerCase() === normQuery.toLowerCase()) {
    return true;
  }

  // 4. Clubbed position group matching
  const queryClub = getClubbedPositionInfo(q);
  if (queryClub) {
    if (normJob && queryClub.canonical.toLowerCase() === normJob.toLowerCase()) {
      return true;
    }
    const matchesSynonym = queryClub.synonyms.some(s => {
      const sLower = s.toLowerCase();
      return jRaw.includes(sLower) || sLower.includes(jRaw);
    });
    if (matchesSynonym) return true;
  }

  // 5. Reverse check: does the job's club match the query?
  const jobClub = getClubbedPositionInfo(jobPosition);
  if (jobClub) {
    if (jobClub.canonical.toLowerCase().includes(q) || q.includes(jobClub.canonical.toLowerCase())) {
      return true;
    }
    const matchesSynonym = jobClub.synonyms.some(s => {
      const sLower = s.toLowerCase();
      return sLower.includes(q) || q.includes(sLower);
    });
    if (matchesSynonym) return true;
  }

  return false;
}

export interface PositionSuggestionItem {
  title: string;
  type: "canonical" | "synonym";
  canonical: string;
  badge?: string;
  description?: string;
  allSynonyms?: string[];
}

/**
 * Generates smart auto-suggestions for the search bar as the user types.
 * E.g., typing "draft" or "draftswomen" suggests:
 * - "Architectural Drafts Person" (Clubbed Position)
 * - "Draftsperson", "Draftsmen", "Draftsman", "Draftswoman", "Draughtsman"
 */
export function getPositionSuggestions(query?: string | null, limit: number = 8): PositionSuggestionItem[] {
  if (!query || String(query).trim().length < 2) return [];
  const q = String(query).trim().toLowerCase();
  const results: PositionSuggestionItem[] = [];
  const added = new Set<string>();

  const club = getClubbedPositionInfo(q);
  if (club) {
    // 1. Add canonical clubbed position first
    results.push({
      title: club.canonical,
      type: "canonical",
      canonical: club.canonical,
      badge: "Clubbed Position",
      description: club.description,
      allSynonyms: club.synonyms,
    });
    added.add(club.canonical.toLowerCase());

    // 2. Add matching or primary synonyms from the club
    club.synonyms.forEach(syn => {
      const sLower = syn.toLowerCase();
      if (!added.has(sLower)) {
        results.push({
          title: syn,
          type: "synonym",
          canonical: club.canonical,
          badge: "Related Title",
        });
        added.add(sLower);
      }
    });
  }

  // 3. Also check if query partially matches any other canonical positions
  for (const c of Object.values(POSITION_CLUBS)) {
    if (club && c.canonical === club.canonical) continue;
    if (c.canonical.toLowerCase().includes(q)) {
      if (!added.has(c.canonical.toLowerCase())) {
        results.push({
          title: c.canonical,
          type: "canonical",
          canonical: c.canonical,
          badge: "Position",
          description: c.description,
          allSynonyms: c.synonyms,
        });
        added.add(c.canonical.toLowerCase());
      }
    }
  }

  return results.slice(0, limit);
}
