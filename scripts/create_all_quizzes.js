const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bcifyymjfktabtsmocnc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const NEW_QUIZZES = [
  {
    slug: 'where-in-the-world-guess-the-city-country',
    title: 'Where in the World? Guess the City & Country',
    description: 'Test your global architectural geography! Can you identify the city and country for 65 world-famous architectural landmarks?',
    category: 'World Geography',
    cover_image: '/quizzes/the-shard.jpg',
    is_published: true
  },
  {
    slug: 'architectural-detective-guess-the-clues',
    title: 'Architectural Detective: Guess the Building from Clues',
    description: 'No photos allowed! Read 3 intriguing clues about structural feats, history, and materials to deduce which iconic building is being described.',
    category: 'Architecture Trivia',
    cover_image: '/quizzes/fallingwater-kaufmann-residence.jpg',
    is_published: true
  },
  {
    slug: 'timeline-challenge-when-was-it-built',
    title: 'Timeline Challenge: Which Year Was It Built?',
    description: 'Can you place architectural history in chronological order? Identify the completion year or decade for 65 revolutionary buildings.',
    category: 'History & Milestones',
    cover_image: '/quizzes/villa-savoye.jpg',
    is_published: true
  },
  {
    slug: 'architectural-styles-and-movements',
    title: 'Architectural Styles & Movements: What Style Is It?',
    description: 'From Catalan Modernisme and Brutalism to Deconstructivism and High-Tech: test your architectural history recall by identifying each landmark\'s style.',
    category: 'History & Theory',
    cover_image: '/quizzes/guggenheim-museum-bilbao.jpg',
    is_published: true
  },
  {
    slug: 'architects-oeuvre-pair-the-masterpieces',
    title: 'Architect\'s Portfolio: Pair the Masterpieces',
    description: 'Do you know your master architects\' complete portfolios? Identify which other landmark was created by the same visionary architect.',
    category: 'Architects & Portfolios',
    cover_image: '/quizzes/salk-institute.jpg',
    is_published: true
  }
];

// Helper to shuffle an array
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function run() {
  console.log('Loading all 65 buildings from architecture_catalog...');
  const { data: catRows, error: catErr } = await supabase.from('architecture_catalog').select('id, data');
  if (catErr || !catRows || catRows.length === 0) {
    throw new Error('Failed to load architecture_catalog: ' + (catErr?.message || 'Empty'));
  }

  const buildings = catRows.map(r => r.data);
  console.log(`Loaded ${buildings.length} buildings.`);

  // 1. Ensure Quiz records exist in quizzes table
  for (const q of NEW_QUIZZES) {
    const { data: existing } = await supabase.from('quizzes').select('id').eq('slug', q.slug).maybeSingle();
    let quizId = existing?.id;

    if (!quizId) {
      const { data: inserted, error: insErr } = await supabase.from('quizzes').insert(q).select('id').single();
      if (insErr) {
        console.error(`Error inserting quiz ${q.slug}:`, insErr.message);
        continue;
      }
      quizId = inserted.id;
      console.log(`Created new quiz [${q.title}] (ID: ${quizId})`);
    } else {
      await supabase.from('quizzes').update({
        title: q.title,
        description: q.description,
        category: q.category,
        cover_image: q.cover_image,
        is_published: true,
        updated_at: new Date().toISOString()
      }).eq('id', quizId);
      console.log(`Updated existing quiz [${q.title}] (ID: ${quizId})`);
    }

    // 2. Generate questions for this quiz
    console.log(`Generating 65 questions for [${q.title}]...`);
    const { error: delErr } = await supabase.from('quiz_questions').delete().eq('quiz_id', quizId);
    if (delErr) console.warn('Delete questions note:', delErr.message);

    let questions = [];

    if (q.slug === 'where-in-the-world-guess-the-city-country') {
      questions = buildings.map((b, idx) => {
        const correctLocation = `${b.city}, ${b.country}`;
        const otherLocs = buildings
          .filter(x => x.building_name !== b.building_name && `${x.city}, ${x.country}` !== correctLocation)
          .map(x => `${x.city}, ${x.country}`);
        const uniqueOtherLocs = Array.from(new Set(otherLocs));
        const pickedDistractors = shuffle(uniqueOtherLocs).slice(0, 3);
        const options = shuffle([correctLocation, ...pickedDistractors]);

        return {
          quiz_id: quizId,
          order_index: idx + 1,
          question_type: 'choose',
          question_text: `In which city and country is "${b.building_name}" located?`,
          media_type: 'image',
          media_url: b.building_photo,
          options,
          correct_answer: correctLocation,
          accepted_aliases: [`diff:${b.difficulty}`, correctLocation],
          explanation_clue: b.puzzle_clues
        };
      });
    } else if (q.slug === 'architectural-detective-guess-the-clues') {
      questions = buildings.map((b, idx) => {
        const otherNames = buildings
          .filter(x => x.building_name !== b.building_name)
          .map(x => x.building_name);
        const pickedDistractors = shuffle(otherNames).slice(0, 3);
        const options = shuffle([b.building_name, ...pickedDistractors]);

        return {
          quiz_id: quizId,
          order_index: idx + 1,
          question_type: 'choose',
          question_text: `Architectural Detective: Identify this landmark from the clues below:\n\n${b.puzzle_clues}`,
          media_type: 'none',
          media_url: null,
          options,
          correct_answer: b.building_name,
          accepted_aliases: [`diff:${b.difficulty}`, b.building_name],
          explanation_clue: `Designed by ${b.architect} in ${b.city}, ${b.country} (${b.opened_year}).`
        };
      });
    } else if (q.slug === 'timeline-challenge-when-was-it-built') {
      questions = buildings.map((b, idx) => {
        const correctYear = parseInt(b.opened_year, 10);
        // generate plausible offsets
        const offsetOptions = [
          correctYear - 12,
          correctYear + 8,
          correctYear + 18,
          correctYear - 20
        ].filter(y => y > 1880 && y <= 2026 && y !== correctYear);

        const pickedOffsets = shuffle(offsetOptions).slice(0, 3);
        const options = shuffle([String(correctYear), ...pickedOffsets.map(String)]);

        return {
          quiz_id: quizId,
          order_index: idx + 1,
          question_type: 'choose',
          question_text: `In which year was "${b.building_name}" in ${b.city}, ${b.country} officially completed and opened?`,
          media_type: 'image',
          media_url: b.building_photo,
          options,
          correct_answer: String(correctYear),
          accepted_aliases: [`diff:${b.difficulty}`, String(correctYear)],
          explanation_clue: `Completed in ${b.opened_year} by ${b.architect}. ${b.puzzle_clues.split('\n')[0]}`
        };
      });
    } else if (q.slug === 'architectural-styles-and-movements') {
      const allStyles = Array.from(new Set(buildings.map(b => b.architectural_style).filter(Boolean)));
      questions = buildings.map((b, idx) => {
        const otherStyles = allStyles.filter(s => s !== b.architectural_style);
        const pickedDistractors = shuffle(otherStyles).slice(0, 3);
        const options = shuffle([b.architectural_style, ...pickedDistractors]);

        return {
          quiz_id: quizId,
          order_index: idx + 1,
          question_type: 'choose',
          question_text: `Which architectural movement or style best characterizes "${b.building_name}" by ${b.architect}?`,
          media_type: 'image',
          media_url: b.building_photo,
          options,
          correct_answer: b.architectural_style,
          accepted_aliases: [`diff:${b.difficulty}`, b.architectural_style],
          explanation_clue: b.puzzle_clues
        };
      });
    } else if (q.slug === 'architects-oeuvre-pair-the-masterpieces') {
      // Find another building by the same architect if exists, or another landmark by peers
      questions = buildings.map((b, idx) => {
        // Find other works by same architect in catalog
        const sameArchWorks = buildings.filter(x => x.architect === b.architect && x.building_name !== b.building_name);
        let counterpart = sameArchWorks[0]?.building_name;
        
        // If architect has only 1 work in catalog, use a globally known peer masterwork by same architect as correct
        if (!counterpart) {
          const fallbackOeuvre = {
            "I. M. Pei": "Bank of China Tower (Hong Kong)",
            "Philip Johnson": "Sony Tower / AT&T Building (New York)",
            "Oscar Niemeyer": "Niterói Contemporary Art Museum (Rio de Janeiro)",
            "Jørn Utzon": "Bagsvaerd Church (Copenhagen)",
            "Rem Koolhaas & Ole Scheeren (OMA)": "Seattle Central Library",
            "Peter Zumthor": "Bruder Klaus Field Chapel (Mechernich)",
            "SANAA": "21st Century Museum of Contemporary Art (Kanazawa)",
            "Jacques Herzog & Pierre de Meuron": "Tate Modern (London)",
            "Jean Nouvel": "Institut du Monde Arabe (Paris)",
            "Alvar Aalto": "Baker House (MIT, Cambridge)",
            "Luis Barragán": "Torres de Satélite (Mexico City)",
            "Kenzō Tange": "Fuji TV Building (Tokyo)",
            "Frei Otto": "Mannheim Multihalle (Mannheim)",
            "Fariborz Sahba": "Terraces of the Shrine of the Báb (Haifa)",
            "Roger Anger": "Cité Radieuse Collaboration",
            "Laurie Baker": "Loyola Chapel (Trivandrum)",
            "Raj Rewal": "Asian Games Village (New Delhi)",
            "Achyut Kanvinde": "National Dairy Development Board (Anand)",
            "Anant Raje": "Indian Institute of Management Ahmedabad New Campus",
            "Richard Meier": "High Museum of Art (Atlanta)",
            "Toyo Ito": "TOD'S Omotesando Building (Tokyo)"
          };
          const baseName = b.architect.split('(')[0].trim();
          counterpart = fallbackOeuvre[b.architect] || fallbackOeuvre[baseName] || `${b.architect}'s Famous Retrospective`;
        }

        const otherBuildings = buildings
          .filter(x => x.architect !== b.architect && x.building_name !== counterpart)
          .map(x => x.building_name);
        const pickedDistractors = shuffle(otherBuildings).slice(0, 3);
        const options = shuffle([counterpart, ...pickedDistractors]);

        return {
          quiz_id: quizId,
          order_index: idx + 1,
          question_type: 'choose',
          question_text: `Aside from "${b.building_name}", which of these masterworks was also designed by ${b.architect}?`,
          media_type: 'image',
          media_url: b.building_photo,
          options,
          correct_answer: counterpart,
          accepted_aliases: [`diff:${b.difficulty}`, counterpart],
          explanation_clue: `Both designed by ${b.architect}. ${b.puzzle_clues.split('\n')[0]}`
        };
      });
    }

    // Insert questions in batches of 20
    for (let i = 0; i < questions.length; i += 20) {
      const chunk = questions.slice(i, i + 20);
      const { error: insQErr } = await supabase.from('quiz_questions').insert(chunk);
      if (insQErr) {
        console.error(`Error inserting batch for ${q.slug}:`, insQErr.message);
      } else {
        console.log(`Inserted batch ${Math.floor(i / 20) + 1} (${chunk.length} questions)`);
      }
    }
  }

  console.log('\n🎉 ALL NEW QUIZZES SUCCESSFULLY CREATED IN SUPABASE!');
}

run().catch(console.error);
