const fs = require('fs');
let content = fs.readFileSync('app/internships/page.tsx', 'utf8');

const match = content.match(/jobs\.filter\(\(job:\s*any\)\s*=>\s*\{([\s\S]*?)\}\)\.length/m);
if (match) {
  console.log("Found match. Length:", match[1].length);
} else {
  console.log("No match found.");
}
