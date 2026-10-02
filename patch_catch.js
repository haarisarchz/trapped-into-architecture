const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

file = file.replace(
  '      if (job.status === "scheduled") {\n         setScheduleDate(job.posted_date);\n      }\n    }\n  };',
  '      if (job.status === "scheduled") {\n         setScheduleDate(job.posted_date);\n      }\n    }\n  } catch (err: any) { alert("FETCH ERROR: " + err.message); console.error("fetchJob Error:", err); } };'
);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Added catch to fetchJob");
