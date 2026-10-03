const fs = require('fs');
let file = fs.readFileSync('app/api/publish/social/route.ts', 'utf8');

file = file.replace(
  '  }\n\n  const firmName = jobs[0].firm_name || "Unknown Firm";',
  '  }'
);

fs.writeFileSync('app/api/publish/social/route.ts', file);
console.log("Fixed duplicate again.");
