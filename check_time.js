const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

async function check() {
  const { data: job } = await supabase.from('jobs').select('id, posted_date').limit(1).single();
  const { error } = await supabase.from('jobs').update({ posted_date: '2026-09-30T15:30:00.000Z' }).eq('id', job.id);
  console.log("Update with timestamp:", error ? error.message : "Success");
  
  // Revert
  if (!error) {
    await supabase.from('jobs').update({ posted_date: job.posted_date }).eq('id', job.id);
  }
}
check();