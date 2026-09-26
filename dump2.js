const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
const sections = ['Position Details', 'Requirements', 'Job Details', 'Application Details', 'Company Profile'];
sections.forEach(s => {
    let idx = c.indexOf(s);
    if(idx !== -1) {
        console.log('\n--- ' + s + ' ---');
        console.log(c.substring(idx - 100, idx + 800));
    }
});