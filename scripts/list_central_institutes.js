const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bcifyymjfktabtsmocnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y'
);

async function list() {
  const { data } = await supabase
    .from('institutions')
    .select('id, coa_code, institution_name, city, state')
    .order('coa_code', { ascending: true });

  const keywords = ['indian institute', 'national institute', 'technology', 'planning', 'jamia', 'cept', 'manipal', 'bms', 'chandigarh', 'chitkara', 'lovely', 'nirma', 'anant', 'anna university', 'aligarh', 'amity', 'trivandrum'];
  
  const matches = data.filter(i => {
    const name = (i.institution_name || '').toLowerCase();
    return keywords.some(k => name.includes(k));
  });

  console.log(`Matched ${matches.length} institutions:`);
  matches.forEach(i => {
    console.log(`[${i.coa_code}] ${i.institution_name} | City: ${i.city} | State: ${i.state} | ID: ${i.id}`);
  });
}

list().catch(console.error);
