const fs = require('fs');
let content = fs.readFileSync('components/ShareButtons.tsx', 'utf8');

content = content.replace(
  '  experience?: any,\n  initialShares?: number,',
  '  experience?: any,\n  employmentType?: string,\n  initialShares?: number,'
);
content = content.replace(
  '  experience,\n  initialShares = 0,',
  '  experience,\n  employmentType,\n  initialShares = 0,'
);
content = content.replace(
  'if (exp) expText = ` (${exp})`;',
  'if (exp && job.employment_type !== "Internship") expText = ` (${exp})`;'
);
content = content.replace(
  'if (exp) singleExpText = ` (${exp})`;',
  'if (exp && employmentType !== "Internship") singleExpText = ` (${exp})`;'
);

fs.writeFileSync('components/ShareButtons.tsx', content);

// Now update Jobcard.tsx to pass employmentType
let jobcard = fs.readFileSync('components/Jobcard.tsx', 'utf8');
jobcard = jobcard.replace(
  /experience=\{experience\}/g,
  'experience={experience}\n              employmentType={employment_type}'
);
fs.writeFileSync('components/Jobcard.tsx', jobcard);

// Now update app/jobs/[id]/page.tsx
let page = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');
page = page.replace(
  /experience=\{job\.experience\}/g,
  'experience={job.experience} employmentType={job.employment_type}'
);
fs.writeFileSync('app/jobs/[id]/page.tsx', page);

console.log("Updated ShareButtons and props for Internships");