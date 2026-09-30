const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

async function check() {
  console.log("=== TABLE STATUS ===");
  
  const { data: fc, error: fce } = await supabase.from('favorite_companies').select('id').limit(1);
  console.log("favorite_companies:", fce ? `ERROR ${fce.code}: ${fce.message}` : "OK (exists)");

  const { data: sj, error: sje } = await supabase.from('saved_jobs').select('id').limit(1);
  console.log("saved_jobs:", sje ? `ERROR ${sje.code}: ${sje.message}` : "OK (exists)");

  const { data: co, error: coe } = await supabase.from('companies').select('id').limit(1);
  console.log("companies:", coe ? `ERROR ${coe.code}: ${coe.message}` : "OK (exists)");

  const { data: jo, error: joe } = await supabase.from('jobs').select('id, save_count').limit(1);
  console.log("jobs (save_count col):", joe ? `ERROR ${joe.code}: ${joe.message}` : "OK");
}
check();