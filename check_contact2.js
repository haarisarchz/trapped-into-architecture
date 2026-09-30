const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');
const startIndex = content.indexOf('/* CONTACT METHOD */');
const endIndex = content.indexOf('/* CREATE USER IN SUPABASE AUTH */');
console.log(content.substring(startIndex, endIndex));