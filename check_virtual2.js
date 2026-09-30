const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');
const startIndex = content.indexOf('// Company not in companies table');
console.log(content.substring(startIndex, startIndex + 1000));