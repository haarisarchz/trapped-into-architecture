const fs = require('fs');
let c = fs.readFileSync('app/admin/jobs/page.tsx', 'utf-8');

const regex = /\{\(\(\) => \{\s*if \(!job\.profiles\) return '[^']+';\s*const myRole = [^;]+;\s*if \(myRole === 'ceo'\) \{\s*return [^;]+;\s*\}\s*if \(loggedProfile\?\.id === job\.author_id\) \{\s*return [^;]+;\s*\}\s*const pRole = [^;]+;\s*if \(pRole === 'ceo'\) return 'CEO';\s*if \(pRole === 'superadmin'\) return 'Super Admin';\s*return 'Admin';\s*\}\)\(\)\}/m;

const replacement = '{(() => {\\n' +
'  if (!job.profiles) return "—";\\n' +
'  if (loggedProfile?.id === job.author_id) {\\n' +
'    return job.profiles.display_name || job.profiles.full_name || job.profiles.username || "Admin";\\n' +
'  }\\n' +
'  const pRole = (job.profiles.role || "").toLowerCase().replace(/[\\\\s_]+/g, "");\\n' +
'  if (pRole === "ceo") return "CEO";\\n' +
'  if (pRole === "superadmin") return "Super Admin";\\n' +
'  return "Admin";\\n' +
'})()}';

c = c.replace(regex, replacement);
fs.writeFileSync('app/admin/jobs/page.tsx', c);
console.log('Fixed posted by');