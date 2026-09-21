const fs = require('fs');
let code = fs.readFileSync('app/companies/page.tsx', 'utf8');

const newMemo = `const companies = useMemo(() => {
  const grouped: any = {};

  // First, add all REAL companies
  realCompanies.forEach((comp) => {
    grouped[comp.firm_name] = {
      company: comp.firm_name,
      slug: comp.slug,
      city: comp.city || "",
      state: comp.state || "",
      organizationType: comp.organization_type || "Architecture Firm",
      logo: comp.logo_url || "",
      totalJobs: 0,
      software: []
    };
  });

  // Then add jobs, incrementing count or creating fallback company
  jobs.forEach((job) => {
    const name = job.firm_name || "Unknown Company";

    if (!grouped[name]) {
      grouped[name] = {
        company: name,
        slug: name
          .toLowerCase()
          .trim()
          .replace(/\\s+/g, "-")
          .replace(/[^\\w-]+/g, ""),
        city: job.city || "",
        state: job.state || "",
        organizationType: job.organization_type || "Architecture Firm",
        logo: job.company_logo || "",
        totalJobs: 0,
        software: []
      };
    }

    grouped[name].totalJobs++;

    // Aggregate software
    if (job.required_software) {
      const sw = Array.isArray(job.required_software)
        ? job.required_software
        : String(job.required_software).split(",").map(x => x.trim());
      grouped[name].software = [...new Set([...grouped[name].software, ...sw])].filter(Boolean);
    }
  });

  return Object.values(grouped);
}, [jobs, realCompanies]);`;

// Find `const companies = useMemo(() => {` and replace until `}, [jobs]);`
const startIndex = code.indexOf('const companies = useMemo(() => {');
const endIndex = code.indexOf('}, [jobs]);', startIndex) + 11;

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newMemo + code.substring(endIndex);
  fs.writeFileSync('app/companies/page.tsx', code);
  console.log('Replaced useMemo');
} else {
  console.log('useMemo not found');
}
