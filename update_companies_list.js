const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

content = content.replace(
  /onClick=\{\(\) => router\.push\(`\/admin\/companies\/edit\/\$\{c\.id\}`\)\}/,
  'onClick={() => router.push(`/admin/companies/edit/${c.id || "new"}?name=${encodeURIComponent(c.firm_name)}`)}'
);

fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Updated app/admin/companies/page.tsx");