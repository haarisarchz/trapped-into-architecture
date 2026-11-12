const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcifyymjfktabtsmocnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function ingestAll() {
  console.log('=== STARTING COA DIPLOMA MASTER INGESTION ===\n');

  // 1. Load existing institutions
  console.log('1. Loading existing institutions from DB...');
  const existingMap = new Map();
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from('institutions')
      .select('id, coa_code, institution_name, slug')
      .range(page * 1000, (page + 1) * 1000 - 1);

    if (error) {
      console.error('Error fetching institutions:', error);
      process.exit(1);
    }
    data.forEach(inst => {
      if (inst.coa_code) {
        existingMap.set(inst.coa_code.trim().toUpperCase(), inst);
      }
    });
    if (data.length < 1000) break;
    page++;
  }
  console.log(`Loaded ${existingMap.size} existing institutions in DB.`);

  // 2. Insert standalone institutions
  const standaloneList = JSON.parse(fs.readFileSync('scripts/consolidated_diploma_institutions.json', 'utf8'));
  console.log(`\n2. Processing ${standaloneList.length} standalone diploma polytechnics...`);

  const toInsert = [];
  for (const s of standaloneList) {
    const code = s.coa_code.trim().toUpperCase();
    if (!existingMap.has(code)) {
      toInsert.push({
        coa_code: code,
        institution_name: s.institution_name,
        normalized_name: s.institution_name.toLowerCase(),
        slug: s.slug,
        city: s.city,
        state: s.state,
        country: 'India',
        address: s.address,
        official_email: s.official_email,
        official_phone: s.official_phone,
        head_of_institution: s.head_of_institution,
        affiliated_university: s.affiliated_university,
        establishment_year: s.establishment_year,
        institution_type: 'Polytechnic / Diploma Institution',
        is_active: true,
        is_verified: true
      });
    }
  }

  console.log(`Found ${toInsert.length} new standalone polytechnics to insert.`);
  if (toInsert.length > 0) {
    const chunkSize = 25;
    for (let i = 0; i < toInsert.length; i += chunkSize) {
      const chunk = toInsert.slice(i, i + chunkSize);
      const { data, error } = await supabase
        .from('institutions')
        .insert(chunk)
        .select('id, coa_code, institution_name, slug');

      if (error) {
        console.error(`Error inserting chunk ${i}-${i + chunkSize}:`, error);
      } else {
        data.forEach(inst => existingMap.set(inst.coa_code.trim().toUpperCase(), inst));
      }
    }
    console.log(`Inserted standalone polytechnics. Total institutions now: ${existingMap.size}`);
  }

  // 3. Load all existing annual records to prevent duplicates
  console.log('\n3. Loading existing annual records to check for duplicates...');
  const existingAnnualMap = new Map();
  let annPage = 0;
  while (true) {
    const { data, error } = await supabase
      .from('institution_annual_records')
      .select('id, institution_id, academic_year, course_name, approved_intake')
      .range(annPage * 1000, (annPage + 1) * 1000 - 1);

    if (error) {
      console.error('Error fetching annual records:', error);
      process.exit(1);
    }
    data.forEach(r => {
      const key = `${r.institution_id}__${r.academic_year}__${r.course_name}`;
      existingAnnualMap.set(key, r);
    });
    if (data.length < 1000) break;
    annPage++;
  }
  console.log(`Loaded ${existingAnnualMap.size} existing annual records in DB.`);

  // 4. Ingest diploma annual records
  const recordsList = JSON.parse(fs.readFileSync('scripts/consolidated_diploma_records.json', 'utf8'));
  console.log(`\n4. Ingesting ${recordsList.length} diploma annual records...`);

  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  const annualToInsert = [];

  for (const r of recordsList) {
    const code = r.coa_code.trim().toUpperCase();
    const inst = existingMap.get(code);

    if (!inst) {
      console.warn(`Institution not found for code: ${code}`);
      skippedCount++;
      continue;
    }

    const key = `${inst.id}__${r.academic_year}__${r.course_name}`;
    const existingRec = existingAnnualMap.get(key);

    const refData = JSON.stringify({
      head: r.head_of_institution || 'The Principal',
      source: r.source || 'Council of Architecture Gazette'
    });

    if (existingRec) {
      // Update if approved_intake or metadata is newer
      if (existingRec.approved_intake !== r.approved_intake || !existingRec.source_reference) {
        await supabase
          .from('institution_annual_records')
          .update({
            approved_intake: r.approved_intake,
            approval_status: r.approval_status || 'Approved',
            affiliated_university: r.affiliated_university || existingRec.affiliated_university,
            source_reference: refData
          })
          .eq('id', existingRec.id);
        updatedCount++;
      }
    } else {
      annualToInsert.push({
        institution_id: inst.id,
        academic_year: r.academic_year,
        course_name: r.course_name,
        approved_intake: r.approved_intake,
        approval_status: r.approval_status || 'Approved',
        affiliated_university: r.affiliated_university || null,
        source_reference: refData
      });
    }
  }

  console.log(`Annual records to insert: ${annualToInsert.length}`);
  if (annualToInsert.length > 0) {
    const chunkSize = 50;
    for (let i = 0; i < annualToInsert.length; i += chunkSize) {
      const chunk = annualToInsert.slice(i, i + chunkSize);
      const { data, error } = await supabase
        .from('institution_annual_records')
        .insert(chunk)
        .select('id');

      if (error) {
        console.error(`Error inserting annual chunk ${i}-${i + chunkSize}:`, error);
      } else {
        insertedCount += data.length;
      }
    }
  }

  console.log('\n==============================================');
  console.log('INGESTION SUMMARY');
  console.log(`Total Institutions in DB: ${existingMap.size}`);
  console.log(`New Annual Records Inserted: ${insertedCount}`);
  console.log(`Existing Annual Records Updated: ${updatedCount}`);
  console.log(`Skipped (Unmatched codes): ${skippedCount}`);
  console.log('==============================================\n');
}

ingestAll().catch(console.error);
