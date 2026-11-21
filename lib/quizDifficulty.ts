export type QuestionCategory = "popular" | "master";
export type GameDifficulty = "easy" | "medium" | "hard";
export type AnyDifficulty = QuestionCategory | GameDifficulty;
export type QuestionDifficulty = QuestionCategory | "easy" | "medium" | "hard";

/**
 * Architectural Landmark Categorization (2 Categories):
 * - Popular: Globally famous landmarks, viral pop-culture icons, and foundation architectural masterpieces.
 * - Architecture Master: Advanced tectonic feats, structural innovations, deep syllabus monographs, and Pritzker milestones.
 */
export const BUILDING_DIFFICULTY_MAP: Record<string, QuestionCategory> = {
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

  // === ARCHITECTURE MASTER (25 Advanced Tectonic, Deep Architectural Theory & Syllabus Masterpieces) ===
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
 * Resolve individual question category: "popular" or "master"
 */
export function getQuestionDifficulty(identifier: string, acceptedAliases?: string[]): QuestionCategory {
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

export function getQuestionCategoryLabel(category: QuestionCategory | string): string {
  return category === "master" ? "Architecture Master" : "Popular";
}

export function getQuestionCategoryPoints(category: QuestionCategory | string): number {
  return category === "master" ? 300 : 100;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Sample questions for game difficulty:
 * - Easy: 100% Popular questions.
 * - Medium: 50% Popular + 50% Architecture Master.
 * - Hard: 75% Architecture Master + 25% Popular questions.
 */
export function getQuestionsForGameDifficulty<T extends { correct_answer?: string; question_text?: string; accepted_aliases?: string[] }>(
  allQuestions: T[],
  chosenDifficulty: GameDifficulty | string,
  requestedCount: number
): T[] {
  if (!allQuestions || allQuestions.length === 0) return [];

  // Categorize questions into the 2 categories
  const popularPool: T[] = [];
  const masterPool: T[] = [];

  for (const q of allQuestions) {
    const textToMatch = q.correct_answer || q.question_text || "";
    const diff = getQuestionDifficulty(textToMatch, q.accepted_aliases);
    if (diff === "master") masterPool.push(q);
    else popularPool.push(q);
  }

  const shuffledPopular = shuffle(popularPool);
  const shuffledMaster = shuffle(masterPool);

  const total = requestedCount === 999 ? allQuestions.length : Math.min(requestedCount, allQuestions.length);

  let targetPopularCount = 0;
  let targetMasterCount = 0;

  const diffLower = (chosenDifficulty || "medium").toLowerCase().trim();

  if (diffLower === "easy") {
    // 100% Popular questions
    targetPopularCount = total;
    targetMasterCount = 0;
  } else if (diffLower === "hard") {
    // 75% Architecture Master + 25% Popular
    targetMasterCount = Math.round(total * 0.75);
    targetPopularCount = total - targetMasterCount;
  } else {
    // Medium (Default): 50% Popular + 50% Architecture Master
    targetPopularCount = Math.round(total * 0.5);
    targetMasterCount = total - targetPopularCount;
  }

  // Draw from pools
  const selectedPopular = shuffledPopular.slice(0, targetPopularCount);
  const selectedMaster = shuffledMaster.slice(0, targetMasterCount);

  // Fallback if one pool doesn't have enough questions
  const currentTotal = selectedPopular.length + selectedMaster.length;
  if (currentTotal < total) {
    const needed = total - currentTotal;
    if (selectedPopular.length < targetPopularCount) {
      const remainingMaster = shuffledMaster.slice(targetMasterCount, targetMasterCount + needed);
      selectedMaster.push(...remainingMaster);
    } else {
      const remainingPopular = shuffledPopular.slice(targetPopularCount, targetPopularCount + needed);
      selectedPopular.push(...remainingPopular);
    }
  }

  // Interleave questions randomly for round playback
  return shuffle([...selectedPopular, ...selectedMaster]);
}
