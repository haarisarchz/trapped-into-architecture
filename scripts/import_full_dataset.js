const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcifyymjfktabtsmocnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  const result = [];
  for (let line of lines) {
    if (!line.trim()) continue;
    const row = [];
    let inQuotes = false;
    let current = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    result.push(row);
  }
  return result;
}

function generateSlug(name, code) {
  const base = name ? name.toLowerCase().trim() : (code || '').toLowerCase().trim();
  let clean = base
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  if (code && !clean.includes(code.toLowerCase())) {
    clean = `${clean}-${code.toLowerCase()}`.replace(/-+/g, '-');
  }
  return clean;
}

function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseNumber(val) {
  if (!val) return null;
  const str = String(val).trim().replace(/_/g, '').replace(/[^\d.-]/g, '');
  if (!str || str === '-') return null;
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

async function runImport() {
  console.log('=== STARTING BULK IMPORT OF ARCHITECTURE INSTITUTIONS ===\n');

  const rawText = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/f1dbf539-8245-4dfa-a331-d3d0836eea70/scratch/raw_institutions_data.csv', 'utf8');
  const rows = parseCSV(rawText);

  // 1. Create source_document audit record
  const { data: docData, error: docErr } = await supabase
    .from('source_documents')
    .insert({
      document_title: 'Official COA Architecture Institutions (TN, KA, KL) & NIRF Historical Data',
      source_name: 'Council of Architecture & NIRF India',
      academic_year: '2024-2025',
      file_type: 'CSV',
      processing_status: 'Reviewing',
      notes: 'Initial comprehensive historical ingestion for Tamil Nadu, Karnataka, Kerala, and All-India NIRF.'
    })
    .select('id')
    .single();

  if (docErr) {
    console.error('Failed to create source document log:', docErr.message);
  }
  const sourceDocId = docData?.id || null;
  console.log('Created source_documents log record with ID:', sourceDocId);

  // 2. Parse State sections
  let currentState = null;
  const stateColleges = [];
  const nirfNationalRows = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const col0 = row[0] || '';
    const col1 = (row[1] || '').trim();
    const col2 = (row[2] || '').trim();

    if (col0 === 'S No' && col1.includes('College Code')) {
      if (!currentState) currentState = 'Tamil Nadu';
      else if (currentState === 'Tamil Nadu') currentState = 'Karnataka';
      else if (currentState === 'Karnataka') currentState = 'Kerala';
      continue;
    }

    if (col0 === 'Institute ID') {
      currentState = 'NIRF_NATIONAL';
      continue;
    }

    if (/^[A-Z]{2}\d+/i.test(col1)) {
      stateColleges.push({
        state: currentState,
        code: col1.toUpperCase(),
        name: col2,
        locality: row[3] || '',
        district: row[4] || '',
        affiliation: row[5] || '',
        courseStarted: parseNumber(row[6]),
        intakes: {
          '2020-2021': parseNumber(row[7]),
          '2021-2022': parseNumber(row[8]),
          '2022-2023': parseNumber(row[9]),
          '2023-2024': parseNumber(row[10]),
          '2024-2025': parseNumber(row[11]),
        },
        nirfRanks: currentState === 'Karnataka' ? {
          2019: parseNumber(row[12]),
          2020: parseNumber(row[13]),
          2021: parseNumber(row[14]),
          2022: parseNumber(row[15]),
          2023: parseNumber(row[16]),
        } : {
          2019: parseNumber(row[12]),
          2020: parseNumber(row[13]),
          2021: parseNumber(row[14]),
          2022: parseNumber(row[15]),
          2023: parseNumber(row[16]),
          2024: parseNumber(row[17]),
        },
        website: currentState === 'Karnataka' ? (row[18] || '') : (row[19] || ''),
        rawRow: row
      });
    } else if (currentState === 'NIRF_NATIONAL' && col0.startsWith('IR-')) {
      nirfNationalRows.push({
        instituteId: col0,
        name: col1,
        city: row[2] || '',
        state: row[3] || '',
        score2023: parseNumber(row[4]),
        score2024: parseNumber(row[5]),
        rank2023: parseNumber(row[6]),
        rank2024: parseNumber(row[7]),
      });
    }
  }

  console.log(`Parsed ${stateColleges.length} state institutions across TN, KA, KL.`);
  console.log(`Parsed ${nirfNationalRows.length} All-India top NIRF architectural institutions.\n`);

  let instCount = 0;
  let intakeCount = 0;
  let rankCount = 0;

  // 3. Import State Colleges
  for (const c of stateColleges) {
    const slug = generateSlug(c.name, c.code);
    const normName = normalizeName(c.name);

    // Upsert into institutions table
    const { data: instData, error: instError } = await supabase
      .from('institutions')
      .upsert({
        coa_code: c.code,
        institution_name: c.name,
        normalized_name: normName,
        slug: slug,
        locality: c.locality || null,
        district: c.district || null,
        city: c.district || null,
        state: c.state,
        country: 'India',
        affiliated_university: c.affiliation || null,
        establishment_year: c.courseStarted || null,
        website: c.website || null,
        is_active: true,
        is_verified: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'coa_code' })
      .select('id')
      .single();

    if (instError) {
      console.error(`Error saving institution ${c.code} (${c.name}):`, instError.message);
      continue;
    }

    const institutionId = instData.id;
    instCount++;

    // Insert annual intakes
    for (const [year, seats] of Object.entries(c.intakes)) {
      if (seats !== null) {
        const status = seats > 0 ? 'Approved' : 'Zero Intake / Discontinued';
        const { error: intErr } = await supabase
          .from('institution_annual_records')
          .upsert({
            institution_id: institutionId,
            academic_year: year,
            course_name: 'B.Arch',
            approved_intake: seats,
            approval_status: status,
            source_document_id: sourceDocId,
            reviewed_at: new Date().toISOString()
          }, { onConflict: 'institution_id,academic_year,course_name' });

        if (!intErr) intakeCount++;
        else console.warn(`Intake upsert warning for ${c.code} ${year}:`, intErr.message);
      }
    }

    // Insert NIRF rankings
    for (const [year, rank] of Object.entries(c.nirfRanks)) {
      if (rank !== null && rank > 0) {
        const { error: rkErr } = await supabase
          .from('institution_rankings')
          .upsert({
            institution_id: institutionId,
            ranking_body: 'NIRF',
            ranking_year: parseInt(year, 10),
            rank_number: rank,
            category: 'Architecture'
          }, { onConflict: 'institution_id,ranking_body,ranking_year,category' });

        if (!rkErr) rankCount++;
        else console.warn(`NIRF rank upsert warning for ${c.code} ${year}:`, rkErr.message);
      }
    }
  }

  // 4. Import National NIRF Institutes
  console.log('\nProcessing National Top NIRF Architecture Institutions...');
  for (const n of nirfNationalRows) {
    const norm = normalizeName(n.name);
    // Check if college already exists
    const { data: match } = await supabase
      .from('institutions')
      .select('id')
      .ilike('normalized_name', `%${norm.slice(0, 15)}%`)
      .maybeSingle();

    let nationalInstId = match?.id || null;

    if (!nationalInstId) {
      const slug = generateSlug(n.name, n.instituteId);
      const { data: newNat, error: newNatErr } = await supabase
        .from('institutions')
        .upsert({
          institution_name: n.name,
          normalized_name: norm,
          slug: slug,
          city: n.city,
          district: n.city,
          state: n.state,
          country: 'India',
          is_active: true,
          is_verified: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'slug' })
        .select('id')
        .single();

      if (!newNatErr && newNat) {
        nationalInstId = newNat.id;
        instCount++;
      }
    }

    if (nationalInstId) {
      if (n.rank2023 && n.rank2023 > 0) {
        const { error: r23Err } = await supabase
          .from('institution_rankings')
          .upsert({
            institution_id: nationalInstId,
            ranking_body: 'NIRF',
            ranking_year: 2023,
            rank_number: n.rank2023,
            category: 'Architecture'
          }, { onConflict: 'institution_id,ranking_body,ranking_year,category' });
        if (!r23Err) rankCount++;
      }

      if (n.rank2024 && n.rank2024 > 0) {
        const { error: r24Err } = await supabase
          .from('institution_rankings')
          .upsert({
            institution_id: nationalInstId,
            ranking_body: 'NIRF',
            ranking_year: 2024,
            rank_number: n.rank2024,
            category: 'Architecture'
          }, { onConflict: 'institution_id,ranking_body,ranking_year,category' });
        if (!r24Err) rankCount++;
      }
    }
  }

  // 5. Finalize source_documents
  if (sourceDocId) {
    await supabase
      .from('source_documents')
      .update({
        total_records_extracted: stateColleges.length + nirfNationalRows.length,
        total_records_imported: instCount,
        processing_status: 'Processed',
        updated_at: new Date().toISOString()
      })
      .eq('id', sourceDocId);
  }

  console.log('\n======================================================');
  console.log('IMPORT COMPLETE!');
  console.log(`- Institutions created/updated: ${instCount}`);
  console.log(`- Historical intake records saved: ${intakeCount}`);
  console.log(`- NIRF ranking records saved: ${rankCount}`);
  console.log('======================================================\n');
}

runImport().catch(err => {
  console.error('Fatal import error:', err);
});
