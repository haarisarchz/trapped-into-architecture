const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

// Use regex to remove the broken sort block inside fetchCompanies
content = content.replace(/result\.sort\(\(a: any, b: any\) => \{[\s\S]*?setCompanies\(result\);/m, 'setCompanies(result);');

// Use regex to insert getSortedCompanies at the very bottom, just before the `return (` of the component
const sortedBody = `
  const getSortedCompanies = (list: any[]) => {
    return [...list].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "created_by") {
         valA = resolveCreatedBy(a);
         valB = resolveCreatedBy(b);
      } else if (sortField === "created_at") {
         valA = a.created_at ? new Date(a.created_at).getTime() : 0;
         valB = b.created_at ? new Date(b.created_at).getTime() : 0;
      } else if (sortField === "location") {
         valA = [a.city, a.state].filter(Boolean).join(", ") || "";
         valB = [b.city, b.state].filter(Boolean).join(", ") || "";
      } else if (sortField === "jobs") {
         valA = a.totalJobs || 0;
         valB = b.totalJobs || 0;
      }

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortedCompanies = getSortedCompanies(companies);
`;

// wait, if we already replaced `  return (\n    <main className="min-h-screen` before with it, we might duplicate.
// Let's check if `const sortedCompanies = getSortedCompanies(companies);` already exists at the bottom.
content = content.replace(/const sortedCompanies = getSortedCompanies\(companies\);/g, '');
content = content.replace(/const getSortedCompanies = \(list: any\[\]\) => \{[\s\S]*?  \};/g, '');
content = content.replace(/function getSortedCompanies\(list: any\[\]\) \{[\s\S]*?  \};/g, '');

content = content.replace('  return (\n    <main className="min-h-screen', sortedBody + '\n  return (\n    <main className="min-h-screen');

fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Forcibly fixed file");