const fs = require('fs');
let content = fs.readFileSync('components/Jobcard.tsx', 'utf8');

const regex = /const showExperience = experience && experience\.toLowerCase\(\) !== "not disclosed" && experience\.toLowerCase\(\) !== "not specified";\s*const showSalary = salary && salary\.toLowerCase\(\) !== "not disclosed" && salary\.toLowerCase\(\) !== "negotiable" && salary\.trim\(\) !== "";/;

const replacement = `const expStr = experience ? String(experience).toLowerCase().trim() : "";
      const showExperience = expStr && expStr !== "not disclosed" && expStr !== "not specified" && expStr !== "null";
      
      const salStr = salary ? String(salary).toLowerCase().trim() : "";
      const showSalary = salStr && salStr !== "not disclosed" && salStr !== "negotiable" && salStr !== "null" && salStr !== "-";`;

if(content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('components/Jobcard.tsx', content);
  console.log("Patched balanced view crash");
} else {
  console.log("Regex not found");
}