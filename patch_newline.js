const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

file = file.replace('setFirmName(job.firm_name || "");\\n        setImageUrl(job.image || "");', 'setFirmName(job.firm_name || "");\n        setImageUrl(job.image || "");');

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Fixed newline syntax!");
