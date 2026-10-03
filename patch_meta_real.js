const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

file = file.split('title: `${job.position} \u2013 ${job.firm_name} | Trapped Into Architecture`').join('title: `${job.firm_name} is hiring ${job.position} in ${job.city}. | Trapped Into Architecture`');
file = file.split('title: `${job.position} - ${job.firm_name} | Trapped Into Architecture`').join('title: `${job.firm_name} is hiring ${job.position} in ${job.city}. | Trapped Into Architecture`');
file = file.split('description: `${job.position} opportunity at ${job.firm_name} in ${job.city}, ${job.state}.`').join('description: `${job.firm_name} is hiring ${job.position} in ${job.city}, ${job.state}. Apply now!`');

fs.writeFileSync('app/jobs/[id]/page.tsx', file);
console.log("Patched meta tags properly.");
