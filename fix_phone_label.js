const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

const regex = /<label className="block mb-2 font-medium">\s*Phone Number\s*<span className="text-red-500">\s*\{"\s*"\}\*\s*<\/span>\s*<\/label>/;

const newLabel = `<label className="block mb-2 font-medium">
    Phone Number <span className="text-sm font-normal text-gray-500">(Optional)</span>
  </label>`;

if (regex.test(content)) {
  content = content.replace(regex, newLabel);
  fs.writeFileSync('components/Navbar.tsx', content);
  console.log("Successfully removed asterisk and added (Optional)");
} else {
  console.log("Failed to match the phone label regex");
}