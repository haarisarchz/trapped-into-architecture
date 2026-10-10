const fs = require('fs');
let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');

// Find the first instance of EXCLUDE EXPIRED and DATE POSTED inside the space-y-8 div and remove them.
const startMarker = '<div className="space-y-8">';
const endMarker = '{/* STATE */}';
const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = '<div className="space-y-8">\n\n      ';
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
}

fs.writeFileSync('app/jobs/page.tsx', content);
console.log("Removed top filters");
