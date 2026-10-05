const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');
file += '\n}\n';
fs.writeFileSync('app/jobs/[id]/page.tsx', file);
console.log("Added bracket back");
