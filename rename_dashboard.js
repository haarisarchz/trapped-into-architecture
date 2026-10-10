const fs = require('fs');

// 1. Update app/admin/page.tsx
let content = fs.readFileSync('app/admin/page.tsx', 'utf8');

// Change the main h1
content = content.replace(
  '<h1 className="text-4xl font-bold">\n              Dashboard\n            </h1>',
  '<h1 className="text-4xl font-bold">\n              Job Dashboard\n            </h1>'
);

// Fallback just in case indentation is different
content = content.replace(
  /<h1 className="text-4xl font-bold">\s*Dashboard\s*<\/h1>/g,
  '<h1 className="text-4xl font-bold">\n              Job Dashboard\n            </h1>'
);

// Change "Dashboard Home" in the sidebar
content = content.replace(
  'Dashboard Home',
  'Job Dashboard'
);

fs.writeFileSync('app/admin/page.tsx', content);


// 2. Update components/admin/AdminQuickMenu.tsx
let quick = fs.readFileSync('components/admin/AdminQuickMenu.tsx', 'utf8');
quick = quick.replace(
  '>Dashboard</button>',
  '>Job Dashboard</button>'
);

fs.writeFileSync('components/admin/AdminQuickMenu.tsx', quick);
console.log("Renamed Dashboard to Job Dashboard successfully");
