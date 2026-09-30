const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');
const startIndex = content.indexOf('/* DEMO EXISTING USERNAMES */');
console.log(content.substring(startIndex + 1000, startIndex + 4000));