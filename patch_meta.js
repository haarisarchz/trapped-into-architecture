const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

file = file.split('title: \${job.position} -  | Trapped Into Architecture\,').join('title: \${job.firm_name} is hiring  in . | Trapped Into Architecture\,');
file = file.split('description: \${job.position} opportunity at  in , .\,').join('description: \${job.firm_name} is hiring  in , . Apply now!\,');

fs.writeFileSync('app/jobs/[id]/page.tsx', file);
console.log("Patched meta tags in job page.");
