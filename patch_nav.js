const fs = require('fs');
let nav = fs.readFileSync('components/Navbar.tsx', 'utf8');

// The desktop links block usually looks like:
// <div className="hidden lg:flex items-center gap-6">
//   <Link href="/jobs" ...>Jobs</Link>
//   <Link href="/companies" ...>Companies</Link>
//   <Link href="/internships" ...>Internships</Link>
// </div>

const desktopLinksPattern = /<div className="hidden md:flex items-center gap-8">([\s\S]*?)<\/div>/;
const match = nav.match(desktopLinksPattern);
if (match) {
  // Let's just recreate the entire block to be clean
  const newBlock = `
        <div className="hidden md:flex items-center gap-8">
          <Link href="/jobs" className="text-gray-900 font-medium hover:text-gray-500 transition">Jobs</Link>
          <Link href="/companies" className="text-gray-900 font-medium hover:text-gray-500 transition">Companies</Link>
          <Link href="/internships" className="text-gray-900 font-medium hover:text-gray-500 transition">Internships</Link>
          <Link href="/resources" className="text-gray-900 font-medium hover:text-gray-500 transition">Resources</Link>
          <Link href="/practice-exams" className="text-gray-900 font-medium hover:text-gray-500 transition">Practice Exam</Link>
          <Link href="/about" className="text-gray-900 font-medium hover:text-gray-500 transition">About Us</Link>
          <Link href="/contact" className="text-gray-900 font-medium hover:text-gray-500 transition">Contact Us</Link>
        </div>
  `;
  nav = nav.replace(match[0], newBlock.trim());
}

// Mobile menu links are inside the `<div className="mt-8 flex flex-col">` or similar
const mobileLinksPattern = /<div className="mt-8 flex flex-col">([\s\S]*?)<\/div>\s*<div className="mt-8 pt-8 border-t border-gray-100">/;
const matchMobile = nav.match(mobileLinksPattern);
if (matchMobile) {
  const newMobileBlock = `
          <div className="mt-8 flex flex-col">
            <Link href="/" className="block px-6 py-4 border-b border-gray-100 text-lg hover:bg-gray-50 transition" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/jobs" className="block px-6 py-4 border-b border-gray-100 text-lg hover:bg-gray-50 transition" onClick={() => setMobileMenuOpen(false)}>Jobs</Link>
            <Link href="/companies" className="block px-6 py-4 border-b border-gray-100 text-lg hover:bg-gray-50 transition" onClick={() => setMobileMenuOpen(false)}>Companies</Link>
            <Link href="/internships" className="block px-6 py-4 border-b border-gray-100 text-lg hover:bg-gray-50 transition" onClick={() => setMobileMenuOpen(false)}>Internships</Link>
            <Link href="/resources" className="block px-6 py-4 border-b border-gray-100 text-lg hover:bg-gray-50 transition" onClick={() => setMobileMenuOpen(false)}>Resources</Link>
            <Link href="/practice-exams" className="block px-6 py-4 border-b border-gray-100 text-lg hover:bg-gray-50 transition" onClick={() => setMobileMenuOpen(false)}>Practice Exam</Link>
            <Link href="/about" className="block px-6 py-4 border-b border-gray-100 text-lg hover:bg-gray-50 transition" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
            <Link href="/contact" className="block px-6 py-4 border-b border-gray-100 text-lg hover:bg-gray-50 transition" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
          </div>
  `;
  nav = nav.replace(matchMobile[1], newMobileBlock.replace('<div className="mt-8 flex flex-col">', '').replace('</div>', ''));
} else {
  // Try another pattern
  const altPattern = /<div className="py-6 flex flex-col border-b border-gray-800">([\s\S]*?)<\/div>/;
  const matchAlt = nav.match(altPattern);
  if (matchAlt) {
    const newMobileBlock = `
            <Link href="/" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/jobs" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Jobs</Link>
            <Link href="/companies" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Companies</Link>
            <Link href="/internships" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Internships</Link>
            <Link href="/resources" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Resources</Link>
            <Link href="/practice-exams" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Practice Exam</Link>
            <Link href="/about" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
            <Link href="/contact" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
    `;
    nav = nav.replace(matchAlt[1], newMobileBlock);
  }
}

fs.writeFileSync('components/Navbar.tsx', nav);

let footer = fs.readFileSync('components/Footer.tsx', 'utf8');
const quickLinksPattern = /<h3 className="text-white font-bold mb-4">Quick Links<\/h3>\s*<ul className="space-y-3">([\s\S]*?)<\/ul>/;
const matchFooter = footer.match(quickLinksPattern);
if (matchFooter) {
  const newFooterLinks = `
            <li><Link href="/jobs" className="hover:text-white transition">Architecture Jobs</Link></li>
            <li><Link href="/internships" className="hover:text-white transition">Internships</Link></li>
            <li><Link href="/companies" className="hover:text-white transition">Companies</Link></li>
            <li><Link href="/resources" className="hover:text-white transition">Resources</Link></li>
            <li><Link href="/practice-exams" className="hover:text-white transition">Practice Exam</Link></li>
            <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link></li>
  `;
  footer = footer.replace(matchFooter[1], newFooterLinks);
}
fs.writeFileSync('components/Footer.tsx', footer);

console.log('Fixed Navbar and Footer links');
