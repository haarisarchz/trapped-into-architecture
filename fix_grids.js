const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(/grid md:grid-cols-2 gap-4 mb-6/g, 'grid md:grid-cols-3 gap-4 mb-6');
c = c.replace(/grid md:grid-cols-2 gap-4 mt-6/g, 'grid md:grid-cols-3 gap-4 mt-6');
c = c.replace(/grid md:grid-cols-2 gap-4/g, 'grid md:grid-cols-3 gap-4');

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Fixed grids to 3 cols');