const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const oldLogic = `        if (job.apply_link) {
          setApplicationType("apply");
          setapply_link(job.apply_link);
        } else if (job.application_email) {
          setApplicationType("email");
          setapplication_email(job.application_email);
        }`;

const newLogic = `        if (job.apply_link && job.apply_link.trim() !== "") {
          setApplicationType("apply");
          setapply_link(job.apply_link);
        } else if (job.application_email && job.application_email.trim() !== "") {
          setApplicationType("email");
          setapplication_email(job.application_email);
        } else {
          setApplicationType("apply");
          setapply_link("");
        }`;

if(file.includes(oldLogic)) {
  file = file.replace(oldLogic, newLogic);
  fs.writeFileSync('app/admin/add-job/page.tsx', file);
  console.log("Fixed apply logic");
} else {
  console.log("Could not find old logic");
}
