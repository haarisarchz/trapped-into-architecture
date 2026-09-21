const fs = require('fs');
let code = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');
code = code.replace(/order\("created_at"/g, 'order("posted_date"');
fs.writeFileSync('app/companies/[slug]/page.tsx', code);
