const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

// 1. Remove the sortedCompanies definition
content = content.replace('  const sortedCompanies = getSortedCompanies(companies);\n', '');

// 2. Put it inside the render block or right before return
content = content.replace(
  '  return (\n    <div className="min-h-screen',
  '  const sortedCompanies = getSortedCompanies(companies);\n\n  return (\n    <div className="min-h-screen'
);

fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Moved sortedCompanies down safely");