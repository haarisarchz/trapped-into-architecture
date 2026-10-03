const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

file = file.replace(
  'const handleSchedule = async () => {\n    await handlePublishJob("scheduled");\n  };',
  'const handleSchedule = async () => {\n    await handlePublishJob("scheduled");\n    setShowSchedule(false);\n  };'
);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Patched schedule close modal.");
