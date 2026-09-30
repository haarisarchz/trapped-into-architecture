const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

const regex = /alert\("Account created successfully!"\);\s*setShowAuthPopup\(false\);\s*router\.push\(\`\/profile\/\$\{username\}\`\);/g;

const newCode = `alert("Account created successfully! Please log in.");
          await supabase.auth.signOut();
          setAuthTab("login");`;

if (regex.test(content)) {
  content = content.replace(regex, newCode);
  fs.writeFileSync('components/Navbar.tsx', content);
  console.log("Updated register logic in Navbar successfully.");
} else {
  console.log("Regex didn't match anything!");
}