const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

content = content.replace('{jobs.map((job) => {', '{getSortedJobs(jobs).map((job) => {');

fs.writeFileSync('app/admin/jobs/page.tsx', content);