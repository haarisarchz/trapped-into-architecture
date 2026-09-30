const fs = require('fs');
let content = fs.readFileSync('components/ShareButtons.tsx', 'utf8');

content = content.replace(
  /if \(exp && job\.employment_type !== "Internship"\) expText = ` \(\$\{exp\}\)`;/,
  'if (exp && job.employment_type !== "Internship" && !(job.position && job.position.toLowerCase().includes("intern"))) expText = ` (${exp})`;'
);

content = content.replace(
  /if \(exp && employmentType !== "Internship"\) singleExpText = ` \(\$\{exp\}\)`;/,
  'if (exp && employmentType !== "Internship" && !(position && position.toLowerCase().includes("intern"))) singleExpText = ` (${exp})`;'
);

fs.writeFileSync('components/ShareButtons.tsx', content);
console.log("Updated ShareButtons.tsx");