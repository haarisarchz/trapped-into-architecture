const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
const search = /\{\/\* QUALIFICATION \*\/\}/;
c = c.replace(search, '{sameRequirements && (\\n<div className="border border-gray-200 p-5 rounded-2xl bg-white shadow-sm mb-6">\\n{/* QUALIFICATION */}');
const searchEnd = /<\/div>\s*\{\/\* JOB DETAILS \*\/\}/;
c = c.replace(searchEnd, '</div>\\n)}</div>\\n            {/* JOB DETAILS */}');
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Wrapped global requirements');