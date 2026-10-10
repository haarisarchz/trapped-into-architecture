const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

content = content.replace('<option value={25}>25</option>', '<option value={24}>24</option>');
content = content.replace('useState(25)', 'useState(24)');

fs.writeFileSync('app/admin/jobs/page.tsx', content);
console.log("Patched admin jobs page");
