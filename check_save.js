const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');
const startIndex = content.indexOf('let error;');
console.log(content.substring(startIndex, startIndex + 1000));