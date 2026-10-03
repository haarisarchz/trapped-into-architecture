const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// The block for setting email
const startEmail = file.indexOf('if (job.apply_link && job.apply_link.trim() !== "") {');
const endEmail = file.indexOf('setApplicationType("apply");', startEmail + 150) + 70;

const replaceEmail = '          if (job.application_email && job.application_email.trim() !== "") {\\n              setApplicationType("email");\\n              setapplication_email(job.application_email);\\n              setapply_link(job.apply_link || "");\\n            } else if (job.apply_link && job.apply_link.trim() !== "") {\\n              setApplicationType("apply");\\n              setapply_link(job.apply_link);\\n              setapplication_email("");\\n            } else {\\n              setApplicationType("apply");\\n              setapply_link("");\\n              setapplication_email("");\\n            }';

file = file.substring(0, startEmail) + replaceEmail + file.substring(endEmail);


const startBtn = file.indexOf('<div className="flex justify-center gap-3 mt-6 mb-4">');
const endBtn = file.indexOf('</button>', startBtn + 100) + 9;

const replaceBtn = '<div className="flex flex-wrap justify-center gap-3 mt-6 mb-4">\\n  <button type="button" onClick={() => { if (hasUnsavedChanges) { if (!window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) return; } router.push("/admin"); }} className="px-6 py-3 text-base rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-semibold hover:bg-gray-100 transition">\\n    Go to Dashboard\\n  </button>\\n  <button type="button" onClick={() => { if (hasUnsavedChanges) { if (!window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) return; } router.push("/admin/jobs"); }} className="px-6 py-3 text-base rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-semibold hover:bg-gray-100 transition">\\n    Manage Jobs\\n  </button>\\n  <button type="button" disabled={isPublishing || uploadingImage} onClick={handleSaveDraft} className="px-6 py-3 text-base rounded-xl border-2 border-black bg-white text-black font-semibold hover:bg-gray-50 transition"\\n  >\\n    Save Draft\\n  </button>';

file = file.substring(0, startBtn) + replaceBtn + file.substring(endBtn);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Patched successfully.");
