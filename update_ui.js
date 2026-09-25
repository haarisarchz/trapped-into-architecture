const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

const regex = /<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">[\s\S]*?<textarea[\s\S]*?\/>\s*<\/div>\s*<\/div>/;

const newBlock = \<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block mb-2 font-medium">Position <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            list="positionsList"
                            value={pos.position} 
                            onChange={(e) => updatePosition(index, "position", e.target.value)} 
                            className="w-full border rounded-2xl px-4 py-3 bg-white text-black" 
                            placeholder="e.g. Junior Architect" 
                          />
                          <datalist id="positionsList">
                            {positionOptions.map((opt) => <option key={opt} value={opt} />)}
                          </datalist>
                        </div>
                        <div>
                          <label className="block mb-2 font-medium">Salary</label>
                          <input 
                            type="text" 
                            value={pos.salary} 
                            onChange={(e) => updatePosition(index, "salary", e.target.value)} 
                            className="w-full border rounded-2xl px-4 py-3 bg-white text-black" 
                            placeholder="e.g. ₹ 3,00,000 - ₹ 5,00,000" 
                          />
                        </div>
                        
                        <div>
                          <label className="block mb-2 font-medium">Required Experience <span className="text-red-500">*</span></label>
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
                                  className={\\\px-4 py-2 border rounded-full text-sm font-semibold transition \\\\\\}
                                >
                                  {exp}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className="flex flex-col h-full">
                          <label className="block mb-2 font-medium">Job Description <span className="text-red-500">*</span></label>
                          <textarea 
                            value={pos.description}
                            onChange={(e) => updatePosition(index, "description", e.target.value)}
                            className="w-full flex-1 border rounded-2xl px-4 py-3 bg-white text-black min-h-[110px] resize-y"
                            placeholder="Write detailed job description..."
                          />
                        </div>
                      </div>
                    </div>\;

c = c.replace(regex, newBlock);
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Success');