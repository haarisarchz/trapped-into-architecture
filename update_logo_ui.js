const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex = /<input type="file" className="w-full border rounded-xl px-3 py-2\.5 text-sm" \/>/;
const replacement = `<input type="file" className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                    {companyLogo && (<div className="mt-2"><img src={companyLogo} alt="Company Logo" className="w-20 h-20 object-contain rounded border shadow-sm bg-white" /></div>)}`;

content = content.replace(regex, replacement);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated add-job to show company logo preview");