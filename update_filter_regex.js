const fs = require('fs');

let jobsContent = fs.readFileSync('app/jobs/page.tsx', 'utf8');
jobsContent = jobsContent.replace(
  /const filteredData = data\.filter\(\(job: any\) => job\.employment_type !== 'Internship'\);/,
  `const filteredData = data.filter((job: any) => job.employment_type !== 'Internship' && !(job.position && job.position.toLowerCase().includes('intern')));`
);
fs.writeFileSync('app/jobs/page.tsx', jobsContent);

let intContent = fs.readFileSync('app/internships/page.tsx', 'utf8');
intContent = intContent.replace(
  /const filteredData = data\.filter\(\(job: any\) => job\.employment_type === 'Internship'\);/,
  `const filteredData = data.filter((job: any) => job.employment_type === 'Internship' || (job.position && job.position.toLowerCase().includes('intern')));`
);
fs.writeFileSync('app/internships/page.tsx', intContent);
console.log("Success updating filters");