const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');
const start = file.indexOf('{showSchedule && (');
const end = file.indexOf('</div>', start + 1000);
console.log(file.substring(start, end));
