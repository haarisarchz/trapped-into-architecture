const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// 1. Replace Username Logic
const oldUsernameLogic = `      /* DEMO EXISTING USERNAMES */

      const takenUsernames = [
        "admin",
        "john123",
        "architecture",
        "designer"
      ];

      if (value.length < 5) {

        usernameMessage.innerHTML =
          "Minimum 5 characters required";

        usernameMessage.className =
          "text-sm mt-2 text-red-500";

      } else if (value.length > 12) {

        usernameMessage.innerHTML =
          "Maximum 12 characters allowed";

        usernameMessage.className =
          "text-sm mt-2 text-red-500";

      } else if (!validPattern.test(value)) {

        usernameMessage.innerHTML =
          "Only letters, numbers, dots and underscore allowed";

        usernameMessage.className =
          "text-sm mt-2 text-red-500";

      } else if (
        takenUsernames.includes(value)
      ) {

        usernameMessage.innerHTML =
          "Username already taken";

        usernameMessage.className =
          "text-sm mt-2 text-red-500";

      } else {

        usernameMessage.innerHTML =
          "Username available ✓";

        usernameMessage.className =
          "text-sm mt-2 text-green-600";

      }`;

const newUsernameLogic = `      if (value.length < 5) {
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

content = content.replace(oldUsernameLogic, newUsernameLogic);

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Updated username logic");