const { createClient } = require('@supabase/supabase-js');
const { catalogProjects } = require('./catalog_data');

const url = 'https://bcifyymjfktabtsmocnc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(url, key);

async function populate() {
  console.log(`Starting insertion of ${catalogProjects.length} architectural masterworks into architecture_catalog...`);

  // Clear any existing rows to ensure a fresh, clean, perfectly ordered catalog
  const { error: delError } = await supabase.from('architecture_catalog').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delError) {
    console.warn("Delete note:", delError.message);
  }

  const rows = catalogProjects.map(proj => ({
    is_locked: false,
    data: proj
  }));

  // Insert in batches of 20
  for (let i = 0; i < rows.length; i += 20) {
    const chunk = rows.slice(i, i + 20);
    const { data, error } = await supabase.from('architecture_catalog').insert(chunk).select('id');
    if (error) {
      console.error(`Error inserting batch ${i / 20 + 1}:`, error.message);
    } else {
      console.log(`Successfully inserted batch ${i / 20 + 1} (${chunk.length} projects)`);
    }
  }

  // Verify total count
  const { count, error: countErr } = await supabase.from('architecture_catalog').select('*', { count: 'exact', head: true });
  console.log(`\n🎉 Verification: Total rows now in architecture_catalog: ${count}`);
}

populate();
