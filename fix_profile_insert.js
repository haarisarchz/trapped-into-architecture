const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

const regex = /id: authData\.user\.id,\s*username,\s*full_name: fullName,\s*display_name: displayName,\s*email,\s*phone,\s*profession,\s*role: "user",/;

const newInsert = `id: authData.user.id,
                username,
                full_name: fullName,
                display_name: displayName,
                email,
                phone: fullPhone || null,
                profession,
                role: "user",`;

if (regex.test(content)) {
  content = content.replace(regex, newInsert);
  fs.writeFileSync('components/Navbar.tsx', content);
  console.log("Updated Profile insert logic");
} else {
  console.log("Failed to match profile insert");
}