const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const target = 'if (status !== "draft" && firmName) {';
if (file.includes(target)) {
    file = file.replace(target, 'if (firmName) {');
    fs.writeFileSync('app/admin/add-job/page.tsx', file);
    console.log("Successfully patched company save condition for drafts!");
} else {
    console.log("Target not found!");
}
