const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

const regex = /\/\* DEMO EXISTING NUMBERS \*\/[\s\S]*?phoneMessage\.className =\s*"text-sm mt-2 text-green-600";\s*\}/;

const newPhoneLogic = `
        const validPhone = /^[0-9]{10}$/;
        if (!validPhone.test(value)) {
          phoneMessage.innerHTML = "Enter 10-digit number";
          phoneMessage.className = "text-sm mt-2 text-red-500";
        } else {
          phoneMessage.innerHTML = "Checking availability...";
          phoneMessage.className = "text-sm mt-2 text-gray-500";
          
          supabase.from('profiles').select('phone').eq('phone', fullPhone).maybeSingle().then(({ data }) => {
            if (data) {
              phoneMessage.innerHTML = "Phone number already registered";
              phoneMessage.className = "text-sm mt-2 text-red-500";
            } else {
              phoneMessage.innerHTML = "Phone available ✓";
              phoneMessage.className = "text-sm mt-2 text-green-600";
            }
          });
        }`;

if (regex.test(content)) {
  content = content.replace(regex, newPhoneLogic);
  fs.writeFileSync('components/Navbar.tsx', content);
  console.log("Replaced phone logic using regex");
} else {
  console.log("Phone regex failed to match");
}