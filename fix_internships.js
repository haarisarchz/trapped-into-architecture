const fs = require('fs');
let internships = fs.readFileSync('app/internships/page.tsx', 'utf8');

internships = internships.replace(
  /position: job\.position,\s*experience:/,
  'position: job.position,\n            employment_type: job.employment_type,\n            experience:'
);

internships = internships.replace(
  /position=\{job\.position\}\s*experience=\{job\.experience\}/,
  'position={job.position}\n        employment_type={job.employment_type}\n        experience={job.experience}'
);

fs.writeFileSync('app/internships/page.tsx', internships);
console.log("Fixed internships/page.tsx");