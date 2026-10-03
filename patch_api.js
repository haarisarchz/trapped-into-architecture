const fs = require('fs');
let file = fs.readFileSync('app/api/extract-job/route.ts', 'utf8');

const target = '- role (string, brief 1-2 line summary of what this specific role entails)';
const replacement = '- role (string, brief 1-2 line summary of what this specific role entails)\\n  - description (string, detailed job description, responsibilities, and requirements for this specific role)';

if (file.includes(target)) {
    file = file.replace(target, replacement);
    fs.writeFileSync('app/api/extract-job/route.ts', file);
    console.log("Updated API route successfully.");
} else {
    console.log("Could not find target in route.ts");
}
