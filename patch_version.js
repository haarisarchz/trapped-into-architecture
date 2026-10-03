const fs = require('fs');
let file = fs.readFileSync('app/api/extract-job/route.ts', 'utf8');

// Also log the exact error to the Vercel logs so I can see what's happening
file = file.replace(
  'const ai = new GoogleGenAI({ apiKey });',
  'const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha" } });'
);

fs.writeFileSync('app/api/extract-job/route.ts', file);
