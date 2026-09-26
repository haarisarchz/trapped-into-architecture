const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
const jobDetailsIdx = c.indexOf('{/* JOB DETAILS */}');
const companyProfileIdx = c.indexOf('{/* ================= ORGANIZATION INFORMATION ================= */}');
console.log(c.substring(jobDetailsIdx, companyProfileIdx));