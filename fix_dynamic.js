const fs = require('fs');
let content = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');

if (!content.includes("export const dynamic = 'force-dynamic';")) {
  content = "export const dynamic = 'force-dynamic';\n" + content;
  fs.writeFileSync('app/companies/[slug]/page.tsx', content);
}