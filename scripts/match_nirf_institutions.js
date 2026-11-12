const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bcifyymjfktabtsmocnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y'
);

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function matchAll() {
  console.log('Loading all institutions from Supabase...');
  let allInst = [];
  let p = 0;
  while (true) {
    const { data } = await supabase.from('institutions').select('id, coa_code, institution_name, city, state, address').range(p*1000, (p+1)*1000-1);
    allInst.push(...data);
    if (data.length < 1000) break;
    p++;
  }
  console.log(`Loaded ${allInst.length} institutions from DB.`);

  const nirfInsts = JSON.parse(fs.readFileSync('scripts/unique_nirf_institutions.json', 'utf8'));
  console.log(`Matching ${nirfInsts.length} unique NIRF institutions...\n`);

  // Build lookup index
  // 1. By coa_code
  // 2. By normalized name
  const byNormName = new Map();
  allInst.forEach(i => {
    byNormName.set(normalize(i.institution_name), i);
  });

  const matched = [];
  const unmatched = [];

  for (const item of nirfInsts) {
    const norm = normalize(item.name);
    let found = byNormName.get(norm);

    if (!found) {
      // Try fuzzy / substring match
      const candidates = allInst.filter(i => {
        const iNorm = normalize(i.institution_name);
        const stateMatch = !item.state || normalize(i.state) === normalize(item.state);
        // check if key tokens match
        const tokens = norm.split(' ').filter(t => t.length > 3 && !['institute', 'technology', 'architecture', 'school', 'university', 'college'].includes(t));
        const tokenMatch = tokens.length > 0 && tokens.every(t => iNorm.includes(t));
        return stateMatch && tokenMatch;
      });

      if (candidates.length === 1) {
        found = candidates[0];
      } else if (candidates.length > 1) {
        // tie break by city
        const cityCand = candidates.find(c => normalize(c.city) === normalize(item.city));
        if (cityCand) found = cityCand;
        else found = candidates[0];
      }
    }

    if (found) {
      matched.push({
        nirfName: item.name,
        nirfCity: item.city,
        nirfState: item.state,
        targetCode: found.coa_code,
        targetName: found.institution_name,
        targetId: found.id,
        yearsRanked: item.yearsRanked
      });
    } else {
      unmatched.push(item);
    }
  }

  console.log(`Successfully matched: ${matched.length} of ${nirfInsts.length}`);
  console.log(`Unmatched: ${unmatched.length}`);

  if (unmatched.length > 0) {
    console.log('\n--- UNMATCHED NIRF INSTITUTIONS ---');
    unmatched.forEach((u, i) => {
      console.log(`[${i+1}] ${u.name} | City: ${u.city} | State: ${u.state} | Years: ${u.yearsRanked.join(', ')}`);
    });
  }

  fs.writeFileSync('scripts/nirf_matched.json', JSON.stringify(matched, null, 2));
  fs.writeFileSync('scripts/nirf_unmatched.json', JSON.stringify(unmatched, null, 2));
}

matchAll().catch(console.error);
