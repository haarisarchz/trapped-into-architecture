const fs = require('fs');
let file = fs.readFileSync('app/api/extract-job/route.ts', 'utf8');

file = file.replace('const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha" } });', 'const ai = new GoogleGenAI({ apiKey });');

fs.writeFileSync('app/api/extract-job/route.ts', file);
console.log("Removed v1alpha override");
