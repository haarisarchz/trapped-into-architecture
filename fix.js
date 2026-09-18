const fs = require("fs");
let code = fs.readFileSync("app/admin/jobs/page.tsx", "utf8");
code = code.replace("const statusFilter =\r\n  searchParams.get(\"status\");", "const statusFilter = searchParams.get(\"status\");\nconst typeFilter = searchParams.get(\"type\");");
code = code.replace("const statusFilter =\n  searchParams.get(\"status\");", "const statusFilter = searchParams.get(\"status\");\nconst typeFilter = searchParams.get(\"type\");");
fs.writeFileSync("app/admin/jobs/page.tsx", code);

