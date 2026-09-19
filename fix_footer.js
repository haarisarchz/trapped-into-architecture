const fs = require('fs');
let code = fs.readFileSync('components/Footer.tsx', 'utf8');

code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');

fs.writeFileSync('components/Footer.tsx', code);
console.log('Fixed Footer backslashes');
