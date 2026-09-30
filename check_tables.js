const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

async function check() {
  // Check if favorite_companies table exists and works
  const { data, error } = await supabase.from('favorite_companies').select('id').limit(1);
  if (error) {
    console.log("favorite_companies status:", error.code, error.message);
  } else {
    console.log("favorite_companies table EXISTS and working. Rows found:", data.length);
  }
  
  // Check saved_jobs too
  const { data: sj, error: sje } = await supabase.from('saved_jobs').select('id').limit(1);
  if (sje) {
    console.log("saved_jobs status:", sje.code, sje.message);
  } else {
    console.log("saved_jobs table EXISTS and working. Rows found:", sj.length);
  }
}
check();