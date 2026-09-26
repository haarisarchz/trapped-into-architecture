const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
c = c.replace(/<h2 className="text-xl font-bold">Roles & Requirements<\/h2>/g, '<h2 className="text-xl font-bold">Position Details</h2>');
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Renamed Roles & Requirements');