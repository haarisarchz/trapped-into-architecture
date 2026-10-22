const { createClient } = require('@supabase/supabase-js');

const url = 'https://bcifyymjfktabtsmocnc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(url, key);

const catalogColumns = [
  { id: 'building_name', title: 'Building Name', type: 'text', order_index: 1, is_core: true, is_visible: true },
  { id: 'architect', title: 'Architect / Firm', type: 'text', order_index: 2, is_core: false, is_visible: true },
  { id: 'city', title: 'City', type: 'text', order_index: 3, is_core: false, is_visible: true },
  { id: 'state_region', title: 'State / Region', type: 'text', order_index: 4, is_core: false, is_visible: true },
  { id: 'country', title: 'Country', type: 'text', order_index: 5, is_core: false, is_visible: true },
  { id: 'opened_year', title: 'Opened Year', type: 'number', order_index: 6, is_core: false, is_visible: true },
  { id: 'architect_native', title: "Architect's Nationality", type: 'text', order_index: 7, is_core: false, is_visible: true },
  { id: 'pritzker_prize_year', title: 'Pritzker Prize Year', type: 'number', order_index: 8, is_core: false, is_visible: true },
  { id: 'major_awards', title: 'Major Awards & Honors', type: 'text', order_index: 9, is_core: false, is_visible: true },
  { id: 'architectural_style', title: 'Architectural Style', type: 'text', order_index: 10, is_core: false, is_visible: true },
  { id: 'building_height', title: 'Building Height', type: 'text', order_index: 11, is_core: false, is_visible: true },
  { id: 'building_area', title: 'Built-up Area', type: 'text', order_index: 12, is_core: false, is_visible: true },
  { id: 'architect_other_projects', title: "Architect's Other Projects", type: 'text', order_index: 13, is_core: false, is_visible: true },
  { id: 'building_photo', title: 'Building Photo', type: 'image', order_index: 14, is_core: false, is_visible: true },
  { id: 'architect_photo', title: "Architect's Photo", type: 'image', order_index: 15, is_core: false, is_visible: true },
  { id: 'puzzle_clues', title: 'Puzzle Clues & Trivia', type: 'text', order_index: 16, is_core: false, is_visible: true }
];

async function setupColumns() {
  console.log("Setting up catalog columns in Supabase...");
  await supabase.from('catalog_columns').delete().neq('id', 'dummy');
  const { error } = await supabase.from('catalog_columns').insert(catalogColumns);
  if (error) {
    console.error("Error setting columns:", error);
  } else {
    console.log("Columns configured successfully!");
  }
}

setupColumns();
