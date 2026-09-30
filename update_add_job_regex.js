const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// Use a more resilient replace
content = content.replace(/<label className="block mb-1\.5 text-sm font-medium">Upload Job Image[\s\S]*?\{imageUrl &&[\s\S]*?<\/div>\)}/g, 
  `<label className="block mb-3 text-sm font-medium">Upload Job Image <span className="text-red-500 text-xl font-bold">*</span></label>
                  <ImageUploader value={imageUrl} onChange={(url) => setImageUrl(url)} label="Upload Job Image" />`);

content = content.replace(/<label className="block mb-1\.5 text-sm font-medium">\{organizationType\} Logo<\/label>[\s\S]*?\{companyLogo &&[\s\S]*?<\/div>\)}/g, 
  `<label className="block mb-3 text-sm font-medium">{organizationType} Logo</label>
                    <ImageUploader value={companyLogo} onChange={(url) => setCompanyLogo(url)} label="Upload Logo" />`);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Regex replacement done");