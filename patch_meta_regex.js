const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

file = file.replace(/title: \`\$\{job\.position\}.*?\$\{job\.firm_name\} \| Trapped Into Architecture\`/g, 'title: \`${job.firm_name} is hiring ${job.position} in ${job.city}. | Trapped Into Architecture\`');

fs.writeFileSync('app/jobs/[id]/page.tsx', file);
console.log("Patched titles.");
