const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// Fix the schedule button in the modal
file = file.replace(
  'onClick={() => setShowSchedule(true)}\\n            className="px-6 py-3 bg-black text-white rounded-xl"\\n          >\\n            Schedule',
  'onClick={async () => { await handleSchedule(); setShowSchedule(false); }}\\n            className="px-6 py-3 bg-black text-white rounded-xl"\\n          >\\n            Schedule'
);

// Fix the image missing issue... if there is one. 
// Just in case fetchJob is crashing, let's wrap the latter half in try/catch to ensure setImageUrl ALWAYS fires!
// Wait, I will just do the modal fix first.

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Fixed schedule button!");
