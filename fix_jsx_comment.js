const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// The JSX comment got mangled into `{/* CONTACT METHOD */` followed by JS code
content = content.replace(
  /\{\/\* CONTACT METHOD \*\/[\s\S]*?const fullPhone = countryCode \+ phone;/,
  `{/* CONTACT METHOD */}`
);

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Restored JSX comment");