const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex = /\}\)\];\n\s*const isSelected = currentExps\.includes\(exp\);\n\s*return \(\n\s*<button[^>]*>\n\s*\{exp\}\n\s*<\/button>\n\s*\);\n\s*\}\)\}\n\s*<\/div>\n\s*<\/div>/g;

// Instead of regex, I will do a string match that is more lenient.
const target = `                                </button>
                              );
                            })}
                          </div>
                        </div>`;

const replacement = `                                </button>
                              );
                            })}
                          </div>

                          <div className="mt-6 pt-4 border-t border-gray-100">
                             <label className="block mb-1.5 text-sm font-medium">Number of Positions</label>
                             <input type="text" value={pos.vacancies || ""} onChange={(e) => updatePosition(index, "vacancies", e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" placeholder="e.g. 2" />
                          </div>

                        </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated add-job UI");