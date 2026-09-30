const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

// 1. Inside fetchCompanies, map modifierProfile
content = content.replace(
  `creatorProfile: comp.created_by ? profilesMap[comp.created_by] : null,`,
  `creatorProfile: comp.created_by ? profilesMap[comp.created_by] : null,
              modifierProfile: comp.updated_by ? profilesMap[comp.updated_by] : null,`
);

// 2. Fix resolveUpdatedBy to use modifierProfile
content = content.replace(
  `const profile = company.updated_by ? profilesMap[company.updated_by] : null;`,
  `const profile = company.modifierProfile;`
);

fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Updated profiles map scope");