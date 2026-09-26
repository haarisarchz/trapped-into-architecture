const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

const regex = /const stats = \{\s*users: usersCount \|\| 0,\s*jobs: jobsCount \|\| 0,\s*companies: Object.keys\(groupedCompanies\).length \|\| 0,\s*\};/s;

const replacement = `const stats = {
    users: usersCount || 0,
    jobs: jobsCount || 0,
    internships: internshipsCount || 0,
    companies: Object.keys(groupedCompanies).length || 0,
  };`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/page.tsx', content);
  console.log("Success replacing stats object in page.tsx");
} else {
  console.log("Regex not found in stats object");
}