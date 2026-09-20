const fs = require('fs');
let code = fs.readFileSync('app/admin/page.tsx', 'utf8');

const settingsRegex = /<li[^>]*>\s*<button[^>]*onClick=\{\(\) => router\.push\(['"]\/admin\/settings['"]\)\}[^>]*>[\s\S]*?Settings[\s\S]*?<\/button>\s*<\/li>/i;
if (code.match(settingsRegex)) {
  code = code.replace(settingsRegex, '');
} else {
  // If it's a Link
  const settingsLinkRegex = /<li[^>]*>\s*<Link[^>]*href=['"]\/admin\/settings['"][^>]*>[\s\S]*?Settings[\s\S]*?<\/Link>\s*<\/li>/i;
  code = code.replace(settingsLinkRegex, '');
}

// In case it's literally just the simple block:
code = code.replace(/<li className="mb-2">\s*<button\s*onClick=\{\(\) => router\.push\("\/admin\/settings"\)\}\s*className="[^"]*"\s*>\s*Settings\s*<\/button>\s*<\/li>/g, '');

const newNavItems = `
            <li className="mb-2">
              <button 
                onClick={() => router.push("/admin/users")} 
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 font-medium transition"
              >
                Users
              </button>
            </li>
            <li className="mb-2">
              <button 
                onClick={() => router.push("/admin/contact")} 
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 font-medium transition"
              >
                Contact & Website Info
              </button>
            </li>
`;

if (code.includes('Analytics')) {
  const analyticsRegex = /(<button[^>]*onClick=\{\(\) => router\.push\(['"]\/admin\/analytics['"]\)\}[^>]*>[\s\S]*?Analytics[\s\S]*?<\/button>\s*<\/li>)/i;
  code = code.replace(analyticsRegex, '$1\n' + newNavItems);
}

fs.writeFileSync('app/admin/page.tsx', code);
console.log('Fixed admin nav');
