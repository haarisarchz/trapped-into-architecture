const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcifyymjfktabtsmocnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function parseTableRows(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let match;
  const list = [];
  while ((match = trRegex.exec(html)) !== null) {
    const rowHtml = match[1];
    const tdMatches = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m =>
      m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    );
    if (tdMatches.length >= 6) {
      const [sno, rawInfo, affiliatingUniversity, courseName, commencementYear, intakeRaw] = tdMatches;
      const codeMatch = rawInfo.match(/^([A-Z]{2}\d{2,3}[A-Z]?)\b/);
      if (!codeMatch) continue;

      const code = codeMatch[1];
      const emailMatch = rawInfo.match(/Email:\s*([^\s,;]+@[^\s,;]+)/i);
      const email = emailMatch ? emailMatch[1].trim() : null;

      const websiteMatch = rawInfo.match(/Website:\s*(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/i);
      const website = websiteMatch ? websiteMatch[1].trim() : null;

      const mobileMatch = rawInfo.match(/Mobile:\s*([0-9\s,\/-]+?)(?=\s*Website:|$)/i);
      const mobile = mobileMatch ? mobileMatch[1].trim() : null;

      const telMatch = rawInfo.match(/Tel:\s*([0-9\s,\/-]+?)(?=\s*Fax:|\s*Email:|$)/i);
      const tel = telMatch ? telMatch[1].trim() : null;

      const pinMatch = rawInfo.match(/Pin\s*code\s*[-:]?\s*(\d{6})/i);
      const pincode = pinMatch ? pinMatch[1] : null;

      const seatMatch = intakeRaw.match(/^(\d+)/);
      const seats = seatMatch ? parseInt(seatMatch[1], 10) : 0;
      const isProgressiveClosure = /progressive\s+closure/i.test(intakeRaw);
      const isPending = /pending/i.test(intakeRaw);
      const isHold = /intake\s+hold/i.test(intakeRaw);

      const years = [...intakeRaw.matchAll(/(\d{4}-\d{4})/g)].map(m => m[1]);

      list.push({
        code,
        rawInfo,
        affiliatingUniversity,
        courseName,
        commencementYear,
        intakeRaw,
        email,
        website,
        phone: mobile || tel,
        pincode,
        seats,
        isProgressiveClosure,
        isPending,
        isHold,
        years
      });
    }
  }
  return list;
}

const NEW_COLLEGES_CATALOG = [
  {
    coa_code: 'BR05',
    institution_name: 'School of Architecture, Gaya College of Engineering',
    normalized_name: 'school of architecture gaya college of engineering',
    slug: 'school-of-architecture-gaya-college-of-engineering-gaya',
    city: 'Gaya',
    state: 'Bihar',
    country: 'India',
    address: 'Sri Krishna Nagar, Post Nagariyawan Khizarsarai, Gaya, Bihar - 823003',
    official_email: 'principal@gcegaya.ac.in',
    official_phone: '9431623579',
    head_of_institution: 'Venkatesh Raman',
    affiliated_university: 'Bihar Engineering University, Patna',
    establishment_year: 2023,
    institution_type: 'Government',
    is_active: true,
    is_verified: true
  },
  {
    coa_code: 'GJ36',
    institution_name: 'Manjushree Institute of Design',
    normalized_name: 'manjushree institute of design',
    slug: 'manjushree-institute-of-design-gandhinagar',
    city: 'Gandhinagar',
    state: 'Gujarat',
    country: 'India',
    address: 'MID Pethapur, Near G.G.S, Piplaj, Gandhinagar, Gujarat - 382610',
    official_email: 'principal@midedu.org',
    official_phone: '9925024464',
    head_of_institution: 'Anjali A. Kale',
    affiliated_university: 'Gujarat Technological University, Ahmedabad',
    establishment_year: 2023,
    institution_type: 'Private',
    is_active: true,
    is_verified: true
  },
  {
    coa_code: 'RJ23',
    institution_name: 'Biyani Institute of Architecture and Design',
    normalized_name: 'biyani institute of architecture and design',
    slug: 'biyani-institute-of-architecture-and-design-jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    address: 'Khasar No 172 173, Jaipur, Rajasthan - 302012',
    official_email: 'architecture@biyanicolleges.org',
    official_phone: '9887353837',
    head_of_institution: 'Amarendra Kumar Mishra',
    affiliated_university: 'Rajasthan Technical University, Kota',
    establishment_year: 2023,
    institution_type: 'Private',
    is_active: true,
    is_verified: true
  },
  {
    coa_code: 'RJ24',
    institution_name: 'School of Architecture, Rajasthan Institute of Engineering and Technology',
    normalized_name: 'school of architecture rajasthan institute of engineering and technology',
    slug: 'school-of-architecture-rajasthan-institute-of-engineering-and-technology-jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    address: 'Ajmer Road, Bhankrota, Jaipur, Rajasthan - 302026',
    official_email: 'chairman@rietjaipur.ac.in',
    official_phone: '9414017865',
    head_of_institution: 'Kamlesh Parasnath Mishra',
    affiliated_university: 'Rajasthan Technical University, Kota',
    establishment_year: 2024,
    institution_type: 'Private',
    is_active: true,
    is_verified: true
  },
  {
    coa_code: 'RJ25',
    institution_name: 'School of Architecture, Jai Minesh Adivasi University',
    normalized_name: 'school of architecture jai minesh adivasi university',
    slug: 'school-of-architecture-jai-minesh-adivasi-university-kota',
    city: 'Kota',
    state: 'Rajasthan',
    country: 'India',
    address: 'Ranpur Kota, Kota, Rajasthan - 325003',
    official_email: 'jmaunodal@gmail.com',
    official_phone: '9413135301',
    head_of_institution: 'Gaurav Deovrat Arya Agrawal',
    affiliated_university: 'Jai Minesh Adivasi University, Ranpur, Kota',
    establishment_year: 2024,
    institution_type: 'Private',
    is_active: true,
    is_verified: true
  },
  {
    coa_code: 'UP06A',
    institution_name: 'Amity School of Architecture & Planning (Dubai Campus)',
    normalized_name: 'amity school of architecture and planning dubai campus',
    slug: 'amity-school-of-architecture-and-planning-dubai-campus-dubai',
    city: 'Dubai',
    state: 'Dubai',
    country: 'United Arab Emirates',
    address: 'Dubai International Academic City, Dubai Knowledge Village, Dubai, UAE - 345019',
    official_email: 'up06a@amityuniversity.ae',
    official_phone: '9810201378',
    website: 'http://www.amityuniversity.ae',
    head_of_institution: 'Niva Mahanta',
    affiliated_university: 'Amity University, Uttar Pradesh',
    establishment_year: 2012,
    institution_type: 'Private',
    is_active: true,
    is_verified: true
  }
];

async function main() {
  console.log('--- STARTING ECOA 2024 & 2025 INGESTION & RECONCILIATION ---');

  // Step 1: Ensure Source Documents exist
  console.log('Ensuring source documents exist...');
  const sourceDocs = [
    {
      document_title: 'Council of Architecture - Approved B.Arch Institutions 2024-2025',
      source_name: 'Council of Architecture (ecoa.in)',
      academic_year: '2024-2025',
      file_url: 'https://ecoa.in/academic/public/Apporved-Institution-Ug-List',
      file_type: 'HTML',
      processing_status: 'Processed'
    },
    {
      document_title: 'Council of Architecture - Approved B.Arch Institutions 2025-2026',
      source_name: 'Council of Architecture (ecoa.in)',
      academic_year: '2025-2026',
      file_url: 'https://ecoa.in/academic/public/Apporved-Institution-UG-2025',
      file_type: 'HTML',
      processing_status: 'Processed'
    }
  ];

  let doc2024Id = null;
  let doc2025Id = null;

  for (const s of sourceDocs) {
    const { data: existing } = await supabase
      .from('source_documents')
      .select('id')
      .eq('document_title', s.document_title)
      .maybeSingle();

    if (existing) {
      if (s.academic_year === '2024-2025') doc2024Id = existing.id;
      if (s.academic_year === '2025-2026') doc2025Id = existing.id;
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from('source_documents')
        .insert(s)
        .select('id')
        .single();
      if (insErr) {
        console.warn('Could not insert source doc:', insErr.message);
      } else {
        if (s.academic_year === '2024-2025') doc2024Id = inserted.id;
        if (s.academic_year === '2025-2026') doc2025Id = inserted.id;
      }
    }
  }

  // Step 2: Ensure the 6 missing institutions are inserted
  console.log('Checking and inserting missing institutions...');
  for (const newInst of NEW_COLLEGES_CATALOG) {
    const { data: existing } = await supabase
      .from('institutions')
      .select('id')
      .eq('coa_code', newInst.coa_code)
      .maybeSingle();

    if (!existing) {
      const { data: insData, error: insErr } = await supabase
        .from('institutions')
        .insert(newInst)
        .select('id, coa_code')
        .single();
      if (insErr) {
        console.error(`Failed to insert ${newInst.coa_code}:`, insErr.message);
      } else {
        console.log(`Inserted brand new institution: [${newInst.coa_code}] ${newInst.institution_name}`);
      }
    } else {
      console.log(`Institution ${newInst.coa_code} already exists.`);
    }
  }

  // Step 3: Fetch all institutions into Map
  console.log('Fetching all institutions from DB...');
  const { data: allInsts, error: fetchErr } = await supabase
    .from('institutions')
    .select('id, coa_code, institution_name, affiliated_university, establishment_year, official_email, official_phone, website, head_of_institution, institution_type');

  if (fetchErr) {
    console.error('Failed to fetch institutions:', fetchErr);
    return;
  }

  const instByCode = new Map();
  allInsts.forEach(inst => {
    if (inst.coa_code) instByCode.set(inst.coa_code, inst);
  });
  console.log(`Loaded ${instByCode.size} institutions into memory.`);

  // Step 4: Parse both files
  const list2024 = parseTableRows('scripts/ecoa_2024.html');
  const list2025 = parseTableRows('scripts/ecoa_2025.html');

  console.log(`Parsed ${list2024.length} rows from 2024 list.`);
  console.log(`Parsed ${list2025.length} rows from 2025 list.`);

  let total2024Upserts = 0;
  let total2025Upserts = 0;
  let totalEnriched = 0;
  let progressiveClosureCount = 0;

  // Step 5: Process 2024 list
  console.log('\n--- PROCESSING 2024 LIST ---');
  for (const item of list2024) {
    const inst = instByCode.get(item.code);
    if (!inst) {
      console.warn(`[2024] Missing DB college for code ${item.code}`);
      continue;
    }

    // Enrich missing fields
    const updates = {};
    if (!inst.affiliated_university && item.affiliatingUniversity) {
      updates.affiliated_university = item.affiliatingUniversity;
    }
    if (!inst.establishment_year && item.commencementYear && /^\d{4}$/.test(item.commencementYear)) {
      updates.establishment_year = parseInt(item.commencementYear, 10);
    }
    if (!inst.official_email && item.email) {
      updates.official_email = item.email;
    }
    if (!inst.official_phone && item.phone) {
      updates.official_phone = item.phone;
    }
    if (!inst.website && item.website) {
      updates.website = item.website;
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from('institutions').update(updates).eq('id', inst.id);
      Object.assign(inst, updates);
      totalEnriched++;
    }

    // Upsert intake for each year mentioned in 2024 list
    // Years typically: ['2024-2025'] or ['2024-2025', '2025-2026'] or ['2025-2026']
    const yearsToUpsert = item.years.length > 0 ? item.years : ['2024-2025'];
    for (const yr of yearsToUpsert) {
      const rec = {
        institution_id: inst.id,
        academic_year: yr,
        course_name: 'B.Arch',
        approved_intake: item.seats,
        approval_status: item.seats > 0 ? 'Approved' : 'Zero Intake / Discontinued',
        source_document_id: doc2024Id,
        reviewed_at: new Date().toISOString()
      };

      const { error: upsErr } = await supabase
        .from('institution_annual_records')
        .upsert(rec, { onConflict: 'institution_id,academic_year,course_name' });

      if (upsErr) {
        console.error(`[2024] Upsert error for ${item.code} (${yr}):`, upsErr.message);
      } else {
        total2024Upserts++;
      }
    }
  }

  // Step 6: Process 2025 list (Reconciliation & Overwrite where applicable)
  console.log('\n--- PROCESSING 2025 LIST & RECONCILING ---');
  for (const item of list2025) {
    const inst = instByCode.get(item.code);
    if (!inst) {
      console.warn(`[2025] Missing DB college for code ${item.code}`);
      continue;
    }

    // Enrich missing fields
    const updates = {};
    if (!inst.affiliated_university && item.affiliatingUniversity) {
      updates.affiliated_university = item.affiliatingUniversity;
    }
    if (!inst.establishment_year && item.commencementYear && /^\d{4}$/.test(item.commencementYear)) {
      updates.establishment_year = parseInt(item.commencementYear, 10);
    }
    if (!inst.official_email && item.email) {
      updates.official_email = item.email;
    }
    if (!inst.official_phone && item.phone) {
      updates.official_phone = item.phone;
    }
    if (!inst.website && item.website) {
      updates.website = item.website;
    }

    // Check progressive closure
    if (item.isProgressiveClosure) {
      progressiveClosureCount++;
      if (!inst.institution_type || !/closed/i.test(inst.institution_type)) {
        updates.institution_type = 'Progressive Closure: 2025-2026';
      }
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from('institutions').update(updates).eq('id', inst.id);
      Object.assign(inst, updates);
      totalEnriched++;
    }

    // Determine status & seats
    let status = 'Approved';
    let seats = item.seats;

    if (item.isProgressiveClosure) {
      status = 'Progressive Closure';
      seats = 0;
    } else if (item.isPending) {
      status = 'Pending Approval';
      seats = 0;
    } else if (item.isHold) {
      status = 'Intake Hold';
      seats = 0;
    } else if (seats === 0) {
      status = 'Zero Intake / Discontinued';
    }

    const yearsToUpsert = item.years.length > 0 ? item.years : ['2025-2026'];
    for (const yr of yearsToUpsert) {
      const rec = {
        institution_id: inst.id,
        academic_year: yr,
        course_name: 'B.Arch',
        approved_intake: seats,
        approval_status: status,
        source_document_id: doc2025Id,
        reviewed_at: new Date().toISOString()
      };

      // Idempotent upsert on (institution_id, academic_year, course_name)
      // When 2025-2026 was already inserted from the 2024 list, this safely updates it
      const { error: upsErr } = await supabase
        .from('institution_annual_records')
        .upsert(rec, { onConflict: 'institution_id,academic_year,course_name' });

      if (upsErr) {
        console.error(`[2025] Upsert error for ${item.code} (${yr}):`, upsErr.message);
      } else {
        total2025Upserts++;
      }
    }
  }

  console.log('\n======================================================');
  console.log('INGESTION AND RECONCILIATION SUMMARY:');
  console.log(`- Total 2024 records upserted: ${total2024Upserts}`);
  console.log(`- Total 2025 records upserted: ${total2025Upserts}`);
  console.log(`- Total institutions enriched: ${totalEnriched}`);
  console.log(`- Total progressive closures identified in 2025: ${progressiveClosureCount}`);

  // Step 7: Verify final total records and duplicate check
  const { count: finalTotal } = await supabase
    .from('institution_annual_records')
    .select('*', { count: 'exact', head: true });

  console.log(`- Final total annual records in DB: ${finalTotal}`);
  console.log('======================================================');
}

main();
