const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8').split('\n');
let url = '', key = '';
for (const line of env) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

const supabase = createClient(url, key);

(async () => {
  const { data: companies, error: compErr } = await supabase.from('companies').select('*');
  const { data: jobs, error: jobsErr } = await supabase.from('jobs').select('firm_name, id');
  console.log("COMPANIES COUNT:", companies?.length);
  console.log("JOBS COUNT:", jobs?.length);
  console.log("JOBS ERROR:", jobsErr);
})();