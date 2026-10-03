const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// 1. Fix the Email/Apply Link precedence in fetchJob
const oldEmailLogic =           if (job.apply_link && job.apply_link.trim() !== "") {
            setApplicationType("apply");
            setapply_link(job.apply_link);
          } else if (job.application_email && job.application_email.trim() !== "") {
            setApplicationType("email");
            setapplication_email(job.application_email);
          } else {
            setApplicationType("apply");
            setapply_link("");
          };
          
const newEmailLogic =           if (job.application_email && job.application_email.trim() !== "") {
            setApplicationType("email");
            setapplication_email(job.application_email);
            setapply_link(job.apply_link || "");
          } else if (job.apply_link && job.apply_link.trim() !== "") {
            setApplicationType("apply");
            setapply_link(job.apply_link);
            setapplication_email("");
          } else {
            setApplicationType("apply");
            setapply_link("");
            setapplication_email("");
          };

file = file.replace(oldEmailLogic, newEmailLogic);

// 2. Add the two navigation buttons at the bottom next to Save Draft
const oldButtons = <div className="flex justify-center gap-3 mt-6 mb-4">
  <button type="button" disabled={isPublishing || uploadingImage} onClick={handleSaveDraft} className="px-6 py-3 text-base rounded-xl border-2 border-black bg-white text-black font-semibold hover:bg-white transition"
    >
      Save Draft
    </button>;

const newButtons = <div className="flex flex-wrap justify-center gap-3 mt-6 mb-4">
  <button type="button" onClick={() => { if (hasUnsavedChanges) { if (!window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) return; } router.push("/admin"); }} className="px-6 py-3 text-base rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-semibold hover:bg-gray-100 transition">
    Go to Dashboard
  </button>
  <button type="button" onClick={() => { if (hasUnsavedChanges) { if (!window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) return; } router.push("/admin/jobs"); }} className="px-6 py-3 text-base rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-semibold hover:bg-gray-100 transition">
    Manage Jobs
  </button>
  <button type="button" disabled={isPublishing || uploadingImage} onClick={handleSaveDraft} className="px-6 py-3 text-base rounded-xl border-2 border-black bg-white text-black font-semibold hover:bg-gray-50 transition"
    >
      Save Draft
    </button>;

file = file.replace(oldButtons, newButtons);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Patched email logic and added bottom nav buttons!");
