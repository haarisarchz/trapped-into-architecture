const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

content = content.replace(/>\s*Admin Dashboard\s*<\/button>/g, '>Admin Panel</button>');

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Renamed Admin Dashboard to Admin Panel in Navbar");
