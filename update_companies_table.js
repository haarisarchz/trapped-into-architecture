const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

// 1. We need to fetch profilesMap for updated_by as well! It already does because it fetches all profiles! So `profilesMap[c.updated_by]` will work!

// 2. Add columns to the table header
content = content.replace(
  `<th className="px-6 py-4 font-semibold w-[150px] cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort("created_by")}>
                    CREATED BY {sortField === "created_by" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-4 font-semibold w-[150px] cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort("created_at")}>
                    CREATED ON {sortField === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>`,
  `<th className="px-6 py-4 font-semibold w-[150px] cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort("created_by")}>
                    CREATED BY {sortField === "created_by" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-4 font-semibold w-[150px] cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort("created_at")}>
                    CREATED ON {sortField === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-4 font-semibold w-[150px] cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort("updated_by")}>
                    MODIFIED BY {sortField === "updated_by" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-4 font-semibold w-[150px] cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort("updated_at")}>
                    MODIFIED ON {sortField === "updated_at" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>`
);

// 3. Add columns to the table body
content = content.replace(
  `<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          }) : "-"}
                        </td>`,
  `<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          }) : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {resolveUpdatedBy(c)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {c.updated_at ? new Date(c.updated_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          }) : "-"}
                        </td>`
);

// 4. Add resolveUpdatedBy function
content = content.replace(
  `// Helper: decide what to show in "Created By" column
    function resolveCreatedBy(company: any): string {`,
  `// Helper: decide what to show in "Modified By" column
    function resolveUpdatedBy(company: any): string {
      const profile = company.updated_by ? profilesMap[company.updated_by] : null;
      if (!profile) return "-";
  
      const myRoleNorm = (currentUser?.role || "").toLowerCase().replace(/[\\s_]+/g, "");
  
      if (myRoleNorm === "ceo") {
        return profile.display_name || profile.full_name || profile.username || "Admin";
      }
  
      if (currentUser?.username && profile.username === currentUser.username) {
        return profile.display_name || profile.full_name || profile.username || "Admin";
      }
  
      const pRoleNorm = (profile.role || "").toLowerCase().replace(/[\\s_]+/g, "");
      if (pRoleNorm === "ceo") return "CEO";
      if (pRoleNorm === "superadmin") return "Super Admin";
      return "Admin";
    }

    // Helper: decide what to show in "Created By" column
    function resolveCreatedBy(company: any): string {`
);

// 5. Update sorting logic
content = content.replace(
  `} else if (sortField === "created_at") {
           valA = a.created_at ? new Date(a.created_at).getTime() : 0;
           valB = b.created_at ? new Date(b.created_at).getTime() : 0;
        }`,
  `} else if (sortField === "created_at") {
           valA = a.created_at ? new Date(a.created_at).getTime() : 0;
           valB = b.created_at ? new Date(b.created_at).getTime() : 0;
        } else if (sortField === "updated_by") {
           valA = resolveUpdatedBy(a);
           valB = resolveUpdatedBy(b);
        } else if (sortField === "updated_at") {
           valA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
           valB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        }`
);

fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Updated companies page table");