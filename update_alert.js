const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

content = content.replace(
  'alert("Failed to save company details.");',
  'alert("Failed to save company details: " + (err.message || err.details || JSON.stringify(err)));'
);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated error alert");