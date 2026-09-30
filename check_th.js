const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

const thStart = content.indexOf('<thead>');
const thEnd = content.indexOf('</thead>');
console.log("HEADERS:\n", content.substring(thStart, thEnd));