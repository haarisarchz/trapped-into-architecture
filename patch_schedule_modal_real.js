const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// 1. Fix the schedule modal button
file = file.split('onClick={() => setShowSchedule(true)}\n            className="px-6 py-3 bg-black text-white rounded-xl"').join('onClick={handleSchedule}\n            disabled={actionLoading !== null}\n            className="px-6 py-3 bg-black text-white rounded-xl"');
file = file.split('onClick={() => setShowSchedule(true)}\r\n            className="px-6 py-3 bg-black text-white rounded-xl"').join('onClick={handleSchedule}\r\n            disabled={actionLoading !== null}\r\n            className="px-6 py-3 bg-black text-white rounded-xl"');

// 2. Fix the text of the button
file = file.split('>\n            Schedule\n          </button>\n\n        </div>').join('>\n            {actionLoading === "scheduled" ? "Scheduling..." : "Schedule"}\n          </button>\n\n        </div>');
file = file.split('>\r\n            Schedule\r\n          </button>\r\n\r\n        </div>').join('>\r\n            {actionLoading === "scheduled" ? "Scheduling..." : "Schedule"}\r\n          </button>\r\n\r\n        </div>');

// 3. Fix handleSchedule
file = file.split('const handleSchedule = async () => {\n    await handlePublishJob("scheduled");\n  };').join('const handleSchedule = async () => {\n    await handlePublishJob("scheduled");\n    setShowSchedule(false);\n  };');
file = file.split('const handleSchedule = async () => {\r\n    await handlePublishJob("scheduled");\r\n  };').join('const handleSchedule = async () => {\r\n    await handlePublishJob("scheduled");\r\n    setShowSchedule(false);\r\n  };');

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Patched schedule button properly.");
