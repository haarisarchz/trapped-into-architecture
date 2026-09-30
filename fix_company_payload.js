const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

// Remove country from payload
content = content.replace(
  '        country,\n        neighborhood: area,',
  '        neighborhood: area,'
);

// Better error logging
content = content.replace(
  'alert("Failed to update company details");',
  'alert("Failed to update company details: " + (err.message || JSON.stringify(err)));'
);

fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);
console.log("Fixed companyPayload and error logging");