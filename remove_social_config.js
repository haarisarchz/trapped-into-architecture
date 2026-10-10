const fs = require('fs');

// 1. Remove from app/admin/page.tsx
let pageContent = fs.readFileSync('app/admin/page.tsx', 'utf8');
pageContent = pageContent.replace(
  '<button\n                  onClick={() => router.push("/admin/social-config")}\n                  className="w-full text-left px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 transition font-medium text-gray-200"\n                >\n                  Social Config\n                </button>',
  ''
);
// In case format differs slightly:
pageContent = pageContent.replace(
    /<\s*button[^>]*onClick=\{\s*\(\)\s*=>\s*router\.push\("\/admin\/social-config"\)\s*\}[^>]*>\s*Social Config\s*<\/\s*button\s*>/g,
    ''
);
fs.writeFileSync('app/admin/page.tsx', pageContent);

// 2. Remove from components/admin/AdminQuickMenu.tsx
let quickContent = fs.readFileSync('components/admin/AdminQuickMenu.tsx', 'utf8');
quickContent = quickContent.replace(
    /<button onClick=\{\(\) => navigate\("\/admin\/social-config"\)\} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Social Config<\/button>/g,
    ''
);
fs.writeFileSync('components/admin/AdminQuickMenu.tsx', quickContent);

// 3. Add to app/admin/contact/page.tsx
let contactContent = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

const targetStr = '<h2 className="text-xl font-bold mb-6 text-gray-900 border-b pb-2">Social & Public Channels</h2>';
const replacementStr = `<div className="flex items-center justify-between border-b pb-2 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Social & Public Channels</h2>
                <Link href="/admin/social-config" className="text-xs font-semibold text-blue-500 hover:underline">
                  Social Configuration
                </Link>
              </div>`;

if (contactContent.includes(targetStr)) {
    // Add import Link if not present
    if (!contactContent.includes('import Link from "next/link";')) {
        contactContent = 'import Link from "next/link";\n' + contactContent;
    }
    contactContent = contactContent.replace(targetStr, replacementStr);
    fs.writeFileSync('app/admin/contact/page.tsx', contactContent);
    console.log("Patched contact page successfully.");
} else {
    console.log("Could not find social panel target in contact page.");
}

