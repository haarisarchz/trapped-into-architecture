const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bcifyymjfktabtsmocnc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const QUIZ_RECORD = {
  slug: 'the-visionaries-faces-of-architecture',
  title: 'The Visionaries: Identify the Master Architect from their Portrait',
  description: 'Can you recognize the master minds who revolutionized the built world? Identify legendary architects from their iconic portrait photographs.',
  category: 'The Visionaries',
  cover_image: '/architect-photos/le-corbusier.jpg',
  is_published: true
};

const QUESTIONS_DATA = [
  // === EASY (10 World-Famous Legends) ===
  {
    name: 'Frank Lloyd Wright',
    portrait: '/architect-photos/frank-lloyd-wright.jpg',
    eraNationality: 'American Pioneer of Organic Architecture & Prairie School (1867–1959)',
    landmark: 'Fallingwater, Mill Run, Pennsylvania, United States',
    bPhoto: '/quizzes/fallingwater-kaufmann-residence.jpg',
    difficulty: 'popular',
    distractors: ['Louis Kahn', 'Alvar Aalto', 'Philip Johnson']
  },
  {
    name: 'Le Corbusier',
    portrait: '/architect-photos/le-corbusier.jpg',
    eraNationality: 'Swiss-French Pioneer of Modernism & Five Points of New Architecture (1887–1965)',
    landmark: 'Villa Savoye, Poissy, France',
    bPhoto: '/quizzes/villa-savoye.jpg',
    difficulty: 'popular',
    distractors: ['Ludwig Mies van der Rohe', 'Walter Gropius', 'Oscar Niemeyer']
  },
  {
    name: 'Ludwig Mies van der Rohe',
    portrait: '/architect-photos/ludwig-mies-van-der-rohe.jpg',
    eraNationality: 'German-American Master of "Less is More" & Skin-and-Bone Architecture (1886–1969)',
    landmark: 'Barcelona Pavilion, Barcelona, Spain',
    bPhoto: '/quizzes/barcelona-pavilion.jpg',
    difficulty: 'popular',
    distractors: ['Walter Gropius', 'Philip Johnson', 'Marcel Breuer']
  },
  {
    name: 'Antoni Gaudí',
    portrait: '/architect-photos/antoni-gaudi.jpg',
    eraNationality: 'Spanish Catalan Modernisme Legend & Master of Organic Parabolic Vaults (1852–1926)',
    landmark: 'Sagrada Família, Barcelona, Spain',
    bPhoto: '/quizzes/sagrada-familia.jpg',
    difficulty: 'popular',
    distractors: ['Lluís Domènech i Montaner', 'Josep Puig i Cadafalch', 'Santiago Calatrava']
  },
  {
    name: 'Zaha Hadid',
    portrait: '/architect-photos/zaha-hadid.jpg',
    eraNationality: 'Iraqi-British "Queen of the Curve" & First Female Pritzker Laureate (1950–2016)',
    landmark: 'Heydar Aliyev Center, Baku, Azerbaijan',
    bPhoto: '/quizzes/heydar-aliyev-center.jpg',
    difficulty: 'popular',
    distractors: ['Frank Gehry', 'Rem Koolhaas', 'Daniel Libeskind']
  },
  {
    name: 'Frank Gehry',
    portrait: '/architect-photos/frank-gehry.jpg',
    eraNationality: 'Canadian-American Pioneer of Deconstructivism & Sculptural Titanium (b. 1929)',
    landmark: 'Guggenheim Museum Bilbao, Bilbao, Spain',
    bPhoto: '/quizzes/guggenheim-museum-bilbao.jpg',
    difficulty: 'popular',
    distractors: ['Peter Eisenman', 'Daniel Libeskind', 'Bernard Tschumi']
  },
  {
    name: 'I. M. Pei',
    portrait: '/architect-photos/i-m-pei.jpg',
    eraNationality: 'Chinese-American Master of Pure Geometry, Glass Pyramids & Light (1917–2019)',
    landmark: 'Grand Louvre Pyramid, Paris, France',
    bPhoto: '/quizzes/grand-louvre-pyramid.jpg',
    difficulty: 'popular',
    distractors: ['Kenzō Tange', 'Kevin Roche', 'Philip Johnson']
  },
  {
    name: 'Norman Foster',
    portrait: '/architect-photos/norman-foster.jpg',
    eraNationality: 'British Titan of High-Tech Architecture & Sustainable Engineering (b. 1935)',
    landmark: 'The Gherkin (30 St Mary Axe), London, United Kingdom',
    bPhoto: '/quizzes/the-gherkin.jpg',
    difficulty: 'popular',
    distractors: ['Richard Rogers', 'Renzo Piano', 'Nicholas Grimshaw']
  },
  {
    name: 'Santiago Calatrava',
    portrait: '/architect-photos/santiago-calatrava.jpg',
    eraNationality: 'Spanish Architect-Engineer of Kinetic Zoomorphic & Skeletal Structures (b. 1951)',
    landmark: 'The Oculus (World Trade Center Hub), New York City, United States',
    bPhoto: '/quizzes/the-oculus-wtc.jpg',
    difficulty: 'popular',
    distractors: ['Félix Candela', 'Pier Luigi Nervi', 'Eero Saarinen']
  },
  {
    name: 'Jørn Utzon',
    portrait: '/architect-photos/jorn-utzon.jpg',
    eraNationality: 'Danish Visionary of Sculptural Organic Expressionism (1918–2008)',
    landmark: 'Sydney Opera House, Sydney, Australia',
    bPhoto: '/quizzes/sydney-opera-house.jpg',
    difficulty: 'popular',
    distractors: ['Eero Saarinen', 'Alvar Aalto', 'Arne Jacobsen']
  },

  // === MEDIUM (11 Modernist Titans & Pritzker Masters) ===
  {
    name: 'Tadao Ando',
    portrait: '/architect-photos/tadao-ando.jpg',
    eraNationality: 'Self-Taught Japanese Master of Smooth Architectural Concrete & Zen Light (b. 1941)',
    landmark: 'Church of the Light, Ibaraki, Osaka, Japan',
    bPhoto: '/quizzes/church-of-the-light.jpg',
    difficulty: '50-50',
    distractors: ['Kenzō Tange', 'Toyo Ito', 'Kengo Kuma']
  },
  {
    name: 'Louis Kahn',
    portrait: '/architect-photos/louis-kahn.jpg',
    eraNationality: 'Estonian-American Master of Monumental Brick, Concrete & Served vs. Servant Spaces (1901–1974)',
    landmark: 'Salk Institute for Biological Studies, La Jolla, California, United States',
    bPhoto: '/quizzes/salk-institute.jpg',
    difficulty: '50-50',
    distractors: ['Paul Rudolph', 'Marcel Breuer', 'Eero Saarinen']
  },
  {
    name: 'Renzo Piano',
    portrait: '/architect-photos/renzo-piano.jpg',
    eraNationality: 'Italian Master of High-Tech Craftsmanship & Building Workshops (b. 1937)',
    landmark: 'The Shard, London, United Kingdom',
    bPhoto: '/quizzes/the-shard.jpg',
    difficulty: '50-50',
    distractors: ['Richard Rogers', 'Norman Foster', 'Jean Nouvel']
  },
  {
    name: 'Eero Saarinen',
    portrait: '/architect-photos/eero-saarinen.jpg',
    eraNationality: 'Finnish-American Sculptor of Dynamic Catenary Arches & Soaring Thin Shells (1910–1961)',
    landmark: 'Gateway Arch, St. Louis, Missouri, United States',
    bPhoto: '/quizzes/gateway-arch.jpg',
    difficulty: '50-50',
    distractors: ['Eliel Saarinen', 'Jørn Utzon', 'Marcel Breuer']
  },
  {
    name: 'Oscar Niemeyer',
    portrait: '/architect-photos/oscar-niemeyer.jpg',
    eraNationality: 'Brazilian Pioneer of Sensual Reinforced Concrete Curves & Brasília (1907–2012)',
    landmark: 'Cathedral of Brasília, Brasília, Brazil',
    bPhoto: '/quizzes/cathedral-of-brasilia.jpg',
    difficulty: '50-50',
    distractors: ['Lúcio Costa', 'Affonso Eduardo Reidy', 'Roberto Burle Marx']
  },
  {
    name: 'Rem Koolhaas',
    portrait: '/architect-photos/rem-koolhaas.jpg',
    eraNationality: 'Dutch Provocateur, Urban Theorist & Founder of OMA (b. 1944)',
    landmark: 'CCTV Headquarters, Beijing, China',
    bPhoto: '/quizzes/cctv-headquarters.jpg',
    difficulty: '50-50',
    distractors: ['Bernard Tschumi', 'Winy Maas (MVRDV)', 'Peter Eisenman']
  },
  {
    name: 'Alvar Aalto',
    portrait: '/architect-photos/alvar-aalto.jpg',
    eraNationality: 'Finnish Master of Humanist Modernism, Bentwood & Organic Textures (1898–1976)',
    landmark: 'Villa Mairea, Noormarkku, Finland',
    bPhoto: '/quizzes/villa-mairea-aalto.jpg',
    difficulty: '50-50',
    distractors: ['Erik Gunnar Asplund', 'Arne Jacobsen', 'Eliel Saarinen']
  },
  {
    name: 'Philip Johnson',
    portrait: '/architect-photos/philip-johnson.jpg',
    eraNationality: 'Influential American Modernist, Curatorial Titan & Inaugural Pritzker Laureate (1906–2005)',
    landmark: 'The Glass House, New Canaan, Connecticut, United States',
    bPhoto: '/quizzes/the-glass-house-philip-johnson.jpg',
    difficulty: '50-50',
    distractors: ['Ludwig Mies van der Rohe', 'Paul Rudolph', 'Robert Venturi']
  },
  {
    name: 'Jean Nouvel',
    portrait: '/architect-photos/jean-nouvel.jpg',
    eraNationality: 'French Pritzker Laureate Celebrated for Cinematic Lighting & Metallic Domes (b. 1945)',
    landmark: 'Louvre Abu Dhabi, Abu Dhabi, United Arab Emirates',
    bPhoto: '/quizzes/louvre-abu-dhabi.jpg',
    difficulty: '50-50',
    distractors: ['Dominique Perrault', 'Christian de Portzamparc', 'Bernard Tschumi']
  },
  {
    name: 'Richard Rogers',
    portrait: '/architect-photos/richard-rogers.jpg',
    eraNationality: 'British-Italian Master of "Inside-Out" Expressive High-Tech Architecture (1933–2021)',
    landmark: "Lloyd's Building, London, United Kingdom",
    bPhoto: '/quizzes/lloyds-building-london.jpg',
    difficulty: '50-50',
    distractors: ['Norman Foster', 'Renzo Piano', 'Michael Hopkins']
  },
  {
    name: 'Jacques Herzog & Pierre de Meuron',
    portrait: '/architect-photos/herzog-de-meuron.jpg',
    eraNationality: 'Swiss Pritzker Duo Renowned for Material Experimentation & Tactile Envelopes (b. 1950)',
    landmark: 'Elbphilharmonie, Hamburg, Germany',
    bPhoto: '/quizzes/elbphilharmonie-hamburg.jpg',
    difficulty: '50-50',
    distractors: ['Peter Zumthor', 'Christian Kerez', 'Gigon/Guyer']
  },

  // === HARD (11 Deep Architectural Theory, Regional Masters & Specialized Pioneers) ===
  {
    name: 'B. V. Doshi',
    portrait: '/architect-photos/b-v-doshi.jpg',
    eraNationality: 'First Indian Pritzker Laureate, Collaborator of Le Corbusier & Kahn (1927–2023)',
    landmark: 'Sangath (Vastu Shilpa Consultants), Ahmedabad, Gujarat, India',
    bPhoto: '/quizzes/sangath-doshi.jpg',
    difficulty: 'master',
    distractors: ['Charles Correa', 'Raj Rewal', 'Achyut Kanvinde']
  },
  {
    name: 'Charles Correa',
    portrait: '/architect-photos/charles-correa.jpg',
    eraNationality: 'Master of Contemporary Indian Architecture & Climate-Responsive "Open-to-Sky" Spaces (1930–2015)',
    landmark: 'Kanchanjunga Apartments, Mumbai, Maharashtra, India',
    bPhoto: '/quizzes/kanchanjunga-apartments-mumbai.jpg',
    difficulty: 'master',
    distractors: ['B. V. Doshi', 'Raj Rewal', 'Anant Raje']
  },
  {
    name: 'Laurie Baker',
    portrait: '/architect-photos/laurie-baker.jpg',
    eraNationality: 'British-Born Indian Humanitarian Architect & Pioneer of Low-Cost Exposed Brick Jali (1917–2007)',
    landmark: 'Centre for Development Studies (CDS), Thiruvananthapuram, Kerala, India',
    bPhoto: '/quizzes/centre-for-development-studies-baker.jpg',
    difficulty: 'master',
    distractors: ['Geoffrey Bawa', 'Charles Correa', 'Habib Rahman']
  },
  {
    name: 'Peter Zumthor',
    portrait: '/architect-photos/peter-zumthor.jpg',
    eraNationality: 'Swiss Master of Atmospheric Phenomenology & Tactile Monolithic Stone (b. 1943)',
    landmark: 'Therme Vals, Vals, Graubünden, Switzerland',
    bPhoto: '/quizzes/therme-vals-zumthor.jpg',
    difficulty: 'master',
    distractors: ['Jacques Herzog', 'Valerio Olgiati', 'Luigi Snozzi']
  },
  {
    name: 'Kenzō Tange',
    portrait: '/architect-photos/kenzo-tange.jpg',
    eraNationality: 'Patriarch of Modern Japanese Architecture & Mentor of the Metabolist Movement (1913–2005)',
    landmark: 'Yoyogi National Gymnasium, Tokyo, Japan',
    bPhoto: '/quizzes/yoyogi-national-gymnasium.jpg',
    difficulty: 'master',
    distractors: ['Kisho Kurokawa', 'Fumihiko Maki', 'Kunio Maekawa']
  },
  {
    name: 'Frei Otto',
    portrait: '/architect-photos/frei-otto.jpg',
    eraNationality: 'German Structural Pioneer of Lightweight Tensile Membranes & Cable-Net Canopies (1925–2015)',
    landmark: 'Munich Olympic Stadium Roof, Munich, Bavaria, Germany',
    bPhoto: '/quizzes/munich-olympic-stadium-roof.jpg',
    difficulty: 'master',
    distractors: ['Günter Behnisch', 'Jörg Schlaich', 'Felix Candela']
  },
  {
    name: 'Toyo Ito',
    portrait: '/architect-photos/toyo-ito.jpg',
    eraNationality: 'Japanese Pritzker Laureate of Ephemeral Fluid Spaces & Tubular Tree Structures (b. 1941)',
    landmark: 'Sendai Mediatheque, Sendai, Miyagi Prefecture, Japan',
    bPhoto: '/quizzes/sendai-mediatheque-toyo-ito.jpg',
    difficulty: 'master',
    distractors: ['Arata Isozaki', 'Kazuyo Sejima', 'Sou Fujimoto']
  },
  {
    name: 'SANAA (Kazuyo Sejima & Ryue Nishizawa)',
    portrait: '/architect-photos/sanaa-sejima-nishizawa.jpg',
    eraNationality: 'Tokyo Pritzker Duo Renowned for Fluid Undulating Floors & Ethereal Transparency',
    landmark: 'Rolex Learning Center, Lausanne, Vaud, Switzerland',
    bPhoto: '/quizzes/rolex-learning-center-sanaa.jpg',
    difficulty: 'master',
    distractors: ['Toyo Ito', 'Shigeru Ban', 'Jun Takahashi']
  },
  {
    name: 'Raj Rewal',
    portrait: '/architect-photos/raj-rewal.jpg',
    eraNationality: 'Indian Master of Bold Geometrical Space-Frames & Traditional Courtyard Spatial Weaving (b. 1934)',
    landmark: 'Hall of Nations, Pragati Maidan, New Delhi, India',
    bPhoto: '/quizzes/hall-of-nations-new-delhi.jpg',
    difficulty: 'master',
    distractors: ['Charles Correa', 'B. V. Doshi', 'Achyut Kanvinde']
  },
  {
    name: 'Fariborz Sahba',
    portrait: '/architect-photos/fariborz-sahba.jpg',
    eraNationality: 'Iranian-Canadian Architect Celebrated for Sacred Expressionist Petal Geometry (b. 1948)',
    landmark: 'Lotus Temple (Bahá\'í House of Worship), New Delhi, India',
    bPhoto: '/quizzes/lotus-temple.jpg',
    difficulty: 'master',
    distractors: ['Hossein Amanat', 'Nader Khalili', 'Kamran Diba']
  },
  {
    name: 'Roger Anger',
    portrait: '/architect-photos/roger-anger.jpg',
    eraNationality: 'French Visionary Sculptural Architect & Master Planner of Auroville (1923–2008)',
    landmark: 'Matrimandir, Auroville, Tamil Nadu, India',
    bPhoto: '/quizzes/matrimandir-auroville.jpg',
    difficulty: 'master',
    distractors: ['Le Corbusier', 'Pierre Jeanneret', 'André Ravéreau']
  }
];

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function main() {
  console.log('--- Registering Quiz 7: The Visionaries ---');
  
  // 1. Ensure Quiz record exists in quizzes table
  const { data: existingQuiz } = await supabase
    .from('quizzes')
    .select('id')
    .eq('slug', QUIZ_RECORD.slug)
    .maybeSingle();

  let quizId = existingQuiz?.id;

  if (!quizId) {
    const { data: inserted, error: insErr } = await supabase
      .from('quizzes')
      .insert(QUIZ_RECORD)
      .select('id')
      .single();

    if (insErr) {
      throw new Error('Failed to insert quiz record: ' + insErr.message);
    }
    quizId = inserted.id;
    console.log('Created new quiz [' + QUIZ_RECORD.title + '] with ID:', quizId);
  } else {
    const { error: updErr } = await supabase
      .from('quizzes')
      .update({
        ...QUIZ_RECORD,
        updated_at: new Date().toISOString()
      })
      .eq('id', quizId);

    if (updErr) {
      throw new Error('Failed to update quiz record: ' + updErr.message);
    }
    console.log('Updated existing quiz [' + QUIZ_RECORD.title + '] with ID:', quizId);
  }

  // 2. Clear old questions for this quiz
  const { error: delErr } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('quiz_id', quizId);

  if (delErr) {
    console.warn('Warning deleting old questions:', delErr.message);
  }

  // 3. Prepare 32 questions
  const questionsToInsert = QUESTIONS_DATA.map((q, idx) => {
    const options = shuffle([q.name, ...q.distractors]);
    // Clue format: "Era & Nationality || Signature Building & Location || Photo URL"
    const explanationClue = `${q.eraNationality} || ${q.landmark} || ${q.bPhoto}`;

    return {
      quiz_id: quizId,
      order_index: idx + 1,
      question_type: 'choose',
      question_text: 'Identify the master architect shown in this portrait:',
      media_type: 'image',
      media_url: q.portrait,
      options,
      correct_answer: q.name,
      accepted_aliases: [`diff:${q.difficulty}`, q.name],
      explanation_clue: explanationClue
    };
  });

  // 4. Insert 32 questions
  const { data: insertedQuestions, error: qInsErr } = await supabase
    .from('quiz_questions')
    .insert(questionsToInsert)
    .select('id');

  if (qInsErr) {
    throw new Error('Failed to insert questions: ' + qInsErr.message);
  }

  console.log(`Successfully seeded all ${insertedQuestions.length} questions for Quiz 7!`);
}

main().catch(err => {
  console.error('Seed script error:', err);
  process.exit(1);
});
