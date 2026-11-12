const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bcifyymjfktabtsmocnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y'
);

async function findInDb() {
  let allInst = [];
  let p = 0;
  while (true) {
    const { data } = await supabase.from('institutions').select('id, coa_code, institution_name, city, state').range(p*1000, (p+1)*1000-1);
    allInst.push(...data);
    if (data.length < 1000) break;
    p++;
  }

  const nirfs = JSON.parse(fs.readFileSync('scripts/unique_nirf_institutions.json', 'utf8'));
  console.log(`Searching DB for each of the ${nirfs.length} unique NIRF institutions...\n`);

  const results = [];

  for (const n of nirfs) {
    const q = n.name.toLowerCase();
    // Keywords
    let matches = [];

    // Specific searches
    if (q.includes('roorkee')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('roorkee'));
    } else if (q.includes('kharagpur')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('kharagpur'));
    } else if (q.includes('calicut') || q.includes('kozhikode')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('calicut') || i.institution_name.toLowerCase().includes('kozhikode'));
    } else if (q.includes('environmental planning') || q.includes('cept')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('cept') || i.institution_name.toLowerCase().includes('environmental planning'));
    } else if (q.includes('school of planning and architecture') && (q.includes('delhi') || n.city.toLowerCase().includes('delhi'))) {
      matches = allInst.filter(i => (i.coa_code === 'DL01' || i.institution_name.toLowerCase().includes('planning and architecture')) && (i.state?.toLowerCase().includes('delhi') || i.city?.toLowerCase().includes('delhi')));
    } else if (q.includes('bhopal')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('bhopal') && i.institution_name.toLowerCase().includes('planning'));
    } else if (q.includes('vijayawada')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('vijayawada'));
    } else if (q.includes('tiruchirappalli') || q.includes('trichy')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('tiruchirappalli') || i.institution_name.toLowerCase().includes('trichy'));
    } else if (q.includes('nagpur') && (q.includes('visvesvaraya') || q.includes('vnit'))) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('visvesvaraya') || (i.institution_name.toLowerCase().includes('nagpur') && i.institution_name.toLowerCase().includes('technology')));
    } else if (q.includes('jamia millia')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('jamia millia'));
    } else if (q.includes('aligarh')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('aligarh') || i.institution_name.toLowerCase().includes('amu'));
    } else if (q.includes('trivandrum') || q.includes('thiruvananthapuram')) {
      matches = allInst.filter(i => (i.institution_name.toLowerCase().includes('trivandrum') || i.institution_name.toLowerCase().includes('thiruvananthapuram')) && i.institution_name.toLowerCase().includes('college of engineering'));
    } else if (q.includes('manipal')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('manipal'));
    } else if (q.includes('bms')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('bms'));
    } else if (q.includes('chandigarh university')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('chandigarh university'));
    } else if (q.includes('chandigarh college')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('chandigarh college'));
    } else if (q.includes('chitkara')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('chitkara'));
    } else if (q.includes('lovely')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('lovely'));
    } else if (q.includes('nirma')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('nirma'));
    } else if (q.includes('anant')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('anant'));
    } else if (q.includes('ramaiah') || q.includes('m. s. ramaiah')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('ramaiah'));
    } else if (q.includes('patna')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('patna') && (i.institution_name.toLowerCase().includes('nit') || i.institution_name.toLowerCase().includes('national institute')));
    } else if (q.includes('raipur')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('raipur') && (i.institution_name.toLowerCase().includes('nit') || i.institution_name.toLowerCase().includes('national institute')));
    } else if (q.includes('hamirpur')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('hamirpur'));
    } else if (q.includes('rourkela')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('rourkela'));
    } else if (q.includes('manit') || (q.includes('maulana azad') && q.includes('bhopal'))) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('maulana azad'));
    } else if (q.includes('malaviya') || (q.includes('mnit') && q.includes('jaipur'))) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('malaviya'));
    } else if (q.includes('bit') && q.includes('mesra')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('birla institute') || i.institution_name.toLowerCase().includes('mesra'));
    } else if (q.includes('crescent') || q.includes('abdur rahman')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('crescent') || i.institution_name.toLowerCase().includes('abdur rahman'));
    } else if (q.includes('hindustan')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('hindustan'));
    } else if (q.includes('srm') || q.includes('s.r.m.')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('srm') || i.institution_name.toLowerCase().includes('s.r.m.'));
    } else if (q.includes('anna university')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('anna university') || i.institution_name.toLowerCase().includes('sap, anna'));
    } else if (q.includes('gitam') || q.includes('gandhi institute')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('gitam') || i.institution_name.toLowerCase().includes('gandhi institute'));
    } else if (q.includes('smvdu') || q.includes('vaishno devi')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('vaishno devi'));
    } else if (q.includes('indraprastha') || q.includes('ggsipu')) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('indraprastha') || i.institution_name.toLowerCase().includes('usap'));
    } else if (q.includes('jnafau') || (q.includes('jawaharlal nehru') && q.includes('fine arts'))) {
      matches = allInst.filter(i => i.institution_name.toLowerCase().includes('jnafau') || i.institution_name.toLowerCase().includes('fine arts'));
    } else {
      // General match
      const words = n.name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 4 && !['institute', 'technology', 'architecture', 'school', 'university', 'college'].includes(w));
      if (words.length > 0) {
        matches = allInst.filter(i => {
          const iname = i.institution_name.toLowerCase();
          return words.some(w => iname.includes(w));
        });
      }
    }

    results.push({
      nirfName: n.name,
      city: n.city,
      state: n.state,
      matched: matches.map(m => `[${m.coa_code}] ${m.institution_name} (${m.city}, ${m.state}) ID:${m.id}`)
    });
  }

  results.forEach((r, idx) => {
    console.log(`\n[${idx+1}] NIRF: ${r.nirfName} (${r.city}, ${r.state})`);
    if (r.matched.length === 0) {
      console.log(`   -> NO MATCH FOUND`);
    } else if (r.matched.length === 1) {
      console.log(`   -> MATCH: ${r.matched[0]}`);
    } else {
      console.log(`   -> MULTIPLE MATCHES (${r.matched.length}):`);
      r.matched.slice(0, 3).forEach(m => console.log(`      * ${m}`));
    }
  });
}

findInDb().catch(console.error);
