const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

content = content.replace(/employee_size: employeeSize \|\| "",/g, "employee_size: employeeSize || null,");

// Make sure alert shows error:
content = content.replace(
  'alert("Failed to save company details: " + (err.message || err.details || JSON.stringify(err)));',
  'alert("Failed to save company details: " + (err.message || err.details || err.hint || JSON.stringify(err)));'
);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated employee_size");