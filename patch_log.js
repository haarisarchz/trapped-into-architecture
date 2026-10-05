const fs = require('fs');
let file = fs.readFileSync('app/api/publish/social/route.ts', 'utf8');

file = file.replace('errorMsg = err.message;', 'errorMsg = err.message;\n        console.error(`Meta API Error for ${platform}:`, err.message);');

fs.writeFileSync('app/api/publish/social/route.ts', file);
console.log("Patched console.error");
