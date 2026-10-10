const fs = require('fs');

let content = fs.readFileSync('app/companies/page.tsx', 'utf8');
content = content.replace('data.sort((a, b) => {', 'data.sort((a: any, b: any) => {');
fs.writeFileSync('app/companies/page.tsx', content);

let intContent = fs.readFileSync('app/internships/page.tsx', 'utf8');
intContent = intContent.replace('const getSal = (s) => {', 'const getSal = (s: any) => {');
fs.writeFileSync('app/internships/page.tsx', intContent);
console.log("Fixed TS errors");
