const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

file = file.replace(
  'setImageUrl(job.image || "");',
  'setImageUrl(job.image || "");\nalert("DEBUG: image URL from DB is: " + job.image + " | apply_link is: " + job.apply_link + " | email is: " + job.application_email);'
);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Added debug alert");
