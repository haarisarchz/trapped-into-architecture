const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

// 1. Remove the broken block inside fetchCompanies completely!
const brokenBlock = `      // Sort: published companies first, then by name
      result.sort((a: any, b: any) => {
        if (b.activeJobs !== a.activeJobs) return b.activeJobs - a.activeJobs;
      
  function getSortedCompanies(list: any[]) {
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


  return (a.firm_name || "").localeCompare(b.firm_name || "");
      });

      setCompanies(result);`;

const correctFetchEnd = `      setCompanies(result);`;

content = content.replace(brokenBlock, correctFetchEnd);

// 2. Put getSortedCompanies at the top level of AdminCompaniesPage component
const fixedGetSorted = `  function getSortedCompanies(list: any[]) {
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
  }

  const sortedCompanies = getSortedCompanies(companies);`;

content = content.replace('  const sortedCompanies = getSortedCompanies(companies);', fixedGetSorted);

fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Fixed the horrible scope bug");