const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(')}</div>\\n            {/* JOB & APPLICATION DETAILS */}', '</div></div>\\n)}</div>\\n            {/* JOB & APPLICATION DETAILS */}');

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Fixed sameRequirements divs');