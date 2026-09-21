const fs = require('fs');

let code = fs.readFileSync('app/companies/page.tsx', 'utf8');

// 1. Fix the missing closing bracket for `if (loading)`
code = code.replace(/if\s*\(\s*loading\s*\)\s*\{\s*const\s+renderFilters\s*=\s*\(\)\s*=>\s*\(/, 
  'if (loading) {\n  return <main className="min-h-screen flex items-center justify-center">Loading...</main>;\n}\n\nconst renderFilters = () => (');

// 2. The mobile drawer is currently trapped in a rogue `return` block at the end of `renderFilters`.
// Wait, `renderFilters` returns JSX starting with `<aside>` and ending with `</aside>`.
// So the `);` after `</aside>` correctly closes `renderFilters`.
// Let's find exactly where it closes:
const badReturnRegex = /return\s*\(\s*<main className=\"min-h-screen flex items-center justify-center\">\s*Loading\.\.\.\s*(\{\/\* MOBILE FILTER DRAWER \*\/\}[\s\S]*?\})\s*<\/main>\s*\);\s*\}/;

const match = code.match(badReturnRegex);
if (match) {
  const drawerCode = match[1];
  
  // Remove the rogue return block entirely
  code = code.replace(badReturnRegex, '');
  
  // Find where to insert the drawer code (before <Footer />)
  code = code.replace(/<Footer \/>/, drawerCode + '\n      <Footer />');
  console.log('Fixed drawer placement!');
} else {
  console.log('Drawer block not found or already fixed.');
}

fs.writeFileSync('app/companies/page.tsx', code);
console.log('Done fixing companies page');
