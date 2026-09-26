const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(/job_description: pos\.role \? \*\*Job Role:\*\* \\[\s\S]*?\\ : pos\.description,/, 'job_description: pos.role ? **Job Role:** \\\\n\\n\\ : pos.description,');
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Fixed backticks syntax error');