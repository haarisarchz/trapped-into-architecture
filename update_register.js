const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

const oldCode = `          alert("Account created successfully!");

          setShowAuthPopup(false);

          router.push(\`/profile/\${username}\`);`;

const newCode = `          alert("Account created successfully! Please log in.");
          
          // The user explicitly requested to NOT auto-login. Supabase auto-logs in if email confirmation is off, so we sign out immediately.
          await supabase.auth.signOut();

          setAuthTab("login");`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('components/Navbar.tsx', content);
console.log("Updated register logic in Navbar");