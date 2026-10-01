const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// 1. Fix Schedule Button Bug
file = file.replace(
  'onClick={() => setShowSchedule(true)}\n          className="px-6 py-3 bg-black text-white rounded-xl"\n        >\n          Schedule',
  'onClick={() => { setShowSchedule(false); handleSchedule(); }}\n          className="px-6 py-3 bg-black text-white rounded-xl"\n        >\n          Schedule'
);

// 2. Extract Action Buttons
const actionButtonsStart = file.indexOf('{/* ACTION BUTTONS */}');
let actionButtonsEnd = file.indexOf('</div>', file.indexOf('</div>', file.indexOf('</div>', actionButtonsStart) + 1) + 1) + 6;
// Actually, let's use a regex to extract the block safely.
const actionButtonsRegex = /\{\/\* ACTION BUTTONS \*\/\}[\s\S]*?(?=<div className="flex-1 border-t)/;
const actionButtonsMatch = file.match(actionButtonsRegex);

if (actionButtonsMatch) {
    let actionButtonsCode = actionButtonsMatch[0];
    
    // Remove it from its current position
    file = file.replace(actionButtonsRegex, '');
    
    // 3. Remove "Save Company Profile" buttons
    file = file.replace(/<button[^>]*onClick=\{handleSaveCompany\}[^>]*>[\s\S]*?<\/button>/g, '');
    
    // Clean up empty div wrappers left behind by the removed buttons
    // The top one is inside: <div className="flex justify-between items-center border-b border-gray-100 pb-2"> ... </div>
    // The bottom one is inside: <div className="flex justify-end mt-4 mb-8 border-b border-gray-100 pb-8"> ... </div>
    
    // 4. Insert Action Buttons at the very bottom, before the Schedule Modal
    const insertPoint = file.indexOf('{/* ================= SCHEDULE MODAL ================= */}');
    file = file.slice(0, insertPoint) + '\n\n' + actionButtonsCode + '\n\n' + file.slice(insertPoint);
}

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log('UI Refactored');
