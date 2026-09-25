const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(/\\n/g, "\n");

fs.writeFileSync('app/admin/add-job/page.tsx', c);
