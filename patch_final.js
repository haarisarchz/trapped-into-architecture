const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// 1. Move setImageUrl higher in fetchJob
const imageSetCode = 'setImageUrl(job.image || "");';
file = file.replace(imageSetCode, '');
file = file.replace('setFirmName(job.firm_name || "");', 'setFirmName(job.firm_name || "");\\n        setImageUrl(job.image || "");');

// 2. Fix the redirect for scheduled jobs
const oldRedirect = 'if (status !== "draft") {\\n        router.push("/admin/jobs");\\n      }';
const newRedirect = 'if (status === "scheduled") {\\n        router.push("/admin/jobs?status=scheduled");\\n      } else if (status !== "draft") {\\n        router.push("/admin/jobs");\\n      }';
file = file.replace(oldRedirect, newRedirect);

// 3. Just double check the schedule button inside the modal in case my previous patch failed
// Wait, I will just manually replace the modal buttons again using a regex to be absolutely certain.
file = file.replace(/<button\\s+type="button"\\s+onClick=\{\(\) => setShowSchedule\(true\)\}\\s+className="px-6 py-3 bg-black text-white rounded-xl"\\s*>[\\s\\S]*?Schedule\\s*<\/button>/, 
  '<button type="button" onClick={async () => { await handleSchedule(); setShowSchedule(false); }} className="px-6 py-3 bg-black text-white rounded-xl">Schedule</button>');

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Patched!");
