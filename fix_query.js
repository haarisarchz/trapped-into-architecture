const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

content = content.replace(
  '.select("id, firm_name, company_id, city, state, organization_type, status, posted_date, created_at, author_id");',
  '.select("id, firm_name, company_id, city, state, organization_type, status, posted_date, author_id");'
);

content = content.replace(
  'created_at: job.created_at || job.posted_date,',
  'created_at: job.posted_date,'
);

fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Fixed jobs query by removing non-existent created_at");