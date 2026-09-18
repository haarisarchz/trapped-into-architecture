const fs = require("fs");
let code = fs.readFileSync("app/admin/jobs/page.tsx", "utf8");
code = code.replace(
  "const statusFilter =\n  searchParams.get(\"status\");",
  "const statusFilter = searchParams.get(\"status\");\n  const typeFilter = searchParams.get(\"type\");"
);
fs.writeFileSync("app/admin/jobs/page.tsx", code);

