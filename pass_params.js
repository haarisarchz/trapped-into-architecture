const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

content = content.replace(
  'onClick={() => router.push(`/admin/companies/edit/${c.id || "new"}?name=${encodeURIComponent(c.firm_name)}`)}',
  'onClick={() => router.push(`/admin/companies/edit/${c.id || "new"}?name=${encodeURIComponent(c.firm_name || "")}&city=${encodeURIComponent(c.city || "")}&state=${encodeURIComponent(c.state || "")}`)}'
);

fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Updated companies page to pass city and state");