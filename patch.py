import sys

with open('app/admin/add-job/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target1 = '''          if (job.apply_link && job.apply_link.trim() !== "") {
            setApplicationType("apply");
            setapply_link(job.apply_link);
          } else if (job.application_email && job.application_email.trim() !== "") {
            setApplicationType("email");
            setapplication_email(job.application_email);
          } else {
            setApplicationType("apply");
            setapply_link("");
          }'''

replace1 = '''          if (job.application_email && job.application_email.trim() !== "") {
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
          }'''

target2 = '''  <div className="flex justify-center gap-3 mt-6 mb-4">
    <button type="button" disabled={isPublishing || uploadingImage} onClick={handleSaveDraft} className="px-6 py-3 text-base rounded-xl border-2 border-black bg-white text-black font-semibold hover:bg-white transition"
    >
      Save Draft
    </button>'''

replace2 = '''  <div className="flex flex-wrap justify-center gap-3 mt-6 mb-4">
    <button type="button" onClick={() => { if (hasUnsavedChanges) { if (!window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) return; } router.push("/admin"); }} className="px-6 py-3 text-base rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-semibold hover:bg-gray-100 transition">
      Go to Dashboard
    </button>
    <button type="button" onClick={() => { if (hasUnsavedChanges) { if (!window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) return; } router.push("/admin/jobs"); }} className="px-6 py-3 text-base rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-semibold hover:bg-gray-100 transition">
      Manage Jobs
    </button>
    <button type="button" disabled={isPublishing || uploadingImage} onClick={handleSaveDraft} className="px-6 py-3 text-base rounded-xl border-2 border-black bg-white text-black font-semibold hover:bg-gray-50 transition"
    >
      Save Draft
    </button>'''

if target1 in content:
    content = content.replace(target1, replace1)
    print("Patched 1")
else:
    print("Failed to find target1")

if target2 in content:
    content = content.replace(target2, replace2)
    print("Patched 2")
else:
    print("Failed to find target2")

with open('app/admin/add-job/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
