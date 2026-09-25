const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(/\{isPublishing \? "Publishing\.\.\." \: uploadingImage \? "Uploading Image\.\.\." \: "Publish Job"\}/g, '{isPublishing ? "Publishing..." : uploadingImage ? "Uploading Image..." : (selectedCompanyId && isCompanyProfileDirty ? "Update & Save" : "Publish Job")}');

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Done button');