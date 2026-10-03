const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  async function test() {
    const { data: jobs } = await supabase.from('jobs').select('id, firm_name, company_id').eq('status', 'published');
    const { data: realCompanies } = await supabase.from('companies').select('id, firm_name, is_hidden');
    
    const grouped = {};
    const idToName = {};

    realCompanies.forEach((comp) => {
      if (!comp.firm_name || comp.is_hidden) return;
      grouped[comp.firm_name] = {
        company: comp.firm_name,
        totalJobs: 0
      };
      if (comp.id) idToName[comp.id] = comp.firm_name;
    });

    jobs.forEach((job) => {
      let name = job.firm_name;
      if (job.company_id && idToName[job.company_id]) {
        name = idToName[job.company_id];
      }
      if (!name) return;
      if (!grouped[name]) {
        grouped[name] = { company: name, totalJobs: 0 };
      }
      grouped[name].totalJobs += 1;
    });

    const result = Object.values(grouped).filter(c => c.totalJobs > 0);
    const tanisha = result.find(c => c.company.toLowerCase().includes('tanisha'));
    
    console.log("Is Tanisha in the final filtered list?:", tanisha ? "YES" : "NO", tanisha);
  }
  test();
}
