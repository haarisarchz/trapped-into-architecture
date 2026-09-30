const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

const oldButton = `onClick={() => router.push(\`/admin/companies/edit/\${c.id || "new"}?name=\${encodeURIComponent(c.firm_name || "")}&city=\${encodeURIComponent(c.city || "")}&state=\${encodeURIComponent(c.state || "")}\`)}`;
const newButton = `onClick={() => router.push(\`/admin/companies/edit/\${c.id || "new"}?name=\${encodeURIComponent(c.firm_name || "")}&city=\${encodeURIComponent(c.city || "")}&state=\${encodeURIComponent(c.state || "")}&cb=\${c.created_by || ""}&ca=\${c.created_at || ""}\`)}`;

content = content.replace(oldButton, newButton);
fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Updated companies page edit button");