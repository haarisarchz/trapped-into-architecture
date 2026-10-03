const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

file = file.split('\\\\n').join('\\n');

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Fixed literal backslashes!");
