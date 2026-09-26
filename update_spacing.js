const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

// 1. Fix hasSalary to hide "Not Disclosed"
const salaryRegex = /const hasSalary = job\.salary && job\.salary\.trim\(\);/;
const salaryReplace = `const hasSalary = job.salary && job.salary.trim() && job.salary.trim().toLowerCase() !== "not disclosed";`;
content = content.replace(salaryRegex, salaryReplace);

// 2. Reduce gap between tags and qualifications
const gap1Regex = /<div className="mt-6 space-y-5 border-t border-gray-100 pt-6">/;
const gap1Replace = `<div className="mt-4 space-y-3 border-t border-gray-100 pt-4">`;
content = content.replace(gap1Regex, gap1Replace);

// 3. Reduce gap in dates
const gap2Regex = /<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">/;
const gap2Replace = `<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">`;
content = content.replace(gap2Regex, gap2Replace);

// 4. Reduce gap for apply buttons
const gap3Regex = /<div className="pt-6 mt-6 border-t border-gray-100 flex justify-center w-full">/;
const gap3Replace = `<div className="pt-4 mt-4 border-t border-gray-100 flex justify-center w-full">`;
content = content.replace(gap3Regex, gap3Replace);

fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Success updating gaps and salary logic");