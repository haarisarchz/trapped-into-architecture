const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');
const startIndex = content.indexOf('{/* CONTACT METHOD */}');
console.log(content.substring(startIndex, startIndex + 1500));