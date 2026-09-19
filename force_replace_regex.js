const fs = require('fs');

let navbar = fs.readFileSync('components/Navbar.tsx', 'utf8');

// The mobile menu chunk:
//         <button
//           onClick={() => {
//             router.push(`/profile/${currentUser.username}`);
//             setMobileMenuOpen(false);
//           }}
//           className="w-full text-left px-6 py-1 border-b border-gray-800"
//         >
//           My Profile
//         </button>

navbar = navbar.replace(
  /className="w-full text-left px-6 py-1 border-b border-gray-800"\s*>\s*My Profile\s*<\/button>/g,
  `className="w-full text-left px-6 py-3 border-b border-gray-800 text-red-500 font-bold"
        >
          My Profile
        </button>
        
        {currentUser?.role && ["superadmin", "admin", "ceo"].includes((currentUser.role || "").toLowerCase().replace(/[\\s_]+/g, "")) && (
          <>
            <button
              onClick={() => {
                router.push("/admin");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-6 py-3 border-b border-gray-800 font-bold text-red-500"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => {
                router.push("/admin/add-job");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-6 py-3 border-b border-gray-800 font-bold text-red-500"
            >
              Add New Job
            </button>
          </>
        )}`
);

// The desktop chunk:
navbar = navbar.replace(
  /className="w-full text-left px-5 py-4 hover:bg-gray-100"\s*>\s*My Profile\s*<\/button>/g,
  `className="w-full text-left px-5 py-4 hover:bg-red-50 text-red-500 font-bold"
        >
          My Profile
        </button>`
);

fs.writeFileSync('components/Navbar.tsx', navbar);
console.log('✅ Replaced using regex!');
