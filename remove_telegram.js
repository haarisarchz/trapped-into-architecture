const fs = require('fs');
let code = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');
code = code.replace(/telegram: data\.telegram \|\| "",\n/g, '');
code = code.replace(/telegram: settings\.telegram,\n/g, '');
code = code.replace(/telegram: "",/g, '');
code = code.replace(/<div>\s*<label className="block text-sm font-semibold mb-1">Telegram<\/label>\s*<input type="text" value=\{settings\.telegram\} onChange=\{e => setSettings\(\{\.\.\.settings, telegram: e\.target\.value\}\)\} className="w-full px-4 py-2 border rounded-xl" placeholder="t\.me\/username" \/>\s*<\/div>/g, '');
fs.writeFileSync('app/admin/contact/page.tsx', code);
