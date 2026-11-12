const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bcifyymjfktabtsmocnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y'
);

const MAPPING = {
  // Roorkee
  'indian institute of technology roorkee': 'UA01',
  'indian institute of technology, roorkee': 'UA01',

  // Calicut
  'national institute of technology calicut': 'KL02',
  'national institute of technology, calicut': 'KL02',

  // Kharagpur
  'indian institute of technology kharagpur': 'WB01',
  'indian institute of technology, kharagpur': 'WB01',

  // CEPT
  'centre for environmental planning and technology university': 'GJ01',
  'cept university': 'GJ01',

  // SPA Delhi
  'school of planning and architecture new delhi': 'DL01',
  'school of planning and architecture, new delhi': 'DL01',

  // NIT Trichy
  'national institute of technology tiruchirappalli': 'TN04',
  'national institute of technology, tiruchirappalli': 'TN04',

  // VNIT Nagpur
  'visvesvaraya national institute of technology, nagpur': 'MH06',
  'visvesvaraya national institute of technology nagpur': 'MH06',
  'visvesvaraya national institute of technology': 'MH06',

  // NIT Patna
  'national institute of technology patna': 'BR01',
  'national institute of technology, patna': 'BR01',

  // Chandigarh University
  'chandigarh university': 'PB08',

  // CET Trivandrum
  'college of engineering trivandrum': 'KL01',
  'college of engineering, trivandrum': 'KL01',

  // Manipal Jaipur
  'manipal university jaipur': 'RJ07',
  'manipal university, jaipur': 'RJ07',

  // SMVDU Katra
  'shri mata vaishno devi university': 'JK01',

  // LPU
  'lovely professional university': 'PB02',

  // MAHE Manipal
  'manipal school of architecture and planning, mahe': 'KA06',
  'faculty of architecture, manipal academy of higher education, manipal': 'KA06',
  'faculty of architecture, manipal academy of higher education': 'KA06',
  'manipal academy of higher education': 'KA06',

  // Nirma
  'nirma university': 'GJ11',

  // NIT Hamirpur
  'national institute of technology hamirpur': 'HP01',
  'national institute of technology, hamirpur': 'HP01',

  // NIT Raipur
  'national institute of technology, raipur': 'CG01',
  'national institute of technology raipur': 'CG01',

  // GGSIPU
  'guru gobind singh indraprastha university': 'DL04',

  // BMS Yelahanka
  'bms school of architecture, yelahanka': 'KA35',
  'bms school of architecture': 'KA35',

  // BMS Bull Temple Road
  'bms college of arhitecture': 'KA14',
  'bms college of architecture': 'KA14',

  // Chitkara
  'chitkara university': 'PB06',

  // AKTU Lucknow
  'faculty of architecture and planning, dr apj abbdul kalam technical university, lucknow': 'UP02',
  'dr. a.p.j. abdul kalam technical university': 'UP02',

  // CCA Chandigarh
  'chandigarh college of architecture, sector-12': 'CH01',
  'chandigarh college of architecture sector-12': 'CH01',

  // GITAM
  'gandhi institute of technology and management': 'AP16',

  // Crescent
  'b. s. abdur rahman crescent institute of science and technology': 'TN21',

  // Jamia
  'jamia millia islamia,new delhi': 'DL03',
  'jamia millia islamia, new delhi': 'DL03',
  'jamia millia islamia': 'DL03',

  // HITS Chennai
  'hindustan institute of technology and science (hits)': 'TN18',
  'hindustan institute of technology and science': 'TN18',

  // AU Vizag
  'college of engineering visakhapatnam': 'AP01',
  'andhra university': 'AP01',

  // JNAFAU Hyderabad
  'jnafau school of planning and architecture': 'TS01',
  'jawaharlal nehru architecture and fine arts university': 'TS01'
};

async function testCodes() {
  const codes = [...new Set(Object.values(MAPPING))];
  console.log(`Checking ${codes.length} mapped COA codes in Supabase institutions table...`);

  const { data, error } = await supabase.from('institutions').select('coa_code, institution_name, city, state').in('coa_code', codes);
  if (error) {
    console.error(error);
    return;
  }

  const foundCodes = new Set(data.map(d => d.coa_code));
  console.log(`Found ${foundCodes.size} of ${codes.length} institutions in DB.`);

  for (const c of codes) {
    if (!foundCodes.has(c)) {
      console.log(`MISSING CODE: ${c}`);
    } else {
      const inst = data.find(d => d.coa_code === c);
      console.log(`[${c}] ${inst.institution_name} (${inst.city}, ${inst.state})`);
    }
  }
}

testCodes().catch(console.error);
