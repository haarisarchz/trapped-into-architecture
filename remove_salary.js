const fs = require('fs');

let content = fs.readFileSync('app/internships/page.tsx', 'utf8');

const salStart = content.indexOf('{/* SALARY */}');
// find the next block, e.g., {/* END OF SALARY */} or just the end of the div
// Looking at the previous output, it's followed by nothing? Wait, let's just find the next `{/*`
const nextBlock = content.indexOf('{/*', salStart + 10);
if (salStart !== -1 && nextBlock !== -1) {
  content = content.substring(0, salStart) + content.substring(nextBlock);
  fs.writeFileSync('app/internships/page.tsx', content);
  console.log("Removed Salary block");
} else {
  console.log("Could not find blocks");
}
