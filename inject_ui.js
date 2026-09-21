const fs = require('fs');
let code = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');
code = code.replace(/<p className="text-gray-500 mb-8">The company you are looking for does not exist or has no active listings\.<\/p>/, '<p>Slug is: {slug}, companyJobs: {companyJobs.length}</p>');
fs.writeFileSync('app/companies/[slug]/page.tsx', code);
