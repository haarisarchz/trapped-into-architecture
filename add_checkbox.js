const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
const search = /<h2 className="text-xl font-bold mt-6 mb-6">\s*Requirements\s*<\/h2>/;
const replace = '<div className="flex flex-col md:flex-row md:items-center justify-between mt-6 mb-6 gap-4">\\n                <h2 className="text-xl font-bold">Requirements</h2>\\n                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 bg-white px-4 py-2 rounded-xl border border-gray-200">\\n                  <input type="checkbox" checked={sameRequirements} onChange={(e) => setSameRequirements(e.target.checked)} className="w-4 h-4 accent-black" />\\n                  Same requirements for all positions\\n                </label>\\n              </div>';
c = c.replace(search, replace);
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Added same requirements checkbox');