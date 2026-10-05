const fs = require('fs');
let file = fs.readFileSync('app/api/publish/social/route.ts', 'utf8');

file = file.replace(/exp\.trim\(\)/g, 'String(exp).trim()');

fs.writeFileSync('app/api/publish/social/route.ts', file);
console.log("Patched exp.trim");
