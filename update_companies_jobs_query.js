const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

content = content.replace(
  'select("id, firm_name, company_id, city, state, organization_type, status, posted_date");',
  'select("id, firm_name, company_id, city, state, organization_type, status, posted_date, author_id");'
);

content = content.replace(
  '                created_by: null,\n                created_at: job.posted_date,',
  '                created_by: job.author_id,\n                created_at: job.posted_date,'
);

content = content.replace(
  '                creatorProfile: null,\n                totalJobs: 0,',
  '                creatorProfile: job.author_id ? profilesMap[job.author_id] : null,\n                totalJobs: 0,'
);

fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Updated jobsData query in companies dashboard");