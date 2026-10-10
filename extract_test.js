const fs = require('fs');
let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');

const match = content.match(/jobs\.filter\(\(job:\s*any\)\s*=>\s*\{([\s\S]*?)\}\)/);
if (match) {
  console.log("Found filter logic. Length:", match[0].length);
} else {
  console.log("Not found");
}
