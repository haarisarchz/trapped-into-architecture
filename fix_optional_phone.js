const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// 1. Remove red * from Phone Number label and add (Optional)
const oldPhoneLabel = `<label className="block mb-2 font-medium">
    Phone Number
    <span className="text-red-500">
      {" "}*
    </span>
  </label>`;

const newPhoneLabel = `<label className="block mb-2 font-medium">
    Phone Number <span className="text-sm font-normal text-gray-500">(Optional)</span>
  </label>`;

content = content.replace(oldPhoneLabel, newPhoneLabel);

// 2. Allow empty value in Phone onChange validation
const oldPhoneLiveCheck = `const validPhone = /^[0-9]{10}$/;
        if (!validPhone.test(value)) {
          phoneMessage.innerHTML = "Enter 10-digit number";
          phoneMessage.className = "text-sm mt-2 text-red-500";
        } else {`;

const newPhoneLiveCheck = `const validPhone = /^[0-9]{10}$/;
        if (value.trim() === "") {
          phoneMessage.innerHTML = "";
        } else if (!validPhone.test(value)) {
          phoneMessage.innerHTML = "Enter 10-digit number";
          phoneMessage.className = "text-sm mt-2 text-red-500";
        } else {`;

content = content.replace(oldPhoneLiveCheck, newPhoneLiveCheck);

// 3. Fix the onClick validation logic
const oldValidationLogic = `/* CONTACT METHOD */

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

content = content.replace(oldValidationLogic, newValidationLogic);

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

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Updated Navbar for optional phone");