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

// 3. Remove contactMethod definition
content = content.replace(
  /const contactMethod = \([\s\S]*?as HTMLSelectElement\s*\)\?.value;/,
  ''
);

// 4. Update Profile Insert with fullPhone AND profession
const regexInsert = /id: authData\.user\.id,\s*username,\s*full_name: fullName,\s*display_name: displayName,\s*email,\s*phone,\s*role: "user",\s*bio: "",/;

const newInsert = `id: authData.user.id,
                username,
                full_name: fullName,
                display_name: displayName,
                email,
                phone: fullPhone || null,
                profession,
                role: "user",
                bio: "",`;

if (regexInsert.test(content)) {
  content = content.replace(regexInsert, newInsert);
} else {
  console.log("Failed to match insert");
}

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Applied remaining fixes!");