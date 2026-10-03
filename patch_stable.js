const fs = require('fs');
let file = fs.readFileSync('app/api/extract-job/route.ts', 'utf8');
file = file.replace(/model: "gemini-[^"]+",/g, 'model: "gemini-flash-latest",');
fs.writeFileSync('app/api/extract-job/route.ts', file);
console.log("Updated to gemini-flash-latest");
