const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// 1. Remove contact method dropdown HTML block using regex
const regexDropdown = /\{\/\* SELECT METHOD \*\/\}(.|\n)*?<\/select>\s*<\/div>/g;
if (regexDropdown.test(content)) {
  content = content.replace(regexDropdown, '');
  console.log("Successfully matched and removed dropdown");
} else {
  console.log("Failed to match dropdown");
}

fs.writeFileSync('components/Navbar.tsx', content);