const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

const oldEmailLogic = `        const existingEmails = [
          "admin@gmail.com",
          "test@gmail.com"
        ];

        const validEmail =
          /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

        if (!validEmail.test(value)) {

          emailMessage.innerHTML =
            "Enter valid email address";

          emailMessage.className =
            "text-sm mt-2 text-red-500";

        } else if (
          existingEmails.includes(value)
        ) {

          emailMessage.innerHTML =
            "Email already registered";

          emailMessage.className =
            "text-sm mt-2 text-red-500";

        } else {

          emailMessage.innerHTML =
            "Email available ✓";

          emailMessage.className =
            "text-sm mt-2 text-green-600";

        }`;

const newEmailLogic = `        const validEmail = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

        if (!validEmail.test(value)) {
          emailMessage.innerHTML = "Enter valid email address";
          emailMessage.className = "text-sm mt-2 text-red-500";
        } else {
          emailMessage.innerHTML = "Checking availability...";
          emailMessage.className = "text-sm mt-2 text-gray-500";
          
          supabase.from('profiles').select('email').ilike('email', value).maybeSingle().then(({ data }) => {
            if (data) {
              emailMessage.innerHTML = "Email already registered";
              emailMessage.className = "text-sm mt-2 text-red-500";
            } else {
              emailMessage.innerHTML = "Email available ✓";
              emailMessage.className = "text-sm mt-2 text-green-600";
            }
          });
        }`;

content = content.replace(oldEmailLogic, newEmailLogic);
fs.writeFileSync('components/Navbar.tsx', content);
console.log("Updated email logic");