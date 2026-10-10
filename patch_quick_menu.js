const fs = require('fs');
let content = fs.readFileSync('components/admin/AdminQuickMenu.tsx', 'utf8');

// Normalize role setting
content = content.replace(
    'if (profile) setUserRole(profile.role);',
    'if (profile) setUserRole((profile.role || "").toLowerCase().replace(/[\\s_]+/g, ""));'
);

// Update userRole checks
content = content.replace(/userRole !== "job_admin"/g, 'userRole !== "jobadmin"');
content = content.replace(/userRole === "super_admin"/g, 'userRole === "superadmin"');

fs.writeFileSync('components/admin/AdminQuickMenu.tsx', content);
console.log("Updated AdminQuickMenu RBAC logic");
