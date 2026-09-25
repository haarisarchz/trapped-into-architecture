const fs = require('fs');
let c = fs.readFileSync('app/admin/jobs/page.tsx', 'utf-8');

c = c.replace(/\\n/g, '\n');
c = c.replace(/window\.open\(\/admin\/add-job\?id=\\, "_blank"\)/g, 'window.open(\/admin/add-job?id=\\, "_blank")');

fs.writeFileSync('app/admin/jobs/page.tsx', c);
console.log('Fixed newlines and URL');