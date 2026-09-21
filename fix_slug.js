const fs = require('fs');
let code = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');
code = code.replace(
  /const companyJobs = \(allJobs \|\| \[\]\)\.filter\(j => \{\s*const genSlug = generateCompanySlug\(j\.firm_name \|\| ""\);\s*return genSlug === slug;\s*\}\);/g,
  `const companyJobs = (allJobs || []).filter(j => {
    if (companyRecord && j.company_id && j.company_id === companyRecord.id) return true;
    const genSlug = generateCompanySlug(j.firm_name || "");
    return genSlug === slug;
  });`
);
fs.writeFileSync('app/companies/[slug]/page.tsx', code);
console.log('Fixed slug page job lookup');
