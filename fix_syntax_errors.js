const fs = require('fs');

// Fix Jobcard.tsx
let jc = fs.readFileSync('components/Jobcard.tsx', 'utf8');
jc = jc.replace('firm_name: string;\\n  organization_type?: string;', 'firm_name: string;\n  organization_type?: string;');
fs.writeFileSync('components/Jobcard.tsx', jc);

// Fix route.ts
let api = fs.readFileSync('app/api/extract-job/route.ts', 'utf8');
api = api.replace(/\\\`/g, '\`').replace(/\\\$/g, '\$');
fs.writeFileSync('app/api/extract-job/route.ts', api);

// Fix company page.tsx
let comp = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');
comp = comp.replace(/\\\`/g, '\`').replace(/\\\$/g, '\$');
fs.writeFileSync('app/companies/[slug]/page.tsx', comp);

console.log('Fixed syntax errors');
