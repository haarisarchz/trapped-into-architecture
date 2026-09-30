const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8').split('\n');
let url = '', key = '';
for (const line of env) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.substring(line.indexOf('=') + 1).trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.substring(line.indexOf('=') + 1).trim();
}

const supabase = createClient(url, key);
(async () => {
  const { data } = await supabase.storage.listBuckets();
  console.log("Buckets:", data?.map(b => b.name));
})();