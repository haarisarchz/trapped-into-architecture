const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// 1. Remove contact method dropdown HTML block
const contactDropdownStr = `{/* SELECT METHOD */}

  <div>

    <label className="block mb-2 font-medium">
      Preferred Login Method
      <span className="text-red-500">
        {" "}*
      </span>
    </label>

    <select
      id="contact-method"
      className="w-full border rounded-xl px-4 py-3"
      onChange={(e) => {

        const method = e.target.value;

        const emailBox =
          document.getElementById(
            "email-box"
          );

        const phoneBox =
          document.getElementById(
            "phone-box"
          );

        if (
          !emailBox ||
          !phoneBox
        ) return;

        if (method === "email") {

          emailBox.style.display =
            "block";

          phoneBox.style.display =
            "none";

        } else {

          emailBox.style.display =
            "none";

          phoneBox.style.display =
            "block";

        }

      }}
    >

      <option value="email">
        Email
      </option>

      <option value="phone">
        Phone Number
      </option>

    </select>

  </div>`;

content = content.replace(contactDropdownStr, '');

// 2. Make Email box always visible by removing its wrapper
const emailBoxStr = `<div id="email-box">`;
content = content.replace(emailBoxStr, `<div>`);

// 3. Make Phone box always visible by removing its wrapper
const phoneBoxStr = `<div
  id="phone-box"
  style={{ display: "none" }}
>`;
content = content.replace(phoneBoxStr, `<div>`);

// 4. Phone Label
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

// 5. Phone Live Validation
const oldPhoneLiveCheck = `const validPhone = /^[0-9]{10}$/;
        if (!validPhone.test(value)) {`;
const newPhoneLiveCheck = `const validPhone = /^[0-9]{10}$/;
        if (value.trim() === "") {
          phoneMessage.innerHTML = "";
        } else if (!validPhone.test(value)) {`;
content = content.replace(oldPhoneLiveCheck, newPhoneLiveCheck);

// 6. onClick Validation
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
const newValidationLogic = `/* CONTACT METHOD (Email required, Phone optional) */

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

// 7. Remove contactMethod definition in onClick
const contactMethodDef = `const contactMethod = (
          document.getElementById(
            "contact-method"
          ) as HTMLSelectElement
        )?.value;`;
content = content.replace(contactMethodDef, '');

// 8. Update Profile Insert
const oldProfileInsert = `email,
                phone,
                role: "user",`;
const newProfileInsert = `email,
                phone: fullPhone || null,
                role: "user",`;
content = content.replace(oldProfileInsert, newProfileInsert);

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Updated Navbar perfectly");