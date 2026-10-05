const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');
file = file.slice(0, file.lastIndexOf('}'));
fs.writeFileSync('app/jobs/[id]/page.tsx', file);
console.log("Removed last bracket");
