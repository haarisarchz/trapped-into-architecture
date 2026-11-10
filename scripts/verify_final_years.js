const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://bcifyymjfktabtsmocnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
  let allRecords = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data } = await supabase
      .from('institution_annual_records')
      .select('id, institution_id, academic_year, course_name, approved_intake')
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (!data || data.length === 0) break;
    allRecords.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  console.log(`Total records loaded: ${allRecords.length}`);

  // Duplicate check
  const seen = new Map();
  const dupes = [];
  for (const r of allRecords) {
    const k = `${r.institution_id}__${r.academic_year}__${r.course_name}`;
    if (seen.has(k)) dupes.push(k);
    else seen.set(k, r.id);
  }
  console.log(`Duplicates on (institution_id, academic_year, course_name): ${dupes.length}`);

  const ugYears = {};
  const pgYears = {};

  allRecords.forEach(r => {
    const isUg = (r.course_name || 'B.Arch') === 'B.Arch';
    const y = r.academic_year;
    if (isUg) ugYears[y] = (ugYears[y] || 0) + 1;
    else pgYears[y] = (pgYears[y] || 0) + 1;
  });

  console.log('\n--- UG (B.Arch) Years Breakdown ---');
  console.table(ugYears);

  console.log('\n--- PG (M.Arch) Years Breakdown ---');
  console.table(pgYears);
}

verify();
