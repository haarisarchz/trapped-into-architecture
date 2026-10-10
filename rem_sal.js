const fs = require('fs');
let content = fs.readFileSync('app/internships/page.tsx', 'utf8');

const salStart = content.indexOf('{/* SALARY */}');
const salEnd = content.indexOf('{/* QUALIFICATION */}');

if (salStart !== -1 && salEnd !== -1) {
  content = content.substring(0, salStart) + content.substring(salEnd);
  fs.writeFileSync('app/internships/page.tsx', content);
  console.log("Removed salary block");
}
