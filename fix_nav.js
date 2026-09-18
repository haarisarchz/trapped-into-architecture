const fs = require("fs");
let code = fs.readFileSync("components/Navbar.tsx", "utf8");
code = code.replace(
  "{[\"CEO\", \"admin\", \"super_admin\"].includes(currentUser.role) && (",
  "{currentUser?.role && [\"ceo\", \"admin\", \"super_admin\", \"owner\"].includes(currentUser.role.toLowerCase()) && ("
);
code = code.replace(
  "[\"CEO\", \"admin\", \"super_admin\"].includes(currentUser.role);",
  "currentUser?.role && [\"ceo\", \"admin\", \"super_admin\", \"owner\"].includes(currentUser.role.toLowerCase());"
);
fs.writeFileSync("components/Navbar.tsx", code);

