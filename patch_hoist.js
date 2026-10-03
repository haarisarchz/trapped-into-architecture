const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const targetEmail = '        if (job.application_email && job.application_email.trim() !== "") {\\n            setApplicationType("email");\\n            setapplication_email(job.application_email);\\n            setapply_link(job.apply_link || "");\\n          } else if (job.apply_link && job.apply_link.trim() !== "") {\\n            setApplicationType("apply");\\n            setapply_link(job.apply_link);\\n            setapplication_email("");\\n          } else {\\n            setApplicationType("apply");\\n            setapply_link("");\\n            setapplication_email("");\\n          }';

const imageTarget = '        setImageUrl(job.image || "");';

if (file.includes(targetEmail)) {
    // Remove it from current location
    file = file.replace(targetEmail, '');
    
    // Insert it right below setImageUrl
    file = file.replace(imageTarget, imageTarget + '\\n\\n' + targetEmail);
    
    fs.writeFileSync('app/admin/add-job/page.tsx', file);
    console.log("Successfully hoisted email logic!");
} else {
    console.log("Could not find target email block.");
}
