const fs = require('fs');
let code = fs.readFileSync('components/ShareButtons.tsx', 'utf8');

code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');
code = code.replace(/\\\\n/g, '\\n');

fs.writeFileSync('components/ShareButtons.tsx', code);
console.log('Fixed ShareButtons backslashes');
