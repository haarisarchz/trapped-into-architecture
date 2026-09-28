const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

content = content.replace(
  '{employmentType === "Internship" ? (',
  '{(employmentType === "Internship" || (pos.position && pos.position.toLowerCase().includes("intern"))) ? ('
);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated app/admin/add-job/page.tsx");