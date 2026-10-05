const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

file = file.replace(/order\("created_at"/g, 'order("posted_date"');
fs.writeFileSync('app/jobs/[id]/page.tsx', file);
console.log("Patched order column");
