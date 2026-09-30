const fs = require('fs');
let content = fs.readFileSync('app/profile/[username]/page.tsx', 'utf8');
const startIndex = content.indexOf('/* PERSONAL */');
console.log(content.substring(startIndex, startIndex + 3000));