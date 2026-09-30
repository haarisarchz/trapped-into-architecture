const fs = require('fs');
let lines = fs.readFileSync('app/admin/companies/page.tsx', 'utf8').split('\n');
lines.forEach((line, i) => { if(i > 115 && i < 185) console.log(`${i+1}: ${line}`) });