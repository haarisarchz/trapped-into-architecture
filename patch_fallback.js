const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

file = file.replace(
  'description: p.description || p.job_description || "",',
  'description: p.description || p.job_description || (index === 0 ? ai.description : "") || "",'
);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Patched fallback successfully.");
