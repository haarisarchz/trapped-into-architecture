const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://bcifyymjfktabtsmocnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
  console.log('--- VERIFYING PG DATA INTEGRITY & MULTI-COURSE MODELING ---');

  // Load all records
  let allRecords = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('institution_annual_records')
      .select('id, institution_id, academic_year, course_name, approved_intake, approval_status')
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error || !data) break;
    allRecords.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  console.log(`Loaded ${allRecords.length} records.`);

  // Duplicates check
  const seen = new Map();
  const dupes = [];
  for (const r of allRecords) {
    const key = `${r.institution_id}__${r.academic_year}__${r.course_name}`;
    if (seen.has(key)) dupes.push(key);
    else seen.set(key, r.id);
  }

  console.log(`Duplicates on (institution_id, academic_year, course_name): ${dupes.length}`);

  // PG vs UG count
  const ug = allRecords.filter(r => r.course_name === 'B.Arch');
  const pg = allRecords.filter(r => r.course_name !== 'B.Arch');
  console.log(`UG (B.Arch) records: ${ug.length}`);
  console.log(`PG (M.Arch specializations) records: ${pg.length}`);

  // Check multi-course institutions
  console.log('\n--- Checking sample institutions with multiple PG courses ---');
  const { data: samples } = await supabase
    .from('institutions')
    .select('id, coa_code, institution_name')
    .in('coa_code', ['GA01', 'KA11', 'KL01', 'MH12', 'MH102']);

  for (const inst of samples) {
    const instRecs = allRecords.filter(r => r.institution_id === inst.id && r.course_name !== 'B.Arch');
    console.log(`\n[${inst.coa_code}] ${inst.institution_name}:`);
    instRecs.sort((a, b) => b.academic_year.localeCompare(a.academic_year) || a.course_name.localeCompare(b.course_name)).forEach(r => {
      console.log(`  - ${r.academic_year} | ${r.course_name}: ${r.approved_intake} seats [${r.approval_status}]`);
    });
  }
}

verify();
