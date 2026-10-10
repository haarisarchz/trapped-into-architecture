const fs = require('fs');
let content = fs.readFileSync('app/internships/page.tsx', 'utf8');

const startTag = 'const filtered = jobs';
const endTag = '.map((job, index) => (';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const chain = content.substring(startIndex + 'const filtered = '.length, endIndex).trim();
  console.log("Found chain length:", chain.length);
} else {
  console.log("Not found.");
}
