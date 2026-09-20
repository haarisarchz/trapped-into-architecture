const fs = require('fs');

let code = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');

// 1. In generateMetadata
code = code.replace(
  'const genSlug = (j.firm_name || "").toLowerCase().trim().replace(/\\s+/g, "-").replace(/[^\\w-]+/g, "");',
  'const genSlug = (j.firm_name || "").toLowerCase().trim().replace(/\\s+/g, "-").replace(/[^\\w-]+/g, "");\n        // Patched below'
);
// Replace both instances of bad regex in the file
code = code.replace(/\(j\.firm_name \|\| ""\)\.toLowerCase\(\)\.trim\(\)\.replace\(\/\\\\s\+\/g, "-"\)\.replace\(\/\[\^\\\\w-\]\+\/g, ""\)/g, '((j.firm_name || "").toLowerCase().trim().replace(/\\s+/g, "-").replace(/[^\\w-]+/g, ""))');

// Just to be extremely safe, import generateCompanySlug and use it
code = code.replace(
  'import { generateJobUrl } from "@/utils/jobUrl";',
  'import { generateJobUrl, generateCompanySlug } from "@/utils/jobUrl";'
);

code = code.replace(
  /const genSlug = \(\(j\.firm_name \|\| ""\)\.toLowerCase\(\)\.trim\(\)\.replace\(\/\\s\+\/g, "-"\)\.replace\(\/\[\^\\w-\]\+\/g, ""\)\);/g,
  'const genSlug = generateCompanySlug(j.firm_name || "");'
);

// We know there's one in CompanyDetailsPage too.
code = code.replace(
  /const genSlug = \(j\.firm_name \|\| ""\)\.toLowerCase\(\)\.trim\(\)\.replace\(\/\\s\+\/g, "-"\)\.replace\(\/\[\^\\w-\]\+\/g, ""\);/g,
  'const genSlug = generateCompanySlug(j.firm_name || "");'
);
code = code.replace(
  /const genSlug = \(j\.firm_name \|\| ""\)\.toLowerCase\(\)\.trim\(\)\.replace\(\/\\\\s\+\/g, "-"\)\.replace\(\/\[\^\\\\w-\]\+\/g, ""\);/g,
  'const genSlug = generateCompanySlug(j.firm_name || "");'
);
code = code.replace(
  /const genSlug = j\.firm_name\?\.toLowerCase\(\)\.trim\(\)\.replace\(\/s\+\/g, "-"\)\.replace\(\/\[\^w-\]\+\/g, ""\);/g,
  'const genSlug = generateCompanySlug(j.firm_name || "");'
);


fs.writeFileSync('app/companies/[slug]/page.tsx', code);
console.log('Fixed companies/[slug] page routing & slug bugs!');
