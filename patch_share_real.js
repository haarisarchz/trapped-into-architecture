const fs = require('fs');
let file = fs.readFileSync('components/ShareButtons.tsx', 'utf8');

file = file.split('text += `Positions: ${position}${singleExpText}\\n\\n`;').join('text += `Position: ${position}${singleExpText}\\n\\n`;');
file = file.split('text += `For Details Visit:\\n${url}`;').join('text += `For more details, visit:\\n${url}`;');

fs.writeFileSync('components/ShareButtons.tsx', file);
console.log("Patched ShareButtons correctly.");
