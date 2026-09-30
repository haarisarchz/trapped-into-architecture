const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

// Replace table headers
const oldHeadersRegex = /<tr>\s*<th className="px-6 py-4 font-semibold">Company<\/th>[\s\S]*?<th className="px-6 py-4 font-semibold text-right">Actions<\/th>\s*<\/tr>/m;

const newHeaders = `<tr>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort("firm_name")}>
                      Company {sortField === "firm_name" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort("location")}>
                      Location {sortField === "location" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort("created_by")}>
                      Created By {sortField === "created_by" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort("created_at")}>
                      Created On {sortField === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort("jobs")}>
                      Jobs (Total / Active) {sortField === "jobs" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 font-semibold">Visibility</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>`;

content = content.replace(oldHeadersRegex, newHeaders);

// Replace mapping
content = content.replace(/companies\.map\(\(c,\s*i\)/g, 'sortedCompanies.map((c, i)');

fs.writeFileSync('app/admin/companies/page.tsx', content);
console.log("Fixed UI hooks in app/admin/companies/page.tsx");