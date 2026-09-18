const fs = require("fs");
let code = fs.readFileSync("app/admin/jobs/edit/[id]/page.tsx", "utf8");

code = code.replace(
  `  const [organizationType, setOrganizationType] =
    useState("Firm");`,
  `  const [organizationType, setOrganizationType] = useState("Firm");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [workplaceType, setWorkplaceType] = useState("On-site");`
);

// inside loadJobDetails, fetch fields
code = code.replace(
  `      setPosition(data.position || "");`,
  `      setPosition(data.position || "");
      setEmploymentType(data.employment_type || "Full-time");
      setWorkplaceType(data.workplace_type || "On-site");`
);

// inside update fields in handlePublishJob
code = code.replace(
  `        position: position,`,
  `        position: position,
        employment_type: employmentType,
        workplace_type: workplaceType,`
);

// Add dropdowns in JSX
code = code.replace(
  `              <h2 className="text-2xl font-bold mb-6">
                Job Details
              </h2>`,
  `              <h2 className="text-2xl font-bold mb-6">
                Job Details
              </h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block mb-2 font-medium">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Workplace Type</label>
                  <select
                    value={workplaceType}
                    onChange={(e) => setWorkplaceType(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>`
);

fs.writeFileSync("app/admin/jobs/edit/[id]/page.tsx", code);
console.log("edit job updated");

