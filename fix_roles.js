const fs = require("fs");
let code = fs.readFileSync("components/Navbar.tsx", "utf8");

code = code.replace(
  /\["ceo", "admin", "super_admin", "owner"\]\.includes\(currentUser\.role\.toLowerCase\(\)\)/g,
  `["ceo", "admin", "super_admin", "super admin", "superadmin", "owner"].includes(currentUser.role.toLowerCase().trim())`
);

fs.writeFileSync("components/Navbar.tsx", code);

