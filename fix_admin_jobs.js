const fs = require("fs");
let code = fs.readFileSync("app/admin/jobs/page.tsx", "utf8");

code = code.replace(
  `const statusFilter =
  searchParams.get("status");`,
  `const statusFilter = searchParams.get("status");
  const typeFilter = searchParams.get("type");`
);

code = code.replace(
  `}, [statusFilter]);`,
  `}, [statusFilter, typeFilter]);`
);

code = code.replace(
  `let query = supabase
    .from("jobs")
    .select("*");`,
  `let query = supabase
    .from("jobs")
    .select("*");
  if (typeFilter && typeFilter !== "All") {
    query = query.eq("employment_type", typeFilter);
  }`
);

// Add the type filter UI after the existing filters
const newFilters = `<select
  value={typeFilter || "All"}
  onChange={(e) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("type", e.target.value);
    router.push("/admin/jobs?" + newParams.toString());
  }}
  className="px-5 py-2 rounded-full border bg-white hover:bg-gray-100 transition"
>
  <option value="All">All Types</option>
  <option value="Full-time">Full-time</option>
  <option value="Part-time">Part-time</option>
  <option value="Contract">Contract</option>
  <option value="Temporary">Temporary</option>
  <option value="Freelance">Freelance</option>
  <option value="Internship">Internship</option>
</select>`;

code = code.replace(
  `    Expired
  </button>

</div>`,
  `    Expired
  </button>

  ${newFilters}

</div>`
);

// Add the columns to the table head
code = code.replace(
  `                  <th className="text-left px-6 py-5">
                    City
                  </th>`,
  `                  <th className="text-left px-6 py-5">
                    City
                  </th>
                  <th className="text-left px-6 py-5">
                    Type
                  </th>`
);

// Add columns to table body rendering
code = code.replace(
  `                  <td className="px-6 py-4 border-b">
                    {job.city}
                  </td>`,
  `                  <td className="px-6 py-4 border-b">
                    {job.city}
                  </td>
                  <td className="px-6 py-4 border-b">
                    <select
                      value={job.employment_type || "Full-time"}
                      onChange={async (e) => {
                        const newType = e.target.value;
                        const { error } = await supabase.from("jobs").update({ employment_type: newType }).eq("id", job.id);
                        if (!error) fetchJobs();
                      }}
                      className="border rounded px-2 py-1 bg-white text-sm"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                    </select>
                    {job.workplace_type && <div className="text-xs text-gray-500 mt-1">{job.workplace_type}</div>}
                  </td>`
);


fs.writeFileSync("app/admin/jobs/page.tsx", code);
console.log("admin jobs updated");

