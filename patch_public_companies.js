const fs = require('fs');
let file = fs.readFileSync('app/companies/page.tsx', 'utf8');

// Update supabase query to include is_hidden
file = file.replace(
  '.select("id, firm_name, slug, city, state, organization_type, logo_url, created_at, founded_year, description");',
  '.select("id, firm_name, slug, city, state, organization_type, logo_url, created_at, founded_year, description, is_hidden");'
);

// Filter out hidden companies in realCompanies.forEach
file = file.replace(
  '    realCompanies.forEach((comp) => {\\n      if (!comp.firm_name) return;',
  '    realCompanies.forEach((comp) => {\\n      if (!comp.firm_name || comp.is_hidden) return;'
);

// Filter out companies with 0 jobs at the end of useMemo
file = file.replace(
  '    return Object.values(grouped);\\n  }, [jobs, realCompanies, favoritesCount]);',
  '    return Object.values(grouped).filter((c: any) => c.totalJobs > 0);\\n  }, [jobs, realCompanies, favoritesCount]);'
);

fs.writeFileSync('app/companies/page.tsx', file);
console.log("Patched public companies page.");
