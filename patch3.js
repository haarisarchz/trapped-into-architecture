const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const targetEmail = '          if (job.apply_link && job.apply_link.trim() !== "") {\\n              setApplicationType("apply");\\n              setapply_link(job.apply_link);\\n            } else if (job.application_email && job.application_email.trim() !== "") {\\n              setApplicationType("email");\\n              setapplication_email(job.application_email);\\n            } else {\\n              setApplicationType("apply");\\n              setapply_link("");\\n            }';

const replaceEmail = '          if (job.application_email && job.application_email.trim() !== "") {\\n              setApplicationType("email");\\n              setapplication_email(job.application_email);\\n              setapply_link(job.apply_link || "");\\n            } else if (job.apply_link && job.apply_link.trim() !== "") {\\n              setApplicationType("apply");\\n              setapply_link(job.apply_link);\\n              setapplication_email("");\\n            } else {\\n              setApplicationType("apply");\\n              setapply_link("");\\n              setapplication_email("");\\n            }';

file = file.replace(targetEmail, replaceEmail);

const targetButtons = '  <div className="flex justify-center gap-3 mt-6 mb-4">\\n    <button type="button" disabled={isPublishing || uploadingImage} onClick={handleSaveDraft} className="px-6 py-3 text-base rounded-xl border-2 border-black bg-white text-black font-semibold hover:bg-white transition"\\n    >\\n      Save Draft\\n    </button>';

const replaceButtons = '  <div className="flex flex-wrap justify-center gap-3 mt-6 mb-4">\\n    <button type="button" onClick={() => { if (hasUnsavedChanges) { if (!window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) return; } router.push("/admin"); }} className="px-6 py-3 text-base rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-semibold hover:bg-gray-100 transition">\\n      Go to Dashboard\\n    </button>\\n    <button type="button" onClick={() => { if (hasUnsavedChanges) { if (!window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) return; } router.push("/admin/jobs"); }} className="px-6 py-3 text-base rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-semibold hover:bg-gray-100 transition">\\n      Manage Jobs\\n    </button>\\n    <button type="button" disabled={isPublishing || uploadingImage} onClick={handleSaveDraft} className="px-6 py-3 text-base rounded-xl border-2 border-black bg-white text-black font-semibold hover:bg-gray-50 transition"\\n    >\\n      Save Draft\\n    </button>';

file = file.replace(targetButtons, replaceButtons);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Patched email logic and buttons!");
