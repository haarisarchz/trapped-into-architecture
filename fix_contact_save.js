const fs = require('fs');
let code = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

const reloadFix = `    setSaving(false);
    alert("Configuration updated successfully");
    window.location.reload();`;

code = code.replace(
  `    setSaving(false);
    alert("Configuration updated successfully!");`,
  reloadFix
);

fs.writeFileSync('app/admin/contact/page.tsx', code);
console.log('Fixed save behaviour');
