const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

file = file.replace(
  'onClick={() => setShowSchedule(true)}\n            className="px-6 py-3 bg-black text-white rounded-xl"\n          >\n            Schedule\n          </button>',
  'onClick={handleSchedule}\n            disabled={actionLoading !== null}\n            className="px-6 py-3 bg-black text-white rounded-xl"\n          >\n            {actionLoading === "scheduled" ? "Scheduling..." : "Schedule"}\n          </button>'
);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Patched schedule button");
