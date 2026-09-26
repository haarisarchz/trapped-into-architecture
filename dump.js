const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
const sections = ['Position Details', 'Requirements', 'Job Details', 'Application Details', 'Company Profile', 'Upload Job Image'];
sections.forEach(s => {
    let idx = c.indexOf(s);
    if(idx !== -1) {
        console.log(\n---  ---);
        console.log(c.substring(idx - 50, idx + 800));
    }
});