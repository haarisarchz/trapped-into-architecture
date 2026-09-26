const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const regex = /if \(loggedProfile\?\.id === job\.author_id\) \{\s*return job\.profiles\.display_name/s;

const replacement = `const isViewerCEO = (loggedProfile?.role || "").toLowerCase().replace(/[\\s_]+/g, "") === "ceo";
    if (isViewerCEO || loggedProfile?.id === job.author_id) {
      return job.profiles.display_name`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/admin/jobs/page.tsx', content);
  console.log("Success with small regex");
} else {
  console.log("Small regex failed");
}