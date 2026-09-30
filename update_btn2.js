const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const anchor = '{/* ================= SCHEDULE MODAL ================= */}';
const insertPos = content.indexOf(anchor);

if (insertPos !== -1) {
  const insertBtn = `
                <div className="flex justify-end mt-4 mb-8 border-b border-gray-100 pb-8">
                  <button 
                    type="button"
                    onClick={handleSaveCompany} 
                    disabled={!firmName || isSavingCompany}
                    className="bg-black text-white text-sm px-6 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition shadow-md font-semibold"
                  >
                    {isSavingCompany ? "Saving..." : "Save Company Profile"}
                  </button>
                </div>

              `;
  content = content.substring(0, insertPos) + insertBtn + content.substring(insertPos);
  fs.writeFileSync('app/admin/add-job/page.tsx', content);
  console.log("Updated add-job button exactly");
} else {
  console.log("Could not find anchor");
}