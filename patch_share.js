const fs = require('fs');
let file = fs.readFileSync('components/ShareButtons.tsx', 'utf8');

file = file.replace(
  'text += \Positions: \\n\\n\;',
  'text += \Position: \\n\\n\;'
);

file = file.replace(
  'text += \For Details Visit:\\n\;',
  'text += \For more details, visit:\\n\;'
);

fs.writeFileSync('components/ShareButtons.tsx', file);
console.log("Patched ShareButtons.");
