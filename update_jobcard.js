const fs = require('fs');
let content = fs.readFileSync('components/Jobcard.tsx', 'utf8');

content = content.replace(
  'const showExperience = employment_type !== "Internship" && expStr && expStr !== "not disclosed" && expStr !== "not specified" && expStr !== "null";',
  'const isIntern = employment_type === "Internship" || (position && position.toLowerCase().includes("intern"));\n        const showExperience = !isIntern && expStr && expStr !== "not disclosed" && expStr !== "not specified" && expStr !== "null";'
);

fs.writeFileSync('components/Jobcard.tsx', content);
console.log("Updated Jobcard.tsx");