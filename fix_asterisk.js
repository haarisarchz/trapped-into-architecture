const fs = require("fs");
let code = fs.readFileSync("app/admin/add-job/page.tsx", "utf8");
code = code.replace(
  "<label className=\"block mb-2 font-medium\">Employment Type</label>",
  "<label className=\"block mb-2 font-medium\">Employment Type <span className=\"text-red-500 text-xl font-bold\">*</span></label>"
);
fs.writeFileSync("app/admin/add-job/page.tsx", code);

let editCode = fs.readFileSync("app/admin/jobs/edit/[id]/page.tsx", "utf8");
editCode = editCode.replace(
  "<label className=\"block mb-2 font-medium\">Employment Type</label>",
  "<label className=\"block mb-2 font-medium\">Employment Type <span className=\"text-red-500 text-xl font-bold\">*</span></label>"
);
fs.writeFileSync("app/admin/jobs/edit/[id]/page.tsx", editCode);

