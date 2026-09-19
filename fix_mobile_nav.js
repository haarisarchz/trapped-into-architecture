const fs = require('fs');

const navbarPath = 'components/Navbar.tsx';
let navbar = fs.readFileSync(navbarPath, 'utf8');

// The mobile menu ends with:
const practiceExamsLink = `<Link
      href="/practice-exams"
      className="block px-6 py-1 border-b border-gray-800"
      onClick={() => setMobileMenuOpen(false)}
    >
      Practice Exams
    </Link>`;

const contactLink = `<Link
      href="/contact"
      className="block px-6 py-1 border-b border-gray-800"
      onClick={() => setMobileMenuOpen(false)}
    >
      Contact
    </Link>`;

const mobileLoginCode = `{currentUser ? (
      <button
        onClick={() => {
          localStorage.removeItem("currentUser");
          window.location.href = "/";
        }}
        className="block px-6 py-4 text-red-400 font-bold"
      >
        Logout
      </button>
    ) : (
      <button
        onClick={() => {
          setMobileMenuOpen(false);
          setShowAuthPopup(true);
        }}
        className="block px-6 py-4 text-white font-bold"
      >
        Login / Register
      </button>
    )}`;

// Create the new mobile menu section
const mobileMyAccountCode = `
    {/* MOBILE MY ACCOUNT */}
    {currentUser && (
      <div className="border-b border-gray-800 bg-gray-900 pb-2">
        <div className="px-6 py-3 font-bold text-gray-400 text-sm tracking-wider">
          MY ACCOUNT
        </div>
        
        <Link
          href={\`/profile/\${currentUser.username}\`}
          className="block px-6 py-3 hover:bg-gray-800 transition"
          onClick={() => setMobileMenuOpen(false)}
        >
          My Profile
        </Link>
        
        {currentUser?.role && ["superadmin", "admin", "ceo"].includes((currentUser.role || "").toLowerCase().replace(/[\\s_]+/g, "")) && (
          <>
            <Link
              href="/admin"
              className="block px-6 py-3 hover:bg-gray-800 transition text-white font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin Dashboard
            </Link>
            <Link
              href="/admin/add-job"
              className="block px-6 py-3 hover:bg-gray-800 transition text-white font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Add New Job
            </Link>
          </>
        )}
      </div>
    )}
`;

// Insert the code
if (!navbar.includes('MY ACCOUNT')) {
  navbar = navbar.replace(
    contactLink,
    contactLink + '\n' + mobileMyAccountCode
  );
  fs.writeFileSync(navbarPath, navbar);
  console.log('✅ Added mobile My Account section');
}
