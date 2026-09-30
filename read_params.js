const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

content = content.replace(
  '      setFirmName(searchParams.get("name") || "");\n      setLoading(false);',
  '      setFirmName(searchParams.get("name") || "");\n      setCity(searchParams.get("city") || "");\n      setState(searchParams.get("state") || "");\n      setLoading(false);'
);

fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);
console.log("Updated edit page to read city and state");