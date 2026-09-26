const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const oldLogic = `  if (!job.profiles) return "—";
    if (loggedProfile?.id === job.author_id) {
      return job.profiles.display_name || job.profiles.full_name || job.profiles.username || "Admin";
    }
    const pRole = (job.profiles.role || "").toLowerCase().replace(/[\\s_]+/g, "");
    if (pRole === "ceo") return "CEO";
    if (pRole === "superadmin") return "Super Admin";
    return "Admin";`;

const newLogic = `  if (!job.profiles) return "—";
    const isViewerCEO = (loggedProfile?.role || "").toLowerCase().replace(/[\\s_]+/g, "") === "ceo";
    if (isViewerCEO || loggedProfile?.id === job.author_id) {
      return job.profiles.display_name || job.profiles.full_name || job.profiles.username || "Admin";
    }
    const pRole = (job.profiles.role || "").toLowerCase().replace(/[\\s_]+/g, "");
    if (pRole === "ceo") return "CEO";
    if (pRole === "superadmin") return "Super Admin";
    return "Admin";`;

if (content.includes(oldLogic)) {
  content = content.replace(oldLogic, newLogic);
  fs.writeFileSync('app/admin/jobs/page.tsx', content);
  console.log("Success updating Manage Jobs UI");
} else {
  console.log("Old logic not found in Manage Jobs");
}
