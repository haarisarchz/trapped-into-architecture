const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://bcifyymjfktabtsmocnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Explicit verified corrections for institutions where portal address leaked into the name column
const EXPLICIT_NAME_OVERRIDES = {
  'AP02': 'Faculty of Architecture, College of Engineering (Andhra University)',
  'AP11': 'School of Architecture, GITAM University',
  'AP23': 'Chadalawada Aruna School of Architecture',
  'BR03': 'Department of Architecture, Birla Institute of Technology (BIT Patna)',
  'DL01': 'School of Planning and Architecture (SPA)',
  'HP01': 'Department of Architecture, NIT Hamirpur',
  'HR09': 'Om Institute of Architecture & Design',
  'HR25': 'School of Architecture & Planning, G.D. Goenka University',
  'HR26': 'Delhi Institute of Architecture & Planning',
  'JK03': 'Department of Architecture, Government College of Engineering and Technology (GCET)',
  'JK04': 'School of Architecture, Abdul Ahad Azad Memorial Degree College Bemina',
  'JK05': 'Department of Architecture, Islamic University of Science & Technology (IUST)',
  'KL23': 'School of Architecture, Mookambika Technical Campus',
  'MH04': 'Department of Architecture and Planning, VNIT Nagpur',
  'MH07': 'School of Architecture, D.Y. Patil College of Engineering and Technology',
  'MH12': 'Department of Architecture, Jawaharlal Nehru Engineering College',
  'MH25': 'School of Architecture, Kavikulguru Institute of Technology and Science',
  'MH42': "Balwant Sheth School of Architecture, SVKM's NMIMS",
  'MH113': 'Tatyasaheb Kore College of Architecture',
  'MP07': 'Bagulamukhi College of Architecture and Planning',
  'MP08': 'Amity School of Architecture & Planning, Amity University Gwalior',
  'MP19': 'Jagran School of Architecture, Jagran Lakecity University',
  'PJ07': 'RIMT College of Architecture',
  'RJ05': 'Amity School of Architecture & Planning, Amity University Rajasthan',
  'RJ21': 'Department of Architecture and Planning, Banasthali Vidyapith',
  'RJ22': 'College of Architecture, Mohanlal Sukhadia University',
  'UA02': 'DIT Faculty of Architecture, DIT University',
  'UP07': 'Amity School of Architecture & Planning, Amity University Lucknow',
  'UP35': 'School of Architecture and Regional Planning, Gautam Buddha University',
  'UP36': 'Axis Institute of Architecture',
  'UP48': 'Naraina School of Planning & Architecture',
  'UP49': 'Department of Architecture, Planning and Design, IIT (BHU)',
};

// Known campus disambiguation for identical names in the same city
const SLUG_SPECIAL_TARGETS = {
  'KL20': 'KMCT College of Architecture Manassery Kozhikode',
  'KL21': 'KMCT College of Architecture Kallanthode Kozhikode',
  'TN33': 'Surya School of Architecture Campus 1 Villupuram',
  'TN102': 'Surya School of Architecture Campus 2 Villupuram',
};

function cleanGenericName(rawName) {
  if (!rawName) return '';
  let name = rawName.trim();

  // Strip multi-line leaks if any
  if (name.includes('\n')) {
    name = name.split('\n')[0].trim();
  }

  // Jammed phrases between Department/Faculty/School and College/Institute/National
  name = name.replace(/(Architecture|Planning|Design|Faculty|Department|School)(College|Institute|University|National|Gandhi|Visvesvaraya|D\.Y\.|Jawahar|Kavikulguru)/g, '$1, $2');

  // Apostrophe cleanup
  name = name.replace(/`s\b/g, "'s");
  name = name.replace(/\s+s\b/g, "'s");
  name = name.replace(/\bVidyapeeths\b/g, "Vidyapeeth's");
  name = name.replace(/\bMandal s\b/g, "Mandal's");

  // Deemed to be university cleanup
  name = name.replace(/,?\s*Deemed To Be University/gi, ' (Deemed University)');
  name = name.replace(/,?\s*Deemed to be University/gi, ' (Deemed University)');

  // Strip trailing uppercase city leaked from COA address table
  name = name.replace(/([a-z])([A-Z]{3,})\s*$/, (match, p1, p2) => {
    if (['IIT', 'NIT', 'SPA', 'CEPT', 'IIEST', 'MANIT', 'MNIT', 'VNIT'].includes(p2)) {
      return `${p1} ${p2}`;
    }
    return `${p1}`;
  });

  // Strip trailing "DIST.XXXX"
  name = name.replace(/,?\s*DIST\.?\s*[A-Z\s]+$/i, '');

  // Punctuation & spaces
  name = name.replace(/\s*,\s*/g, ', ');
  name = name.replace(/,\s*,/g, ',');
  name = name.replace(/\s{2,}/g, ' ');
  name = name.replace(/,\s*$/, '');

  return name.trim();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function execute() {
  console.log('Fetching all institutions from Supabase...');
  const { data: insts, error } = await supabase
    .from('institutions')
    .select('id, coa_code, institution_name, city, state, slug')
    .order('coa_code');

  if (error || !insts) {
    console.error('Error fetching institutions:', error);
    return;
  }

  console.log(`Loaded ${insts.length} institutions.`);

  const updates = [];
  const slugTracker = new Map();

  for (const inst of insts) {
    const code = inst.coa_code;
    let city = (inst.city || '').trim();

    // 1. Fix city if Delhi/New
    if (code === 'DL01' || (inst.state === 'Delhi' && (!city || city.toLowerCase() === 'new'))) {
      city = 'New Delhi';
    }

    // 2. Resolve clean name
    let cleanName = EXPLICIT_NAME_OVERRIDES[code] || cleanGenericName(inst.institution_name);

    // 3. Resolve slug (No COA code)
    let slugTarget = cleanName;
    if (SLUG_SPECIAL_TARGETS[code]) {
      slugTarget = SLUG_SPECIAL_TARGETS[code];
    } else if (city && !cleanName.toLowerCase().includes(city.toLowerCase())) {
      slugTarget = `${cleanName} ${city}`;
    }

    let finalSlug = slugify(slugTarget);

    // Safety check against collisions
    if (slugTracker.has(finalSlug)) {
      console.warn(`Slug collision detected for ${code}: ${finalSlug}. Disambiguating...`);
      finalSlug = `${finalSlug}-2`;
    }
    slugTracker.set(finalSlug, code);

    // Normalized search name
    const normalizedName = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    updates.push({
      id: inst.id,
      coa_code: code,
      oldName: inst.institution_name,
      newName: cleanName,
      oldSlug: inst.slug,
      newSlug: finalSlug,
      city: city,
      normalized_name: normalizedName,
      needsUpdate:
        inst.institution_name !== cleanName ||
        inst.slug !== finalSlug ||
        inst.city !== city
    });
  }

  const toApply = updates.filter(u => u.needsUpdate);
  console.log(`\nTotal institutions to update: ${toApply.length} of ${updates.length}`);

  console.log('\n--- SAMPLE UPDATES ---');
  toApply.slice(0, 10).forEach(u => {
    console.log(`[${u.coa_code}]`);
    console.log(`  Name: ${u.oldName} -> ${u.newName}`);
    console.log(`  City: ${u.city}`);
    console.log(`  Slug: ${u.oldSlug} -> ${u.newSlug}`);
  });

  console.log('\nApplying updates to Supabase in batches...');
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < toApply.length; i += 10) {
    const chunk = toApply.slice(i, i + 10);
    await Promise.all(
      chunk.map(async u => {
        const updatePayload = {
          institution_name: u.newName,
          normalized_name: u.normalized_name,
          slug: u.newSlug,
          city: u.city
        };

        const { error: updateErr } = await supabase
          .from('institutions')
          .update(updatePayload)
          .eq('id', u.id);

        if (updateErr) {
          console.error(`Failed to update ${u.coa_code}:`, updateErr.message);
          errorCount++;
        } else {
          successCount++;
        }
      })
    );
  }

  console.log(`\nDone! Successfully updated: ${successCount}, Errors: ${errorCount}`);
}

execute();
