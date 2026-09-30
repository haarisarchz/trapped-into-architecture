const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const anchor = `                  </div>
                </div>

              {/* ================= SCHEDULE MODAL ================= */}`;
              
const insertBtn = `                  </div>
                </div>
                
                <div className="flex justify-end mt-4 mb-8">
                  <button 
                    type="button"
                    onClick={handleSaveCompany} 
                    disabled={!firmName || isSavingCompany}
                    className="bg-black text-white text-sm px-6 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition shadow-md font-semibold"
                  >
                    {isSavingCompany ? "Saving..." : "Save Company Profile"}
                  </button>
                </div>

              {/* ================= SCHEDULE MODAL ================= */}`;

content = content.replace(anchor, insertBtn);
fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated add-job button");