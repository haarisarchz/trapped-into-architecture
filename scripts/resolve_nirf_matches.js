const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bcifyymjfktabtsmocnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y'
);

async function resolve() {
  const uniqueNirf = JSON.parse(fs.readFileSync('scripts/unique_nirf_institutions.json', 'utf8'));
  console.log(`Loaded ${uniqueNirf.length} unique NIRF institutions.`);

  // Fetch all 583 institutions from Supabase
  let allInst = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('institutions')
      .select('id, coa_code, institution_name, city, state, slug')
      .range(from, from + pageSize - 1);
    if (error) throw error;
    allInst = allInst.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  console.log(`Fetched ${allInst.length} institutions from DB.`);

  // Let's create helper matching functions
  const clean = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  const results = [];

  for (const item of uniqueNirf) {
    const nirfClean = clean(item.name);
    const nirfCity = clean(item.city);
    const nirfState = clean(item.state);

    // Score all institutions
    let scored = allInst.map(inst => {
      const instClean = clean(inst.institution_name);
      const instCity = clean(inst.city);
      const instState = clean(inst.state);

      let score = 0;
      // Direct string containment
      if (nirfClean === instClean) score += 100;
      else if (instClean.includes(nirfClean) || nirfClean.includes(instClean)) score += 50;

      // Word token overlap
      const nirfWords = nirfClean.split(' ').filter(w => w.length > 2 && !['and', 'the', 'for', 'institute', 'technology', 'college', 'school', 'architecture', 'university'].includes(w));
      const instWords = instClean.split(' ').filter(w => w.length > 2 && !['and', 'the', 'for', 'institute', 'technology', 'college', 'school', 'architecture', 'university'].includes(w));
      
      let matchedWords = 0;
      for (const w of nirfWords) {
        if (instWords.includes(w)) matchedWords++;
      }
      if (nirfWords.length > 0) {
        score += (matchedWords / nirfWords.length) * 30;
      }

      // City / State match
      if (nirfCity && (instCity.includes(nirfCity) || nirfCity.includes(instCity))) score += 20;
      if (nirfState && (instState.includes(nirfState) || nirfState.includes(instState))) score += 10;

      return { inst, score, matchedWords, totalWords: nirfWords.length };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    const top3 = scored.slice(0, 3).filter(s => s.score > 25);

    results.push({
      nirf: item,
      best: best && best.score > 35 ? best : null,
      candidates: top3
    });
  }

  const matched = results.filter(r => r.best !== null);
  const unmatched = results.filter(r => r.best === null);

  console.log(`\nMatched: ${matched.length} / ${uniqueNirf.length}`);
  console.log(`Unmatched: ${unmatched.length} / ${uniqueNirf.length}`);

  fs.writeFileSync('scripts/nirf_resolution_audit.json', JSON.stringify(results, null, 2));
  console.log('Saved to scripts/nirf_resolution_audit.json');
}

resolve().catch(console.error);
