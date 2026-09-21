const fs = require('fs');
let code = fs.readFileSync('components/Navbar.tsx', 'utf8');

code = code.replace(/currentUser\.displayName && currentUser\.displayName\.trim\(\) !== ""/g, '(currentUser.displayName && currentUser.displayName.trim() !== "" && currentUser.profession && currentUser.profession.trim() !== "")');
code = code.replace(/>\s*Set Display Name\s*<\/button>/g, '>Complete Profile</button>');
code = code.replace(/role: profile.role,/g, 'role: profile.role,\n        profession: profile.profession,');

fs.writeFileSync('components/Navbar.tsx', code);
