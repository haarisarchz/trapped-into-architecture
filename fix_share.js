const fs = require('fs');
let code = fs.readFileSync('components/ShareButtons.tsx', 'utf8');

code = code.split("combinedPosition += ` (${experience.trim()})`;").join("combinedPosition += ` (${Array.isArray(experience) ? experience.join(', ') : (typeof experience === 'string' ? experience.trim() : String(experience))})`;");

fs.writeFileSync('components/ShareButtons.tsx', code);
console.log('Fixed ShareButtons.tsx completely');
