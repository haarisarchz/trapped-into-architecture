export type QuestionDifficulty = "easy" | "medium" | "hard";

/**
 * Architectural Landmark Difficulty Classification
 * - Easy: Globally famous, pop culture, viral in reels/social media, 1st/2nd year core syllabus (e.g. Sydney Opera House, Fallingwater, Louvre Pyramid).
 * - Medium: Core architecture syllabus classics, celebrated modern milestones (e.g. Salk Institute, Chandigarh Capitol, Church of the Light).
 * - Hard: Deep tectonic, regional masterpieces, niche Pritzker works (e.g. Braga Quarry Stadium, UTEC Lima, Ningbo Museum).
 */
export const BUILDING_DIFFICULTY_MAP: Record<string, QuestionDifficulty> = {
  // === EASY (15 Globally Famous / Pop Culture / Foundation Icons) ===
  "Fallingwater (Kaufmann Residence)": "easy",
  "Sydney Opera House": "easy",
  "Grand Louvre Pyramid": "easy",
  "The Gherkin (30 St Mary Axe)": "easy",
  "Sagrada Família": "easy",
  "Guggenheim Museum Bilbao": "easy",
  "Walt Disney Concert Hall": "easy",
  "Centre Pompidou": "easy",
  "The Shard": "easy",
  "Lotus Temple (Bahá'í House of Worship)": "easy",
  "Gateway Arch": "easy",
  "CCTV Headquarters": "easy",
  "The Oculus (World Trade Center Hub)": "easy",
  "Reichstag New German Parliament": "easy",
  "Heydar Aliyev Center": "easy",

  // === MEDIUM (25 Core Architecture Syllabus & Modern Icons) ===
  "Villa Savoye": "medium",
  "Chapelle Notre Dame du Haut (Ronchamp)": "medium",
  "Unité d'Habitation (Cité Radieuse)": "medium",
  "Barcelona Pavilion (German Pavilion)": "medium",
  "Farnsworth House": "medium",
  "Seagram Building": "medium",
  "Solomon R. Guggenheim Museum": "medium",
  "Church of the Light (Ibaraki Kasugaoka)": "medium",
  "Dancing House (Tančící dům)": "medium",
  "Casa Batlló": "medium",
  "Casa Milà (La Pedrera)": "medium",
  "Salk Institute for Biological Studies": "medium",
  "Kanchanjunga Apartments": "medium",
  "Jawahar Kala Kendra (JKK)": "medium",
  "IIM Ahmedabad (Louis Kahn Campus)": "medium",
  "Indian Institute of Management Bangalore (IIMB)": "medium",
  "Sangath (Vastu Shilpa Consultants)": "medium",
  "The Glass House": "medium",
  "Cathedral of Brasília (Catedral Metropolitana)": "medium",
  "TWA Flight Center": "medium",
  "Elbphilharmonie": "medium",
  "Lloyd's Building": "medium",
  "Louvre Abu Dhabi": "medium",
  "City of Arts and Sciences": "medium",
  "Palace of Assembly (Chandigarh Capitol Complex)": "medium",

  // === HARD (25 Advanced Tectonic, Deep Architectural Theory & Syllabus Masterpieces) ===
  "Robie House (Frederick C. Robie House)": "hard",
  "Row House in Sumiyoshi (Azuma House)": "hard",
  "Chichu Art Museum": "hard",
  "Hearst Tower": "hard",
  "HSBC Main Building": "hard",
  "National Assembly Building of Bangladesh (Jatiya Sangsad Bhaban)": "hard",
  "Amdavad ni Gufa (Husain-Doshi Gufa)": "hard",
  "Gandhi Smarak Sangrahalaya (Sabarmati Ashram)": "hard",
  "Bharat Bhavan": "hard",
  "Champalimaud Centre for the Unknown": "hard",
  "Therme Vals (7132 Thermal Baths)": "hard",
  "Rolex Learning Center": "hard",
  "Sendai Mediatheque": "hard",
  "Munich Olympic Stadium Roof": "hard",
  "Casa Luis Barragán": "hard",
  "Yoyogi National Gymnasium": "hard",
  "Matrimandir": "hard",
  "Hall of Nations (Pragati Maidan)": "hard",
  "Centre for Development Studies (CDS)": "hard",
  "Indian Institute of Forest Management (IIFM)": "hard",
  "IIT Kanpur Campus": "hard",
  "MAXXI Museum (National Museum of 21st Century Arts)": "hard",
  "Villa Mairea": "hard",
  "Paimio Sanatorium": "hard",
  "The Getty Center": "hard"
};

/**
 * Resolve difficulty for any question based on explicit tag or building name/correct answer
 */
export function getQuestionDifficulty(identifier: string, acceptedAliases?: string[]): QuestionDifficulty {
  // 1. Check if acceptedAliases contains explicit tag: "diff:easy" | "diff:medium" | "diff:hard"
  if (acceptedAliases && Array.isArray(acceptedAliases)) {
    const tag = acceptedAliases.find(a => typeof a === "string" && a.startsWith("diff:"));
    if (tag) {
      const val = tag.split(":")[1]?.trim().toLowerCase();
      if (val === "easy" || val === "medium" || val === "hard") {
        return val as QuestionDifficulty;
      }
    }
  }

  if (!identifier) return "medium";
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

  return "medium";
}

/**
 * Filter and prioritize question pool according to selected game difficulty
 */
export function getQuestionsForGameDifficulty<T extends { correct_answer?: string; question_text?: string; accepted_aliases?: string[] }>(
  allQuestions: T[],
  chosenDifficulty: QuestionDifficulty,
  requestedCount: number
): T[] {
  if (!allQuestions || allQuestions.length === 0) return [];

  // Categorize questions
  const easyQuestions: T[] = [];
  const mediumQuestions: T[] = [];
  const hardQuestions: T[] = [];

  for (const q of allQuestions) {
    // Check answer or text and explicit aliases
    const textToMatch = q.correct_answer || q.question_text || "";
    const diff = getQuestionDifficulty(textToMatch, q.accepted_aliases);
    if (diff === "easy") easyQuestions.push(q);
    else if (diff === "hard") hardQuestions.push(q);
    else mediumQuestions.push(q);
  }

  let targetedPool: T[] = [];

  if (chosenDifficulty === "easy") {
    // Easy mode: strictly prioritize Easy (famous / viral / syllabus basics)
    // If user requested more than available easy, supplement with lighter medium
    targetedPool = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
    return targetedPool.slice(0, requestedCount === 999 ? targetedPool.length : Math.min(requestedCount, targetedPool.length));
  } else if (chosenDifficulty === "medium") {
    // Medium mode: balanced blend of Medium + Easy
    targetedPool = [...mediumQuestions, ...easyQuestions, ...hardQuestions];
    return targetedPool.slice(0, requestedCount === 999 ? targetedPool.length : requestedCount);
  } else {
    // Hard mode: prioritize Hard (advanced tectonic / deep monographs), then Medium
    targetedPool = [...hardQuestions, ...mediumQuestions, ...easyQuestions];
    return targetedPool.slice(0, requestedCount === 999 ? targetedPool.length : requestedCount);
  }
}
