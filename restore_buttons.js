const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

const actionButtonsStr = `
            {/* ACTION BUTTONS */}
            <div className="flex justify-center gap-3 mt-6 mb-4">
              <button type="button" disabled={isPublishing} onClick={handleSaveDraft} className="px-6 py-3 text-base rounded-xl border-2 border-black bg-white text-black font-semibold hover:bg-white transition">
                Save Draft
              </button>
              <button type="button" disabled={isPublishing} onClick={() => setShowSchedule(true)} className="px-6 py-3 text-base rounded-xl border-2 border-black bg-white text-black font-semibold hover:bg-white transition">
                Schedule
              </button>
              <button type="button" disabled={uploadingImage || isPublishing} onClick={() => handlePublishJob("published")} className={\`px-6 py-3 text-base rounded-xl text-lg font-semibold transition \${uploadingImage ? "bg-gray-400 text-white cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"}\`}>
                {isPublishing ? "Publishing..." : uploadingImage ? "Uploading Image..." : (selectedCompanyId && isCompanyProfileDirty ? "Update & Save" : "Publish Job")}
              </button>
            </div>
            
            <div className="flex-1 border-t border-gray-300 mb-6"></div>
`;

// Insert the action buttons back right before the Schedule Modal
const scheduleModalStr = '{/* ================= SCHEDULE MODAL ================= */}';
c = c.replace(scheduleModalStr, actionButtonsStr + '\n            ' + scheduleModalStr);

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Restored action buttons');