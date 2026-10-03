const fs = require('fs');
let file = fs.readFileSync('app/companies/page.tsx', 'utf8');

file = file.replace(
  'select("id, firm_name, slug, city, state, organization_type, logo_url, created_at, founded_year, description, is_hidden");',
  'select("id, firm_name, slug, city, state, organization_type, logo_url, created_at, founded_year, description");'
);

file = file.replace(
  'if (!comp.firm_name || comp.is_hidden) return;',
  'if (!comp.firm_name) return;'
);

fs.writeFileSync('app/companies/page.tsx', file);
console.log("Reverted is_hidden");
