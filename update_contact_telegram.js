const fs = require('fs');

// 1. Update Admin Contact Page
let adminContent = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

adminContent = adminContent.replace(
  /<LockedField label="Instagram URL" type="url" fieldKey="instagram"/g,
  '<LockedField label="Telegram Channel URL" type="url" fieldKey="instagram"'
);

fs.writeFileSync('app/admin/contact/page.tsx', adminContent);

// 2. Update Footer
let footerContent = fs.readFileSync('components/Footer.tsx', 'utf8');
const regex = /\{settings\?\.telegram && \([\s\S]*?<\/a>\s*\)\}\s*\{settings\?\.instagram && \([\s\S]*?<\/a>\s*\)\}/;

const replacement = `{settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition hover:scale-110 transform" title="Telegram">
                <TelegramBrandIcon size={28} />
              </a>
            )}`;

if (footerContent.match(regex)) {
  footerContent = footerContent.replace(regex, replacement);
  fs.writeFileSync('components/Footer.tsx', footerContent);
  console.log("Success updating admin contact and footer");
} else {
  console.log("Regex not found in footer");
}