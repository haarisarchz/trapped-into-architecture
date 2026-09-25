const fs = require('fs');
let c = fs.readFileSync('app/admin/activity/page.tsx', 'utf-8');

c = c.replace(/\\n/g, '\n');

fs.writeFileSync('app/admin/activity/page.tsx', c);
console.log('Fixed literal newlines');