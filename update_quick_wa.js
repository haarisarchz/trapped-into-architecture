const fs = require('fs');

let content = fs.readFileSync('components/Footer.tsx', 'utf8');

const waRegex = /href=\{\`https:\/\/wa\.me\/\$\{settings\.whatsapp\.replace\(\/\\D\/g, ''\)\}\`\}/;
const waReplace = `href={\`https://web.whatsapp.com/send?phone=\${settings.whatsapp.replace(/\\D/g, '')}\`}`;

if (content.match(waRegex)) {
  content = content.replace(waRegex, waReplace);
  fs.writeFileSync('components/Footer.tsx', content);
  console.log("Updated Quick Links WhatsApp to Web");
} else {
  console.log("Could not find Quick Links WhatsApp");
}