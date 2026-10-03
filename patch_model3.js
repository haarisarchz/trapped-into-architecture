const fs = require('fs');
let file = fs.readFileSync('app/api/extract-job/route.ts', 'utf8');

file = file.replace(/gemini-2\.5-flash/g, 'gemini-3.0-flash');

fs.writeFileSync('app/api/extract-job/route.ts', file);
console.log("Updated model to gemini-3.0-flash");
