const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');
file = file.replace(/encodeURIComponent\(job\.city\)/g, 'encodeURIComponent(job.city || "")');
file = file.replace(/encodeURIComponent\(cleanPos\)/g, 'encodeURIComponent(cleanPos || "")');
fs.writeFileSync('app/jobs/[id]/page.tsx', file);
console.log("Patched encodeURI fixes.");
