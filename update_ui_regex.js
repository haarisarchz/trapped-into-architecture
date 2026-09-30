const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex = /\s*\}\)\}\s*<\/div>\s*<\/div>\s*\{\!sameRequirements && \(/;

const replacement = `
                            })}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-100 hidden md:block">
                               <label className="block mb-1.5 text-sm font-medium">Number of Positions</label>
                               <input type="text" value={pos.vacancies || ""} onChange={(e) => updatePosition(index, "vacancies", e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" placeholder="e.g. 2" />
                            </div>
                          </div>
                          
                          <div className="md:hidden mt-4">
                             <label className="block mb-1.5 text-sm font-medium">Number of Positions</label>
                             <input type="text" value={pos.vacancies || ""} onChange={(e) => updatePosition(index, "vacancies", e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" placeholder="e.g. 2" />
                          </div>

                          {!sameRequirements && (`

content = content.replace(regex, replacement);
fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated add-job UI via regex");