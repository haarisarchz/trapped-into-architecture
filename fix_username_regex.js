const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

const regex = /\/\* DEMO EXISTING USERNAMES \*\/[\s\S]*?usernameMessage\.className =\s*"text-sm mt-2 text-green-600";\s*\}/;

const newUsernameLogic = `
        if (value.length < 5) {
          usernameMessage.innerHTML = "Minimum 5 characters required";
          usernameMessage.className = "text-sm mt-2 text-red-500";
        } else if (value.length > 12) {
          usernameMessage.innerHTML = "Maximum 12 characters allowed";
          usernameMessage.className = "text-sm mt-2 text-red-500";
        } else if (!validPattern.test(value)) {
          usernameMessage.innerHTML = "Only letters, numbers, dots and underscore allowed";
          usernameMessage.className = "text-sm mt-2 text-red-500";
        } else {
          usernameMessage.innerHTML = "Checking availability...";
          usernameMessage.className = "text-sm mt-2 text-gray-500";
          
          supabase.from('profiles').select('username').ilike('username', value).maybeSingle().then(({ data }) => {
            if (data) {
              usernameMessage.innerHTML = "Username already taken";
              usernameMessage.className = "text-sm mt-2 text-red-500";
            } else {
              usernameMessage.innerHTML = "Username available ✓";
              usernameMessage.className = "text-sm mt-2 text-green-600";
            }
          });
        }`;

if (regex.test(content)) {
  content = content.replace(regex, newUsernameLogic);
  fs.writeFileSync('components/Navbar.tsx', content);
  console.log("Replaced username logic using regex");
} else {
  console.log("Username regex failed to match");
}