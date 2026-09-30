const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// 1. Remove contact method dropdown HTML block
const contactDropdownRegex = /\{\/\* SELECT METHOD \*\/\}\s*<div>[\s\S]*?<\/select>\s*<\/div>/;
content = content.replace(contactDropdownRegex, '');

// 2. Phone Label
content = content.replace(
  `<label className="block mb-2 font-medium">
    Phone Number
    <span className="text-red-500">
      {" "}*
    </span>
  </label>`,
  `<label className="block mb-2 font-medium">
    Phone Number <span className="text-sm font-normal text-gray-500">(Optional)</span>
  </label>`
);

// 3. Phone Live Validation
content = content.replace(
  `const validPhone = /^[0-9]{10}$/;
        if (!validPhone.test(value)) {`,
  `const validPhone = /^[0-9]{10}$/;
        if (value.trim() === "") {
          phoneMessage.innerHTML = "";
        } else if (!validPhone.test(value)) {`
);

// 4. onClick Validation
// The current validation in HEAD is:
//         /* CONTACT METHOD */
// 
//         if (contactMethod === "email") {
//           if (!email) {
//             alert("Enter email");
//             return;
//           }
//         }
// 
//         if (contactMethod === "phone") {
//           if (!phone) {
//             alert("Enter phone number with country code");
//             return;
//           }
//         }

content = content.replace(
  `/* CONTACT METHOD */

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
        }`,
  `/* EMAIL IS COMPULSORY, PHONE IS OPTIONAL */

        if (!email) {
          alert("Enter email address");
          return;
        }

        let fullPhone = null;
        if (phone) {
          const countryCode = (document.getElementById("country-code") as HTMLInputElement)?.value || "";
          fullPhone = countryCode + phone;
        }`
);

// 5. Update Profile Insert
content = content.replace(
  `                email,
                phone,
                profession,`,
  `                email,
                phone: fullPhone,
                profession,`
);

// 6. Remove contactMethod definition in onClick
content = content.replace(
  /const contactMethod = \([\s\S]*?as HTMLSelectElement\s*\)\?.value;/,
  ''
);

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Updated Navbar perfectly");