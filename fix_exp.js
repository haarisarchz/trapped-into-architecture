const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
c = c.replace(/px-3 py-1\.5 border rounded-full text-xs font-semibold/g, 'px-4 py-2 border rounded-full text-sm font-semibold mb-1');
fs.writeFileSync('app/admin/add-job/page.tsx', c);