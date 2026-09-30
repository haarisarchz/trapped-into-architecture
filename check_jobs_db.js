const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

async function check() {
  const { data: jobs } = await supabase.from('jobs').select('id, firm_name, company_id, status').limit(20);
  console.log("Sample Jobs:", JSON.stringify(jobs, null, 2));
  
  const { data: comps } = await supabase.from('companies').select('id, firm_name, slug').limit(5);
  console.log("Sample Companies:", JSON.stringify(comps, null, 2));
}
check();