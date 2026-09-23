const fs = require('fs');
let code = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

code = code.replace(
  '{job.created_at',
  '{job.posted_date'
);
code = code.replace(
  'job.created_at',
  'job.posted_date'
);

fs.writeFileSync('app/admin/jobs/page.tsx', code);
console.log('Fixed posted_date in jobs');
