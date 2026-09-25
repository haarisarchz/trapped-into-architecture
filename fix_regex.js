const fs = require('fs');
let c = fs.readFileSync('app/admin/jobs/page.tsx', 'utf-8');
c = c.replace(/\[\\\\s_\]\+/g, '[\\s_]+');
fs.writeFileSync('app/admin/jobs/page.tsx', c);
console.log('Fixed double backslashes');