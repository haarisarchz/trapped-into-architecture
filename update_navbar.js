const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// 1. Add text-black to auth popup wrapper
const popupWrapperRegex = /className="bg-white w-full max-w-md rounded-3xl p-8 relative shadow-2xl max-h-\[90vh\] overflow-y-auto"/g;
content = content.replace(popupWrapperRegex, 'className="bg-white text-black w-full max-w-md rounded-3xl p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto"');

// 2. Inject Display Name UI
const injectPos = content.indexOf('{/* CONTACT METHOD */}');
if(injectPos !== -1) {
  const displayNameUI = `
  {/* DISPLAY NAME */}
  <div>
    <label className="block mb-2 font-medium">
      Display Name
      <span className="text-red-500"> *</span>
    </label>
    <input
      id="register-display-name"
      type="text"
      placeholder="e.g. John Doe"
      className="w-full border rounded-xl px-4 py-3 text-black"
      required
    />
  </div>
  `;
  content = content.substring(0, injectPos) + displayNameUI + '\n  ' + content.substring(injectPos);
} else {
  console.log("Could not find CONTACT METHOD");
}

// 3. Inject Display Name value extraction
const extractPos = content.indexOf('const username = (');
if(extractPos !== -1) {
  const displayExtract = `
          const displayName = (
            document.getElementById(
              "register-display-name"
            ) as HTMLInputElement
          )?.value.trim();
  `;
  content = content.substring(0, extractPos) + displayExtract + content.substring(extractPos);
}

// 4. Validation
const valPos = content.indexOf('const usernameRegex = /^[a-zA-Z0-9._]{5,12}$/;');
if(valPos !== -1) {
  const validation = `
          if (!displayName) {
            alert("Enter display name");
            return;
          }
  `;
  content = content.substring(0, valPos) + validation + content.substring(valPos);
}

// 5. Database insert
const insertRegex = /full_name: fullName,\s*email,/g;
content = content.replace(insertRegex, 'full_name: fullName,\n                  display_name: displayName,\n                  email,');

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Updated Navbar successfully");