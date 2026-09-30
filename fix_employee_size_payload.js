const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

content = content.replace(/employee_size:\s*employeeSize(?! \|\| null)/g, 'employee_size: employeeSize || null');

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Fixed employee_size payload mapping");