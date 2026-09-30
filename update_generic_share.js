const fs = require('fs');

let content = fs.readFileSync('components/ShareButtons.tsx', 'utf8');

const shareUrlRegex = /\{ name: "WhatsApp", href: `https:\/\/wa\.me\/\?text=\$\{shareText\}` \},/;

const shareUrlReplace = `{ name: "WhatsApp App", href: \`https://api.whatsapp.com/send?text=\${shareText}\` },
      { name: "WhatsApp Web", href: \`https://web.whatsapp.com/send?text=\${shareText}\` },`;

if (content.match(shareUrlRegex)) {
  content = content.replace(shareUrlRegex, shareUrlReplace);
  fs.writeFileSync('components/ShareButtons.tsx', content);
  console.log("Updated generic ShareButtons WhatsApp links");
} else {
  console.log("Could not find WhatsApp link in ShareButtons");
}