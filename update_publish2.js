const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

content = content.replace(
  /experience:\s*pos\.experience,/,
  'experience: (employmentType === "Internship" || (pos.position && pos.position.toLowerCase().includes("intern"))) ? [] : pos.experience,'
);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated handlePublishJob again");