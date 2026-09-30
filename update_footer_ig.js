const fs = require('fs');
let footerContent = fs.readFileSync('components/Footer.tsx', 'utf8');

// 1. Add InstagramBrandIcon to import
footerContent = footerContent.replace(
  /import \{ WhatsAppBrandIcon, FacebookBrandIcon, LinkedInBrandIcon, TelegramBrandIcon, XBrandIcon \} from "@\/components\/icons\/BrandIcons";/,
  `import { WhatsAppBrandIcon, FacebookBrandIcon, LinkedInBrandIcon, TelegramBrandIcon, XBrandIcon, InstagramBrandIcon } from "@/components/icons/BrandIcons";`
);

// 2. Change Telegram mapping from settings?.instagram to settings?.website_url
// And add Instagram mapping back
const telegramRegex = /\{settings\?\.instagram && \([\s\S]*?<TelegramBrandIcon size=\{28\} \/>\s*<\/a>\s*\)\}/;

const telegramReplace = `{settings?.website_url && (
              <a href={settings.website_url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition hover:scale-110 transform" title="Telegram">
                <TelegramBrandIcon size={28} />
              </a>
            )}
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition hover:scale-110 transform" title="Instagram">
                <InstagramBrandIcon size={28} />
              </a>
            )}`;

if (footerContent.match(telegramRegex)) {
  footerContent = footerContent.replace(telegramRegex, telegramReplace);
  fs.writeFileSync('components/Footer.tsx', footerContent);
  console.log("Updated Footer socials");
} else {
  console.log("Regex not found in Footer");
}