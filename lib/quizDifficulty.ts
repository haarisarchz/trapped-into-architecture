export type QuestionCategory = "popular" | "50-50" | "master";
export type GameDifficulty = "easy" | "medium" | "hard";
export type AnyDifficulty = QuestionCategory | GameDifficulty;
export type QuestionDifficulty = QuestionCategory | "easy" | "medium" | "hard";

/**
 * Architectural Landmark Categorization (3 Categories):
 * - Popular: Globally famous landmarks, viral pop-culture icons, and foundation architectural masterpieces.
 * - 50-50 (Intermediate): Moderately recognizable landmarks, regional masterworks, and mid-tier architectural icons.
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
 * Resolve individual question category: "popular", "50-50", or "master"
 */
export function getQuestionDifficulty(identifier: string, acceptedAliases?: string[]): QuestionCategory {
  if (acceptedAliases && Array.isArray(acceptedAliases)) {
    const tag = acceptedAliases.find(a => typeof a === "string" && a.startsWith("diff:"));
    if (tag) {
      const val = tag.split(":")[1]?.trim().toLowerCase();
      if (val === "50-50" || val === "fifty-fifty" || val === "intermediate") return "50-50";
      if (val === "master" || val === "hard") return "master";
      if (val === "popular" || val === "easy") return "popular";
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
  if (category === "50-50") return "50-50 Intermediate";
  if (category === "master") return "Architecture Master";
  return "Popular";
}

export function getGameDifficultyPoints(diff: GameDifficulty | string): number {
  const d = (diff || "medium").toLowerCase();
  if (d === "easy" || d === "popular") return 150;
  if (d === "hard" || d === "master") return 450;
  return 300; // Medium
}

export function getGameDifficultyClueDeduction(diff: GameDifficulty | string): number {
  const d = (diff || "medium").toLowerCase();
  if (d === "easy" || d === "popular") return 50;
  if (d === "hard" || d === "master") return 150;
  return 100; // Medium
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
 * Sample questions strictly adhering to Game Difficulty rules:
 * - Easy: Only 10 or 20 Qs. 10 Qs = 100% Popular. 20 Qs = All Popular first + remainder from 50-50.
 * - Medium: Only 20 or 50 Qs. 20 Qs = All 50-50 first + remainder split equally between Popular & Master (if odd, Master upper hand).
 * - Hard: 10, 20 or 50 Qs. 10 Qs = 100% Master. 20 Qs = 100% Master. 50 Qs = 75% Master, 15% 50-50, 10% Popular.
 */
export function getQuestionsForGameDifficulty<T extends { correct_answer?: string; question_text?: string; accepted_aliases?: string[] }>(
  allQuestions: T[],
  chosenDifficulty: GameDifficulty | string,
  requestedCount: number
): T[] {
  if (!allQuestions || allQuestions.length === 0) return [];

  // Categorize questions into the 3 categories
  const popularPool: T[] = [];
  const fiftyFiftyPool: T[] = [];
  const masterPool: T[] = [];

  for (const q of allQuestions) {
    const textToMatch = q.correct_answer || q.question_text || "";
    const diff = getQuestionDifficulty(textToMatch, q.accepted_aliases);
    if (diff === "50-50") fiftyFiftyPool.push(q);
    else if (diff === "master") masterPool.push(q);
    else popularPool.push(q);
  }

  const shuffledPopular = shuffle(popularPool);
  const shuffled5050 = shuffle(fiftyFiftyPool);
  const shuffledMaster = shuffle(masterPool);

  const diffLower = (chosenDifficulty || "medium").toLowerCase().trim();
  const total = requestedCount === 999 ? allQuestions.length : Math.min(requestedCount, allQuestions.length);

  let selected: T[] = [];

  if (diffLower === "easy") {
    // Easy: 10 Qs (100% Popular) or 20 Qs (All Popular + remainder from 50-50)
    if (total <= 10) {
      selected = shuffledPopular.slice(0, total);
      if (selected.length < total) {
        selected.push(...shuffled5050.slice(0, total - selected.length));
      }
    } else {
      // 20 Qs on Easy
      const takePop = Math.min(shuffledPopular.length, total);
      selected = [...shuffledPopular.slice(0, takePop)];
      const needed = total - selected.length;
      if (needed > 0) {
        selected.push(...shuffled5050.slice(0, needed));
      }
      // If still needed (e.g. 50-50 pool is small), fill from master as safe fallback
      if (selected.length < total) {
        selected.push(...shuffledMaster.slice(0, total - selected.length));
      }
    }
  } else if (diffLower === "hard") {
    // Hard: 10 Qs = 100% Master, 20 Qs = 100% Master, 50 Qs = 75% Master, 15% 50-50, 10% Popular
    if (total <= 20) {
      selected = shuffledMaster.slice(0, total);
      if (selected.length < total) {
        selected.push(...shuffled5050.slice(0, total - selected.length));
      }
      if (selected.length < total) {
        selected.push(...shuffledPopular.slice(0, total - selected.length));
      }
    } else {
      // 50 Qs on Hard: 75% Master, 15% 50-50, 10% Popular
      const targetMaster = Math.min(shuffledMaster.length, Math.round(total * 0.75));
      const target5050 = Math.min(shuffled5050.length, Math.round(total * 0.15));
      selected = [
        ...shuffledMaster.slice(0, targetMaster),
        ...shuffled5050.slice(0, target5050)
      ];
      const remaining = total - selected.length;
      selected.push(...shuffledPopular.slice(0, remaining));
      // Fallback if still under total: fill from any remaining questions in master, 50-50, or popular
      if (selected.length < total) {
        const leftPool = [...shuffledMaster, ...shuffled5050, ...shuffledPopular].filter(q => !selected.includes(q));
        selected.push(...leftPool.slice(0, total - selected.length));
      }
    }
  } else {
    // Medium: 20 Qs or 50 Qs.
    // 20 Qs: All 50-50 first, remainder equally split between Popular & Master (if odd, Master upper hand)
    if (total <= 20) {
      selected = [...shuffled5050.slice(0, Math.min(shuffled5050.length, total))];
      const needed = total - selected.length;
      if (needed > 0) {
        const half = Math.floor(needed / 2);
        const masterShare = needed % 2 !== 0 ? half + 1 : half; // Master gets upper hand if odd
        const popularShare = needed - masterShare;
        selected.push(...shuffledMaster.slice(0, masterShare));
        selected.push(...shuffledPopular.slice(0, popularShare));
      }
      if (selected.length < total) {
        const leftPool = [...shuffledMaster, ...shuffledPopular, ...shuffled5050].filter(q => !selected.includes(q));
        selected.push(...leftPool.slice(0, total - selected.length));
      }
    } else {
      // 50 Qs on Medium: Balanced across 50-50, Popular, and Master
      const target5050 = Math.min(shuffled5050.length, Math.round(total * 0.4));
      const remaining = total - target5050;
      const targetPop = Math.floor(remaining / 2);
      const targetMaster = remaining - targetPop;
      selected = [
        ...shuffled5050.slice(0, target5050),
        ...shuffledPopular.slice(0, targetPop),
        ...shuffledMaster.slice(0, targetMaster)
      ];
      if (selected.length < total) {
        const leftPool = [...shuffledMaster, ...shuffledPopular, ...shuffled5050].filter(q => !selected.includes(q));
        selected.push(...leftPool.slice(0, total - selected.length));
      }
    }
  }

  // Shuffle question order so players get a fresh randomized sequence
  return shuffle(selected);
}
