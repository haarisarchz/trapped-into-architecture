const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const serviceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
console.log("Service key exists?", !!serviceKey);
if(serviceKey) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(url, serviceKey[1].trim());
  supabase.from('jobs').select('posted_date').limit(1).then(r => console.log(r));
}