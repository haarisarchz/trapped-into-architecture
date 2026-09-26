const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const regex = /if \(!job\.profiles\) return "\?";\s*if \(loggedProfile\?\.id === job\.author_id\) \{\s*return job\.profiles\.display_name \|\| job\.profiles\.full_name \|\| job\.profiles\.username \|\| "Admin";\s*\}\s*const pRole = \(job\.profiles\.role \|\| ""\)\.toLowerCase\(\)\.replace\(\/\[\\s_\]\+\/g, ""\);\s*if \(pRole === "ceo"\) return "CEO";\s*if \(pRole === "superadmin"\) return "Super Admin";\s*return "Admin";/s;

const newLogic = `if (!job.profiles) return "—";
    const isViewerCEO = (loggedProfile?.role || "").toLowerCase().replace(/[\\s_]+/g, "") === "ceo";
    if (isViewerCEO || loggedProfile?.id === job.author_id) {
      return job.profiles.display_name || job.profiles.full_name || job.profiles.username || "Admin";
    }
    const pRole = (job.profiles.role || "").toLowerCase().replace(/[\\s_]+/g, "");
    if (pRole === "ceo") return "CEO";
    if (pRole === "superadmin") return "Super Admin";
    return "Admin";`;

if (regex.test(content)) {
  content = content.replace(regex, newLogic);
  fs.writeFileSync('app/admin/jobs/page.tsx', content);
  console.log("Success updating Manage Jobs UI with Regex");
} else {
  console.log("Regex not found");
}
