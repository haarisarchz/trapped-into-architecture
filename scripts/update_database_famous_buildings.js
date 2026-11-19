const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bcifyymjfktabtsmocnc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const QUIZ_1_ID = '6cfa5430-2982-4108-b5e5-49e8034afd72'; // Iconic World Landmarks: Guess the Building
const QUIZ_2_ID = '7c4ea5cc-854b-4964-9ec8-24760015d93d'; // Master Architects: Who Designed It?

// 65 Iconic World Architectural Masterpieces
const FAMOUS_BUILDINGS = [
  // ==========================================
  // EASY (15 Landmark Icons - 1 Point)
  // ==========================================
  {
    building_name: "Fallingwater (Kaufmann Residence)",
    architect: "Frank Lloyd Wright",
    city: "Mill Run, Pennsylvania",
    country: "United States",
    opened_year: 1939,
    architectural_style: "Organic Architecture",
    difficulty: "easy",
    photo_slug: "fallingwater-kaufmann-residence",
    wiki_page: "Fallingwater",
    puzzle_clues: "1. Built dramatically over a natural waterfall on Bear Run in southwestern Pennsylvania.\n2. Features revolutionary cantilevered reinforced concrete balconies anchored directly into natural rock.\n3. Designed for Edgar J. Kaufmann, owner of Pittsburgh's Kaufmann's Department Store.",
    distractors: ["The Glass House", "Farnsworth House", "Robie House"],
    architect_distractors: ["Ludwig Mies van der Rohe", "Philip Johnson", "Le Corbusier"]
  },
  {
    building_name: "Sydney Opera House",
    architect: "Jørn Utzon",
    city: "Sydney",
    country: "Australia",
    opened_year: 1973,
    architectural_style: "Expressionist Modernism",
    difficulty: "easy",
    photo_slug: "sydney-opera-house",
    wiki_page: "Sydney_Opera_House",
    puzzle_clues: "1. World-famous for its interlocking concrete sail-like precast roof shells.\n2. Sits prominently on Bennelong Point in Sydney Harbour.\n3. The Danish architect resigned before interior completion, but it became a UNESCO World Heritage site.",
    distractors: ["Walt Disney Concert Hall", "Elbphilharmonie", "Centre Pompidou"],
    architect_distractors: ["Frank Gehry", "Renzo Piano", "Eero Saarinen"]
  },
  {
    building_name: "Grand Louvre Pyramid",
    architect: "I. M. Pei",
    city: "Paris",
    country: "France",
    opened_year: 1989,
    architectural_style: "Modernist / Structural Glass",
    difficulty: "easy",
    photo_slug: "grand-louvre-pyramid",
    wiki_page: "Louvre_Pyramid",
    puzzle_clues: "1. A monumental 21.6-metre glass and metal pyramid in the main courtyard of the Palais du Louvre.\n2. Serves as the central entrance to the world's most visited museum.\n3. Features 603 rhombus-shaped and 70 triangular glass segments.",
    distractors: ["Centre Pompidou", "Reichstag New German Parliament", "Heydar Aliyev Center"],
    architect_distractors: ["Norman Foster", "Jean Nouvel", "Renzo Piano"]
  },
  {
    building_name: "The Gherkin (30 St Mary Axe)",
    architect: "Norman Foster (Foster + Partners)",
    city: "London",
    country: "United Kingdom",
    opened_year: 2004,
    architectural_style: "High-Tech / Neo-Futurism",
    difficulty: "easy",
    photo_slug: "the-gherkin-30-st-mary-axe",
    wiki_page: "30_St_Mary_Axe",
    puzzle_clues: "1. Iconic pickle-shaped skyscraper in London's financial district.\n2. Aerodynamic diagrid structural skin reduces wind deflection and energy usage.\n3. Won the RIBA Stirling Prize in 2004 as Britain's most celebrated modern tower.",
    distractors: ["The Shard", "Lloyd's Building", "Hearst Tower"],
    architect_distractors: ["Renzo Piano", "Richard Rogers", "Santiago Calatrava"]
  },
  {
    building_name: "Sagrada Família",
    architect: "Antoni Gaudí",
    city: "Barcelona",
    country: "Spain",
    opened_year: 2026,
    architectural_style: "Catalan Modernisme / Organic Gothic",
    difficulty: "easy",
    photo_slug: "sagrada-familia",
    wiki_page: "Sagrada_Família",
    puzzle_clues: "1. Basílica i Temple Expiatori, under construction since 1882 in Barcelona.\n2. Tree-like branching stone columns supporting hyperboloid vaults inspired by nature.\n3. The visionary architect is buried in the crypt of this unfinished masterwork.",
    distractors: ["Casa Batlló", "Casa Milà (La Pedrera)", "Cathedral of Brasília"],
    architect_distractors: ["Santiago Calatrava", "Oscar Niemeyer", "Rafael Moneo"]
  },
  {
    building_name: "Guggenheim Museum Bilbao",
    architect: "Frank Gehry",
    city: "Bilbao",
    country: "Spain",
    opened_year: 1997,
    architectural_style: "Deconstructivism",
    difficulty: "easy",
    photo_slug: "guggenheim-museum-bilbao",
    wiki_page: "Guggenheim_Museum_Bilbao",
    puzzle_clues: "1. Coated in 33,000 fluttering titanium tiles along the Nervión River.\n2. Coined the 'Bilbao Effect'—the economic transformation of a city via iconic architecture.\n3. Hailed by Philip Johnson as 'the greatest building of our time'.",
    distractors: ["Walt Disney Concert Hall", "Dancing House", "Heydar Aliyev Center"],
    architect_distractors: ["Zaha Hadid", "Daniel Libeskind", "Rem Koolhaas"]
  },
  {
    building_name: "Walt Disney Concert Hall",
    architect: "Frank Gehry",
    city: "Los Angeles, California",
    country: "United States",
    opened_year: 2003,
    architectural_style: "Deconstructivism",
    difficulty: "easy",
    photo_slug: "walt-disney-concert-hall",
    wiki_page: "Walt_Disney_Concert_Hall",
    puzzle_clues: "1. Sculptural billowing stainless steel sails on Grand Avenue in downtown Los Angeles.\n2. Home to the Los Angeles Philharmonic, known for world-class acoustics engineered by Yasuhisa Toyota.\n3. Exterior metal panels had to be sanded down after sun reflections blinded nearby drivers.",
    distractors: ["Guggenheim Museum Bilbao", "Sydney Opera House", "Elbphilharmonie"],
    architect_distractors: ["Frank Lloyd Wright", "Zaha Hadid", "Richard Meier"]
  },
  {
    building_name: "Centre Pompidou",
    architect: "Renzo Piano & Richard Rogers",
    city: "Paris",
    country: "France",
    opened_year: 1977,
    architectural_style: "High-Tech Modernism",
    difficulty: "easy",
    photo_slug: "centre-pompidou",
    wiki_page: "Centre_Georges_Pompidou",
    image_fallback: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Centre_Georges-Pompidou_Paris.jpg/1280px-Centre_Georges-Pompidou_Paris.jpg",
    puzzle_clues: "1. Revolutionized architecture by placing all escalators, elevators, and ductwork on the outside.\n2. Services are color-coded: blue for air conditioning, green for water, red for circulation, and yellow for electrical.\n3. Named after the French President who commissioned this cultural hub in Beaubourg.",
    distractors: ["Lloyd's Building", "Grand Louvre Pyramid", "The Shard"],
    architect_distractors: ["Norman Foster", "Jean Nouvel", "I. M. Pei"]
  },
  {
    building_name: "The Shard",
    architect: "Renzo Piano",
    city: "London",
    country: "United Kingdom",
    opened_year: 2012,
    architectural_style: "Neo-Futurism / High-Tech",
    difficulty: "easy",
    photo_slug: "the-shard",
    wiki_page: "The_Shard",
    puzzle_clues: "1. 310-metre pyramidal glass spire soaring above London Bridge station.\n2. The tallest building in the United Kingdom, composed of 11,000 glass panes.\n3. Designed as a 'vertical city' combining offices, hotel, restaurants, and viewing gallery.",
    distractors: ["The Gherkin (30 St Mary Axe)", "Hearst Tower", "Lloyd's Building"],
    architect_distractors: ["Norman Foster", "Richard Rogers", "Zaha Hadid"]
  },
  {
    building_name: "Lotus Temple (Bahá'í House of Worship)",
    architect: "Fariborz Sahba",
    city: "New Delhi",
    country: "India",
    opened_year: 1986,
    architectural_style: "Expressionist / Biomimicry",
    difficulty: "easy",
    photo_slug: "lotus-temple",
    wiki_page: "Lotus_Temple",
    puzzle_clues: "1. Composed of 27 free-standing marble-clad 'petals' arranged in clusters to form nine entry doors.\n2. Clad in pristine white Greek Penteli marble, the same stone used in the Parthenon.\n3. Welcomes people of all faiths surrounded by nine reflective ponds.",
    distractors: ["Matrimandir", "Sydney Opera House", "Cathedral of Brasília"],
    architect_distractors: ["Roger Anger", "Charles Correa", "B. V. Doshi"]
  },
  {
    building_name: "Gateway Arch",
    architect: "Eero Saarinen",
    city: "St. Louis, Missouri",
    country: "United States",
    opened_year: 1965,
    architectural_style: "Monumental Expressionism",
    difficulty: "easy",
    photo_slug: "gateway-arch",
    wiki_page: "Gateway_Arch",
    puzzle_clues: "1. 192-metre-tall weighted catenary arch clad in gleaming stainless steel.\n2. Built as a monument to the westward expansion of the United States on the Mississippi River.\n3. Visitors ride a unique motorized tram capsule to the observation room at the apex.",
    distractors: ["Sydney Opera House", "Cathedral of Brasília", "TWA Flight Center"],
    architect_distractors: ["Frank Lloyd Wright", "Louis Kahn", "Santiago Calatrava"]
  },
  {
    building_name: "CCTV Headquarters",
    architect: "Rem Koolhaas & Ole Scheeren (OMA)",
    city: "Beijing",
    country: "China",
    opened_year: 2012,
    architectural_style: "Deconstructivism / Structural Expressionism",
    difficulty: "easy",
    photo_slug: "cctv-headquarters",
    wiki_page: "CCTV_Headquarters",
    puzzle_clues: "1. A dramatic continuous loop formed by two leaning towers joined by a 75-metre cantilevered bridge.\n2. Nicknamed 'Big Boxer Shorts' (Dà Kùchǎ) by Beijing locals for its gravity-defying form.\n3. The structural diamond diagrid pattern is densest where structural stress is highest.",
    distractors: ["China Zun", "Ningbo Historic Museum", "Heydar Aliyev Center"],
    architect_distractors: ["Zaha Hadid", "Norman Foster", "Herzog & de Meuron"]
  },
  {
    building_name: "The Oculus (World Trade Center Hub)",
    architect: "Santiago Calatrava",
    city: "New York City",
    country: "United States",
    opened_year: 2016,
    architectural_style: "Biomimetic Structuralism",
    difficulty: "easy",
    photo_slug: "the-oculus-wtc",
    wiki_page: "World_Trade_Center_station_(PATH)",
    puzzle_clues: "1. Designed to evoke the image of a dove released from a child's hands into the sky.\n2. Soaring white steel ribbed wings frame a central skylight aligned with the autumn sun each September 11.\n3. Serves as the central transit hub and concourse of Lower Manhattan's reconstructed World Trade Center.",
    distractors: ["City of Arts and Sciences", "TWA Flight Center", "Grand Louvre Pyramid"],
    architect_distractors: ["Eero Saarinen", "Frank Gehry", "Norman Foster"]
  },
  {
    building_name: "Reichstag New German Parliament",
    architect: "Norman Foster (Foster + Partners)",
    city: "Berlin",
    country: "Germany",
    opened_year: 1999,
    architectural_style: "High-Tech / Adaptive Reuse",
    difficulty: "easy",
    photo_slug: "reichstag-new-german-parliament",
    wiki_page: "Reichstag_building",
    puzzle_clues: "1. Features a transparent glass dome with a mirrored central cone reflecting daylight down into the debating chamber.\n2. Citizens ascend a spiral ramp directly above the heads of elected politicians, symbolizing democratic transparency.\n3. Preserved original Soviet soldier graffiti on the historic 1894 stone walls.",
    distractors: ["The Gherkin (30 St Mary Axe)", "Elbphilharmonie", "Louvre Abu Dhabi"],
    architect_distractors: ["Renzo Piano", "David Chipperfield", "Daniel Libeskind"]
  },
  {
    building_name: "Heydar Aliyev Center",
    architect: "Zaha Hadid",
    city: "Baku",
    country: "Azerbaijan",
    opened_year: 2012,
    architectural_style: "Parametricism / Neo-Futurism",
    difficulty: "easy",
    photo_slug: "heydar-aliyev-center",
    wiki_page: "Heydar_Aliyev_Center",
    puzzle_clues: "1. Fluid, swooping white shell that rises seamlessly from the surrounding public plaza without sharp angles.\n2. Built using glass fibre reinforced concrete (GFRC) and polyester panels over an advanced space frame.\n3. Won the London Design Museum's Design of the Year Award in 2014.",
    distractors: ["MAXXI Museum", "Guggenheim Museum Bilbao", "Louvre Abu Dhabi"],
    architect_distractors: ["Frank Gehry", "Rem Koolhaas", "Jean Nouvel"]
  },

  // ==========================================
  // MEDIUM (25 Core Syllabus Masterworks - 2 Points)
  // ==========================================
  {
    building_name: "Villa Savoye",
    architect: "Le Corbusier (with Pierre Jeanneret)",
    city: "Poissy",
    country: "France",
    opened_year: 1931,
    architectural_style: "Purism / International Style",
    difficulty: "medium",
    photo_slug: "villa-savoye",
    wiki_page: "Villa_Savoye",
    puzzle_clues: "1. The definitive embodiment of Le Corbusier's 'Five Points of a New Architecture'.\n2. Features slender pilotis, a roof terrace, free plan, ribbon windows, and a free facade.\n3. Celebrated as the ultimate 'machine for living in' (machine à habiter).",
    distractors: ["Farnsworth House", "The Glass House", "Barcelona Pavilion"],
    architect_distractors: ["Ludwig Mies van der Rohe", "Philip Johnson", "Walter Gropius"]
  },
  {
    building_name: "Chapelle Notre Dame du Haut (Ronchamp)",
    architect: "Le Corbusier",
    city: "Ronchamp",
    country: "France",
    opened_year: 1955,
    architectural_style: "Expressionist Brutalism",
    difficulty: "medium",
    photo_slug: "chapelle-notre-dame-du-haut-ronchamp",
    wiki_page: "Notre-Dame_du_Haut",
    puzzle_clues: "1. Sculptural pilgrimage chapel crowning a hilltop in eastern France.\n2. Features a swooping upturned concrete roof resembling a crab shell, seemingly floating above a slit of daylight.\n3. Deep, tapered window openings with colored glass create dramatic shafts of spiritual illumination.",
    distractors: ["Church of the Light", "Cathedral of Brasília", "Villa Savoye"],
    architect_distractors: ["Tadao Ando", "Oscar Niemeyer", "Alvar Aalto"]
  },
  {
    building_name: "Unité d'Habitation (Cité Radieuse)",
    architect: "Le Corbusier",
    city: "Marseille",
    country: "France",
    opened_year: 1952,
    architectural_style: "Brutalism / Modernism",
    difficulty: "medium",
    photo_slug: "unite-dhabitation-marseille",
    wiki_page: "Unité_d%27Habitation",
    puzzle_clues: "1. Post-war residential housing block made of rough cast concrete (béton brut).\n2. Features two-storey interlocking duplex apartments organized around central 'interior shopping streets'.\n3. The rooftop contains a nursery school, running track, and sculptural ventilation chimneys.",
    distractors: ["Kanchanjunga Apartments", "Habitat 67", "Villa Savoye"],
    architect_distractors: ["Charles Correa", "Moshe Safdie", "Louis Kahn"]
  },
  {
    building_name: "Barcelona Pavilion (German Pavilion)",
    architect: "Ludwig Mies van der Rohe (with Lilly Reich)",
    city: "Barcelona",
    country: "Spain",
    opened_year: 1929,
    architectural_style: "Modernism / Minimalist Free Plan",
    difficulty: "medium",
    photo_slug: "barcelona-pavilion",
    wiki_page: "Barcelona_Pavilion",
    puzzle_clues: "1. Temporary German national pavilion for the 1929 International Exposition.\n2. Famous for the architectural aphorism 'less is more' with onyx doré, travertine, and chrome cruciform columns.\n3. Designed alongside the iconic leather-and-steel Barcelona Chair.",
    distractors: ["Farnsworth House", "Villa Savoye", "The Glass House"],
    architect_distractors: ["Le Corbusier", "Philip Johnson", "Frank Lloyd Wright"]
  },
  {
    building_name: "Farnsworth House",
    architect: "Ludwig Mies van der Rohe",
    city: "Plano, Illinois",
    country: "United States",
    opened_year: 1951,
    architectural_style: "International Style / Minimalism",
    difficulty: "medium",
    photo_slug: "farnsworth-house",
    wiki_page: "Farnsworth_House",
    puzzle_clues: "1. A pristine glass-and-white-steel pavilion floating above the Fox River floodplain.\n2. A single open room framed by eight exterior steel I-beam columns with zero interior walls.\n3. Commissioned by Dr. Edith Farnsworth as a rural weekend retreat.",
    distractors: ["The Glass House", "Fallingwater (Kaufmann Residence)", "Villa Savoye"],
    architect_distractors: ["Philip Johnson", "Frank Lloyd Wright", "Marcel Breuer"]
  },
  {
    building_name: "Seagram Building",
    architect: "Ludwig Mies van der Rohe (with Philip Johnson)",
    city: "New York City",
    country: "United States",
    opened_year: 1958,
    architectural_style: "International Style Modernism",
    difficulty: "medium",
    photo_slug: "seagram-building",
    wiki_page: "Seagram_Building",
    puzzle_clues: "1. 38-storey Park Avenue skyscraper clad in warm bronze and amber-tinted glass.\n2. Deliberately set back 100 feet from the street to create a grand public granite plaza with twin fountains.\n3. Features non-structural bronze I-beams running up the exterior facade to articulate the structural bays.",
    distractors: ["Lever House", "Hearst Tower", "The Gherkin (30 St Mary Axe)"],
    architect_distractors: ["Gordon Bunshaft (SOM)", "Philip Johnson", "Norman Foster"]
  },
  {
    building_name: "Solomon R. Guggenheim Museum",
    architect: "Frank Lloyd Wright",
    city: "New York City",
    country: "United States",
    opened_year: 1959,
    architectural_style: "Organic Modernism",
    difficulty: "medium",
    photo_slug: "solomon-r-guggenheim-museum-nyc",
    wiki_page: "Solomon_R._Guggenheim_Museum",
    puzzle_clues: "1. Cylindrical white concrete ziggurat inverted against Manhattan's rectangular grid on Fifth Avenue.\n2. Visitors take an elevator to the top and descend along a continuous gently sloping quarter-mile spiral ramp.\n3. Crowned by a dramatic glass web skylight pouring daylight into the central rotunda.",
    distractors: ["Guggenheim Museum Bilbao", "Whitney Museum", "The Getty Center"],
    architect_distractors: ["Frank Gehry", "Marcel Breuer", "Richard Meier"]
  },
  {
    building_name: "Church of the Light (Ibaraki Kasugaoka)",
    architect: "Tadao Ando",
    city: "Ibaraki, Osaka",
    country: "Japan",
    opened_year: 1989,
    architectural_style: "Minimalism / Exposed Concrete",
    difficulty: "medium",
    photo_slug: "church-of-the-light",
    wiki_page: "Church_of_the_Light",
    puzzle_clues: "1. Intimate Christian chapel defined by smooth silky cast-in-place concrete walls.\n2. An altar wall pierced with cruciform floor-to-ceiling slits letting in a glowing cross of natural sunlight.\n3. The raw wooden floorboards and benches were made from recycled wooden construction scaffolding.",
    distractors: ["Chapelle Notre Dame du Haut (Ronchamp)", "Cardboard Cathedral", "Therme Vals"],
    architect_distractors: ["Le Corbusier", "Kenzō Tange", "Peter Zumthor"]
  },
  {
    building_name: "Dancing House (Tančící dům)",
    architect: "Frank Gehry (with Vlado Milunić)",
    city: "Prague",
    country: "Czech Republic",
    opened_year: 1996,
    architectural_style: "Deconstructivism",
    difficulty: "medium",
    photo_slug: "dancing-house-prague",
    wiki_page: "Dancing_House",
    puzzle_clues: "1. Nicknamed 'Fred and Ginger' after the famous dancers Fred Astaire and Ginger Rogers.\n2. A glass tower cinched at the waist leans gracefully against a solid curving concrete companion tower.\n3. Overlooks the Vltava River, standing out vividly among Prague's Baroque and Art Nouveau buildings.",
    distractors: ["Guggenheim Museum Bilbao", "Walt Disney Concert Hall", "CCTV Headquarters"],
    architect_distractors: ["Daniel Libeskind", "Zaha Hadid", "Peter Eisenman"]
  },
  {
    building_name: "Casa Batlló",
    architect: "Antoni Gaudí",
    city: "Barcelona",
    country: "Spain",
    opened_year: 1906,
    architectural_style: "Catalan Modernisme / Organic",
    difficulty: "medium",
    photo_slug: "casa-batllo",
    wiki_page: "Casa_Batlló",
    puzzle_clues: "1. Known locally as 'Casa dels ossos' (House of Bones) for its visceral, skeletal organic stone balconies.\n2. The iridescent tiled roof evokes the arched scaly back of a dragon slain by Saint George.\n3. The facade is a vibrant mosaic of broken ceramic tiles (trencadís) shifting from orange to turquoise.",
    distractors: ["Casa Milà (La Pedrera)", "Sagrada Família", "Casa Luis Barragán"],
    architect_distractors: ["Santiago Calatrava", "Luis Barragán", "Hector Guimard"]
  },
  {
    building_name: "Casa Milà (La Pedrera)",
    architect: "Antoni Gaudí",
    city: "Barcelona",
    country: "Spain",
    opened_year: 1912,
    architectural_style: "Catalan Modernisme",
    difficulty: "medium",
    photo_slug: "casa-mila-la-pedrera",
    wiki_page: "Casa_Milà",
    puzzle_clues: "1. Nicknamed 'La Pedrera' (The Stone Quarry) because of its rough-hewn undulating limestone facade.\n2. Completely free-form structural stone and iron frame without any load-bearing walls on residential floors.\n3. The rooftop features surreal sculptured chimney towers resembling medieval helmeted warriors.",
    distractors: ["Casa Batlló", "Sagrada Família", "Palace of Assembly"],
    architect_distractors: ["Josep Maria Jujol", "Le Corbusier", "Santiago Calatrava"]
  },
  {
    building_name: "Salk Institute for Biological Studies",
    architect: "Louis Kahn",
    city: "La Jolla, California",
    country: "United States",
    opened_year: 1965,
    architectural_style: "Monumental Brutalism",
    difficulty: "medium",
    photo_slug: "salk-institute",
    wiki_page: "Salk_Institute_for_Biological_Studies",
    puzzle_clues: "1. Two symmetrical laboratory wings of pozzolanic concrete and teak framing a travertine plaza.\n2. A thin central stream of water ('Stream of Life') flows down the open court toward the Pacific Ocean.\n3. Luis Barragán famously advised Kahn: 'Don't put a single blade of grass. A plaza will unite the sky and earth.'",
    distractors: ["The Getty Center", "Kimbell Art Museum", "IIM Ahmedabad (Louis Kahn Campus)"],
    architect_distractors: ["Richard Meier", "Louis Kahn", "Eero Saarinen"]
  },
  {
    building_name: "Kanchanjunga Apartments",
    architect: "Charles Correa",
    city: "Mumbai",
    country: "India",
    opened_year: 1983,
    architectural_style: "Modernist / Climatic Brutalism",
    difficulty: "medium",
    photo_slug: "kanchanjunga-apartments-mumbai",
    wiki_page: "Charles_Correa",
    image_fallback: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Kanchanjunga_Apartments_Mumbai.jpg/800px-Kanchanjunga_Apartments_Mumbai.jpg",
    puzzle_clues: "1. An 84-metre residential tower on Cumbala Hill responding directly to Mumbai's hot and humid coastal climate.\n2. Features deep, two-storey-high garden verandas carved into the building corners.\n3. Solves the orientation dilemma: shielded east-west against sun and rain while capturing sea breezes.",
    distractors: ["Unité d'Habitation (Cité Radieuse)", "Jawahar Kala Kendra (JKK)", "Sangath (Vastu Shilpa Consultants)"],
    architect_distractors: ["B. V. Doshi", "Raj Rewal", "Achyut Kanvinde"]
  },
  {
    building_name: "Jawahar Kala Kendra (JKK)",
    architect: "Charles Correa",
    city: "Jaipur",
    country: "India",
    opened_year: 1991,
    architectural_style: "Contemporary Vernacular / Vastu Vidya",
    difficulty: "medium",
    photo_slug: "jawahar-kala-kendra",
    wiki_page: "Jawahar_Kala_Kendra",
    puzzle_clues: "1. The plan is directly derived from the nine-square Navagraha mandala, echoing Jaipur's original 18th-century grid.\n2. One square of the grid is displaced to create an open-air stepwell amphitheatre (kund).\n3. Clad in local red and pink Dholpur sandstone adorned with astronomical symbols.",
    distractors: ["Bharat Bhavan", "Gandhi Smarak Sangrahalaya", "Sangath (Vastu Shilpa Consultants)"],
    architect_distractors: ["B. V. Doshi", "Raj Rewal", "Charles Correa"]
  },
  {
    building_name: "IIM Ahmedabad (Louis Kahn Campus)",
    architect: "Louis Kahn",
    city: "Ahmedabad",
    country: "India",
    opened_year: 1974,
    architectural_style: "Monumental Brick Modernism",
    difficulty: "medium",
    photo_slug: "iim-ahmedabad-louis-kahn",
    wiki_page: "IIM_Ahmedabad",
    image_fallback: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/IIM_Ahmedabad_Dormitories.jpg/1280px-IIM_Ahmedabad_Dormitories.jpg",
    puzzle_clues: "1. Renowned for its monolithic exposed red brick facades pierced by massive geometric circular cutouts.\n2. Brick arches span wide porches using horizontal tension tie-rods instead of concrete lintels.\n3. Designed to foster informal discussion through deep diagonal plazas and shaded breezeways.",
    distractors: ["Indian Institute of Management Bangalore (IIMB)", "IIT Kanpur Campus", "Sangath (Vastu Shilpa Consultants)"],
    architect_distractors: ["B. V. Doshi", "Achyut Kanvinde", "Anant Raje"]
  },
  {
    building_name: "Indian Institute of Management Bangalore (IIMB)",
    architect: "B. V. Doshi",
    city: "Bengaluru",
    country: "India",
    opened_year: 1983,
    architectural_style: "Modern Vernacular / Biophilic Concrete",
    difficulty: "medium",
    photo_slug: "iim-bangalore-doshi",
    wiki_page: "Indian_Institute_of_Management_Bangalore",
    puzzle_clues: "1. Inspired by traditional temple towns like Madurai and Fatehpur Sikri.\n2. An interlocking network of open and semi-covered corridors made of rough granite and exposed concrete.\n3. Green pergolas and courtyard gardens create microclimatic cooling without air conditioning.",
    distractors: ["IIM Ahmedabad (Louis Kahn Campus)", "Sangath (Vastu Shilpa Consultants)", "IIT Kanpur Campus"],
    architect_distractors: ["Louis Kahn", "Charles Correa", "Raj Rewal"]
  },
  {
    building_name: "Sangath (Vastu Shilpa Consultants)",
    architect: "B. V. Doshi",
    city: "Ahmedabad",
    country: "India",
    opened_year: 1980,
    architectural_style: "Modern Vernacular / Brutalism",
    difficulty: "medium",
    photo_slug: "sangath-doshi",
    wiki_page: "B._V._Doshi",
    image_fallback: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Sangath_BV_Doshi_1981_02.jpg/1280px-Sangath_BV_Doshi_1981_02.jpg",
    puzzle_clues: "1. The architect's own studio; the name means 'moving together through participation' in Sanskrit.\n2. Features sunken barrel vaults finished with broken white porcelain mosaic tiles (china mosaic).\n3. Grassy mounds, outdoor amphitheatre steps, and rainwater retention ponds create a village sanctuary.",
    distractors: ["Amdavad ni Gufa (Husain-Doshi Gufa)", "Indian Institute of Management Bangalore (IIMB)", "Jawahar Kala Kendra (JKK)"],
    architect_distractors: ["Charles Correa", "Laurie Baker", "Achyut Kanvinde"]
  },
  {
    building_name: "The Glass House",
    architect: "Philip Johnson",
    city: "New Canaan, Connecticut",
    country: "United States",
    opened_year: 1949,
    architectural_style: "Modernist / Minimalist Glass",
    difficulty: "medium",
    photo_slug: "the-glass-house-philip-johnson",
    wiki_page: "File:Philip Johnson Glass House The House.jpg",
    image_fallback: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Philip_Johnson_Glass_House_The_House.jpg/1280px-Philip_Johnson_Glass_House_The_House.jpg",
    puzzle_clues: "1. A pristine 56-foot glass rectangle set into a pastoral Connecticut hilltop.\n2. The only solid volume inside is a cylindrical red brick chimney that houses the bathroom.\n3. Built as the architect's own residence, inspired by Mies van der Rohe's Farnsworth House.",
    distractors: ["Farnsworth House", "Villa Savoye", "Fallingwater (Kaufmann Residence)"],
    architect_distractors: ["Ludwig Mies van der Rohe", "Marcel Breuer", "Eero Saarinen"]
  },
  {
    building_name: "Cathedral of Brasília (Catedral Metropolitana)",
    architect: "Oscar Niemeyer",
    city: "Brasília",
    country: "Brazil",
    opened_year: 1970,
    architectural_style: "Modernist Expressionism",
    difficulty: "medium",
    photo_slug: "cathedral-of-brasilia",
    wiki_page: "Cathedral_of_Brasília",
    puzzle_clues: "1. Crown-shaped hyperboloid structure framed by 16 curved concrete columns weighing 90 tons each.\n2. Stained glass panels in shades of blue, green, and white bathe the subterranean nave in celestial light.\n3. Visitors enter through a dark tunnel before emerging into the brilliant, illuminated cathedral floor.",
    distractors: ["Chapelle Notre Dame du Haut (Ronchamp)", "Sagrada Família", "Sydney Opera House"],
    architect_distractors: ["Lúcio Costa", "Santiago Calatrava", "Le Corbusier"]
  },
  {
    building_name: "TWA Flight Center",
    architect: "Eero Saarinen",
    city: "New York City (JFK Airport)",
    country: "United States",
    opened_year: 1962,
    architectural_style: "Futurist / Expressionist Thin-Shell",
    difficulty: "medium",
    photo_slug: "twa-flight-center-saarinen",
    wiki_page: "TWA_Flight_Center",
    puzzle_clues: "1. Celebrated thin-shell concrete bird-in-flight canopy capturing the optimism of the Jet Age.\n2. Curving sculptural red-carpeted interior tubes connecting the terminal directly to departure gates.\n3. Lovingly restored and reopened in 2019 as the TWA Hotel at JFK Airport.",
    distractors: ["Dulles International Airport", "Gateway Arch", "Sydney Opera House"],
    architect_distractors: ["Jørn Utzon", "Santiago Calatrava", "Paul Rudolph"]
  },
  {
    building_name: "Elbphilharmonie",
    architect: "Jacques Herzog & Pierre de Meuron",
    city: "Hamburg",
    country: "Germany",
    opened_year: 2017,
    architectural_style: "Contemporary / Parametric Glass",
    difficulty: "medium",
    photo_slug: "elbphilharmonie-hamburg",
    wiki_page: "Elbphilharmonie",
    puzzle_clues: "1. A glass iceberg with a wave-like roofline rising on top of a historic red brick cocoa warehouse.\n2. Overlooks the River Elbe in the HafenCity district of Hamburg.\n3. The Grand Hall features 10,000 individually milled acoustic plaster panels known as the 'White Skin'.",
    distractors: ["Sydney Opera House", "Walt Disney Concert Hall", "CCTV Headquarters"],
    architect_distractors: ["Rem Koolhaas", "Norman Foster", "Frank Gehry"]
  },
  {
    building_name: "Lloyd's Building",
    architect: "Richard Rogers",
    city: "London",
    country: "United Kingdom",
    opened_year: 1986,
    architectural_style: "High-Tech / Bowellism",
    difficulty: "medium",
    photo_slug: "lloyds-building-london",
    wiki_page: "Lloyd%27s_building",
    puzzle_clues: "1. Nicknamed the 'Inside-Out Building' for placing all elevators, water pipes, and power cables on the outside.\n2. Awarded Grade I listed status, the youngest building ever to achieve this heritage rating in Britain.\n3. The central underwriting atrium houses the historic 1799 Lutine Bell rung when ships are lost.",
    distractors: ["The Gherkin (30 St Mary Axe)", "Centre Pompidou", "The Shard"],
    architect_distractors: ["Renzo Piano", "Norman Foster", "James Stirling"]
  },
  {
    building_name: "Louvre Abu Dhabi",
    architect: "Jean Nouvel",
    city: "Abu Dhabi",
    country: "United Arab Emirates",
    opened_year: 2017,
    architectural_style: "Contemporary / Arabesque Mashrabiya",
    difficulty: "medium",
    photo_slug: "louvre-abu-dhabi",
    wiki_page: "Louvre_Abu_Dhabi",
    puzzle_clues: "1. Crowned by a 180-metre silver dome made of 7,850 unique metal stars in eight overlapping layers.\n2. Filters intense Arabian sunlight into an enchanting 'Rain of Light' onto white seaside pavilions.\n3. Sits on Saadiyat Island surrounded by the turquoise waters of the Persian Gulf.",
    distractors: ["Museum of the Future", "Grand Louvre Pyramid", "Heydar Aliyev Center"],
    architect_distractors: ["I. M. Pei", "Santiago Calatrava", "Frank Gehry"]
  },
  {
    building_name: "City of Arts and Sciences",
    architect: "Santiago Calatrava (with Félix Candela)",
    city: "Valencia",
    country: "Spain",
    opened_year: 1998,
    architectural_style: "Biomimetic Structuralism",
    difficulty: "medium",
    photo_slug: "city-of-arts-and-sciences",
    wiki_page: "City_of_Arts_and_Sciences",
    puzzle_clues: "1. Spectacular futuristic cultural complex built along the drained Turia riverbed in Valencia.\n2. Features an eye-shaped planetarium (L'Hemisfèric) and an opera house clad in white crushed ceramic tiles.\n3. Inspired by natural skeletons, vertebrae, and marine biology.",
    distractors: ["The Oculus (World Trade Center Hub)", "Sydney Opera House", "Guggenheim Museum Bilbao"],
    architect_distractors: ["Frank Gehry", "Zaha Hadid", "Rafael Moneo"]
  },
  {
    building_name: "Palace of Assembly (Chandigarh Capitol Complex)",
    architect: "Le Corbusier",
    city: "Chandigarh",
    country: "India",
    opened_year: 1962,
    architectural_style: "Monumental Brutalism",
    difficulty: "medium",
    photo_slug: "palace-of-assembly-chandigarh",
    wiki_page: "Palace_of_Assembly_(Chandigarh)",
    puzzle_clues: "1. The legislative assembly hall of Punjab and Haryana featuring a towering hyperbolic cooling-tower skylight.\n2. Fronted by a massive monumental scoop-shaped portico reflected in a tranquil ceremonial basin.\n3. Part of the UNESCO World Heritage Capitol Complex master-planned after India's independence.",
    distractors: ["Secretariat Building (Chandigarh)", "High Court (Chandigarh)", "National Assembly Building (Dhaka)"],
    architect_distractors: ["Louis Kahn", "Pierre Jeanneret", "Edwin Lutyens"]
  },

  // ==========================================
  // HARD (25 Syllabus Masterpieces - 5 Points)
  // ==========================================
  {
    building_name: "Robie House (Frederick C. Robie House)",
    architect: "Frank Lloyd Wright",
    city: "Chicago, Illinois",
    country: "United States",
    opened_year: 1910,
    architectural_style: "Prairie School",
    difficulty: "hard",
    photo_slug: "robie-house-flw",
    wiki_page: "Robie_House",
    puzzle_clues: "1. The quintessential masterpiece of Frank Lloyd Wright's Prairie School architecture.\n2. Dramatic cantilevered roof eaves extending over low horizontal Roman brick terraces.\n3. Centered around a monumental living-room brick fireplace, symbolizing domestic shelter and family unity.",
    distractors: ["Fallingwater (Kaufmann Residence)", "Gamble House", "Farnsworth House"],
    architect_distractors: ["Louis Sullivan", "Marion Mahony Griffin", "Greene and Greene"]
  },
  {
    building_name: "Row House in Sumiyoshi (Azuma House)",
    architect: "Tadao Ando",
    city: "Osaka",
    country: "Japan",
    opened_year: 1976,
    architectural_style: "Minimalist Concrete",
    difficulty: "hard",
    photo_slug: "row-house-sumiyoshi-azuma",
    wiki_page: "Row_House_in_Sumiyoshi",
    puzzle_clues: "1. A windowless raw concrete box slotted into a traditional wooden row house neighborhood.\n2. Divided into three equal cubes, where the central third is an open-air courtyard exposed to the weather.\n3. Residents must carry an umbrella to cross between the bedroom and bathroom during rain.",
    distractors: ["Church of the Light", "Chichu Art Museum", "Koshino House"],
    architect_distractors: ["Kenzō Tange", "Toyo Ito", "Arata Isozaki"]
  },
  {
    building_name: "Chichu Art Museum",
    architect: "Tadao Ando",
    city: "Naoshima",
    country: "Japan",
    opened_year: 2004,
    architectural_style: "Subterranean Minimalism",
    difficulty: "hard",
    photo_slug: "chichu-art-museum",
    wiki_page: "Chichu_Art_Museum",
    puzzle_clues: "1. Built entirely underground inside a hillside to avoid disturbing the natural scenery of the Seto Inland Sea.\n2. Geometric skylights (triangles and rectangles) cut into the ground admit changing natural light.\n3. Custom-built to house works by Claude Monet, James Turrell, and Walter De Maria.",
    distractors: ["Church of the Light", "Miho Museum", "Benesse House"],
    architect_distractors: ["I. M. Pei", "Kengo Kuma", "Kazuyo Sejima"]
  },
  {
    building_name: "Hearst Tower",
    architect: "Norman Foster (Foster + Partners)",
    city: "New York City",
    country: "United States",
    opened_year: 2006,
    architectural_style: "High-Tech / Diagrid",
    difficulty: "hard",
    photo_slug: "hearst-tower-nyc",
    wiki_page: "Hearst_Tower_(Manhattan)",
    puzzle_clues: "1. A 46-storey triangular diagrid glass tower erupting out of an original 1928 Art Deco limestone base.\n2. The diagrid steel frame uses 20% less steel than a conventional office skyscraper frame.\n3. Manhattan's very first LEED Gold-certified commercial office building.",
    distractors: ["The Gherkin (30 St Mary Axe)", "Seagram Building", "Lever House"],
    architect_distractors: ["Renzo Piano", "Skidmore, Owings & Merrill (SOM)", "Richard Rogers"]
  },
  {
    building_name: "HSBC Main Building",
    architect: "Norman Foster (Foster + Partners)",
    city: "Hong Kong",
    country: "Hong Kong",
    opened_year: 1985,
    architectural_style: "High-Tech Structural Expressionism",
    difficulty: "hard",
    photo_slug: "hsbc-main-building-hong-kong",
    wiki_page: "HSBC_Building_(Hong_Kong)",
    puzzle_clues: "1. Completely column-free internal floorplates hung from exterior structural steel masts.\n2. Features a massive central atrium flooded with sunlight reflected by giant motorized exterior mirrors (sunscoop).\n3. Guarded by the famous pair of bronze lions, Stephen and Stitt, on the ground-level public plaza.",
    distractors: ["Bank of China Tower", "The Gherkin (30 St Mary Axe)", "Lloyd's Building"],
    architect_distractors: ["I. M. Pei", "Richard Rogers", "Cesar Pelli"]
  },
  {
    building_name: "National Assembly Building of Bangladesh (Jatiya Sangsad Bhaban)",
    architect: "Louis Kahn",
    city: "Dhaka",
    country: "Bangladesh",
    opened_year: 1982,
    architectural_style: "Monumental Concrete Modernism",
    difficulty: "hard",
    photo_slug: "national-assembly-dhaka-kahn",
    wiki_page: "Jatiya_Sangsad_Bhaban",
    puzzle_clues: "1. Rises out of an artificial surrounding lake like a medieval fortress of democracy.\n2. Monolithic poured-in-place concrete walls sliced with giant geometric openings (circles, triangles, crescents).\n3. A central octagonal parliamentary debating chamber illuminated by a parabolic concrete canopy.",
    distractors: ["Palace of Assembly (Chandigarh)", "Salk Institute", "IIM Ahmedabad (Louis Kahn Campus)"],
    architect_distractors: ["Le Corbusier", "Muzharul Islam", "B. V. Doshi"]
  },
  {
    building_name: "Amdavad ni Gufa (Husain-Doshi Gufa)",
    architect: "B. V. Doshi (with M. F. Husain)",
    city: "Ahmedabad",
    country: "India",
    opened_year: 1994,
    architectural_style: "Organic Underground Cave",
    difficulty: "hard",
    photo_slug: "amdavad-ni-gufa",
    wiki_page: "Amdavad_ni_Gufa",
    puzzle_clues: "1. Underground cave-like art gallery designed collaboratively with legendary painter M. F. Husain.\n2. Interconnected ferro-cement domes covered in recycled broken ceramic mosaic tiles.\n3. Slanted columns inside resemble tree trunks in an enchanted subterranean cavern.",
    distractors: ["Sangath (Vastu Shilpa Consultants)", "Jawahar Kala Kendra (JKK)", "Matrimandir"],
    architect_distractors: ["Charles Correa", "Raj Rewal", "Laurie Baker"]
  },
  {
    building_name: "Gandhi Smarak Sangrahalaya (Sabarmati Ashram)",
    architect: "Charles Correa",
    city: "Ahmedabad",
    country: "India",
    opened_year: 1963,
    architectural_style: "Contemporary Vernacular Modernism",
    difficulty: "hard",
    photo_slug: "gandhi-smarak-sangrahalaya",
    wiki_page: "Sabarmati_Ashram",
    image_fallback: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/GANDHI_ASHRAM_03.jpg/1280px-GANDHI_ASHRAM_03.jpg",
    puzzle_clues: "1. Built within Mahatma Gandhi's historic Sabarmati Ashram on the banks of the Sabarmati River.\n2. Modular 6m x 6m brick-and-wood open pavilions with tiled pyramid roofs arranged around water channels.\n3. Embraces Gandhi's philosophy of simplicity, swadeshi materials, and non-monumental scale.",
    distractors: ["Jawahar Kala Kendra (JKK)", "Bharat Bhavan", "Sangath (Vastu Shilpa Consultants)"],
    architect_distractors: ["B. V. Doshi", "Achyut Kanvinde", "Raj Rewal"]
  },
  {
    building_name: "Bharat Bhavan",
    architect: "Charles Correa",
    city: "Bhopal",
    country: "India",
    opened_year: 1982,
    architectural_style: "Terraced Vernacular / Contextualism",
    difficulty: "hard",
    photo_slug: "bharat-bhavan-correa",
    wiki_page: "Bharat_Bhavan",
    puzzle_clues: "1. Multi-arts complex cascading gently down a sloping hillside toward Upper Lake in Bhopal.\n2. Sunken open-air courtyards, subterranean galleries, and stepped amphitheatre terraces.\n3. Designed to create a non-hierarchical meeting ground for tribal, folk, and contemporary artists.",
    distractors: ["Jawahar Kala Kendra (JKK)", "Kala Academy (Goa)", "Centre for Development Studies (CDS)"],
    architect_distractors: ["B. V. Doshi", "Laurie Baker", "Achyut Kanvinde"]
  },
  {
    building_name: "Champalimaud Centre for the Unknown",
    architect: "Charles Correa",
    city: "Lisbon",
    country: "Portugal",
    opened_year: 2010,
    architectural_style: "Contemporary Structuralist",
    difficulty: "hard",
    photo_slug: "champalimaud-centre-correa",
    wiki_page: "Champalimaud_Foundation",
    puzzle_clues: "1. World-class medical research facility sited right where the Tagus River meets the Atlantic Ocean.\n2. A dramatic central pathway rises toward a pair of stone monoliths framing the open sea.\n3. The exact site from which Vasco da Gama set sail on his historic voyage of discovery in 1497.",
    distractors: ["Salk Institute", "Jawahar Kala Kendra (JKK)", "Kanchanjunga Apartments"],
    architect_distractors: ["Álvaro Siza", "Eduardo Souto de Moura", "Louis Kahn"]
  },
  {
    building_name: "Therme Vals (7132 Thermal Baths)",
    architect: "Peter Zumthor",
    city: "Vals",
    country: "Switzerland",
    opened_year: 1996,
    architectural_style: "Phenomenology / Alpine Minimalism",
    difficulty: "hard",
    photo_slug: "therme-vals-zumthor",
    wiki_page: "Therme_Vals",
    image_fallback: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/7132_Thermal_Baths_%26_Hotel_Vals.jpg/1280px-7132_Thermal_Baths_%26_Hotel_Vals.jpg",
    puzzle_clues: "1. Built into a Swiss mountainside using 60,000 precision-cut slabs of local Valser quartzite stone.\n2. Designed as a sensory experience of stone, warm mineral thermal water, steam, and shadow.\n3. Awarded protected monument status just two years after its completion.",
    distractors: ["Church of the Light", "Bruder Klaus Field Chapel", "Rolex Learning Center"],
    architect_distractors: ["Tadao Ando", "Herzog & de Meuron", "Mario Botta"]
  },
  {
    building_name: "Rolex Learning Center",
    architect: "Kazuyo Sejima & Ryue Nishizawa (SANAA)",
    city: "Lausanne",
    country: "Switzerland",
    opened_year: 2010,
    architectural_style: "Topographical Fluidity / Japanese Minimalism",
    difficulty: "hard",
    photo_slug: "rolex-learning-center-sanaa",
    wiki_page: "Rolex_Learning_Center",
    puzzle_clues: "1. A single continuous undulating concrete landscape with zero internal partition walls.\n2. Gentle slopes, rolling mounds, and curved glass courtyards organically separate study zones.\n3. Sited at the EPFL campus overlooking Lake Geneva and the Swiss Alps.",
    distractors: ["Sendai Mediatheque", "Seattle Central Library", "MAXXI Museum"],
    architect_distractors: ["Toyo Ito", "Shigeru Ban", "Kengo Kuma"]
  },
  {
    building_name: "Sendai Mediatheque",
    architect: "Toyo Ito",
    city: "Sendai",
    country: "Japan",
    opened_year: 2001,
    architectural_style: "Transparent High-Tech / Structural Flux",
    difficulty: "hard",
    photo_slug: "sendai-mediatheque-toyo-ito",
    wiki_page: "Sendai_Mediatheque",
    puzzle_clues: "1. Supported by 13 organic, hollow tubular steel lattice columns resembling seaweed floating in water.\n2. Completely open, barrier-free floor slabs without conventional structural walls.\n3. Famously survived the devastating 2011 Great East Japan earthquake with minimal structural damage.",
    distractors: ["Rolex Learning Center", "Yokosuka Museum of Art", "Spiral Building"],
    architect_distractors: ["Arata Isozaki", "SANAA", "Fumihiko Maki"]
  },
  {
    building_name: "Munich Olympic Stadium Roof",
    architect: "Frei Otto & Günter Behnisch",
    city: "Munich",
    country: "Germany",
    opened_year: 1972,
    architectural_style: "Tensile Lightweight Membrane",
    difficulty: "hard",
    photo_slug: "munich-olympic-stadium-roof",
    wiki_page: "Munich_Olympic_Stadium",
    puzzle_clues: "1. Revolutionary sweeping translucent cable-net tent canopy mimicking the Alpine foothills.\n2. Pioneered computer-aided form-finding and minimal-surface soap bubble physics.\n3. Built for the 1972 Summer Olympics as a symbol of transparent, open, modern Germany.",
    distractors: ["Yoyogi National Gymnasium", "Allianz Arena", "Beijing National Stadium"],
    architect_distractors: ["Kenzō Tange", "Jörg Schlaich", "Santiago Calatrava"]
  },
  {
    building_name: "Casa Luis Barragán",
    architect: "Luis Barragán",
    city: "Mexico City",
    country: "Mexico",
    opened_year: 1948,
    architectural_style: "Emotional Modernism / Mexican Vernacular",
    difficulty: "hard",
    photo_slug: "casa-luis-barragan",
    wiki_page: "Casa_Luis_Barragán",
    puzzle_clues: "1. The home and studio of Mexico's greatest modern architect, inscribed as a UNESCO World Heritage site.\n2. Modest volcanic stone exterior conceals glowing interior rooms with vivid magenta and yellow plaster walls.\n3. Famous for its floating cantilevered wooden staircase and serene private walled garden.",
    distractors: ["Casa Batlló", "Villa Savoye", "The Glass House"],
    architect_distractors: ["Ricardo Legorreta", "Antoni Gaudí", "Oscar Niemeyer"]
  },
  {
    building_name: "Yoyogi National Gymnasium",
    architect: "Kenzō Tange",
    city: "Tokyo",
    country: "Japan",
    opened_year: 1964,
    architectural_style: "Suspension Structuralism / Metabolism",
    difficulty: "hard",
    photo_slug: "yoyogi-national-gymnasium",
    wiki_page: "Yoyogi_National_Gymnasium",
    puzzle_clues: "1. Monumental arena for the 1964 Tokyo Olympics suspended from two central steel tension cables.\n2. Graceful sweeping roofline pays homage to the traditional curved eaves of Shinto shrines.\n3. Directly inspired Frei Otto's tensile cable roofs for the 1972 Munich Olympics.",
    distractors: ["Munich Olympic Stadium Roof", "Tokyo Dome", "Budokan"],
    architect_distractors: ["Frei Otto", "Arata Isozaki", "Kisho Kurokawa"]
  },
  {
    building_name: "Matrimandir",
    architect: "Roger Anger",
    city: "Auroville, Tamil Nadu",
    country: "India",
    opened_year: 2008,
    architectural_style: "Utopian / Futurist Geodesic",
    difficulty: "hard",
    photo_slug: "matrimandir-auroville",
    wiki_page: "Matrimandir",
    puzzle_clues: "1. A massive golden geodesic sphere situated at the geometric center of the experimental township of Auroville.\n2. Clad in thousands of concave discs plated with genuine gold leaf.\n3. The inner chamber is a silent white marble meditation hall containing the world's largest optically pure glass globe.",
    distractors: ["Lotus Temple", "Amdavad ni Gufa", "Centre for Development Studies (CDS)"],
    architect_distractors: ["Fariborz Sahba", "Charles Correa", "B. V. Doshi"]
  },
  {
    building_name: "Hall of Nations (Pragati Maidan)",
    architect: "Raj Rewal & Mahendra Raj",
    city: "New Delhi",
    country: "India",
    opened_year: 1972,
    architectural_style: "Brutalist Space Frame / Structuralism",
    difficulty: "hard",
    photo_slug: "hall-of-nations-new-delhi",
    wiki_page: "Hall_of_Nations",
    puzzle_clues: "1. Built to celebrate 25 years of Indian Independence, the world's first large-span cast-in-place concrete space frame.\n2. Tessellated triangular sun-shading geometry inspired by traditional jali screens.\n3. Tragically demolished in 2017 despite fierce international protests from MoMA and the global architectural community.",
    distractors: ["IIT Kanpur Campus", "Indian Institute of Forest Management (IIFM)", "Centre for Development Studies (CDS)"],
    architect_distractors: ["Achyut Kanvinde", "Charles Correa", "Mahendra Raj"]
  },
  {
    building_name: "Centre for Development Studies (CDS)",
    architect: "Laurie Baker",
    city: "Thiruvananthapuram, Kerala",
    country: "India",
    opened_year: 1971,
    architectural_style: "Vernacular / Cost-Effective Brick",
    difficulty: "hard",
    photo_slug: "centre-for-development-studies-baker",
    wiki_page: "Centre_for_Development_Studies",
    puzzle_clues: "1. Sits on a 10-acre wooded hillside in Kerala, built entirely using exposed unplastered local brick.\n2. Uses traditional brick jalis (perforated screens) to provide natural cross-ventilation without glass or AC.\n3. Famous for a 7-storey twisting circular library tower with a central cooling courtyard.",
    distractors: ["IIT Kanpur Campus", "Indian Institute of Forest Management (IIFM)", "Sangath (Vastu Shilpa Consultants)"],
    architect_distractors: ["Achyut Kanvinde", "B. V. Doshi", "Charles Correa"]
  },
  {
    building_name: "Indian Institute of Forest Management (IIFM)",
    architect: "Anant Raje",
    city: "Bhopal",
    country: "India",
    opened_year: 1988,
    architectural_style: "Contextual Monumentalism / Brick & Concrete",
    difficulty: "hard",
    photo_slug: "iifm-bhopal-anant-raje",
    wiki_page: "Indian_Institute_of_Forest_Management",
    puzzle_clues: "1. Crowned atop a forested hill in Bhopal, inspired by medieval hill-town forts like Mandu.\n2. Built of exposed coursed rubble stone masonry combined with bold semicircular brick and concrete arches.\n3. Designed by a master architect who worked closely with Louis Kahn on IIM Ahmedabad.",
    distractors: ["IIT Kanpur Campus", "Centre for Development Studies (CDS)", "Bharat Bhavan"],
    architect_distractors: ["Louis Kahn", "Charles Correa", "B. V. Doshi"]
  },
  {
    building_name: "IIT Kanpur Campus",
    architect: "Achyut Kanvinde",
    city: "Kanpur, Uttar Pradesh",
    country: "India",
    opened_year: 1966,
    architectural_style: "Bauhaus Modernism / Exposed Concrete & Brick",
    difficulty: "hard",
    photo_slug: "iit-kanpur-kanvinde",
    wiki_page: "Indian_Institute_of_Technology_Kanpur",
    puzzle_clues: "1. One of modern India's earliest and most influential master-planned academic campuses.\n2. Features reinforced concrete frames with exposed local brick infill and elevated pedestrian walkways.\n3. The architect studied directly under Walter Gropius at Harvard before returning to build post-independence India.",
    distractors: ["IIM Ahmedabad (Louis Kahn Campus)", "Indian Institute of Management Bangalore (IIMB)", "IIFM Bhopal"],
    architect_distractors: ["Charles Correa", "B. V. Doshi", "Walter Gropius"]
  },
  {
    building_name: "MAXXI Museum (National Museum of 21st Century Arts)",
    architect: "Zaha Hadid",
    city: "Rome",
    country: "Italy",
    opened_year: 2009,
    architectural_style: "Deconstructivism / Concrete Ribbons",
    difficulty: "hard",
    photo_slug: "maxxi-rome-zaha",
    wiki_page: "MAXXI",
    puzzle_clues: "1. A dynamic network of overlapping curved concrete ribbons weaving through an ancient Roman barracks site.\n2. Features black steel staircases and illuminated bridges suspended inside double-height galleries.\n3. Won the coveted RIBA Stirling Prize in 2010.",
    distractors: ["Heydar Aliyev Center", "Guggenheim Museum Bilbao", "Rolex Learning Center"],
    architect_distractors: ["Frank Gehry", "Renzo Piano", "Daniel Libeskind"]
  },
  {
    building_name: "Villa Mairea",
    architect: "Alvar Aalto (with Aino Aalto)",
    city: "Noormarkku",
    country: "Finland",
    opened_year: 1939,
    architectural_style: "Nordic Modernism / Organic Functionalism",
    difficulty: "hard",
    photo_slug: "villa-mairea-aalto",
    wiki_page: "Villa_Mairea",
    puzzle_clues: "1. Built as a rural country residence for Harry and Maire Gullichsen in a dense Finnish pine forest.\n2. Features columns wrapped in birch bark and rattan, seamlessly blending nature with modern architecture.\n3. Famous for its kidney-shaped outdoor swimming pool that influenced mid-century pool design worldwide.",
    distractors: ["Paimio Sanatorium", "Villa Savoye", "Farnsworth House"],
    architect_distractors: ["Gunnar Asplund", "Eero Saarinen", "Le Corbusier"]
  },
  {
    building_name: "Paimio Sanatorium",
    architect: "Alvar Aalto (with Aino Aalto)",
    city: "Paimio",
    country: "Finland",
    opened_year: 1933,
    architectural_style: "Humanist Functionalism",
    difficulty: "hard",
    photo_slug: "paimio-sanatorium-aalto",
    wiki_page: "Paimio_Sanatorium",
    puzzle_clues: "1. A tuberculosis sanatorium designed from the patient's perspective, treated as a medical instrument.\n2. Featuring gentle ceiling heating, splash-free sinks, and canary-yellow staircases to uplift spirits.\n3. Led directly to the design of the famous bent plywood Paimio Chair No. 41.",
    distractors: ["Villa Mairea", "Villa Savoye", "Unité d'Habitation (Cité Radieuse)"],
    architect_distractors: ["Le Corbusier", "Walter Gropius", "Gunnar Asplund"]
  },
  {
    building_name: "The Getty Center",
    architect: "Richard Meier",
    city: "Los Angeles, California",
    country: "United States",
    opened_year: 1997,
    architectural_style: "Neo-Corbusian / Travertine Modernism",
    difficulty: "hard",
    photo_slug: "the-getty-center-meier",
    wiki_page: "Getty_Center",
    image_fallback: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Getty_Center_2011.jpg/1280px-Getty_Center_2011.jpg",
    puzzle_clues: "1. Sited on a hilltop in the Santa Monica Mountains connected to parking via a driverless hover-train.\n2. Clad in 1.2 million square feet of textured Italian travertine stone and off-white enameled aluminum panels.\n3. Overlooks the Los Angeles basin with sweeping views of the Pacific Ocean.",
    distractors: ["Salk Institute", "Walt Disney Concert Hall", "Solomon R. Guggenheim Museum"],
    architect_distractors: ["Frank Gehry", "Louis Kahn", "I. M. Pei"]
  }
];

// Helper: Download an image with custom headers and follow redirects
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.get(parsed, {
      headers: {
        'User-Agent': 'TI2A-Quiz/1.0 (contact: admin.ti2a@gmail.com; educational platform)'
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, url).href;
        }
        return downloadImage(redirectUrl, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      const out = fs.createWriteStream(destPath);
      res.pipe(out);
      out.on('finish', () => {
        out.close();
        const stats = fs.statSync(destPath);
        resolve(stats.size);
      });
      out.on('error', reject);
    });
    req.on('error', reject);
  });
}

// Helper: Fetch Wikipedia lead image URL
function getWikiLeadImage(pageTitle) {
  return new Promise((resolve) => {
    const url = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(pageTitle);
    https.get(url, { headers: { 'User-Agent': 'TI2A-Quiz/1.0 (contact: admin.ti2a@gmail.com)' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          const thumb = j.originalimage?.source || j.thumbnail?.source;
          resolve(thumb || null);
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  const publicDir = path.resolve(__dirname, '../public/quizzes');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log(`\n======================================================`);
  console.log(`Step 1: Downloading & Verifying Photos for 65 Buildings`);
  console.log(`======================================================`);

  for (let i = 0; i < FAMOUS_BUILDINGS.length; i++) {
    const b = FAMOUS_BUILDINGS[i];
    const filePath = path.join(publicDir, `${b.photo_slug}.jpg`);

    // Check if already downloaded and valid
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 20000) {
      console.log(`[${i + 1}/65] ⏩ Already on disk (${(fs.statSync(filePath).size / 1024).toFixed(1)} KB): ${b.building_name}`);
      continue;
    }

    let downloadUrl = null;

    // Try Wikipedia summary API first
    if (b.wiki_page) {
      downloadUrl = await getWikiLeadImage(b.wiki_page);
    }

    // Try fallback image URL if wiki lead not found
    if (!downloadUrl && b.image_fallback) {
      downloadUrl = b.image_fallback;
    }

    if (!downloadUrl) {
      console.warn(`[${i + 1}/65] ⚠️ No URL for: ${b.building_name}`);
      continue;
    }

    try {
      const size = await downloadImage(downloadUrl, filePath);
      console.log(`[${i + 1}/65] ✅ Downloaded (${(size / 1024).toFixed(1)} KB): ${b.building_name}`);
    } catch (err) {
      console.error(`[${i + 1}/65] ❌ Download failed for ${b.building_name}: ${err.message}`);
      if (b.image_fallback && downloadUrl !== b.image_fallback) {
        try {
          const size = await downloadImage(b.image_fallback, filePath);
          console.log(`[${i + 1}/65] ✅ Recovered via fallback (${(size / 1024).toFixed(1)} KB): ${b.building_name}`);
        } catch (fErr) {
          console.error(`[${i + 1}/65] ❌ Fallback also failed: ${fErr.message}`);
        }
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`Step 2: Updating 'architecture_catalog' in Supabase`);
  console.log(`======================================================`);

  // Clear existing catalog rows and insert new 65 rows
  const { error: delCatErr } = await supabase.from('architecture_catalog').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delCatErr) {
    console.warn("Delete note:", delCatErr.message);
  }

  const catalogRows = FAMOUS_BUILDINGS.map(b => ({
    is_locked: false,
    data: {
      building_name: b.building_name,
      architect: b.architect,
      city: b.city,
      country: b.country,
      opened_year: b.opened_year,
      architectural_style: b.architectural_style,
      difficulty: b.difficulty,
      building_photo: `/quizzes/${b.photo_slug}.jpg`,
      puzzle_clues: b.puzzle_clues
    }
  }));

  for (let i = 0; i < catalogRows.length; i += 20) {
    const chunk = catalogRows.slice(i, i + 20);
    const { error: insErr } = await supabase.from('architecture_catalog').insert(chunk);
    if (insErr) {
      console.error(`Catalog batch error:`, insErr.message);
    } else {
      console.log(`Inserted catalog batch ${Math.floor(i / 20) + 1} (${chunk.length} items)`);
    }
  }

  console.log(`\n======================================================`);
  console.log(`Step 3: Updating 'quiz_questions' for Quiz 1 (Guess the Building)`);
  console.log(`======================================================`);

  // Delete existing questions for Quiz 1
  const { error: delQ1Err } = await supabase.from('quiz_questions').delete().eq('quiz_id', QUIZ_1_ID);
  if (delQ1Err) console.warn("Delete Quiz 1 questions note:", delQ1Err.message);

  const quiz1Questions = FAMOUS_BUILDINGS.map((b, idx) => {
    // 4 options: correct answer + 3 distractors, shuffled
    const rawOpts = [b.building_name, ...b.distractors];
    // deterministic shuffle
    const shuffled = rawOpts.sort(() => (b.photo_slug.length % 2 === 0 ? 0.3 : -0.3));

    return {
      quiz_id: QUIZ_1_ID,
      order_index: idx + 1,
      question_type: 'choose',
      question_text: 'Identify this iconic architectural landmark from the photo:',
      media_type: 'image',
      media_url: `/quizzes/${b.photo_slug}.jpg`,
      options: shuffled,
      correct_answer: b.building_name,
      accepted_aliases: [`diff:${b.difficulty}`, b.building_name],
      explanation_clue: b.puzzle_clues
    };
  });

  for (let i = 0; i < quiz1Questions.length; i += 20) {
    const chunk = quiz1Questions.slice(i, i + 20);
    const { error: q1InsErr } = await supabase.from('quiz_questions').insert(chunk);
    if (q1InsErr) {
      console.error(`Quiz 1 batch insert error:`, q1InsErr.message);
    } else {
      console.log(`Inserted Quiz 1 batch ${Math.floor(i / 20) + 1} (${chunk.length} questions)`);
    }
  }

  console.log(`\n======================================================`);
  console.log(`Step 4: Updating 'quiz_questions' for Quiz 2 (Master Architects: Who Designed It?)`);
  console.log(`======================================================`);

  const { error: delQ2Err } = await supabase.from('quiz_questions').delete().eq('quiz_id', QUIZ_2_ID);
  if (delQ2Err) console.warn("Delete Quiz 2 questions note:", delQ2Err.message);

  const quiz2Questions = FAMOUS_BUILDINGS.map((b, idx) => {
    const rawOpts = [b.architect, ...b.architect_distractors];
    const shuffled = rawOpts.sort(() => (b.photo_slug.length % 3 === 0 ? 0.4 : -0.4));

    return {
      quiz_id: QUIZ_2_ID,
      order_index: idx + 1,
      question_type: 'choose',
      question_text: `Which architect or studio designed "${b.building_name}" in ${b.city}, ${b.country}?`,
      media_type: 'image',
      media_url: `/quizzes/${b.photo_slug}.jpg`,
      options: shuffled,
      correct_answer: b.architect,
      accepted_aliases: [`diff:${b.difficulty}`, b.architect],
      explanation_clue: b.puzzle_clues
    };
  });

  for (let i = 0; i < quiz2Questions.length; i += 20) {
    const chunk = quiz2Questions.slice(i, i + 20);
    const { error: q2InsErr } = await supabase.from('quiz_questions').insert(chunk);
    if (q2InsErr) {
      console.error(`Quiz 2 batch insert error:`, q2InsErr.message);
    } else {
      console.log(`Inserted Quiz 2 batch ${Math.floor(i / 20) + 1} (${chunk.length} questions)`);
    }
  }

  // Update question counts in quizzes table
  await supabase.from('quizzes').update({ updated_at: new Date().toISOString() }).eq('id', QUIZ_1_ID);
  await supabase.from('quizzes').update({ updated_at: new Date().toISOString() }).eq('id', QUIZ_2_ID);

  console.log(`\n🎉 ALL DONE! 65 iconic buildings successfully downloaded and updated in Supabase!`);
}

main().catch(console.error);
