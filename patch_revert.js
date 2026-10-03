const fs = require('fs');
let file = fs.readFileSync('app/api/extract-job/route.ts', 'utf8');

file = file.replace(/gemini-3\.0-flash/g, 'gemini-1.5-flash');

fs.writeFileSync('app/api/extract-job/route.ts', file);
console.log("Reverted model to gemini-1.5-flash");
