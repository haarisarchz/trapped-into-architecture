const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// 1. Remove contact method dropdown HTML block
const contactDropdownStr = `{/* CONTACT METHOD */}

<div className="space-y-5">

  {/* SELECT METHOD */}

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

// 2. Remove email box wrappers
content = content.replace(/<div id="email-box">/g, '<div>');

// 3. Remove phone box wrappers
content = content.replace(/<div\s*id="phone-box"\s*style=\{\{ display: "none" \}\}\s*>/g, '<div>');

// 4. Update the onClick JS logic
content = content.replace(
  `        const contactMethod = (
          document.getElementById(
            "contact-method"
          ) as HTMLSelectElement
        )?.value;`,
  ``
);

// 5. Replace JS validation logic
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

const newValidationLogic = `        /* EMAIL AND PHONE ARE BOTH REQUIRED */

        if (!email) {
          alert("Enter email address");
          return;
        }

        if (!phone) {
          alert("Enter phone number");
          return;
        }
        
        const countryCode = (document.getElementById("country-code") as HTMLInputElement)?.value || "";
        const fullPhone = countryCode + phone;`;

content = content.replace(oldValidationLogic, newValidationLogic);

// 6. Update the profile payload
content = content.replace(
  `                email,
                phone,
                profession,`,
  `                email,
                phone: fullPhone,
                profession,`
);

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Updated Navbar cleanly");