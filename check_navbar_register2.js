const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');
const startIndex = content.indexOf('/* CREATE PROFILE */');
console.log(content.substring(startIndex, startIndex + 2500));