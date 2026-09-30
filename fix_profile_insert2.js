const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// The `profession` field somehow didn't make it into the profile insert payload in the last commit?
// Let's add `profession` and `phone: fullPhone || null` right now.

const regex = /id: authData\.user\.id,\s*username,\s*full_name: fullName,\s*display_name: displayName,\s*email,\s*phone,\s*role: "user",\s*bio: "",/;

const newInsert = `id: authData.user.id,
                username,
                full_name: fullName,
                display_name: displayName,
                email,
                phone: fullPhone || null,
                profession,
                role: "user",
                bio: "",`;

if (regex.test(content)) {
  content = content.replace(regex, newInsert);
  fs.writeFileSync('components/Navbar.tsx', content);
  console.log("Updated Profile insert logic with fullPhone and profession!");
} else {
  console.log("Still failed to match insert");
}