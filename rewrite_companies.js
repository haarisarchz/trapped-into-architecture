const fs = require('fs');
let code = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

const p1 = code.indexOf('const fetchCompanies = async () => {');
const p2 = code.indexOf('  const handleHideToggle = async');

const newFetch = `const fetchCompanies = async () => {
    // 1. Fetch real companies
    const { data: companiesData } = await supabase.from("companies").select("*");
    
    // 2. Fetch profiles
    const { data: profilesData } = await supabase.from("profiles").select("id, display_name, full_name, username");
    const profilesMap: Record<string, any> = {};
    if (profilesData) profilesData.forEach(p => profilesMap[p.id] = p);
    
    // 3. Fetch jobs
    const { data: jobsData } = await supabase.from("jobs").select("company_id, status, firm_name, city, organization_type, author_id, posted_date");
    
    const grouped: Record<string, any> = {};
    
    // Add real companies first
    if (companiesData) {
       companiesData.forEach(comp => {
         if (!comp.firm_name) return;
         grouped[comp.firm_name] = {
            ...comp,
            totalJobs: 0,
            activeJobs: 0,
            profiles: comp.created_by ? profilesMap[comp.created_by] : null
         };
       });
    }
    
    // Merge jobs
    if (jobsData) {
       jobsData.forEach((job: any) => {
          let name = job.firm_name;
          if (!name) return;
          
          if (!grouped[name]) {
             grouped[name] = {
                id: "fallback-" + name,
                firm_name: name,
                city: job.city || "",
                organization_type: job.organization_type || "Architecture Firm",
                is_hidden: false,
                created_by: job.author_id,
                created_at: job.posted_date,
                profiles: job.author_id ? profilesMap[job.author_id] : null,
                totalJobs: 0,
                activeJobs: 0,
                isFallback: true
             };
          }
          
          grouped[name].totalJobs += 1;
          if (job.status === 'published') {
             grouped[name].activeJobs += 1;
          }
       });
    }
    
    setCompanies(Object.values(grouped));
  };

`;

code = code.substring(0, p1) + newFetch + code.substring(p2);
fs.writeFileSync('app/admin/companies/page.tsx', code);
console.log('Rewrote fetchCompanies');
