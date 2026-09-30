const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('companies').update({ updated_by: '00000000-0000-0000-0000-000000000000' }).eq('id', 'non-existent-id');
  if (error) console.error("Error:", error.message);
  else console.log("Success");
}
check();