const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// revert the last change first
content = content.replace(
`                            })}
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

                          {!sameRequirements && (`,
`                            })}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-100 hidden md:block">
                               <label className="block mb-1.5 text-sm font-medium">Number of Positions</label>
                               <input type="text" value={pos.vacancies || ""} onChange={(e) => updatePosition(index, "vacancies", e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" placeholder="e.g. 2" />
                            </div>
                          </div>

                          {!sameRequirements && (`
);

// Now insert the mobile version right above Job Description
const regexJD = /<div>\s*<label className="block mb-1\.5 text-sm font-medium">Job Description <span className="text-red-500">\*<\/span><\/label>\s*<textarea value=\{pos\.description\}/;
const mobileVacancies = `
                             <div className="md:hidden">
                                <label className="block mb-1.5 text-sm font-medium">Number of Positions</label>
                                <input type="text" value={pos.vacancies || ""} onChange={(e) => updatePosition(index, "vacancies", e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" placeholder="e.g. 2" />
                             </div>
                             
                             <div>
                                <label className="block mb-1.5 text-sm font-medium">Job Description <span className="text-red-500">*</span></label>
                                <textarea value={pos.description}`;

content = content.replace(regexJD, mobileVacancies);
fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Re-adjusted Add Job form");