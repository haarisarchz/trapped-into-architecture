const fs = require('fs');
let file = 'components/admin/AdminQuickMenu.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50', 'absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100 py-2 z-[99999]');
fs.writeFileSync(file, content);
console.log("Patched AdminQuickMenu");
