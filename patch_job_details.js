const fs = require('fs');

let code = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

// 1. Fix the ID decoding in the main component
const idParseOld = `  const { id: rawId } = await params;
  const uuidMatch = rawId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  const id = uuidMatch ? uuidMatch[0] : rawId;`;

const idParseNew = `  const { id: rawId } = await params;
  let id = rawId;
  const uuidMatch = rawId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  if (uuidMatch) {
    id = uuidMatch[0];
  } else if (rawId.length === 22 && !rawId.includes("-")) {
    const decoded = decodeUuid(rawId);
    if (decoded) id = decoded;
  }`;

if (code.includes(idParseOld)) {
  code = code.replace(idParseOld, idParseNew);
} else {
  // Try more flexible replace if spacing is off
  const idParseRegex = /const { id: rawId } = await params;[\s\S]*?const id = uuidMatch \? uuidMatch\[0\] : rawId;/;
  code = code.replace(idParseRegex, idParseNew);
}

// 2. Fix the regex in companySlug fallback
// Before: job.firm_name?.toLowerCase().trim().replace(/s+/g, "-").replace(/[^w-]+/g, "");
// We can just use the generateCompanySlug util which we imported above
// The file imports generateJobUrl and decodeUuid. We'll import generateCompanySlug too.
code = code.replace(
  'import { generateJobUrl, decodeUuid } from "@/utils/jobUrl";',
  'import { generateJobUrl, decodeUuid, generateCompanySlug } from "@/utils/jobUrl";'
);

code = code.replace(
  /const companySlug = company\?\.slug \|\| job\.firm_name\?\.toLowerCase\(\)\.trim\(\)\.replace\(\/s\+\/g, "-"\)\.replace\(\/\[\^w-\]\+\/g, ""\);/,
  'const companySlug = company?.slug || generateCompanySlug(job.firm_name);'
);

code = code.replace(
  /const companySlug = company\?\.slug \|\| job\.firm_name\?\.toLowerCase\(\)\.trim\(\)\.replace\(\/\\s\+\/g, "-"\)\.replace\(\/\[\^\\w-\]\+\/g, ""\);/,
  'const companySlug = company?.slug || generateCompanySlug(job.firm_name);'
);

fs.writeFileSync('app/jobs/[id]/page.tsx', code);
console.log('Fixed job details page routing & slug bugs!');
