const fs = require('fs');

let code = fs.readFileSync('app/admin/page.tsx', 'utf8');

const oldCheck = /const allowedRoles = \["superadmin", "admin", "ceo"\];\s*if \(error \|\| !profile \|\| !allowedRoles\.includes\(\(profile\.role \|\| ""\)\.toLowerCase\(\)\.replace\(\/\[\\s_\]\+\/g, ""\)\)\) \{\s*router\.push\("\/"\);\s*return;\s*\}/;

const newCheck = `const allowedRoles = ["superadmin", "admin", "ceo"];
  const normalizedRole = (profile?.role || "").toLowerCase().replace(/[\\s_]+/g, "");
  
  if (error || !profile || !allowedRoles.includes(normalizedRole)) {
    router.push("/");
    return;
  }
  
  // Actually set the userRole so the UI buttons render!
  setUserRole(normalizedRole);`;

if (code.match(oldCheck)) {
  code = code.replace(oldCheck, newCheck);
  fs.writeFileSync('app/admin/page.tsx', code);
}
