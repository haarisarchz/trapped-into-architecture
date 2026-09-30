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
  const { data, error } = await supabase.rpc('get_schema_info');
  // Or we can just insert a blank job with dummy types to see what fails
  const dummyJob = {
        firm_name: "Test",
        employment_type: "Full-Time",
        workplace_type: "On-Site",
        area: "Test",
        city: "Test",
        state: "Test",
        position: "Test",
        experience: ["Fresher"],
        salary: "Not Disclosed",
        job_description: "Test",
        qualifications: ["B.Arch"],
        skills_required: ["AutoCAD"],
        posted_date: "2026-09-28",
        last_date_to_apply: "2026-09-30",
        post_expiry_date: "2026-10-28",
        apply_link: "",
        application_email: "",
        source: "Direct",
        image: "",
        status: "draft"
  };
  const { error: err2 } = await supabase.from('jobs').insert([dummyJob]);
  console.log("Insert Error:", err2);
}
test();