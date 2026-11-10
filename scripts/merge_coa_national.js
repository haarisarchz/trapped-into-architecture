const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcifyymjfktabtsmocnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

async function runMerge() {
  console.log('=== STARTING MERGE OF ALL 406 COA NATIONAL INSTITUTIONS ===\n');

  const raw = fs.readFileSync('scripts/parsed_coa_live.json', 'utf8');
  const colleges = JSON.parse(raw);
  console.log(`Loaded ${colleges.length} institutions from COA portal.`);

  // 1. Audit Log in source_documents
  const { data: docData, error: docErr } = await supabase
    .from('source_documents')
    .insert({
      document_title: 'COA Official National Architecture Institutions Directory',
      source_name: 'Council of Architecture (coa.gov.in)',
      academic_year: '2024-2025',
      file_type: 'WEB/PORTAL',
      total_records_extracted: colleges.length,
      processing_status: 'Completed',
      notes: 'Full national scrape from https://coa.gov.in/institutionStatus.php covering 406 institutions across India.'
    })
    .select('id')
    .single();

  const sourceDocId = docData?.id || null;
  console.log('Created source_documents log record with ID:', sourceDocId);

  // 2. Fetch all existing institutions to map by coa_code or normalized name
  const { data: existingList, error: exErr } = await supabase
    .from('institutions')
    .select('id, coa_code, institution_name, normalized_name, slug');

  if (exErr) {
    console.error('Error fetching existing institutions:', exErr.message);
  }

  const existingByCode = new Map();
  const existingByName = new Map();
  (existingList || []).forEach(inst => {
    if (inst.coa_code) existingByCode.set(inst.coa_code.toUpperCase().trim(), inst);
    if (inst.normalized_name) existingByName.set(inst.normalized_name, inst);
  });

  console.log(`Currently found ${existingByCode.size} existing institutions in database.\n`);

  let newCount = 0;
  let enrichedCount = 0;
  let intakeCount = 0;

  for (let i = 0; i < colleges.length; i++) {
    const c = colleges[i];
    const coaCode = (c.coa_code || '').toUpperCase().trim();
    if (!coaCode) continue;

    const normName = normalizeName(c.institution_name);
    const existing = existingByCode.get(coaCode) || existingByName.get(normName);

    let institutionId = existing ? existing.id : null;
    const headInfo = [c.head_name, c.designation].filter(Boolean).join(', ');

    if (existing) {
      // ENRICH existing college
      const { error: updateErr } = await supabase
        .from('institutions')
        .update({
          address: c.address || undefined,
          official_phone: c.phone || c.mobile || undefined,
          official_email: c.email || undefined,
          website: c.website || undefined,
          head_of_institution: headInfo || undefined,
          affiliated_university: c.affiliated_university || undefined,
          establishment_year: c.commencement_year || undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (!updateErr) enrichedCount++;
      else console.warn(`Update error for ${coaCode}:`, updateErr.message);
    } else {
      // INSERT new national college
      let slug = generateSlug(c.institution_name, coaCode);

      // Extract city/district from address
      let city = null;
      let district = null;
      if (c.address) {
        const parts = c.address.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          city = parts[parts.length - 2].replace(/pin\s*code.*$/i, '').trim();
          district = city;
        }
      }

      const { data: newInst, error: insertErr } = await supabase
        .from('institutions')
        .insert({
          coa_code: coaCode,
          institution_name: c.institution_name,
          normalized_name: normName,
          slug: slug,
          address: c.address || null,
          city: city,
          district: district,
          state: c.state || 'All India',
          country: 'India',
          website: c.website || null,
          official_email: c.email || null,
          official_phone: c.phone || c.mobile || null,
          head_of_institution: headInfo || null,
          affiliated_university: c.affiliated_university || null,
          establishment_year: c.commencement_year || null,
          is_active: true,
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (!insertErr && newInst) {
        institutionId = newInst.id;
        newCount++;
        existingByCode.set(coaCode, newInst);
      } else if (insertErr) {
        console.warn(`Insert error for new ${coaCode}:`, insertErr.message);
      }
    }

    // Upsert Current Intake into institution_annual_records
    if (institutionId) {
      const seats = c.approved_intake;
      const status = seats > 0 ? 'Approved' : 'Zero Intake / Discontinued';
      const academicYear = c.approval_period || '2024-2025';

      const { error: intErr } = await supabase
        .from('institution_annual_records')
        .upsert({
          institution_id: institutionId,
          academic_year: '2024-2025',
          course_name: c.course_name ? (c.course_name.includes('Master') ? 'M.Arch' : 'B.Arch') : 'B.Arch',
          approved_intake: seats !== null ? seats : 0,
          approval_status: status,
          source_document_id: sourceDocId,
          reviewed_at: new Date().toISOString()
        }, { onConflict: 'institution_id,academic_year,course_name' });

      if (!intErr) intakeCount++;
    }

    if ((i + 1) % 50 === 0 || i === colleges.length - 1) {
      console.log(`Processed ${i + 1}/${colleges.length} colleges (Enriched: ${enrichedCount}, New Created: ${newCount}, Intakes: ${intakeCount})`);
    }
  }

  console.log('\n======================================================');
  console.log('MERGE COMPLETED SUCCESSFULLY!');
  console.log(`- Enriched Existing Institutions: ${enrichedCount}`);
  console.log(`- Brand New Institutions Created: ${newCount}`);
  console.log(`- Total Live Institutions Now: ${existingByCode.size + newCount}`);
  console.log(`- Annual Intake Records Updated: ${intakeCount}`);
  console.log('======================================================\n');
}

runMerge().catch(console.error);
