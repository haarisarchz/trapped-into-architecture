const fs = require('fs');
let nav = fs.readFileSync('components/Navbar.tsx', 'utf8');
const dIndex = nav.indexOf('<div className="hidden md:flex');
console.log(nav.substring(dIndex, dIndex + 1000));
