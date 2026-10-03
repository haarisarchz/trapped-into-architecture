const fs = require('fs');
let file = fs.readFileSync('app/api/extract-job/route.ts', 'utf8');

file = file.replace(/gemini-1\.5-pro/g, 'gemini-3.0-flash');
file = file.replace(/gemini-1\.5-flash/g, 'gemini-3.0-flash');
file = file.replace(/gemini-2\.5-flash/g, 'gemini-3.0-flash');

fs.writeFileSync('app/api/extract-job/route.ts', file);
console.log("Updated to gemini-3.0-flash");
