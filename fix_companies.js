const fs = require('fs');
let code = fs.readFileSync('app/companies/page.tsx', 'utf8');

const newMemo = `  const companies = useMemo(() => {
    const grouped: any = {};
    const idToName: any = {};

    // 1. Add all REAL companies
    realCompanies.forEach((comp) => {
      grouped[comp.firm_name] = {
        company: comp.firm_name,
        slug: comp.slug,
        city: comp.city || "",
        state: comp.state || "",
        organizationType: comp.organization_type || "Architecture Firm",
        logo: comp.logo_url || "",
        totalJobs: 0,
      };
      if (comp.id) {
        idToName[comp.id] = comp.firm_name;
      }
    });

    // 2. Add jobs (increment count and fallback company creation)
    jobs.forEach((job) => {
      let name = job.firm_name || "Unknown Company";
      
      // If job has a company_id and we know it, use the real company's name
      if (job.company_id && idToName[job.company_id]) {
        name = idToName[job.company_id];
      }

      if (!grouped[name]) {
        grouped[name] = {
          company: name,
          slug: name.toLowerCase().trim().replace(/\\s+/g, "-").replace(/[^\\w-]+/g, ""),
          city: job.city || "",
          state: job.state || "",
          organizationType: job.organization_type || "Architecture Firm",
          logo: job.company_logo || job.image || "",
          totalJobs: 0,
        };
      }
      grouped[name].totalJobs++;
    });

    return Object.values(grouped);
  }, [jobs, realCompanies]);`;

code = code.replace(/const companies = useMemo\(\(\) => \{[\s\S]*?return Object\.values\(grouped\);\n  \}, \[jobs, realCompanies\]\);/, newMemo);

fs.writeFileSync('app/companies/page.tsx', code);
console.log('Fixed company page grouping');
