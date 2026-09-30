const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');
content = content.replace('disabled={saving || uploadingImage}', 'disabled={saving}');
fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);