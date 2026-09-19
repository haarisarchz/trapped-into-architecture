const fs = require('fs');

const profilePath = 'app/profile/[username]/page.tsx';
let profileCode = fs.readFileSync(profilePath, 'utf8');

// The block to remove is:
/*
{["CEO", "super_admin", "admin"].includes(user.role) && (
  <button
    onClick={() => router.push("/admin")}
    className="w-full mt-4 bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition"
  >
    Admin Dashboard
  </button>
)}
*/

profileCode = profileCode.replace(/\{\[\"CEO\"[\s\S]*?Admin Dashboard\s*<\/button>\s*\)\}/, '');
fs.writeFileSync(profilePath, profileCode);
console.log('✅ Removed Admin Dashboard from Profile page');
