const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

const posRegex = /<div className="grid grid-cols-1 md:grid-cols-4 gap-4">([\s\S]*?)<div className="md:col-span-4 mt-2 pt-4 border-t border-gray-100">/g;
const replaceString = `<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3 flex flex-col gap-4">
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block mb-1.5 text-sm font-medium">Position <span className="text-red-500">*</span></label>
                                <input type="text" list="positionsList" value={pos.position} onChange={(e) => updatePosition(index, "position", e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" placeholder="e.g. Junior Architect" />
                                <datalist id="positionsList">
                                  {positionOptions.map((opt) => <option key={opt} value={opt} />)}
                                </datalist>
                              </div>
                              <div>
                                <label className="block mb-1.5 text-sm font-medium">Job Role</label>
                                <input type="text" value={pos.role || ""} onChange={(e) => updatePosition(index, "role", e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" placeholder="e.g. Designer, Manager" />
                              </div>
                              <div>
                                <label className="block mb-1.5 text-sm font-medium">Salary</label>
                                <Autocomplete value={pos.salary} onChange={(val) => updatePosition(index, "salary", val)} fetchSuggestions={async (q) => { const { data } = await supabase.from("jobs").select("salary").ilike("salary", "%" + q + "%").limit(20); return Array.from(new Set(data?.map(d => d.salary).filter(Boolean))) || []; }} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" placeholder="e.g. ₹ 3,00,000 - ₹ 5,00,000" />
                              </div>
                           </div>
                           
                           <div>
                              <label className="block mb-1.5 text-sm font-medium">Job Description <span className="text-red-500">*</span></label>
                              <textarea value={pos.description} onChange={(e) => updatePosition(index, "description", e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black min-h-[110px] resize-y" placeholder="Write detailed job description..." />
                           </div>
                        </div>

                        <div className="md:col-span-1 border-l border-gray-100 pl-4">
                          <label className="block mb-1.5 text-sm font-medium">Required Experience <span className="text-red-500">*</span></label>
                          <div className="flex flex-wrap gap-2">
                            {EXPERIENCE_OPTIONS.map((exp) => {
                              const currentExps = Array.isArray(pos.experience) ? pos.experience : (pos.experience ? [pos.experience] : []);
                              const isSelected = currentExps.includes(exp);
                              return (
                                <button
                                  key={exp}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      updatePosition(index, "experience", currentExps.filter(e => e !== exp));
                                    } else {
                                      updatePosition(index, "experience", [...currentExps, exp]);
                                    }
                                  }}
                                  className={\`px-3 py-1.5 border rounded-full text-xs font-semibold transition \${
                                    isSelected
                                      ? "bg-black text-white border-black"
                                      : "bg-white text-black border-gray-300 hover:bg-gray-100"
                                  }\`}
                                >
                                  {exp}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="md:col-span-4 mt-2 pt-4 border-t border-gray-100">`;

c = c.replace(posRegex, replaceString);
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Position block redesigned');