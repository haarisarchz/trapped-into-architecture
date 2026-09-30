const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');
const startIndex = content.indexOf('/* REGISTER */');
console.log(content.substring(startIndex, startIndex + 3000));