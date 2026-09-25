const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(/\{\/\* DESCRIPTION \*\/\}[\s\S]*?<textarea[\s\S]*?value=\{jobDescription\}[\s\S]*?<\/div>\r?\n\s*<\/div>/, "</div>");

fs.writeFileSync('app/admin/add-job/page.tsx', c);
