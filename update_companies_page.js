const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

content = content.replace(
  /onClick=\{\(\) =>\s*alert\(\s*"Company editing will be available in the company edit page\."\s*\)\s*\}/,
  'onClick={() => router.push(`/admin/companies/edit/${c.id}`)}'
);

fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Updated admin companies page");