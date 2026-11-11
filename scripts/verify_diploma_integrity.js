const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bcifyymjfktabtsmocnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y'
);

async function verifyAll() {
  console.log('=== VERIFYING DATABASE INTEGRITY ===\n');

  // Fetch all annual records
  let allRecords = [];
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from('institution_annual_records')
      .select('id, institution_id, academic_year, course_name, approved_intake, approval_status, source_reference')
      .range(page * 1000, (page + 1) * 1000 - 1);

    if (error) {
      console.error(error);
      break;
    }
    allRecords.push(...data);
    if (data.length < 1000) break;
    page++;
  }

  console.log(`Total Annual Records in DB: ${allRecords.length}`);

  // Check duplicates
  const seen = new Set();
  let dupCount = 0;
  allRecords.forEach(r => {
    const key = `${r.institution_id}__${r.academic_year}__${r.course_name}`;
    if (seen.has(key)) dupCount++;
    else seen.add(key);
  });
  console.log(`Duplicate records: ${dupCount} (Must be 0)`);

  // Course categories
  let ugCount = 0;
  let pgCount = 0;
  let diplomaCount = 0;
  const diplomaCourses = new Map();

  allRecords.forEach(r => {
    const c = r.course_name || 'B.Arch';
    if (c.includes('Diploma')) {
      diplomaCount++;
      diplomaCourses.set(c, (diplomaCourses.get(c) || 0) + 1);
    } else if (c.startsWith('M.Arch') || c.includes('Master')) {
      pgCount++;
    } else {
      ugCount++;
    }
  });

  console.log(`\nProgram Breakdown:`);
  console.log(`- UG (Bachelor of Architecture): ${ugCount}`);
  console.log(`- PG (Master of Architecture & Specializations): ${pgCount}`);
  console.log(`- Diploma (COA Approved Diploma Programs): ${diplomaCount}`);

  console.log(`\nDiploma Courses Breakdown:`);
  for (const [name, count] of diplomaCourses.entries()) {
    console.log(`  * ${name}: ${count} records`);
  }

  // Check sample colleges with both B.Arch & Diploma (e.g. GJ06, KA09, MH102)
  console.log(`\nSample Dual-Stream Institutions (B.Arch + Diploma):`);
  const testCodes = ['GJ06', 'GJ09', 'KA09', 'MH102', 'APD01'];
  for (const code of testCodes) {
    const { data: inst } = await supabase.from('institutions').select('id, coa_code, institution_name, institution_type, head_of_institution').eq('coa_code', code).single();
    if (inst) {
      const { data: recs } = await supabase.from('institution_annual_records').select('academic_year, course_name, approved_intake, source_reference').eq('institution_id', inst.id).order('academic_year', { ascending: false });
      console.log(`\n[${inst.coa_code}] ${inst.institution_name} (${inst.institution_type || 'Degree'})`);
      console.log(`  Current Head: ${inst.head_of_institution}`);
      console.log(`  Total annual records: ${recs.length}`);
      recs.slice(0, 6).forEach(r => {
        let head = '-';
        if (r.source_reference) {
          try { head = JSON.parse(r.source_reference).head || '-'; } catch(e) {}
        }
        console.log(`   - ${r.academic_year} | ${r.course_name.padEnd(35)} | ${r.approved_intake} seats | Leader: ${head}`);
      });
    }
  }
}

verifyAll().catch(console.error);
