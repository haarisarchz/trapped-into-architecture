const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

const regex = /const existingEmails = \[\s*"admin@gmail\.com",\s*"test@gmail\.com"\s*\];[\s\S]*?emailMessage\.className =\s*"text-sm mt-2 text-green-600";\s*\}/;

const newEmailLogic = `const validEmail = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
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

if (regex.test(content)) {
  content = content.replace(regex, newEmailLogic);
  fs.writeFileSync('components/Navbar.tsx', content);
  console.log("Replaced email logic using regex");
} else {
  console.log("Email regex failed to match");
}