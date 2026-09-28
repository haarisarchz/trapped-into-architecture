const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// Add vacancies to state payload
content = content.replace(
  'job_description: pos.role ? `**Job Role:** ${pos.role}\\n\\n${pos.description}` : pos.description,',
  `job_description: [pos.role ? \`**Job Role:** \${pos.role}\` : "", pos.vacancies ? \`**Number of Positions:** \${pos.vacancies}\` : "", pos.description].filter(Boolean).join("\\n\\n"),`
);

// Add the UI block
content = content.replace(
  `                              })}
                            </div>
                          </div>`,
  `                              })}
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-gray-100">
                               <label className="block mb-1.5 text-sm font-medium">Number of Positions</label>
                               <input type="text" value={pos.vacancies || ""} onChange={(e) => updatePosition(index, "vacancies", e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" placeholder="e.g. 2" />
                            </div>
                          </div>`
);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated add-job page with vacancies");