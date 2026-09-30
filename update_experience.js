const fs = require('fs');

let pageContent = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');
pageContent = pageContent.replace(
  'const hasExperience = job.experience && ((Array.isArray(job.experience) && job.experience.length > 0) || (typeof job.experience === "string" && job.experience.trim()));',
  'const hasExperience = job.employment_type !== "Internship" && job.experience && ((Array.isArray(job.experience) && job.experience.length > 0) || (typeof job.experience === "string" && job.experience.trim()));'
);
fs.writeFileSync('app/jobs/[id]/page.tsx', pageContent);

let jobcardContent = fs.readFileSync('components/Jobcard.tsx', 'utf8');
jobcardContent = jobcardContent.replace(
  'const showExperience = expStr && expStr !== "not disclosed" && expStr !== "not specified" && expStr !== "null";',
  'const showExperience = employment_type !== "Internship" && expStr && expStr !== "not disclosed" && expStr !== "not specified" && expStr !== "null";'
);
fs.writeFileSync('components/Jobcard.tsx', jobcardContent);

console.log("Updated both files");