const fs = require('fs');
let c = fs.readFileSync('app/admin/jobs/page.tsx', 'utf-8');

// I already reverted jobs/page.tsx and page.tsx to just query "jobs"!
// Let me verify they are reverted correctly.
console.log(c.includes('Promise.all'));

let d = fs.readFileSync('app/admin/page.tsx', 'utf-8');
console.log(d.includes('Promise.all'));