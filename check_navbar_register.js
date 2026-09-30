const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');
const startIndex = content.indexOf('/* GET VALUES */');
console.log(content.substring(startIndex, startIndex + 3000));