const fs = require("fs");
let code = fs.readFileSync("app/admin/page.tsx", "utf8");

code = code.replace(
  `  if (\n    error ||\n    !profile ||\n    profile.role !== "CEO"\n  ) {`,
  `  const allowedRoles = ["ceo", "admin", "super_admin", "superadmin", "super admin"];\n  if (\n    error ||\n    !profile ||\n    !allowedRoles.includes((profile.role || "").toLowerCase().trim())\n  ) {`
);

fs.writeFileSync("app/admin/page.tsx", code);

