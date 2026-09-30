const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

content = content.replace(
  'const [error, setError] = useState<string | null>(null);',
  'const [error, setError] = useState<string | null>(null);\n\n  const [sortField, setSortField] = useState<string>("created_at");\n  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");\n\n  const handleSort = (field: string) => {\n    if (sortField === field) {\n      setSortOrder(sortOrder === "asc" ? "desc" : "asc");\n    } else {\n      setSortField(field);\n      setSortOrder("desc");\n    }\n  };'
);

content = content.replace(
  `        // Sort: published companies first, then by name
        result.sort((a: any, b: any) => {
          if (b.activeJobs !== a.activeJobs) return b.activeJobs - a.activeJobs;
          return (a.firm_name || "").localeCompare(b.firm_name || "");
        });

        setCompanies(result);`,
  `        setCompanies(result);` // Remove the old hardcoded sort
);

// We need a helper to get sorted companies at render time, or just sort `companies` inside the component body before rendering.
const sortedBody = `
  const getSortedCompanies = (list: any[]) => {
    return [...list].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "created_by") {
         valA = resolveCreatedBy(a);
         valB = resolveCreatedBy(b);
      } else if (sortField === "created_at") {
         valA = a.created_at ? new Date(a.created_at).getTime() : 0;
         valB = b.created_at ? new Date(b.created_at).getTime() : 0;
      } else if (sortField === "location") {
         valA = [a.city, a.state].filter(Boolean).join(", ") || "";
         valB = [b.city, b.state].filter(Boolean).join(", ") || "";
      } else if (sortField === "jobs") {
         valA = a.totalJobs || 0;
         valB = b.totalJobs || 0;
      }

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortedCompanies = getSortedCompanies(companies);
`;

content = content.replace(
  '  return (',
  sortedBody + '\n  return ('
);

const oldHeaders = `                  <tr>
                    <th className="px-6 py-4 font-semibold">Company</th>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    <th className="px-6 py-4 font-semibold">Created By</th>
                    <th className="px-6 py-4 font-semibold">Created On</th>
                    <th className="px-6 py-4 font-semibold">Jobs (Total / Active)</th>
                    <th className="px-6 py-4 font-semibold">Visibility</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>`;

const newHeaders = `                  <tr>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-50" onClick={() => handleSort("firm_name")}>
                      Company {sortField === "firm_name" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-50" onClick={() => handleSort("location")}>
                      Location {sortField === "location" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-50" onClick={() => handleSort("created_by")}>
                      Created By {sortField === "created_by" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-50" onClick={() => handleSort("created_at")}>
                      Created On {sortField === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-50" onClick={() => handleSort("jobs")}>
                      Jobs {sortField === "jobs" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 font-semibold">Visibility</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>`;

content = content.replace(oldHeaders, newHeaders);
content = content.replace(/{companies\.map\(\(c, index\)/g, '{sortedCompanies.map((c, index)');

fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Updated sorting in companies page");