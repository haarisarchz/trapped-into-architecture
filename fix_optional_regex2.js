const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

const regex = /\/\* CONTACT METHOD \*\/[\s\S]*?if \(contactMethod === "phone"\) \{[\s\S]*?return;\s*\}/;

const newValidationLogic = `/* EMAIL IS COMPULSORY, PHONE IS OPTIONAL */

        if (!email) {
          alert("Enter email address");
          return;
        }

        let fullPhone = null;
        if (phone) {
          const countryCode = (document.getElementById("country-code") as HTMLInputElement)?.value || "";
          fullPhone = countryCode + phone;
        }`;

if (regex.test(content)) {
  content = content.replace(regex, newValidationLogic);
} else {
  console.log("Validation regex failed to match");
}

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Updated Navbar validation with regex");