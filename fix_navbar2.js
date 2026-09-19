const fs = require('fs');

const navbarPath = 'components/Navbar.tsx';
let navbar = fs.readFileSync(navbarPath, 'utf8');

// I need to add Admin Dashboard and Add New Job to the mobile menu.
// The existing mobile menu auth block looks like:
/*
      <>
        <button
          onClick={() => {
            router.push(`/profile/${currentUser.username}`);
            setMobileMenuOpen(false);
          }}
          className="w-full text-left px-6 py-1 border-b border-gray-800"
        >
          My Profile
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("currentUser");
            window.location.href = "/";
          }}
          className="w-full text-left px-6 py-1 text-red-400"
        >
          Logout
        </button>
      </>
*/

const adminMobileLinks = `
        {currentUser?.role && ["superadmin", "admin", "ceo"].includes((currentUser.role || "").toLowerCase().replace(/[\\s_]+/g, "")) && (
          <>
            <button
              onClick={() => {
                router.push("/admin");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-6 py-2 border-b border-gray-800 text-red-500 font-semibold"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => {
                router.push("/admin/add-job");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-6 py-2 border-b border-gray-800 text-red-500 font-semibold"
            >
              Add New Job
            </button>
          </>
        )}
`;

// Also, the user wants "My Profile" highlighted in red.
const myProfileSearch = `className="w-full text-left px-6 py-1 border-b border-gray-800"
        >
          My Profile
        </button>`;
const myProfileReplace = `className="w-full text-left px-6 py-2 border-b border-gray-800 text-red-500 font-semibold"
        >
          My Profile
        </button>
${adminMobileLinks}`;

navbar = navbar.replace(myProfileSearch, myProfileReplace);

// Let's also do it for the desktop dropdown menu
const desktopProfileSearch = `className="w-full text-left px-5 py-4 hover:bg-gray-100"
        >
          My Profile
        </button>`;
const desktopProfileReplace = `className="w-full text-left px-5 py-4 hover:bg-red-50 text-red-500 font-semibold"
        >
          My Profile
        </button>`;
navbar = navbar.replace(desktopProfileSearch, desktopProfileReplace);

fs.writeFileSync(navbarPath, navbar);
console.log('✅ Updated Navbar with admin mobile links and red profile links');
