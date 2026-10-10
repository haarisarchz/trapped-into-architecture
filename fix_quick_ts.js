const fs = require('fs');

// Fix AdminQuickMenu TS errors
let quick = fs.readFileSync('components/admin/AdminQuickMenu.tsx', 'utf8');
quick = quick.replace(
  'const navItem = (href, label) => {',
  'const navItem = (href: string, label: string) => {'
);
fs.writeFileSync('components/admin/AdminQuickMenu.tsx', quick);

console.log("Fixed TS errors");
