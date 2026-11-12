const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bcifyymjfktabtsmocnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y'
);

// Explicit NIRF Name -> COA Code mapping
const NIRF_NAME_TO_COA = {
  // IITs, NITs, SPAs, Central & State Universities
  'Indian Institute of Technology Roorkee': 'UA01',
  'Indian Institute of Technology, Roorkee': 'UA01',
  'National Institute of Technology Calicut': 'KL04',
  'National Institute of Technology, Calicut': 'KL04',
  'Indian Institute of Technology Kharagpur': 'WB02',
  'Indian Institute of Technology, Kharagpur': 'WB02',
  'Indian Institute of Engineering Science and Technology, Shibpur': 'WB01',
  'School of Planning and Architecture New Delhi': 'DL01',
  'School of Planning and Architecture, New Delhi': 'DL01',
  'School of Planning and Architecture Bhopal': 'MP10',
  'School of Planning & Architecture, Bhopal': 'MP10',
  'School of Planning and Architecture, Vijayawada': 'AP18',
  'School of Planning and Architecture Vijayawada': 'AP18',
  'National Institute of Technology Tiruchirappalli': 'TN02',
  'National Institute of Technology, Tiruchirappalli': 'TN02',
  'Visvesvaraya National Institute of Technology, Nagpur': 'MH04',
  'Visvesvaraya National Institute of Technology': 'MH04',
  'National Institute of Technology Patna': 'BR01',
  'National Institute of Technology, Patna': 'BR01',
  'National Institute of Technology Hamirpur': 'HP01',
  'National Institute of Technology, Hamirpur': 'HP01',
  'National Institute of Technology, Raipur': 'CG01',
  'National Institute of Technology Raipur': 'CG01',
  'National Institute of Technology Rourkela': 'OR06',
  'Malaviya National Institute of Technology': 'RJ01',
  'Malaviya National Institute of Technology Jaipur': 'RJ01',
  'Jamia Millia Islamia': 'DL04',
  'Jamia Millia Islamia, New Delhi': 'DL04',
  'Jamia Millia Islamia,new Delhi': 'DL04',
  'Jadavpur University': 'WB03',
  'Aligarh Muslim University': 'UP02',
  'Indian Institute of Technology (BHU) Varanasi': 'UP49',
  'College of Engineering Trivandrum': 'KL01',
  'Chandigarh College of Architecture': 'CH01',
  'Chandigarh College of Architecture, Sector-12': 'CH01',
  'Chandigarh University': 'PJ11',
  'Chitkara University': 'PJ04',
  'Lovely Professional University': 'PJ06',
  'Nirma University': 'GJ20',
  'Centre for Environmental Planning and Technology University': 'GJ02',
  'CEPT University': 'GJ02',
  'Faculty of Architecture, CEPT University': 'GJ02',
  'Anant National University': 'GJ11',
  'Shri Mata Vaishno Devi University': 'JK01',
  'Guru Gobind Singh Indraprastha University': 'DL06',
  'Gandhi Institute of Technology and Management': 'AP11',
  'Gitam School of Architecture': 'AP11',
  'Faculty of Architecture and Planning, Dr APJ Abbdul Kalam Technical University, Lucknow': 'UP01',
  'Dr. A.P.J. Abdul Kalam Technical University': 'UP01',

  // Manipal
  'Manipal School of Architecture and Planning, MAHE': 'KA02',
  'Faculty of Architecture, Manipal Academy of Higher Education, Manipal': 'KA02',
  'Faculty of Architecture, Manipal Academy of Higher Education': 'KA02',
  'Manipal Academy of Higher Education': 'KA02',
  'Manipal University Jaipur': 'RJ12',

  // BMS
  'BMS School of Architecture': 'KA17',
  'BMS School of Architecture, Yelahanka': 'KA17',
  'B. M. S. College of Architecture': 'KA03',
  'BMS College of Architecture': 'KA03',
  'BMS College of Arhitecture': 'KA03'
};

async function audit() {
  const uniqueNirf = JSON.parse(fs.readFileSync('scripts/unique_nirf_institutions.json', 'utf8'));
  console.log(`Auditing ${uniqueNirf.length} unique NIRF institutions...`);

  // Fetch all DB institutions
  let allInst = [];
  let from = 0;
  while (true) {
    const { data } = await supabase.from('institutions').select('id, coa_code, institution_name, city, state').range(from, from + 999);
    allInst = allInst.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  const byCode = new Map(allInst.map(i => [i.coa_code, i]));

  const missingFromOverride = [];
  const resolved = [];

  for (const n of uniqueNirf) {
    let coaCode = NIRF_NAME_TO_COA[n.name];
    if (!coaCode) {
      missingFromOverride.push(n);
    } else {
      const inst = byCode.get(coaCode);
      if (!inst) {
        console.error(`ERROR: COA Code ${coaCode} for ${n.name} not found in DB!`);
      } else {
        resolved.push({
          nirfName: n.name,
          coaCode,
          instId: inst.id,
          instName: inst.institution_name,
          city: inst.city,
          state: inst.state,
          yearsRanked: n.yearsRanked
        });
      }
    }
  }

  console.log(`Resolved with explicit overrides: ${resolved.length}`);
  console.log(`Remaining to resolve: ${missingFromOverride.length}`);

  if (missingFromOverride.length > 0) {
    console.log('\n--- REMAINING INSTITUTIONS ---');
    missingFromOverride.forEach(m => {
      console.log(`- "${m.name}" (${m.city}, ${m.state}) [Years: ${m.yearsRanked.join(', ')}]`);
    });
  }

  fs.writeFileSync('scripts/remaining_nirf_to_map.json', JSON.stringify(missingFromOverride, null, 2));
}

audit().catch(console.error);
