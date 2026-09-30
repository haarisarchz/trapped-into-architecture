const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

content = content.replace(
  'setState(record.state || "");',
  'setState(record.state || "");\n        setCountry(record.country || "India");'
);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated onSelect");