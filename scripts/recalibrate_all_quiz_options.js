const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bcifyymjfktabtsmocnc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper to clean building name from excessive bracketed subtitles
function cleanBuildingName(name) {
  const map = {
    'Fallingwater (Kaufmann Residence)': 'Fallingwater',
    'The Gherkin (30 St Mary Axe)': 'The Gherkin',
    "Lotus Temple (Bahá'í House of Worship)": 'Lotus Temple',
    'The Oculus (World Trade Center Hub)': 'The Oculus',
    'Chapelle Notre Dame du Haut (Ronchamp)': 'Chapelle Notre Dame du Haut',
    "Unité d'Habitation (Cité Radieuse)": "Unité d'Habitation",
    'Barcelona Pavilion (German Pavilion)': 'Barcelona Pavilion',
    'Church of the Light (Ibaraki Kasugaoka)': 'Church of the Light',
    'Dancing House (Tančící dům)': 'Dancing House',
    'Casa Milà (La Pedrera)': 'Casa Milà',
    'Jawahar Kala Kendra (JKK)': 'Jawahar Kala Kendra',
    'IIM Ahmedabad (Louis Kahn Campus)': 'IIM Ahmedabad',
    'Indian Institute of Management Bangalore (IIMB)': 'IIM Bangalore',
    'Sangath (Vastu Shilpa Consultants)': 'Sangath',
    'Cathedral of Brasília (Catedral Metropolitana)': 'Cathedral of Brasília',
    'Palace of Assembly (Chandigarh Capitol Complex)': 'Palace of Assembly',
    'Robie House (Frederick C. Robie House)': 'Robie House',
    'Row House in Sumiyoshi (Azuma House)': 'Row House in Sumiyoshi',
    'National Assembly Building of Bangladesh (Jatiya Sangsad Bhaban)': 'National Assembly Building of Bangladesh',
    'Amdavad ni Gufa (Husain-Doshi Gufa)': 'Amdavad ni Gufa',
    'Gandhi Smarak Sangrahalaya (Sabarmati Ashram)': 'Gandhi Smarak Sangrahalaya',
    'Therme Vals (7132 Thermal Baths)': 'Therme Vals',
    'Hall of Nations (Pragati Maidan)': 'Hall of Nations',
    'Centre for Development Studies (CDS)': 'Centre for Development Studies',
    'Indian Institute of Forest Management (IIFM)': 'IIFM Bhopal',
    'MAXXI Museum (National Museum of 21st Century Arts)': 'MAXXI Museum'
  };
  return map[name] || name;
}

// Global easy distractors (obviously distinct world monuments)
const GLOBAL_EASY_DISTRACTORS = [
  'Eiffel Tower, France',
  'Taj Mahal, India',
  'Colosseum, Italy',
  'Big Ben, United Kingdom',
  'Empire State Building, United States',
  'Pyramids of Giza, Egypt',
  'Leaning Tower of Pisa, Italy',
  'Burj Khalifa, United Arab Emirates',
  'Statue of Liberty, United States',
  'Parthenon, Greece'
];

const EASY_ARCHITECT_DISTRACTORS = [
  'Michelangelo',
  'Leonardo da Vinci',
  'Christopher Wren',
  'Antoni Gaudí',
  'Gustave Eiffel',
  'Filippo Brunelleschi'
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function run() {
  console.log('Fetching all 65 architecture catalog rows...');
  const { data: catRows, error: catErr } = await supabase.from('architecture_catalog').select('id, data');
  if (catErr) throw catErr;

  console.log(`Loaded ${catRows.length} catalog rows.`);

  // 1. Clean building names and append country
  const cleanedItems = catRows.map(r => {
    const d = r.data;
    const baseName = cleanBuildingName(d.building_name);
    const country = d.country;
    const fullName = `${baseName}, ${country}`;
    return {
      id: r.id,
      ...d,
      base_building_name: baseName,
      display_name: fullName,
      country: country,
      city: d.city,
      architect: d.architect,
      difficulty: d.difficulty || 'medium',
      opened_year: parseInt(d.opened_year, 10),
      architectural_style: d.architectural_style,
      building_photo: d.building_photo,
      puzzle_clues: d.puzzle_clues
    };
  });

  // Update architecture_catalog rows
  console.log('Updating architecture_catalog in Supabase with clean names...');
  for (const item of cleanedItems) {
    await supabase.from('architecture_catalog').update({
      data: {
        ...item,
        building_name: item.display_name
      }
    }).eq('id', item.id);
  }

  // Fetch all quizzes
  const { data: quizzes } = await supabase.from('quizzes').select('id, slug, title');
  console.log('Found quizzes:', quizzes.map(q => q.slug));

  for (const quiz of quizzes) {
    console.log(`\n======================================================`);
    console.log(`Recalibrating options for: ${quiz.title} (${quiz.slug})`);
    console.log(`======================================================`);

    const { error: delErr } = await supabase.from('quiz_questions').delete().eq('quiz_id', quiz.id);
    if (delErr) console.warn('Delete error:', delErr.message);

    let newQuestions = [];

    // ==========================================
    // QUIZ 1: Guess the Building
    // ==========================================
    if (quiz.slug === 'iconic-world-landmarks-guess-the-building') {
      newQuestions = cleanedItems.map((b, idx) => {
        const correct = b.display_name;
        let options = [];

        if (b.difficulty === 'easy') {
          // Easy: Pick 3 obviously distinct global monuments
          const distractors = shuffle(GLOBAL_EASY_DISTRACTORS.filter(d => d !== correct)).slice(0, 3);
          options = shuffle([correct, ...distractors]);
        } else if (b.difficulty === 'medium') {
          // Medium: Plausible 20th-century modern icons of similar prominence
          const pool = cleanedItems.filter(x => x.display_name !== correct && (x.difficulty === 'medium' || x.difficulty === 'easy'));
          const distractors = shuffle(pool).slice(0, 3).map(x => x.display_name);
          options = shuffle([correct, ...distractors]);
        } else {
          // Hard: Tricky close competitors (same country, same material, or same master architect)
          let closePool = cleanedItems.filter(x => x.display_name !== correct && (x.country === b.country || x.architect === b.architect));
          if (closePool.length < 3) {
            closePool = cleanedItems.filter(x => x.display_name !== correct && x.difficulty === 'hard');
          }
          const distractors = shuffle(closePool).slice(0, 3).map(x => x.display_name);
          options = shuffle([correct, ...distractors]);
        }

        return {
          quiz_id: quiz.id,
          order_index: idx + 1,
          question_type: 'choose',
          question_text: 'Identify this iconic architectural landmark from the photo:',
          media_type: 'image',
          media_url: b.building_photo,
          options,
          correct_answer: correct,
          accepted_aliases: [`diff:${b.difficulty}`, correct, b.base_building_name],
          explanation_clue: `Designed by ${b.architect} in ${b.city}, ${b.country} (${b.opened_year}).\n\n${b.puzzle_clues}`
        };
      });
    }

    // ==========================================
    // QUIZ 2: Master Architects: Who Designed It?
    // ==========================================
    else if (quiz.slug === 'master-architects-who-designed-it') {
      newQuestions = cleanedItems.map((b, idx) => {
        const correct = b.architect;
        let options = [];

        if (b.difficulty === 'easy') {
          // Easy: Obviously distinct architects from different historical eras
          const distractors = shuffle(EASY_ARCHITECT_DISTRACTORS.filter(a => a !== correct)).slice(0, 3);
          options = shuffle([correct, ...distractors]);
        } else if (b.difficulty === 'medium') {
          // Medium: Famous mid-century modern peers
          const pool = Array.from(new Set(cleanedItems.map(x => x.architect).filter(a => a !== correct)));
          const distractors = shuffle(pool).slice(0, 3);
          options = shuffle([correct, ...distractors]);
        } else {
          // Hard: Closely aligned contemporaries from same region/typology
          const sameCountryArchs = Array.from(new Set(cleanedItems.filter(x => x.country === b.country && x.architect !== correct).map(x => x.architect)));
          let hardPool = sameCountryArchs;
          if (hardPool.length < 3) {
            const allArchs = Array.from(new Set(cleanedItems.filter(x => x.architect !== correct).map(x => x.architect)));
            hardPool = allArchs;
          }
          const distractors = shuffle(hardPool).slice(0, 3);
          options = shuffle([correct, ...distractors]);
        }

        return {
          quiz_id: quiz.id,
          order_index: idx + 1,
          question_type: 'choose',
          question_text: `Which architect or studio designed "${b.display_name}"?`,
          media_type: 'image',
          media_url: b.building_photo,
          options,
          correct_answer: correct,
          accepted_aliases: [`diff:${b.difficulty}`, correct],
          explanation_clue: `Designed by ${b.architect}. Style: ${b.architectural_style}.\n\n${b.puzzle_clues}`
        };
      });
    }

    // ==========================================
    // QUIZ 3: Where in the World?
    // ==========================================
    else if (quiz.slug === 'where-in-the-world-guess-the-city-country') {
      newQuestions = cleanedItems.map((b, idx) => {
        const correct = `${b.city}, ${b.country}`;
        let options = [];

        if (b.difficulty === 'easy') {
          // Easy: Distractors from completely different continents
          const distinctContinents = [
            'Tokyo, Japan',
            'Paris, France',
            'Sydney, Australia',
            'New York City, United States',
            'Cairo, Egypt',
            'Rio de Janeiro, Brazil'
          ].filter(l => l !== correct);
          const distractors = shuffle(distinctContinents).slice(0, 3);
          options = shuffle([correct, ...distractors]);
        } else if (b.difficulty === 'medium') {
          // Medium: Other famous architectural cities
          const pool = Array.from(new Set(cleanedItems.map(x => `${x.city}, ${x.country}`).filter(l => l !== correct)));
          const distractors = shuffle(pool).slice(0, 3);
          options = shuffle([correct, ...distractors]);
        } else {
          // Hard: Cities within same country or neighbouring region
          const sameCountryCities = Array.from(new Set(cleanedItems.filter(x => x.country === b.country && `${x.city}, ${x.country}` !== correct).map(x => `${x.city}, ${x.country}`)));
          let pool = sameCountryCities;
          if (pool.length < 3) {
            pool = Array.from(new Set(cleanedItems.map(x => `${x.city}, ${x.country}`).filter(l => l !== correct)));
          }
          const distractors = shuffle(pool).slice(0, 3);
          options = shuffle([correct, ...distractors]);
        }

        return {
          quiz_id: quiz.id,
          order_index: idx + 1,
          question_type: 'choose',
          question_text: `In which city and country is "${b.base_building_name}" located?`,
          media_type: 'image',
          media_url: b.building_photo,
          options,
          correct_answer: correct,
          accepted_aliases: [`diff:${b.difficulty}`, correct, b.city, b.country],
          explanation_clue: `Located in ${b.city}, ${b.country}. Opened in ${b.opened_year} by ${b.architect}.`
        };
      });
    }

    // ==========================================
    // QUIZ 4: Architectural Detective
    // ==========================================
    else if (quiz.slug === 'architectural-detective-guess-the-clues') {
      newQuestions = cleanedItems.map((b, idx) => {
        const correct = b.display_name;
        let options = [];

        if (b.difficulty === 'easy') {
          const distractors = shuffle(GLOBAL_EASY_DISTRACTORS.filter(d => d !== correct)).slice(0, 3);
          options = shuffle([correct, ...distractors]);
        } else if (b.difficulty === 'medium') {
          const pool = cleanedItems.filter(x => x.display_name !== correct && x.difficulty === 'medium');
          const distractors = shuffle(pool).slice(0, 3).map(x => x.display_name);
          options = shuffle([correct, ...distractors]);
        } else {
          // Hard: Tricky buildings from same architect or region
          let pool = cleanedItems.filter(x => x.display_name !== correct && (x.country === b.country || x.architect === b.architect));
          if (pool.length < 3) pool = cleanedItems.filter(x => x.display_name !== correct);
          const distractors = shuffle(pool).slice(0, 3).map(x => x.display_name);
          options = shuffle([correct, ...distractors]);
        }

        return {
          quiz_id: quiz.id,
          order_index: idx + 1,
          question_type: 'choose',
          question_text: `Architectural Detective: Identify this landmark from the forensic clues below:\n\n${b.puzzle_clues}`,
          media_type: 'none',
          media_url: null,
          options,
          correct_answer: correct,
          accepted_aliases: [`diff:${b.difficulty}`, correct, b.base_building_name],
          explanation_clue: `Solved: "${b.display_name}" by ${b.architect} (${b.opened_year}).`
        };
      });
    }

    // ==========================================
    // QUIZ 5: Timeline Challenge
    // ==========================================
    else if (quiz.slug === 'timeline-challenge-when-was-it-built') {
      newQuestions = cleanedItems.map((b, idx) => {
        const correct = String(b.opened_year);
        let options = [];

        if (b.difficulty === 'easy') {
          // Easy: Years spaced widely apart by 30 to 50 years
          const dist = [
            b.opened_year - 40,
            b.opened_year + 35,
            b.opened_year - 70,
            b.opened_year + 50
          ].filter(y => y > 1850 && y <= 2026 && y !== b.opened_year).map(String);
          options = shuffle([correct, ...shuffle(dist).slice(0, 3)]);
        } else if (b.difficulty === 'medium') {
          // Medium: Years spaced by 12 to 18 years
          const dist = [
            b.opened_year - 15,
            b.opened_year + 12,
            b.opened_year - 24,
            b.opened_year + 20
          ].filter(y => y > 1880 && y <= 2026 && y !== b.opened_year).map(String);
          options = shuffle([correct, ...shuffle(dist).slice(0, 3)]);
        } else {
          // Hard: Very close years within 2 to 5 years!
          const dist = [
            b.opened_year - 3,
            b.opened_year + 2,
            b.opened_year - 5,
            b.opened_year + 4
          ].filter(y => y > 1880 && y <= 2026 && y !== b.opened_year).map(String);
          options = shuffle([correct, ...shuffle(dist).slice(0, 3)]);
        }

        return {
          quiz_id: quiz.id,
          order_index: idx + 1,
          question_type: 'choose',
          question_text: `In which year was "${b.display_name}" officially completed and opened?`,
          media_type: 'image',
          media_url: b.building_photo,
          options,
          correct_answer: correct,
          accepted_aliases: [`diff:${b.difficulty}`, correct],
          explanation_clue: `Completed in ${b.opened_year} by ${b.architect}. ${b.puzzle_clues.split('\n')[0]}`
        };
      });
    }

    // ==========================================
    // QUIZ 6: Architectural Styles & Movements
    // ==========================================
    else if (quiz.slug === 'architectural-styles-and-movements') {
      const allStyles = Array.from(new Set(cleanedItems.map(x => x.architectural_style).filter(Boolean)));

      newQuestions = cleanedItems.map((b, idx) => {
        const correct = b.architectural_style;
        let options = [];

        if (b.difficulty === 'easy') {
          // Easy: Radically different architectural eras
          const easyStyles = ['Gothic Revival', 'Classical Baroque', 'Ancient Egyptian', 'Art Nouveau', 'Victorian'].filter(s => s !== correct);
          options = shuffle([correct, ...shuffle(easyStyles).slice(0, 3)]);
        } else if (b.difficulty === 'medium') {
          // Medium: Distinct modern styles
          const medPool = allStyles.filter(s => s !== correct);
          options = shuffle([correct, ...shuffle(medPool).slice(0, 3)]);
        } else {
          // Hard: Closely related 20th-century theoretical movements
          const hardPool = allStyles.filter(s => s !== correct && (s.includes('Modern') || s.includes('Brutalism') || s.includes('Structural') || s.includes('Minimalism')));
          let pool = hardPool;
          if (pool.length < 3) pool = allStyles.filter(s => s !== correct);
          options = shuffle([correct, ...shuffle(pool).slice(0, 3)]);
        }

        return {
          quiz_id: quiz.id,
          order_index: idx + 1,
          question_type: 'choose',
          question_text: `Which architectural movement or style best characterizes "${b.display_name}" by ${b.architect}?`,
          media_type: 'image',
          media_url: b.building_photo,
          options,
          correct_answer: correct,
          accepted_aliases: [`diff:${b.difficulty}`, correct],
          explanation_clue: `Style: ${b.architectural_style}. Designed by ${b.architect} in ${b.opened_year}.\n\n${b.puzzle_clues}`
        };
      });
    }

    // ==========================================
    // QUIZ 7: Architect's Portfolio
    // ==========================================
    else if (quiz.slug === 'architects-oeuvre-pair-the-masterpieces') {
      newQuestions = cleanedItems.map((b, idx) => {
        const sameArchWorks = cleanedItems.filter(x => x.architect === b.architect && x.display_name !== b.display_name);
        let counterpart = sameArchWorks[0]?.display_name;

        if (!counterpart) {
          const fallbackOeuvre = {
            "I. M. Pei": "Bank of China Tower, Hong Kong",
            "Philip Johnson": "Sony Tower / AT&T Building, United States",
            "Oscar Niemeyer": "Niterói Contemporary Art Museum, Brazil",
            "Jørn Utzon": "Bagsvaerd Church, Denmark",
            "Rem Koolhaas & Ole Scheeren (OMA)": "Seattle Central Library, United States",
            "Peter Zumthor": "Bruder Klaus Field Chapel, Germany",
            "SANAA": "21st Century Museum of Contemporary Art, Japan",
            "Jacques Herzog & Pierre de Meuron": "Tate Modern, United Kingdom",
            "Jean Nouvel": "Institut du Monde Arabe, France",
            "Alvar Aalto": "Baker House, United States",
            "Luis Barragán": "Torres de Satélite, Mexico",
            "Kenzō Tange": "Fuji TV Building, Japan",
            "Frei Otto": "Mannheim Multihalle, Germany",
            "Fariborz Sahba": "Terraces of the Shrine of the Báb, Israel",
            "Roger Anger": "Cité Radieuse Collaboration, France",
            "Laurie Baker": "Loyola Chapel, India",
            "Raj Rewal": "Asian Games Village, India",
            "Achyut Kanvinde": "National Dairy Development Board, India",
            "Anant Raje": "IIM Ahmedabad Ravi J. Matthai Centre, India",
            "Richard Meier": "High Museum of Art, United States",
            "Toyo Ito": "TOD'S Omotesando Building, Japan"
          };
          const baseName = b.architect.split('(')[0].trim();
          counterpart = fallbackOeuvre[b.architect] || fallbackOeuvre[baseName] || `${b.architect}'s Famous Retrospective`;
        }

        let options = [];
        if (b.difficulty === 'easy') {
          const easyPool = GLOBAL_EASY_DISTRACTORS.filter(d => d !== counterpart);
          options = shuffle([counterpart, ...shuffle(easyPool).slice(0, 3)]);
        } else if (b.difficulty === 'medium') {
          const medPool = cleanedItems.filter(x => x.architect !== b.architect && x.display_name !== counterpart);
          options = shuffle([counterpart, ...shuffle(medPool).slice(0, 3).map(x => x.display_name)]);
        } else {
          // Hard: Distractors by close peers or from the same country
          let hardPool = cleanedItems.filter(x => x.architect !== b.architect && x.country === b.country && x.display_name !== counterpart);
          if (hardPool.length < 3) {
            hardPool = cleanedItems.filter(x => x.architect !== b.architect && x.display_name !== counterpart);
          }
          options = shuffle([counterpart, ...shuffle(hardPool).slice(0, 3).map(x => x.display_name)]);
        }

        return {
          quiz_id: quiz.id,
          order_index: idx + 1,
          question_type: 'choose',
          question_text: `Aside from "${b.display_name}", which of these masterworks was also designed by ${b.architect}?`,
          media_type: 'image',
          media_url: b.building_photo,
          options,
          correct_answer: counterpart,
          accepted_aliases: [`diff:${b.difficulty}`, counterpart],
          explanation_clue: `Both designed by ${b.architect}. ${b.puzzle_clues.split('\n')[0]}`
        };
      });
    }

    // Insert new questions in batches of 20
    for (let i = 0; i < newQuestions.length; i += 20) {
      const chunk = newQuestions.slice(i, i + 20);
      const { error: insErr } = await supabase.from('quiz_questions').insert(chunk);
      if (insErr) {
        console.error(`Error inserting batch for ${quiz.slug}:`, insErr.message);
      } else {
        console.log(`Inserted batch ${Math.floor(i / 20) + 1} (${chunk.length} questions) for ${quiz.slug}`);
      }
    }
  }

  console.log('\n🎉 ALL QUIZZES RECALIBRATED SUCCESSFULLY!');
}

run().catch(console.error);
