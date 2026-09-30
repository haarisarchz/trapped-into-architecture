const fs = require('fs');
let content = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');

// Update location string
const oldLocation = `const location = [company.city, company.state].filter(Boolean).join(", ");`;
const newLocation = `const location = [company.address, company.neighborhood, company.city, company.state].filter(Boolean).join(", ");`;

content = content.replace(oldLocation, newLocation);

fs.writeFileSync('app/companies/[slug]/page.tsx', content);
console.log("Updated public company page with full address");