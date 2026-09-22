const fs = require('fs');

let code = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

const oldFetch = /const fetchCompanies = async \(\) => \{[\s\S]*?setCompanies\(merged\);\s*\};/;

const newFetch = `const fetchCompanies = async () => {
    // Fetch all companies
    const { data: companiesData, error: companiesError } = await supabase
      .from("companies")
      .select("*");
      
    // Fetch jobs to count them and aggregate companies if RLS blocks companies table
    const { data: jobsData, error: jobsError } = await supabase.from("jobs").select("company_id, status, firm_name, city, organization_type");
    
    if (jobsError) return console.error(jobsError);

    const jobCounts: Record<string, { total: number; active: number }> = {};
    const fallbackCompanies: Record<string, any> = {};

    if (jobsData) {
      jobsData.forEach((job: any) => {
        if (job.company_id) {
          if (!jobCounts[job.company_id]) {
            jobCounts[job.company_id] = { total: 0, active: 0 };
          }
          jobCounts[job.company_id].total += 1;
          if (job.status === "published") {
            jobCounts[job.company_id].active += 1;
          }
        }
        
        // Fallback aggregation if RLS blocks the actual companies table
        if (job.firm_name) {
           if (!fallbackCompanies[job.firm_name]) {
              fallbackCompanies[job.firm_name] = {
                 id: "fallback-" + job.firm_name,
                 firm_name: job.firm_name,
                 city: job.city || "",
                 organization_type: job.organization_type || "Architecture Firm",
                 is_hidden: false,
                 totalJobs: 0,
                 activeJobs: 0,
                 isFallback: true
              };
           }
           fallbackCompanies[job.firm_name].totalJobs += 1;
           if (job.status === "published") fallbackCompanies[job.firm_name].activeJobs += 1;
        }
      });
    }

    let merged = (companiesData || []).map((company: any) => ({
      ...company,
      totalJobs: jobCounts[company.id]?.total || 0,
      activeJobs: jobCounts[company.id]?.active || 0,
    }));
    
    // If companiesData is empty (due to RLS), use the fallback aggregated from jobs!
    if (merged.length === 0) {
       merged = Object.values(fallbackCompanies);
    }

    setCompanies(merged);
  };`;

if (code.match(oldFetch)) {
  code = code.replace(oldFetch, newFetch);
  fs.writeFileSync('app/admin/companies/page.tsx', code);
}
