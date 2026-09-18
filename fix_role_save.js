const fs = require("fs");
let code = fs.readFileSync("components/Navbar.tsx", "utf8");

code = code.replace(
  `        email: profile.email,\n        username: profile.username,\n      })`,
  `        email: profile.email,\n        username: profile.username,\n        role: profile.role,\n      })`
);

fs.writeFileSync("components/Navbar.tsx", code);

