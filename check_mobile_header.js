const fs = require('fs');
let content = fs.readFileSync('app/companies/page.tsx', 'utf8');
const mbHeader = content.indexOf('{/* Mobile Search & Filter Toggle */}');
console.log("MOBILE HEADER:\n", content.substring(mbHeader, mbHeader + 1500));