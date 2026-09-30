const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

content = content.replace(/address: companyAddress \|\| "",\s*/g, '');
content = content.replace(/address: companyAddress,\s*/g, '');

fs.writeFileSync('app/admin/add-job/page.tsx', content);