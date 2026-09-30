const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// 1. Phone Label
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

// 2. Phone Live Validation
content = content.replace(
  `const validPhone = /^[0-9]{10}$/;
        if (!validPhone.test(value)) {`,
  `const validPhone = /^[0-9]{10}$/;
        if (value.trim() === "") {
          phoneMessage.innerHTML = "";
        } else if (!validPhone.test(value)) {`
);

// 3. onClick Validation
// The current validation says:
//         if (!phone) {
//           alert("Enter phone number");
//           return;
//         }
//         
//         const countryCode = (document.getElementById("country-code") as HTMLInputElement)?.value || "";
//         const fullPhone = countryCode + phone;

content = content.replace(
  `        if (!phone) {
          alert("Enter phone number");
          return;
        }
        
        const countryCode = (document.getElementById("country-code") as HTMLInputElement)?.value || "";
        const fullPhone = countryCode + phone;`,
  `        let fullPhone = null;
        if (phone) {
          const countryCode = (document.getElementById("country-code") as HTMLInputElement)?.value || "";
          fullPhone = countryCode + phone;
        }`
);

// 4. Update Profile Insert
content = content.replace(
  `                email,
                phone: fullPhone,
                profession,`,
  `                email,
                phone: fullPhone || null,
                profession,`
);

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Updated Navbar exactly and safely");