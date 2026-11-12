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

async function retry() {
  console.log('=== RETRYING MISSING AND INCOMPLETE COA INSTITUTIONS ===\n');

  const { data: dbData } = await supabase.from('institutions').select('id, coa_code, official_email');
  const dbMap = new Map();
  (dbData || []).forEach(d => {
    if (d.coa_code) dbMap.set(d.coa_code.toUpperCase().trim(), d);
  });

  const allParsed = JSON.parse(fs.readFileSync('scripts/parsed_coa_live.json', 'utf8'));

  let added = 0;
  let enriched = 0;

  for (const c of allParsed) {
    const code = (c.coa_code || '').toUpperCase().trim();
    if (!code) continue;

    const existing = dbMap.get(code);
    const headInfo = [c.head_name, c.designation].filter(Boolean).join(', ');

    if (!existing) {
      // Missing college - insert
      const normName = normalizeName(c.institution_name);
      const slug = generateSlug(c.institution_name, code);
      let city = null;
      let district = null;
      if (c.address) {
        const parts = c.address.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          city = parts[parts.length - 2].replace(/pin\s*code.*$/i, '').trim();
          district = city;
        }
      }

      const { data: newInst, error: insErr } = await supabase
        .from('institutions')
        .insert({
          coa_code: code,
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
        })
        .select('id')
        .single();

      if (!insErr && newInst) {
        added++;
        dbMap.set(code, newInst);
        // Insert annual intake
        await supabase
          .from('institution_annual_records')
          .upsert({
            institution_id: newInst.id,
            academic_year: '2024-2025',
            course_name: c.course_name ? (c.course_name.includes('Master') ? 'M.Arch' : 'B.Arch') : 'B.Arch',
            approved_intake: c.approved_intake !== null ? c.approved_intake : 0,
            approval_status: (c.approved_intake || 0) > 0 ? 'Approved' : 'Zero Intake / Discontinued',
            reviewed_at: new Date().toISOString()
          }, { onConflict: 'institution_id,academic_year,course_name' });
      } else {
        console.warn(`Retry insert error for ${code}:`, insErr?.message);
      }
    } else if (!existing.official_email && c.email) {
      // Existing but was missed during update
      const { error: upErr } = await supabase
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

      if (!upErr) enriched++;
    }
  }

  console.log(`\nRetry Completed: Added ${added} new institutions, Enriched ${enriched} existing.`);
}

retry().catch(console.error);
