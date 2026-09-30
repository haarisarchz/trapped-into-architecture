const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

content = content.replace(
  /state=\{job\.state\}/g,
  `state={job.state} area={job.area} experience={job.experience}`
);

fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Updated page.tsx");