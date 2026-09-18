const fs = require("fs");
let code = fs.readFileSync("app/admin/companies/page.tsx", "utf8");
code = code.replace(
  "{c.city} {c.state ? `\\`, \\${c.state}\\`` : \"\"}",
  "{c.city} {c.state ? `, ${c.state}` : \"\"}"
);
// just brute force it since the slash is literal in the file:
code = code.split("\n");
code[70] = "                      {c.city} {c.state ? `, ${c.state}` : \"\"}";
fs.writeFileSync("app/admin/companies/page.tsx", code.join("\n"));

