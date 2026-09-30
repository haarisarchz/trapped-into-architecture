const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

const tdStart = content.indexOf('<tbody');
const tdEnd = content.indexOf('</tbody>');
console.log("BODY PART 2:\n", content.substring(tdStart + 1500, tdStart + 3500));