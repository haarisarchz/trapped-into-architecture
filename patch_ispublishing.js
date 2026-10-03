const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

file = file.replace(
  'disabled={isPublishing}',
  'disabled={actionLoading !== null}'
);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Patched isPublishing.");
