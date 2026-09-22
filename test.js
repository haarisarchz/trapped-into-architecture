const fs = require('fs');
const code = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');
const idx = code.indexOf('from("jobs")');
console.log(code.substring(idx - 100, idx + 200));
