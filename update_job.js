const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

content = content.replace(
  'const hasExperience = job.employment_type !== "Internship" && job.experience && ((Array.isArray(job.experience) && job.experience.length > 0) || (typeof job.experience === "string" && job.experience.trim()));',
  'const isIntern = job.employment_type === "Internship" || (job.position && job.position.toLowerCase().includes("intern"));\n  const hasExperience = !isIntern && job.experience && ((Array.isArray(job.experience) && job.experience.length > 0) || (typeof job.experience === "string" && job.experience.trim()));'
);

fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Updated app/jobs/[id]/page.tsx");