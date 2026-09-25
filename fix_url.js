const fs = require('fs');
let c = fs.readFileSync('app/admin/jobs/page.tsx', 'utf-8');

c = c.replace('window.open(/admin/add-job?id=\\, "_blank");', 'window.open(\/admin/add-job?id=\\, "_blank");');

fs.writeFileSync('app/admin/jobs/page.tsx', c);
console.log('Fixed URL strictly');