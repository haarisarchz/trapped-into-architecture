export type QuestionDifficulty = "easy" | "medium" | "hard";

/**
 * Architectural Landmark Difficulty Classification
 * - Easy: Globally famous, pop culture, viral in reels/social media, 1st/2nd year core syllabus (e.g. Sydney Opera House, Fallingwater, Louvre Pyramid).
 * - Medium: Core architecture syllabus classics, celebrated modern milestones (e.g. Salk Institute, Chandigarh Capitol, Church of the Light).
 * - Hard: Deep tectonic, regional masterpieces, niche Pritzker works (e.g. Braga Quarry Stadium, UTEC Lima, Ningbo Museum).
 */
export const BUILDING_DIFFICULTY_MAP: Record<string, QuestionDifficulty> = {
  // === EASY (15 Globally Famous / Viral / Syllabus Foundations) ===
  "Sydney Opera House": "easy",
  "Fallingwater (Kaufmann Residence)": "easy",
  "Grand Louvre Pyramid": "easy",
  "Lotus Temple (Bahá'í House of Worship)": "easy",
  "Guggenheim Museum Bilbao": "easy",
  "Villa Savoye": "easy",
  "CCTV Headquarters": "easy",
  "Heydar Aliyev Center": "easy",
  "City of Arts and Sciences (Ciudad de las Artes y las Ciencias)": "easy",
  "Barcelona Pavilion (German Pavilion)": "easy",
  "Cathedral of Brasília (Catedral Metropolitana)": "easy",
  "Reichstag New German Parliament": "easy",
  "Louvre Abu Dhabi": "easy",
  "Elbphilharmonie": "easy",
  "Munich Olympic Stadium Roof": "easy",

  // === MEDIUM (15 Standard Architecture Syllabus & Modern Icons) ===
  "Salk Institute for Biological Studies": "medium",
  "Palace of Assembly (Chandigarh Capitol Complex)": "medium",
  "Rolex Learning Center": "medium",
  "The Getty Center": "medium",
  "Lloyd's Building (The Inside-Out Building)": "medium",
  "Church of the Light (Ibaraki Kasugaoka)": "medium",
  "Matrimandir": "medium",
  "Lever House": "medium",
  "Amdavad ni Gufa (Husain-Doshi Gufa)": "medium",
  "Casa Luis Barragán": "medium",
  "Jawahar Kala Kendra (JKK)": "medium",
  "Vanna Venturi House": "medium",
  "Cardboard Cathedral (Christchurch Transitional Cathedral)": "medium",
  "Bharat Bhavan": "medium",
  "Hall of Nations (Pragati Maidan)": "medium",

  // === HARD (15 Advanced Tectonic, Structural & Deep Historical Masterpieces) ===
  "Braga Municipal Stadium (Estádio Municipal de Braga)": "hard",
  "UTEC Campus (Universidad de Ingeniería y Tecnología)": "hard",
  "Caltrans District 7 Headquarters": "hard",
  "Neues Museum (Restoration)": "hard",
  "Ningbo Historic Museum": "hard",
  "Sendai Mediatheque": "hard",
  "Yokosuka Museum of Art": "hard",
  "National Museum of Roman Art (MNAR)": "hard",
  "Norwegian Glacier Museum (Norsk Bremuseum)": "hard",
  "Ford Foundation Building": "hard",
  "Haas Haus": "hard",
  "Yoyogi National Gymnasium": "hard",
  "Neue Staatsgalerie": "hard",
  "Nara Centennial Hall": "hard",
  "Cité de la Musique (Philharmonie 2)": "hard"
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
