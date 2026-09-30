const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

const regex = /(\{\/\* Created On \*\/\}\s*<td[\s\S]*?<\/td>)/;

const newCells = `
                        {/* Modified By */}
                        <td className="px-6 py-4 text-gray-700">{resolveModifiedBy(c)}</td>
                        {/* Modified On */}
                        <td className="px-6 py-4 text-gray-700">
                          {c.updated_at
                            ? new Date(c.updated_at).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "--"}
                        </td>`;

if (regex.test(content)) {
  content = content.replace(regex, "$1\n" + newCells);
  fs.writeFileSync('app/admin/companies/page.tsx', content);
  console.log("Fixed cells");
} else {
  console.log("Could not match regex for cells");
}

// ALSO change colSpan={7} to colSpan={9}
content = content.replace(/colSpan=\{7\}/g, "colSpan={9}");
fs.writeFileSync('app/admin/companies/page.tsx', content);