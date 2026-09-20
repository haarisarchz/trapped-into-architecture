const fs = require('fs');

let code = fs.readFileSync('components/Navbar.tsx', 'utf8');

// The incorrect regex in the desktop dropdown is:
// .replace(/[s_]+/g, "")
// It should be:
// .replace(/[\\s_]+/g, "")

code = code.replace(
  '["superadmin", "admin", "ceo"].includes((currentUser.role || "").toLowerCase().replace(/[s_]+/g, ""))',
  '["superadmin", "admin", "ceo"].includes((currentUser.role || "").toLowerCase().replace(/[\\s_]+/g, ""))'
);

fs.writeFileSync('components/Navbar.tsx', code);
console.log('Fixed desktop dropdown role regex in Navbar.tsx');
