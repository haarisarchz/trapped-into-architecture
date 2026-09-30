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
  const dummyComp = {
          firm_name: "Test",
          city: "Test",
          state: "Test",
          neighborhood: "Test",
          organization_type: "Firm",
          logo_url: "",
          description: "",
          website: "",
          email: "",
          phone: "",
          facebook: "",
          instagram: "",
          linkedin: "",
          whatsapp: "",
          twitter: "",
          principal_architect: "",
          employee_size: null,
          founded_year: null
  };
  const { error: err } = await supabase.from('companies').insert([dummyComp]);
  console.log("Insert Error:", err);
}
test();