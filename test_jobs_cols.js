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
  const { data, error } = await supabase.from('jobs').select('firm_name, company_id, employment_type, workplace_type, area, city, state, position, experience, salary, job_description, qualifications, skills_required, posted_date, last_date_to_apply, post_expiry_date, apply_link, application_email, source, image, status, author_id').limit(1);
  console.log("Error:", error);
}
test();