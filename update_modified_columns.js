const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

// 1. Add sort fields for modified_by and modified_at
const resolveModifierCode = `
  // Helper: decide what to show in "Modified By" column
  function resolveModifiedBy(company: any): string {
    const profile = company.modifierProfile;
    if (!profile) return "--";
    return profile.display_name || profile.full_name || profile.username || "--";
  }
`;
content = content.replace(`// Helper: decide what to show in "Created By" column`, resolveModifierCode + `\n  // Helper: decide what to show in "Created By" column`);

content = content.replace(
  `} else if (sortField === "created_at") {
         valA = a.created_at ? new Date(a.created_at).getTime() : 0;
         valB = b.created_at ? new Date(b.created_at).getTime() : 0;
      }`,
  `} else if (sortField === "created_at") {
         valA = a.created_at ? new Date(a.created_at).getTime() : 0;
         valB = b.created_at ? new Date(b.created_at).getTime() : 0;
      } else if (sortField === "updated_by") {
         valA = resolveModifiedBy(a);
         valB = resolveModifiedBy(b);
      } else if (sortField === "updated_at") {
         valA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
         valB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      }`
);

// 2. Add Headers
const headers = `<th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort("created_at")}>
                      Created On {sortField === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>`;
const newHeaders = headers + `
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort("updated_by")}>
                      Modified By {sortField === "updated_by" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort("updated_at")}>
                      Modified On {sortField === "updated_at" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>`;
content = content.replace(headers, newHeaders);

// 3. Add Cells
const cells = `{/* Created On */}
                      <td className="px-6 py-4 text-gray-500">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "--"}
                      </td>`;
const newCells = cells + `
                      {/* Modified By */}
                      <td className="px-6 py-4 text-gray-700">{resolveModifiedBy(c)}</td>
                      {/* Modified On */}
                      <td className="px-6 py-4 text-gray-500">
                        {c.updated_at ? new Date(c.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "--"}
                      </td>`;
content = content.replace(cells, newCells);

fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Updated companies page with modified columns");