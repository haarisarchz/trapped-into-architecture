const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

content = content.replace(
  '.select("id, firm_name, company_id, city, state, organization_type, status, posted_date, author_id");',
  '.select("id, firm_name, company_id, city, state, organization_type, status, posted_date, created_at, author_id");'
);

content = content.replace(
  '              created_by: null,\n              created_at: job.posted_date, // best available date\n              logo_url: null,\n              creatorProfile: null,',
  '              created_by: job.author_id,\n              created_at: job.created_at || job.posted_date,\n              logo_url: null,\n              creatorProfile: job.author_id ? profilesMap[job.author_id] : null,'
);

fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Fixed ghost company created_by, creatorProfile, and created_at assignments!");