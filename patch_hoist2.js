const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// Find the email block using regex
const regex = /\\s*if \\(job\\.application_email && job\\.application_email\\.trim\\(\\) !== ""\\) \\{[\\s\\S]*?\\} else \\{[\\s\\S]*?setapplication_email\\(""\\);\\s*\\}/;
const match = file.match(regex);

if (match) {
    file = file.replace(match[0], '');
    
    const imageTarget = 'setImageUrl(job.image || "");';
    file = file.replace(imageTarget, imageTarget + '\\n' + match[0]);
    
    fs.writeFileSync('app/admin/add-job/page.tsx', file);
    console.log("Successfully hoisted using regex!");
} else {
    console.log("Regex not matched.");
}
