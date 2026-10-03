const fs = require('fs');
let file = fs.readFileSync('app/api/publish/social/route.ts', 'utf8');

file = file.replace(
  'const firmName = jobs[0].firm_name || "Unknown Firm";\n\n  if (platform === "whatsapp"',
  'if (platform === "whatsapp"'
);

fs.writeFileSync('app/api/publish/social/route.ts', file);
console.log("Fixed duplicate firmName");
