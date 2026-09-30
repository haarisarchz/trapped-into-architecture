const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

async function testFetch() {
  const { data: companyRecord } = await supabase.from("companies").select("*").eq("slug", "amf-design-studio").single();
  console.log("Company:", companyRecord.firm_name);
  
  const { data: jobsById } = await supabase.from("jobs").select("id, firm_name, status").eq("status", "published").eq("company_id", companyRecord.id);
  console.log("jobsById count:", jobsById?.length);
  
  const { data: jobsByFirm } = await supabase.from("jobs").select("id, firm_name, status").eq("status", "published").eq("firm_name", companyRecord.firm_name);
  console.log("jobsByFirm count:", jobsByFirm?.length);
  
  const combined = [...(jobsById || []), ...(jobsByFirm || [])];
  const uniqueJobs = Array.from(new Map(combined.map(job => [job.id, job])).values());
  console.log("Unique jobs count:", uniqueJobs.length);
}
testFetch();