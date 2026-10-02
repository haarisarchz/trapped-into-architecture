const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

file = file.replace(/if \(job\.apply_link\) \{\s*setApplicationType\("apply"\);\s*setapply_link\(job\.apply_link\);\s*\} else if \(job\.application_email\) \{\s*setApplicationType\("email"\);\s*setapplication_email\(job\.application_email\);\s*\}/, 
`if (job.apply_link && job.apply_link.trim() !== "") {
          setApplicationType("apply");
          setapply_link(job.apply_link);
        } else if (job.application_email && job.application_email.trim() !== "") {
          setApplicationType("email");
          setapplication_email(job.application_email);
        } else {
          setApplicationType("apply");
          setapply_link("");
        }`);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Fixed apply logic via regex");
