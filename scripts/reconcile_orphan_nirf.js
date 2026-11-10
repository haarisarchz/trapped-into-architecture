const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcifyymjfktabtsmocnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const NIRF_NAME_TO_COA_MAP = {
  'Indian Institute of Technology Roorkee': 'UA01',
  'National Institute of Technology Calicut': 'KL02',
  'School of Planning and Architecture New Delhi': 'DL01',
  'Centre for Environmental Planning and Technology University': 'GJ01',
  'Jamia Millia Islamia': 'DL03',
  'National Institute of Technology Tiruchirappalli': 'TN04',
  'National Institute of Technology Rourkela': 'OR02',
  'Visvesvaraya National Institute of Technology Nagpur': 'MH06',
  'S.R.M. Institute of Science and Technology': 'TN05',
  'Aligarh Muslim University': 'UP01',
  'Maulana Azad National Institute of Technology': 'MP01',
  'Nirma University': 'GJ09',
  'M. S. Ramaiah Institute of Technology': 'KA05',
  'Amity University': 'WB02',
  'Guru Gobind Singh Indraprastha University': 'DL04',
  'Shri Mata Vaishno Devi University': 'JK01',
  'National Institute of Technology Raipur': 'CG01',
  'B. S. Abdur Rahman Crescent Institute of Science and Technology': 'TN21',
  'Malaviya National Institute of Technology': 'RJ01',
  'College of Engineering, Trivandrum': 'KL01',
  'Birla Institute of Technology': 'JH01',
  'Lovely Professional University': 'PB02',
  'National Institute of Technology Patna': 'BR01',
  'Chandigarh College of Architecture, Sector-12': 'CH01',
  'National Institute of Technology Hamirpur': 'HP01',
  'Chitkara University': 'PB06',
  'Anant National University': 'GJ18',
  'Chandigarh University': 'PB08'
};

async function reconcile() {
  console.log('=== RECONCILING 28 ORPHAN NIRF RECORDS WITH REAL COA INSTITUTIONS ===\n');

  // Fetch all COA institutions
  const { data: realInsts } = await supabase.from('institutions').select('id, coa_code, institution_name').not('coa_code', 'is', null);
  const coaMap = new Map();
  realInsts.forEach(r => coaMap.set(r.coa_code.toUpperCase().trim(), r));

  // Fetch null COA records
  const { data: nulls } = await supabase.from('institutions').select('id, institution_name').is('coa_code', null);
  console.log(`Found ${nulls.length} orphan records with coa_code: null`);

  let transferredCount = 0;
  let deletedCount = 0;

  for (const n of nulls) {
    const targetCode = NIRF_NAME_TO_COA_MAP[n.institution_name];
    if (targetCode && coaMap.has(targetCode)) {
      const targetInst = coaMap.get(targetCode);
      console.log(`Mapping '${n.institution_name}' (ID: ${n.id}) -> Target COA '${targetCode}' (ID: ${targetInst.id})`);

      // 1. Move rankings
      const { data: ranks } = await supabase.from('institution_rankings').select('*').eq('institution_id', n.id);
      if (ranks && ranks.length > 0) {
        for (const rk of ranks) {
          await supabase.from('institution_rankings').upsert({
            institution_id: targetInst.id,
            ranking_body: rk.ranking_body,
            ranking_year: rk.ranking_year,
            rank_number: rk.rank_number,
            score: rk.score,
            category: rk.category
          }, { onConflict: 'institution_id,ranking_body,ranking_year,category' });
        }
        transferredCount += ranks.length;
      }

      // 2. Move any annual records if any
      const { data: intakes } = await supabase.from('institution_annual_records').select('*').eq('institution_id', n.id);
      if (intakes && intakes.length > 0) {
        for (const intk of intakes) {
          await supabase.from('institution_annual_records').upsert({
            institution_id: targetInst.id,
            academic_year: intk.academic_year,
            course_name: intk.course_name,
            approved_intake: intk.approved_intake,
            approval_status: intk.approval_status
          }, { onConflict: 'institution_id,academic_year,course_name' });
        }
      }

      // 3. Delete foreign keys on orphan
      await supabase.from('institution_rankings').delete().eq('institution_id', n.id);
      await supabase.from('institution_annual_records').delete().eq('institution_id', n.id);

      // 4. Delete orphan institution row
      const { error: delErr } = await supabase.from('institutions').delete().eq('id', n.id);
      if (!delErr) deletedCount++;
      else console.error('Delete error:', delErr.message);
    } else {
      console.warn(`No target mapping for: ${n.institution_name}`);
    }
  }

  console.log(`\nReconciliation Complete: Transferred ${transferredCount} rankings, Deleted ${deletedCount} orphan rows.`);
}

reconcile().catch(console.error);
