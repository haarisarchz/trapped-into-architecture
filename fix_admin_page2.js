const fs = require("fs");
let code = fs.readFileSync("app/admin/page.tsx", "utf8");

code = code.replace(
  /if \(\s*error \|\|\s*!profile \|\|\s*profile\.role !== \"CEO\"\s*\)/,
  `const allowedRoles = ["super_admin", "super admin", "admin", "ceo"];\n  if (error || !profile || !allowedRoles.includes((profile.role || "").toLowerCase().trim()))`
);

fs.writeFileSync("app/admin/page.tsx", code);

let navCode = fs.readFileSync("components/Navbar.tsx", "utf8");
navCode = navCode.replace(
  /\["ceo", "admin", "super_admin", "super admin", "superadmin", "owner"\]\.includes/g,
  `["super_admin", "super admin", "admin", "ceo"].includes`
);
fs.writeFileSync("components/Navbar.tsx", navCode);

