const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

// 1. Better hasSalary check
const oldSalaryCheck = 'const hasSalary = job.salary && job.salary.trim() && job.salary.trim().toLowerCase() !== "not disclosed";';
const newSalaryCheck = 'const lowerSalary = job.salary ? job.salary.trim().toLowerCase() : "";\n  const hasSalary = lowerSalary && !["not disclosed", "not specified", "negotiable", "-", "null", "as per industry standards"].includes(lowerSalary);';
content = content.replace(oldSalaryCheck, newSalaryCheck);

// 2. Change Contact Details styling
const oldContact = `<div className="pt-4 mt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-2 font-medium">Contact Details</p>`;
const newContact = `<div className="pt-3 mt-3 border-t border-gray-100">
                        <h2 className="text-base font-bold mb-1 text-gray-900">Contact Details</h2>`;
content = content.replace(oldContact, newContact);

fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Updated jobs/[id]/page.tsx");