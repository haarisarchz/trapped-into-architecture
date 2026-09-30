const fs = require('fs');
let content = fs.readFileSync('app/companies/page.tsx', 'utf8');

// 1. Add created_at and founded_year to select query
content = content.replace(
  /\.select\("id, firm_name, slug, city, state, organization_type, logo_url"\);/,
  `.select("id, firm_name, slug, city, state, organization_type, logo_url, created_at, founded_year");`
);

// 2. Add them to the grouped map
content = content.replace(
  /logo: comp\.logo_url \|\| "",\s*totalJobs: 0,/,
  `logo: comp.logo_url || "",
          totalJobs: 0,
          created_at: comp.created_at || null,
          founded_year: comp.founded_year || null,`
);

// 3. For jobs fallback, just set them to null or jobs posted_date
content = content.replace(
  /logo: "",\s*totalJobs: 0,/,
  `logo: "",
            totalJobs: 0,
            created_at: job.posted_date || null,
            founded_year: null,`
);

// 4. Update the Sorting logic
const oldSortLogic = `      // Sort
      if (sortBy === "name") {
        data.sort((a: any, b: any) => a.company.localeCompare(b.company));
      } else if (sortBy === "jobs") {
        data.sort((a: any, b: any) => b.totalJobs - a.totalJobs);
      }`;

const newSortLogic = `      // Sort
      if (sortBy === "name_asc" || sortBy === "name") {
        data.sort((a: any, b: any) => a.company.localeCompare(b.company));
      } else if (sortBy === "name_desc") {
        data.sort((a: any, b: any) => b.company.localeCompare(a.company));
      } else if (sortBy === "date_added") {
        data.sort((a: any, b: any) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
      } else if (sortBy === "jobs") {
        data.sort((a: any, b: any) => (b.totalJobs || 0) - (a.totalJobs || 0));
      } else if (sortBy === "year_founded") {
        data.sort((a: any, b: any) => {
          const yA = a.founded_year || 0;
          const yB = b.founded_year || 0;
          return yB - yA;
        });
      }`;

content = content.replace(oldSortLogic, newSortLogic);

fs.writeFileSync('app/companies/page.tsx', content);
console.log("Updated data fetching and sorting logic.");