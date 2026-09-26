const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
const replacement = fs.readFileSync('ui_replacement.txt', 'utf-8');

const regex = /\{\/\* POSITIONS & DESCRIPTIONS \*\/\}([\s\S]*?)<\/div>\s*\{\/\* VISIBILITY \*\/\}/;

c = c.replace(regex, replacement);
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Fixed UI block properly');