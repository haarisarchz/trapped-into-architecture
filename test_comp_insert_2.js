const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) env[key.trim()] = val.join('=').trim().replace(/"/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { error } = await supabase.from('companies').insert([{ firm_name: "TestFirmWithoutCreatedBy" }]);
  console.log("Insert 1 Error:", error);
  
  const { error: err2 } = await supabase.from('companies').insert([{ firm_name: "TestFirmWithCreatedBy", created_by: null }]);
  console.log("Insert 2 Error:", err2);
}
test();