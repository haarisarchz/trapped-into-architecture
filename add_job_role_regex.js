const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
const searchRegex = /<\/datalist>\s*<\/div>/g;
c = c.replace(searchRegex, '</datalist>\\n                          </div>\\n                          <div>\\n                            <label className="block mb-2 font-medium">Job Role</label>\\n                            <input type="text" value={pos.role || ""} onChange={(e) => updatePosition(index, "role", e.target.value)} className="w-full border rounded-2xl px-4 py-3 bg-white text-black" placeholder="e.g. Designer, Manager" />\\n                          </div>');
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Added Job Role with regex');