const fs = require('fs');
let file = fs.readFileSync('app/api/publish/social/route.ts', 'utf8');

file = file.replace(
  'function generatePostText(jobs: any[], platform: string, jobUrl: string, company: any) {\n  if (platform === "whatsapp"',
  'function generatePostText(jobs: any[], platform: string, jobUrl: string, company: any) {\n  const firmName = jobs[0].firm_name || "Unknown Firm";\n  if (platform === "whatsapp"'
);

fs.writeFileSync('app/api/publish/social/route.ts', file);
console.log("Restored firmName declaration");
