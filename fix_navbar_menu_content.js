const fs = require('fs');

let code = fs.readFileSync('components/Navbar.tsx', 'utf8');

// 1. Fix Set Display Name click
code = code.replace(
  'router.push(`/profile/${currentUser.username}`);',
  'router.push(`/profile/${currentUser.username}?highlight=displayName`);'
);

// 2. Rewrite MOBILE MENU completely
const mobileMenuStart = code.indexOf('{/* MOBILE MENU */}');
const mobileMenuEndStr = ')}';
const mobileMenuEnd = code.indexOf(mobileMenuEndStr, code.indexOf('</div>', mobileMenuStart)) + mobileMenuEndStr.length;

const newMobileMenu = `{/* MOBILE MENU */}
{mobileMenuOpen && (
  <div className="absolute top-full left-0 w-full bg-black text-white border-t border-gray-800 md:hidden z-50 shadow-2xl flex flex-col">
    <Link href="/" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Home</Link>
    <Link href="/jobs" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Jobs</Link>
    <Link href="/companies" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Companies</Link>
    <Link href="/internships" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Internships</Link>
    <Link href="/resources" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Resources</Link>
    <Link href="/practice-exams" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Practice Exams</Link>
    
    {!currentUser && (
      <div className="flex bg-gray-900">
        <button
          onClick={() => {
            setAuthTab("login");
            setShowAuthPopup(true);
            setMobileMenuOpen(false);
          }}
          className="flex-1 text-center px-6 py-4 font-bold hover:bg-gray-800 transition border-r border-gray-800"
        >
          Login
        </button>
        <button
          onClick={() => {
            setAuthTab("register");
            setShowAuthPopup(true);
            setMobileMenuOpen(false);
          }}
          className="flex-1 text-center px-6 py-4 font-bold hover:bg-gray-800 transition"
        >
          Register
        </button>
      </div>
    )}
  </div>
)}`;

// We know mobileMenuBlock is currently wrapped, let's just do a string replacement.
// Let's actually use a regex to replace everything between {/* MOBILE MENU */} and the end of that block.

let newCode = code.substring(0, mobileMenuStart) + newMobileMenu + '\n\n' + code.substring(mobileMenuEnd);
// Wait, the mobileMenuEnd might be hard to calculate accurately.
// Let's just do it with substring index of `<nav>` end.
const navEnd = code.lastIndexOf('</nav>', code.indexOf('{/* AUTH POPUP */}'));
let insideNav = code.substring(0, navEnd);
const mobileMenuMatch = insideNav.indexOf('{/* MOBILE MENU */}');
if (mobileMenuMatch > -1) {
    insideNav = insideNav.substring(0, mobileMenuMatch) + newMobileMenu;
}
newCode = insideNav + '\n</nav>\n' + code.substring(navEnd + 6);

// Clean up double backticks and dollars if any (none in this script)
fs.writeFileSync('components/Navbar.tsx', newCode);
console.log('Mobile menu updated in Navbar');
