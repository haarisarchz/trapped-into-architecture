const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
c = c.replace(/\\n/g, '\n');
c = c.replace(/window\.open\(\/admin\/add-job\?id=\$\{job\.id\},\s*"_blank"\)/g, 'window.open(/admin/add-job?id=, "_blank")'); // Fix any accidental URL escaping if it existed
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Fixed literal \\n');