const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());
  async function check() {
    const { data: jobs } = await supabase.from('jobs').select('id, position, author_id, firm_name').order('id', { ascending: false }).limit(10);
    console.log("LAST 10 JOBS:", jobs);
    
    const { data: profiles } = await supabase.from('profiles').select('id, username');
    console.log("PROFILES:", profiles);
  }
  check();
} else {
  console.log("Could not find supabase credentials");
}