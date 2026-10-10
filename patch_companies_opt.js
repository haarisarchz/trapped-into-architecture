const fs = require('fs');
let content = fs.readFileSync('app/companies/page.tsx', 'utf8');

content = content.replace('<option value={25}>25</option>', '<option value={24}>24</option>');
content = content.replace('useState(25)', 'useState(24)');

fs.writeFileSync('app/companies/page.tsx', content);
console.log("Patched companies page");
