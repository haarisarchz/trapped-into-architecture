const fs = require('fs');
let content = fs.readFileSync('components/Footer.tsx', 'utf8');

const importAdd = `import { WhatsAppBrandIcon, FacebookBrandIcon, LinkedInBrandIcon, TelegramBrandIcon, XBrandIcon } from "@/components/icons/BrandIcons";\n`;
if (!content.includes('WhatsAppBrandIcon')) {
  content = content.replace('import { MessageCircle } from "lucide-react";', `import { MessageCircle } from "lucide-react";\n${importAdd}`);
}

const socialRegex = /<div className="mt-6 flex items-center gap-4 text-gray-400">([\s\S]*?)<\/div>/;

const newSocialBlock = `<div className="mt-6 flex flex-wrap items-center gap-4 text-gray-400">
            {settings?.whatsapp_channel_url && (
              <a href={settings.whatsapp_channel_url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition hover:scale-110 transform" title="WhatsApp Channel">
                <WhatsAppBrandIcon size={28} />
              </a>
            )}
            {settings?.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition hover:scale-110 transform" title="Facebook">
                <FacebookBrandIcon size={28} />
              </a>
            )}
            {settings?.linkedin && (
              <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition hover:scale-110 transform" title="LinkedIn">
                <LinkedInBrandIcon size={28} />
              </a>
            )}
            {settings?.telegram && (
              <a href={settings.telegram} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition hover:scale-110 transform" title="Telegram">
                <TelegramBrandIcon size={28} />
              </a>
            )}
            {settings?.twitter && (
              <a href={settings.twitter} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition hover:scale-110 transform" title="X / Twitter">
                <XBrandIcon size={28} />
              </a>
            )}
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition hover:scale-110 transform" title="Instagram">
                <span className="font-bold border-2 border-current p-1 rounded-md text-xs">IG</span>
              </a>
            )}
          </div>`;

if (content.match(socialRegex)) {
  content = content.replace(socialRegex, newSocialBlock);
  fs.writeFileSync('components/Footer.tsx', content);
  console.log("Success updating Footer socials");
} else {
  console.log("Regex not found in Footer");
}
