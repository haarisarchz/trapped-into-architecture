const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// 1. Remove contact method dropdown block
const contactDropdownRegex = /\{\/\* SELECT METHOD \*\/\}\s*<div>[\s\S]*?<\/select>\s*<\/div>/;
content = content.replace(contactDropdownRegex, '');

// 2. Remove email box wrappers
content = content.replace(/<div id="email-box">/g, '<div>');

// 3. Remove phone box wrappers
content = content.replace(/<div\s*id="phone-box"\s*style=\{\{ display: "none" \}\}\s*>/g, '<div>');

// 4. Update the onClick logic
// First, remove contactMethod retrieval
content = content.replace(
  `          const contactMethod = (
            document.getElementById(
              "contact-method"
            ) as HTMLSelectElement
          )?.value;`,
  `          // contactMethod removed`
);

// Then, update validation logic
const oldValidationLogic = `        /* CONTACT METHOD */

        if (contactMethod === "email") {
          if (!email) {
            alert("Enter email");
            return;
          }
        }

        if (contactMethod === "phone") {
          if (!phone) {
            alert("Enter phone number with country code");
            return;
          }
        }`;

const newValidationLogic = `        /* CONTACT METHOD */

        if (!email) {
          alert("Enter email address");
          return;
        }

        if (!phone) {
          alert("Enter phone number with country code");
          return;
        }
        
        const countryCode = (document.getElementById("country-code") as HTMLInputElement)?.value || "";
        const fullPhone = countryCode + phone;
        `;

content = content.replace(oldValidationLogic, newValidationLogic);

// Ensure we save the fullPhone in profiles
content = content.replace(
  `                email,
                phone,
                profession,`,
  `                email,
                phone: fullPhone,
                profession,`
);

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Updated Navbar for mandatory email and phone");