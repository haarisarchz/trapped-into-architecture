const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// 1. Remove contactMethod definition
content = content.replace(
  /const contactMethod = \([\s\S]*?as HTMLSelectElement\s*\)\?.value;/,
  ''
);

// 2. Replace validation
const regex = /\/\* CONTACT METHOD \*\/[\s\S]*?if \(!phone\) \{[\s\S]*?return;\s*\}/;

const newValidation = `/* CONTACT METHOD */

        if (!email) {
          alert("Enter email address");
          return;
        }

        if (!phone) {
          alert("Enter phone number");
          return;
        }
        
        const countryCode = (document.getElementById("country-code") as HTMLInputElement)?.value || "";
        const fullPhone = countryCode + phone;
`;

if (regex.test(content)) {
  content = content.replace(regex, newValidation);
} else {
  console.log("Failed to match validation regex");
}

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Fixed validation logic");