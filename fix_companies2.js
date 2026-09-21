const fs = require('fs');
let code = fs.readFileSync('app/companies/page.tsx', 'utf8');
code = code.replace(/\.map\(\(x\) => x\.trim\(\)\)/g, '.map((x: any) => typeof x === "string" ? x.trim() : String(x || ""))');
fs.writeFileSync('app/companies/page.tsx', code);
