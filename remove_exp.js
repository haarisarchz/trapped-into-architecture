const fs = require('fs');

let content = fs.readFileSync('app/internships/page.tsx', 'utf8');
const expBlockStart = content.indexOf('{/* EXPERIENCE */}');
const expBlockEndStr = '{/* SALARY */}';
const expBlockEnd = content.indexOf(expBlockEndStr);

if (expBlockStart !== -1 && expBlockEnd !== -1) {
  content = content.substring(0, expBlockStart) + content.substring(expBlockEnd);
  fs.writeFileSync('app/internships/page.tsx', content);
  console.log("Removed Experience block from internships");
} else {
  console.log("Not found");
}
