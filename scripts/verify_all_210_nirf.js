const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bcifyymjfktabtsmocnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y'
);

// Master NIRF Name to COA Code map covering all name variants from 2018 to 2025
const NIRF_NAME_TO_COA = {
  // IIT Roorkee
  'Indian Institute of Technology Roorkee': 'UA01',
  'Indian Institute of Technology, Roorkee': 'UA01',

  // NIT Calicut
  'National Institute of Technology Calicut': 'KL04',
  'National Institute of Technology, Calicut': 'KL04',

  // IIT Kharagpur
  'Indian Institute of Technology Kharagpur': 'WB02',
  'Indian Institute of Technology, Kharagpur': 'WB02',

  // IIEST Shibpur
  'Indian Institute of Engineering Science and Technology, Shibpur': 'WB01',
  'Indian Institute of Engineering Science and Technology': 'WB01',

  // Jamia Millia Islamia
  'Jamia Millia Islamia': 'DL04',
  'Jamia Millia Islamia, New Delhi': 'DL04',
  'Jamia Millia Islamia,New Delhi': 'DL04',

  // CEPT
  'Centre for Environmental Planning and Technology University': 'GJ02',
  'CEPT University': 'GJ02',
  'Faculty of Architecture, CEPT University': 'GJ02',

  // NIT Trichy
  'National Institute of Technology Tiruchirappalli': 'TN02',
  'National Institute of Technology, Tiruchirappalli': 'TN02',

  // VNIT Nagpur
  'Visvesvaraya National Institute of Technology, Nagpur': 'MH04',
  'Visvesvaraya National Institute of Technology Nagpur': 'MH04',
  'Visvesvaraya National Institute of Technology': 'MH04',

  // NIT Patna
  'National Institute of Technology Patna': 'BR01',
  'National Institute of Technology, Patna': 'BR01',

  // SPA New Delhi
  'School of Planning and Architecture New Delhi': 'DL01',
  'School of Planning and Architecture, New Delhi': 'DL01',
  'School of Planning and Architecture': (r) => {
    if (r.city === 'New Delhi' || r.state === 'Delhi') return 'DL01';
    if (r.city === 'Bhopal' || r.state === 'Madhya Pradesh') return 'MP10';
    if (r.city === 'Vijayawada' || r.state === 'Andhra Pradesh') return 'AP18';
    return null;
  },

  // SPA Bhopal
  'School of Planning and Architecture Bhopal': 'MP10',
  'School of Planning & Architecture, Bhopal': 'MP10',
  'School of Planning and Architecture, Bhopal': 'MP10',

  // SPA Vijayawada
  'School of Planning and Architecture, Vijayawada': 'AP18',
  'School of Planning & Architecture, Vijayawada': 'AP18',
  'School of Planning and Architecture Vijayawada': 'AP18',
  'School of Planning & Architecture': 'AP18',

  // NIT Hamirpur
  'National Institute of Technology Hamirpur': 'HP01',
  'National Institute of Technology, Hamirpur': 'HP01',

  // NIT Raipur
  'National Institute of Technology, Raipur': 'CG01',
  'National Institute of Technology Raipur': 'CG01',

  // NIT Rourkela
  'National Institute of Technology Rourkela': 'OR06',

  // MNIT Jaipur
  'Malaviya National Institute of Technology': 'RJ01',
  'Malaviya National Institute of Technology Jaipur': 'RJ01',

  // Jadavpur University
  'Jadavpur University': 'WB03',

  // AMU Aligarh
  'Aligarh Muslim University': 'UP02',

  // IIT BHU
  'Indian Institute of Technology (BHU) Varanasi': 'UP49',

  // CET Trivandrum
  'College of Engineering Trivandrum': 'KL01',
  'College of Engineering, Trivandrum': 'KL01',
  'College of Engineering': 'KL01',

  // CCA Chandigarh
  'Chandigarh College of Architecture': 'CH01',
  'Chandigarh College of Architecture, Sector-12': 'CH01',
  'Chandigarh College of Architecture Sector-12': 'CH01',

  // Chandigarh University
  'Chandigarh University': 'PJ11',

  // Chitkara University
  'Chitkara University': 'PJ04',

  // LPU
  'Lovely Professional University': 'PJ06',

  // Nirma University
  'Nirma University': 'GJ20',

  // Anant National University
  'Anant National University': 'GJ11',

  // SMVDU Katra
  'Shri Mata Vaishno Devi University': 'JK01',

  // GGSIPU Delhi
  'Guru Gobind Singh Indraprastha University': 'DL06',

  // GITAM
  'Gandhi Institute of Technology and Management': 'AP11',
  'Gitam School of Architecture': 'AP11',

  // AKTU Lucknow
  'Faculty of Architecture and Planning, Dr APJ Abbdul Kalam Technical University, Lucknow': 'UP01',
  'Dr. A.P.J. Abdul Kalam Technical University': 'UP01',

  // MAHE Manipal
  'Manipal School of Architecture and Planning, MAHE': 'KA02',
  'Manipal School of Architecture and Planning, Mahe': 'KA02',
  'Faculty of Architecture, Manipal Academy of Higher Education, Manipal': 'KA02',
  'Faculty of Architecture, Manipal Academy of Higher Education': 'KA02',
  'Manipal Academy of Higher Education': 'KA02',

  // Manipal Jaipur
  'Manipal University Jaipur': 'RJ12',
  'Manipal University, Jaipur': 'RJ12',

  // BMS
  'BMS School of Architecture': 'KA17',
  'BMS School of Architecture, Yelahanka': 'KA17',
  'B. M. S. College of Architecture': 'KA03',
  'BMS College of Architecture': 'KA03',
  'BMS College of Arhitecture': 'KA03',

  // MANIT Bhopal
  'Maulana Azad National Institute of Technology': 'MP01',

  // SRM
  'S.R.M. Institute of Science and Technology': 'TN05',

  // BIT Mesra
  'Birla Institute of Technology': 'JH01',

  // Amity Kolkata
  'Amity University': 'WB07',

  // Anna University
  'Anna University': 'TN01',

  // MSRIT
  'M. S. Ramaiah Institute of Technology': 'KA11',

  // Dr. MGR
  'Dr. M. G. R. Educational and Research Institute': 'TN41',
  'M. G. R. Educational and Research Institute': 'TN41',

  // Thiagarajar College of Engineering
  'Thiagarajar College of Engineering': 'TN11',

  // Christ University
  'Christ University': 'KA45',

  // Crescent
  'B. S. Abdur Rahman Crescent Institute of Science and Technology': 'TN28',

  // HITS
  'Hindustan Institute of Technology and Science (HITS)': 'TN08',

  // Andhra University
  'College of Engineering Visakhapatnam': 'AP02',

  // JNAFAU
  'JNAFAU School of Planning and Architecture': 'TS01'
};

async function verifyAll210() {
  const allRankings = JSON.parse(fs.readFileSync('scripts/all_nirf_extracted.json', 'utf8'));
  console.log(`Checking all ${allRankings.length} NIRF rankings records...`);

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

  const mappedRecords = [];
  const unmapped = [];

  for (const r of allRankings) {
    let mapping = NIRF_NAME_TO_COA[r.name];
    let coaCode = typeof mapping === 'function' ? mapping(r) : mapping;

    if (!coaCode) {
      unmapped.push(r);
      continue;
    }

    const inst = byCode.get(coaCode);
    if (!inst) {
      console.error(`COA code ${coaCode} not found in DB for record:`, r);
      unmapped.push(r);
      continue;
    }

    mappedRecords.push({
      institution_id: inst.id,
      coa_code: coaCode,
      institution_name: inst.institution_name,
      ranking_body: 'NIRF',
      ranking_year: r.year,
      rank_number: r.rank,
      category: 'Architecture'
    });
  }

  console.log(`\nSuccessfully mapped: ${mappedRecords.length} / ${allRankings.length}`);
  console.log(`Unmapped: ${unmapped.length}`);

  if (unmapped.length > 0) {
    console.error('Failed to map records:', unmapped);
    process.exit(1);
  }

  // Deduplication check on (institution_id, ranking_year, ranking_body)
  const keySet = new Set();
  const dupes = [];
  for (const rec of mappedRecords) {
    const k = `${rec.institution_id}_${rec.ranking_year}_${rec.ranking_body}`;
    if (keySet.has(k)) {
      dupes.push(rec);
    }
    keySet.add(k);
  }

  console.log(`Duplicate records: ${dupes.length}`);
  if (dupes.length > 0) {
    console.error('Found duplicate records:', dupes);
    process.exit(1);
  }

  console.log('ALL 210 NIRF RANKINGS FULLY RESOLVED AND DEDUPLICATED!');
  fs.writeFileSync('scripts/mapped_nirf_rankings.json', JSON.stringify(mappedRecords, null, 2));
}

verifyAll210().catch(console.error);
