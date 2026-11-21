export type LegacyDifficulty = "easy" | "medium" | "hard";
export type QuestionDifficulty = "popular" | "master";
export type AnyDifficulty = QuestionDifficulty | LegacyDifficulty;

/**
 * Architectural Landmark 2-Tier Classification
 * - Popular & Iconic: Globally famous landmarks, viral pop-culture icons, and foundation architectural masterpieces (100 PTS • 15s/Q).
 * - Deep Master: Advanced tectonic feats, structural innovations, deep syllabus monographs, and Pritzker milestones (300 PTS • 5s/Q lightning pace).
 */
export const BUILDING_DIFFICULTY_MAP: Record<string, QuestionDifficulty> = {
  // === POPULAR & ICONIC (40 Globally Famous, Pop Culture & Foundation Masterpieces) ===
  "Fallingwater (Kaufmann Residence)": "popular",
  "Sydney Opera House": "popular",
  "Grand Louvre Pyramid": "popular",
  "The Gherkin (30 St Mary Axe)": "popular",
  "Sagrada Família": "popular",
  "Guggenheim Museum Bilbao": "popular",
  "Walt Disney Concert Hall": "popular",
  "Centre Pompidou": "popular",
  "The Shard": "popular",
  "Lotus Temple (Bahá'í House of Worship)": "popular",
  "Gateway Arch": "popular",
  "CCTV Headquarters": "popular",
  "The Oculus (World Trade Center Hub)": "popular",
  "Reichstag New German Parliament": "popular",
  "Heydar Aliyev Center": "popular",
  "Villa Savoye": "popular",
  "Chapelle Notre Dame du Haut (Ronchamp)": "popular",
  "Unité d'Habitation (Cité Radieuse)": "popular",
  "Barcelona Pavilion (German Pavilion)": "popular",
  "Farnsworth House": "popular",
  "Seagram Building": "popular",
  "Solomon R. Guggenheim Museum": "popular",
  "Church of the Light (Ibaraki Kasugaoka)": "popular",
  "Dancing House (Tančící dům)": "popular",
  "Casa Batlló": "popular",
  "Casa Milà (La Pedrera)": "popular",
  "Salk Institute for Biological Studies": "popular",
  "Kanchanjunga Apartments": "popular",
  "Jawahar Kala Kendra (JKK)": "popular",
  "IIM Ahmedabad (Louis Kahn Campus)": "popular",
  "Indian Institute of Management Bangalore (IIMB)": "popular",
  "Sangath (Vastu Shilpa Consultants)": "popular",
  "The Glass House": "popular",
  "Cathedral of Brasília (Catedral Metropolitana)": "popular",
  "TWA Flight Center": "popular",
  "Elbphilharmonie": "popular",
  "Lloyd's Building": "popular",
  "Louvre Abu Dhabi": "popular",
  "City of Arts and Sciences": "popular",
  "Palace of Assembly (Chandigarh Capitol Complex)": "popular",

  // === DEEP MASTER (25 Advanced Tectonic, Deep Architectural Theory & Syllabus Masterpieces) ===
  "Robie House (Frederick C. Robie House)": "master",
  "Row House in Sumiyoshi (Azuma House)": "master",
  "Chichu Art Museum": "master",
  "Hearst Tower": "master",
  "HSBC Main Building": "master",
  "National Assembly Building of Bangladesh (Jatiya Sangsad Bhaban)": "master",
  "Amdavad ni Gufa (Husain-Doshi Gufa)": "master",
  "Gandhi Smarak Sangrahalaya (Sabarmati Ashram)": "master",
  "Bharat Bhavan": "master",
  "Champalimaud Centre for the Unknown": "master",
  "Therme Vals (7132 Thermal Baths)": "master",
  "Rolex Learning Center": "master",
  "Sendai Mediatheque": "master",
  "Munich Olympic Stadium Roof": "master",
  "Casa Luis Barragán": "master",
  "Yoyogi National Gymnasium": "master",
  "Matrimandir": "master",
  "Hall of Nations (Pragati Maidan)": "master",
  "Centre for Development Studies (CDS)": "master",
  "Indian Institute of Forest Management (IIFM)": "master",
  "IIT Kanpur Campus": "master",
  "MAXXI Museum (National Museum of 21st Century Arts)": "master",
  "Villa Mairea": "master",
  "Paimio Sanatorium": "master",
  "The Getty Center": "master"
};

/**
 * Normalize any legacy string ("easy" | "medium" | "hard") into the 2-tier system ("popular" | "master")
 */
export function normalizeDifficulty(diff?: string | null): QuestionDifficulty {
  if (!diff) return "popular";
  const lower = diff.toLowerCase().trim();
  if (lower === "master" || lower === "hard") return "master";
  return "popular";
}

export function getDifficultyLabel(diff?: string | null): string {
  const norm = normalizeDifficulty(diff);
  return norm === "master" ? "Deep Master" : "Popular & Iconic";
}

export function getDifficultyPoints(diff?: string | null): number {
  const norm = normalizeDifficulty(diff);
  return norm === "master" ? 300 : 100;
}

export function getDifficultySeconds(diff?: string | null): number {
  const norm = normalizeDifficulty(diff);
  return norm === "master" ? 5 : 15;
}

/**
 * Resolve difficulty for any question based on explicit tag or building name/correct answer
 */
export function getQuestionDifficulty(identifier: string, acceptedAliases?: string[]): QuestionDifficulty {
  // 1. Check if acceptedAliases contains explicit tag: "diff:popular" | "diff:master" | "diff:easy" | "diff:medium" | "diff:hard"
  if (acceptedAliases && Array.isArray(acceptedAliases)) {
    const tag = acceptedAliases.find(a => typeof a === "string" && a.startsWith("diff:"));
    if (tag) {
      const val = tag.split(":")[1]?.trim().toLowerCase();
      if (val === "master" || val === "hard") return "master";
      if (val === "popular" || val === "easy" || val === "medium") return "popular";
    }
  }

  if (!identifier) return "popular";
  const clean = identifier.trim();
  
  if (BUILDING_DIFFICULTY_MAP[clean]) {
    return BUILDING_DIFFICULTY_MAP[clean];
  }

  // Substring or fuzzy check
  for (const [key, diff] of Object.entries(BUILDING_DIFFICULTY_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return diff;
    }
  }

  return "popular";
}

/**
 * Filter and prioritize question pool according to selected game difficulty
 */
export function getQuestionsForGameDifficulty<T extends { correct_answer?: string; question_text?: string; accepted_aliases?: string[] }>(
  allQuestions: T[],
  chosenDifficulty: AnyDifficulty | string,
  requestedCount: number
): T[] {
  if (!allQuestions || allQuestions.length === 0) return [];
  const normalized = normalizeDifficulty(chosenDifficulty);

  // Categorize questions into 2 tiers
  const popularQuestions: T[] = [];
  const masterQuestions: T[] = [];

  for (const q of allQuestions) {
    const textToMatch = q.correct_answer || q.question_text || "";
    const diff = getQuestionDifficulty(textToMatch, q.accepted_aliases);
    if (diff === "master") masterQuestions.push(q);
    else popularQuestions.push(q);
  }

  let targetedPool: T[] = [];

  if (normalized === "popular") {
    // Popular mode: strictly prioritize Popular & Iconic landmarks first
    targetedPool = [...popularQuestions, ...masterQuestions];
  } else {
    // Master mode: strictly prioritize Deep Master tectonic landmarks first
    targetedPool = [...masterQuestions, ...popularQuestions];
  }

  return targetedPool.slice(0, requestedCount === 999 ? targetedPool.length : Math.min(requestedCount, targetedPool.length));
}
