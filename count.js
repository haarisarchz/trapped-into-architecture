const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

let count = 0;
let lines = file.split('\n');

let startIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export default async function JobDetailsPage')) {
    startIndex = i;
    break;
  }
}

if (startIndex === -1) process.exit(1);

for (let i = startIndex; i < lines.length; i++) {
  let line = lines[i];
  for (let char of line) {
    if (char === '{') count++;
    else if (char === '}') count--;
  }
  if (count === 0 && i > startIndex + 10) {
    console.log("Function closed at line:", i + 1);
    console.log("Line content:", line);
    console.log("Previous 5 lines:");
    for (let j = i - 5; j < i; j++) console.log(lines[j]);
    break;
  }
}
