const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const oldBtn = 'onClick={() => router.push("/admin")}';
const newBtn = 'onClick={() => { if (hasUnsavedChanges) { if (!window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) return; } router.push("/admin"); }}';

file = file.replace(oldBtn, newBtn);
fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Patched dashboard button!");
