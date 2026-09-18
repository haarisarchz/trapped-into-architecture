const fs = require("fs");
let code = fs.readFileSync("components/Navbar.tsx", "utf8");

code = code.replace(
  /username:\s*profile\.username,?\s*\n\s*\}/g,
  `username: profile.username,\n        role: profile.role,\n      }`
);

fs.writeFileSync("components/Navbar.tsx", code);

