const fs = require('fs');

let adminContent = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

// Change Telegram back to website_url mapping
adminContent = adminContent.replace(
  /<LockedField label="Telegram Channel URL" type="url" fieldKey="instagram" value=\{settings\.instagram\} onChange=\{\(val: string\) => setSettings\(\{\.\.\.settings, instagram: val\}\)\} \/>/g,
  '<LockedField label="Telegram Channel URL" type="url" fieldKey="website_url" value={settings.website_url} onChange={(val: string) => setSettings({...settings, website_url: val})} />\n                <LockedField label="Instagram URL" type="url" fieldKey="instagram" value={settings.instagram} onChange={(val: string) => setSettings({...settings, instagram: val})} />'
);

// We should also remove any other references to website_url if it was rendered elsewhere as "Website URL"
// Let's check if there's another LockedField for website_url
adminContent = adminContent.replace(
  /<LockedField label="Website URL" type="url" fieldKey="website_url" value=\{settings\.website_url\} onChange=\{\(val: string\) => setSettings\(\{\.\.\.settings, website_url: val\}\)\} \/>/g,
  ''
);

fs.writeFileSync('app/admin/contact/page.tsx', adminContent);
console.log("Updated admin contact page");