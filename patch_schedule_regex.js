const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex = /Cancel\s*<\/button>\s*<button\s*type="button"\s*onClick=\{\(\) => setShowSchedule\(true\)\}\s*className="px-6 py-3 bg-black text-white rounded-xl"\s*>\s*Schedule\s*<\/button>/g;

const replacement = `Cancel
          </button>
  
          <button
            type="button"
            disabled={actionLoading !== null}
            onClick={handleSchedule}
            className="px-6 py-3 bg-black text-white rounded-xl"
          >
            {actionLoading === "scheduled" ? "Scheduling..." : "Schedule"}
          </button>`;

file = file.replace(regex, replacement);

const handleRegex = /const handleSchedule = async \(\) => \{\s*await handlePublishJob\("scheduled"\);\s*\};/g;
const handleReplacement = `const handleSchedule = async () => {
    await handlePublishJob("scheduled");
    setShowSchedule(false);
  };`;

file = file.replace(handleRegex, handleReplacement);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Patched via regex!");
