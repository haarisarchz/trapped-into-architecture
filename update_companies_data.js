const fs = require('fs');
let content = fs.readFileSync('app/companies/page.tsx', 'utf8');

content = content.replace(
  'select("id, firm_name, slug, city, state, organization_type, logo_url, created_at, founded_year");',
  'select("id, firm_name, slug, city, state, organization_type, logo_url, created_at, founded_year, description");'
);

content = content.replace(
`          organizationType: comp.organization_type || "Architecture Firm",
          logo: comp.logo_url || "",
            totalJobs: 0,
            created_at: comp.created_at || null,
            founded_year: comp.founded_year || null,
        };`,
`          organizationType: comp.organization_type || "Architecture Firm",
          logo: comp.logo_url || "",
          description: comp.description || "",
            totalJobs: 0,
            created_at: comp.created_at || null,
            founded_year: comp.founded_year || null,
        };`
);

content = content.replace(
`            organizationType: job.organization_type || "Firm",
            logo: "",
              totalJobs: 0,`,
`            organizationType: job.organization_type || "Firm",
            logo: "",
            description: "",
              totalJobs: 0,`
);

fs.writeFileSync('app/companies/page.tsx', content);