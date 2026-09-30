const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// Remove 'country: country || "India",'
content = content.replace(/country: country \|\| "India",\s*/g, '');

// Remove 'country: country,'
content = content.replace(/country: country,\s*/g, '');

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Removed country from DB payload");