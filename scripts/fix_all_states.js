const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/)[1];
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)/)[1];
const supabase = createClient(url, key);

const STATE_FIXES = {
  'ANDHRA PRADESH': 'Andhra Pradesh',
  'ASSAM': 'Assam',
  'HARYANA': 'Haryana',
  'MAHARASHTRA': 'Maharashtra',
  'MEGHALAYA': 'Meghalaya',
  'TAMIL NADU': 'Tamil Nadu',
  'TELANGANA': 'Telangana',
  'UTTAR PRADESH': 'Uttar Pradesh',
  'Jammu and Kashmir': 'Jammu & Kashmir',
};

async function fixStates() {
  console.log('--- 1. Fixing Uppercase and Variant State Names ---');
  for (const [from, to] of Object.entries(STATE_FIXES)) {
    const { data, error } = await supabase
      .from('institutions')
      .update({ state: to })
      .eq('state', from)
      .select('id, coa_code');
    if (error) {
      console.error('Error on', from, error.message);
    } else {
      console.log(`Updated ${data.length} institutions from "${from}" to "${to}"`);
    }
  }

  console.log('--- 2. Fixing Punjab colleges with state="All India" ---');
  const { data: pjAllIndia, error: errPJ } = await supabase
    .from('institutions')
    .update({ state: 'Punjab' })
    .eq('state', 'All India')
    .select('id, coa_code');
  if (errPJ) console.error('Error on All India PJ:', errPJ.message);
  else console.log(`Updated ${pjAllIndia.length} Punjab institutions with state="All India" to "Punjab"`);

  console.log('--- 3. Fixing Punjab Polytechnics with state="India" ---');
  const { data: pjdList } = await supabase
    .from('institutions')
    .update({ state: 'Punjab' })
    .in('coa_code', ['PJD01', 'PJD02', 'PJD03', 'PJD04', 'PJD05', 'PJD06', 'PJD07', 'PJD08'])
    .select('id, coa_code');
  console.log(`Updated ${(pjdList || []).length} Punjab Polytechnics to "Punjab"`);

  console.log('--- 4. Fixing Tripura and Odisha with state="India" ---');
  await supabase.from('institutions').update({ state: 'Tripura' }).eq('coa_code', 'TRD01');
  await supabase.from('institutions').update({ state: 'Odisha' }).in('coa_code', ['ORD01', 'ORD02']);
  console.log('Updated TRD01 to Tripura and ORD01/02 to Odisha');

  console.log('--- 5. Standardizing International (UAE) Campuses ---');
  await supabase.from('institutions').update({ state: 'International (UAE)' }).in('coa_code', ['UP06A', 'JH01A']);
  console.log('Updated UP06A and JH01A to International (UAE)');

  console.log('--- 6. Verifying Final State Counts ---');
  const { data: finalInsts } = await supabase.from('institutions').select('state');
  const counts = {};
  finalInsts.forEach(d => {
    counts[d.state] = (counts[d.state] || 0) + 1;
  });
  console.log(JSON.stringify(counts, null, 2));
}

fixStates();
