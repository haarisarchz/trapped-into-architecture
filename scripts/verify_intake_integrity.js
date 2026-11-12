const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://bcifyymjfktabtsmocnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
  console.log('--- VERIFYING ANNUAL RECORDS INTEGRITY ---');

  // Fetch all records with pagination to bypass 1000 row limit
  let allRecords = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('institution_annual_records')
      .select('id, institution_id, academic_year, course_name, approved_intake, approval_status')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Fetch error:', error);
      break;
    }
    allRecords.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  console.log(`Loaded ${allRecords.length} annual records.`);

  // Check for duplicates on (institution_id, academic_year, course_name)
  const seen = new Map();
  const duplicates = [];

  for (const r of allRecords) {
    const key = `${r.institution_id}__${r.academic_year}__${r.course_name}`;
    if (seen.has(key)) {
      duplicates.push({ key, id1: seen.get(key), id2: r.id });
    } else {
      seen.set(key, r.id);
    }
  }

  console.log(`Duplicate count: ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.error('Duplicate records detected:', duplicates);
  } else {
    console.log('PASSED: Zero duplicates found on (institution_id, academic_year, course_name)!');
  }

  // Academic year distribution
  const yearCounts = {};
  allRecords.forEach(r => {
    const y = r.academic_year;
    yearCounts[y] = (yearCounts[y] || 0) + 1;
  });

  console.log('\nAcademic year breakdown:');
  console.table(yearCounts);

  // Check sample multi-year colleges
  console.log('\nChecking sample multi-year colleges (AP02, GJ04, PJ01):');
  const { data: testInsts } = await supabase
    .from('institutions')
    .select('id, coa_code, institution_name')
    .in('coa_code', ['AP02', 'GJ04', 'PJ01', 'BR05', 'UP06A']);

  for (const inst of testInsts) {
    const recs = allRecords.filter(r => r.institution_id === inst.id);
    console.log(`\n[${inst.coa_code}] ${inst.institution_name}:`);
    recs.sort((a, b) => b.academic_year.localeCompare(a.academic_year)).forEach(r => {
      console.log(`  - ${r.course_name} (${r.academic_year}): ${r.approved_intake} seats [${r.approval_status}]`);
    });
  }
  // Check progressive closure colleges
  console.log('\nChecking 2025 Progressive Closure colleges (KA33, KA43, MH111, RJ09, UP03, UP21):');
  const { data: progInsts } = await supabase
    .from('institutions')
    .select('id, coa_code, institution_name, institution_type')
    .in('coa_code', ['KA33', 'KA43', 'MH111', 'RJ09', 'UP03', 'UP21']);

  for (const inst of progInsts) {
    const recs = allRecords.filter(r => r.institution_id === inst.id);
    console.log(`\n[${inst.coa_code}] ${inst.institution_name} | Status: ${inst.institution_type}`);
    recs.sort((a, b) => b.academic_year.localeCompare(a.academic_year)).slice(0, 3).forEach(r => {
      console.log(`  - ${r.course_name} (${r.academic_year}): ${r.approved_intake} seats [${r.approval_status}]`);
    });
  }
}

verify();
