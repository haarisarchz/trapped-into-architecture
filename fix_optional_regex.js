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

// 4. Update the profile insert payload for fullPhone
// Wait, currently it says:
// email,
// phone,
// role: "user",

// We need to change `phone,` to `phone: fullPhone || null,`
content = content.replace(
  `                email,
                phone,
                role: "user",`,
  `                email,
                phone: fullPhone,
                role: "user",`
);

// 5. Also replace `contactMethod` variable declaration just in case it's still there
content = content.replace(
  /const contactMethod = \([\s\S]*?as HTMLSelectElement\s*\)\?.value;/,
  ''
);

// 6. Fix "phone," in profile insert if it was inside profession list
content = content.replace(
  `                email,
                phone,
                profession,`,
  `                email,
                phone: fullPhone,
                profession,`
);

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Updated Navbar using regex for optional phone");