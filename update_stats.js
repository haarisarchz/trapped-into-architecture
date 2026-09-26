const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

const regex = /companies: companiesCount \|\| 0,/s;
const replacement = `companies: Object.keys(groupedCompanies).length || 0,`;

if (content.includes('companies: companiesCount || 0,')) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/page.tsx', content);
  console.log("Success updating company stats");
} else {
  console.log("Regex not found in page.tsx");
}