const fs = require('fs');
let code = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

if (!code.includes('telegram_channel_url:')) {
  code = code.replace(/whatsapp_channel_url: ''/g, "whatsapp_channel_url: '',\n    telegram_channel_url: ''");
  code = code.replace(/whatsapp_channel_url: data\.whatsapp_channel_url \|\| ''/g, "whatsapp_channel_url: data.whatsapp_channel_url || '',\n          telegram_channel_url: data.telegram_channel_url || ''");

  const telegramUI = `<div className="flex flex-col gap-2">
              <label className="font-bold text-gray-700">Telegram Channel URL</label>
              <input
                type="url"
                value={settings.telegram_channel_url}
                onChange={(e) => setSettings({ ...settings, telegram_channel_url: e.target.value })}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                placeholder="https://t.me/..."
              />
            </div>`;

  code = code.replace(/<div className="flex flex-col gap-2">\s*<label className="font-bold text-gray-700">WhatsApp Channel URL<\/label>[\s\S]*?<\/div>/, 
    (match) => match + '\n            ' + telegramUI);

  fs.writeFileSync('app/admin/contact/page.tsx', code);
  console.log('Added Telegram to Admin Contact');
} else {
  console.log('Telegram already exists in Admin Contact');
}
