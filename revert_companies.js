const fs = require('fs');

let code = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');
code = code.replace(
  /const role = \(currentUser\.role \|\| ""\)\.toLowerCase\(\)\.replace\(\/\[\\s_\]\+\/g, ""\);\s*if \(role !== "ceo"\) \{\s*router\.push\("\/admin"\);\s*return;\s*\}/,
  ''
);
fs.writeFileSync('app/admin/companies/page.tsx', code);

let adminCode = fs.readFileSync('app/admin/page.tsx', 'utf8');
adminCode = adminCode.replace(
  /\{userRole === "ceo" && \(\s*(<Link href="\/admin\/companies"[\s\S]*?<\/Link>)\s*\)\}/,
  '$1'
);
fs.writeFileSync('app/admin/page.tsx', adminCode);
