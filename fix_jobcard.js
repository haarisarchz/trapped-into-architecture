const fs = require('fs');
let content = fs.readFileSync('components/Jobcard.tsx', 'utf8');

const oldCheck = 'const showSalary = salStr && salStr !== "not disclosed" && salStr !== "negotiable" && salStr !== "null" && salStr !== "-";';
const newCheck = 'const showSalary = salStr && !["not disclosed", "not specified", "negotiable", "-", "null", "as per industry standards"].includes(salStr);';

content = content.replace(oldCheck, newCheck);
fs.writeFileSync('components/Jobcard.tsx', content);
console.log("Updated Jobcard.tsx");