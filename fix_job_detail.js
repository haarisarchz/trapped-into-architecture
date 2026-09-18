const fs = require("fs");
let code = fs.readFileSync("app/jobs/[id]/page.tsx", "utf8");

// Add employment type to Quick Info section
const newCode = `  {job.employment_type && (
    <div className="bg-gray-50 rounded-xl px-4 py-3 border min-w-[160px]">
      <p className="text-xs text-gray-500">Employment Type</p>
      <h3 className="text-lg font-semibold mt-1">{job.employment_type}</h3>
    </div>
  )}
  {job.workplace_type && (
    <div className="bg-gray-50 rounded-xl px-4 py-3 border min-w-[160px]">
      <p className="text-xs text-gray-500">Workplace</p>
      <h3 className="text-lg font-semibold mt-1">{job.workplace_type}</h3>
    </div>
  )}`;

code = code.replace(
  `{/* EXPERIENCE */}`,
  `${newCode}\n\n  {/* EXPERIENCE */}`
);

fs.writeFileSync("app/jobs/[id]/page.tsx", code);
console.log("job detail updated");

