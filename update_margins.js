const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(/mb-10/g, 'mb-6');
c = c.replace(/mt-10/g, 'mt-6');
c = c.replace(/text-2xl font-bold/g, 'text-xl font-bold');

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Reduced margins and fonts');