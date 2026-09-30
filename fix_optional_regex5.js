const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

const regex = /if \(!passwordRegex\.test\(password\)\) \{[\s\S]*?return;\s*\}[\s\S]*?\/\* CONTACT METHOD \*\/[\s\S]*?if \(contactMethod === "phone"\) \{[\s\S]*?return;\s*\}\s*\}/;

const newValidationLogic = `if (!passwordRegex.test(password)) {
          alert("Password must be 8–16 characters.");
          return;
        }

        /* EMAIL IS COMPULSORY, PHONE IS OPTIONAL */

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
console.log("Updated Navbar validation with precise regex");