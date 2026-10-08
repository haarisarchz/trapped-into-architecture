const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

const t1 = `          {currentUser ? (
          (currentUser.displayName && currentUser.displayName.trim() !== "" && currentUser.profession && currentUser.profession.trim() !== "") ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className="font-semibold text-gray-200 hover:text-white transition flex items-center gap-1"
                aria-label="Open account menu"
              >
                {currentUser.displayName}`;

const r1 = `          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className="font-semibold text-gray-200 hover:text-white transition flex items-center gap-1"
                aria-label="Open account menu"
              >
                {currentUser.displayName || currentUser.username || "Profile"}`;

content = content.replace(t1, r1);

const t2 = `            </div>
          ) : (
            <button 
              onClick={() => {
                router.push(\`/profile/\${currentUser.username}\`);
              }} 
              className="text-red-400 font-bold hover:text-red-300 transition"
            >Complete Profile</button>
          )
        ) : (`;

const r2 = `            </div>
        ) : (`;

content = content.replace(t2, r2);

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Done");
