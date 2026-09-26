const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(/px-8 py-4/g, 'px-6 py-3 text-base');
c = c.replace(/gap-4 mt-8 mb-6/g, 'gap-3 mt-6 mb-4');
c = c.replace(/mt-8 mb-6/g, 'mt-6 mb-4'); // For company profile

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Fixed buttons padding');