const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

const navRegex = /<Link href="\/internships" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick=\{\(\) => setMobileMenuOpen\(false\)\}>Internships<\/Link>/;

const replacement = `<Link href="/internships" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Internships</Link>
      <Link href="/contact" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Contact</Link>`;

content = content.replace(navRegex, replacement);
fs.writeFileSync('components/Navbar.tsx', content);
console.log("Updated Mobile Nav");