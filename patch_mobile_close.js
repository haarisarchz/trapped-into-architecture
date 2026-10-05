const fs = require('fs');
let file = fs.readFileSync('components/Navbar.tsx', 'utf8');

// The mobile section ends right before `{/* DESKTOP MENU */}`.
file = file.replace(/(\s*)({\/\* DESKTOP MENU \*\/})/, '$1</div>$1$2');

fs.writeFileSync('components/Navbar.tsx', file);
console.log("Patched mobile closing div");
