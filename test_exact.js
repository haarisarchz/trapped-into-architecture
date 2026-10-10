const fs = require('fs');
let content = fs.readFileSync('app/internships/page.tsx', 'utf8');

const target = '  return (\n    <main className="min-h-screen bg-gray-100 text-black">';
console.log("Target string found?", content.includes(target));

if (!content.includes(target)) {
  console.log("Here is what return main looks like:");
  const mainMatch = content.match(/return\s*\(\s*<main[\s\S]*?>/);
  console.log(mainMatch ? mainMatch[0] : "Not found");
}
