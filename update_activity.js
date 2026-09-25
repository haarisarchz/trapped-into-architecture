const fs = require('fs');
let c = fs.readFileSync('app/admin/activity/page.tsx', 'utf-8');

c = c.replace(/const displayAdmins = useMemo\(\(\) => \{\s*if \(userRole !== "ceo"\) return admins;\s*if \(selectedAdminId === "all"\) return admins;\s*return admins\.filter\(a => a\.id === selectedAdminId\);\s*\}, \[admins, selectedAdminId, userRole\]\);/, 'const displayAdmins = useMemo(() => {\\n  if (userRole !== "ceo") return admins.filter(a => a.id === currentUser?.id);\\n  if (selectedAdminId === "all") return admins;\\n  return admins.filter(a => a.id === selectedAdminId);\\n}, [admins, selectedAdminId, userRole, currentUser]);');

fs.writeFileSync('app/admin/activity/page.tsx', c);
console.log('Fixed activity list');