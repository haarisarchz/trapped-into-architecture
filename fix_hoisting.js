const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

// Convert resolveCreatedBy to function
content = content.replace(
  /const resolveCreatedBy = \(company: any\): string => \{/,
  'function resolveCreatedBy(company: any): string {'
);

// Convert getSortedCompanies to function
content = content.replace(
  /const getSortedCompanies = \(list: any\[\]\) => \{/,
  'function getSortedCompanies(list: any[]) {'
);

fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Converted functions to hoisted declarations");