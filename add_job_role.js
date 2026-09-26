const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
const search = '<datalist id="positionsList">\\n                              {positionOptions.map((opt) => <option key={opt} value={opt} />)}\\n                            </datalist>\\n                          </div>';
const replace = search + '\\n                          <div>\\n                            <label className="block mb-2 font-medium">Job Role</label>\\n                            <input type="text" value={pos.role || ""} onChange={(e) => updatePosition(index, "role", e.target.value)} className="w-full border rounded-2xl px-4 py-3 bg-white text-black" placeholder="e.g. Designer, Manager" />\\n                          </div>';
c = c.replace(search, replace);
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Added Job Role');