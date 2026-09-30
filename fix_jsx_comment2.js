const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// The JSX comment got mangled into `{/* EMAIL IS COMPULSORY, PHONE IS OPTIONAL */` followed by JS code
content = content.replace(
  /\{\/\* EMAIL IS COMPULSORY, PHONE IS OPTIONAL \*\/[\s\S]*?let fullPhone = null;[\s\S]*?fullPhone = countryCode \+ phone;\s*\}/,
  `{/* CONTACT METHOD */}`
);

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Restored JSX comment");