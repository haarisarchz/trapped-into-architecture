const fs = require('fs');
let code = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

const oldTd = `<td className="px-6 py-4 text-gray-700">
                        {c.profiles?.display_name || c.profiles?.full_name || c.profiles?.username || "Admin"}
                      </td>`;

const newTd = `<td className="px-6 py-4 text-gray-700">
                        {(() => {
                           if (!c.profiles) return "Admin";
                           
                           const userRole = (currentUser?.role || "").toLowerCase().replace(/[\\s_]+/g, "");
                           
                           // If CEO, see everything
                           if (userRole === "ceo") {
                             return c.profiles.display_name || c.profiles.full_name || c.profiles.username || "Admin";
                           }
                           
                           // If own company, see own name
                           if (currentUser?.id === c.created_by) {
                             return c.profiles.display_name || c.profiles.full_name || c.profiles.username || "Admin";
                           }
                           
                           // Otherwise show role label
                           const pRole = (c.profiles.role || "Admin").toLowerCase().replace(/[\\s_]+/g, "");
                           if (pRole === "ceo") return "CEO";
                           if (pRole === "superadmin") return "Super Admin";
                           return "Admin";
                        })()}
                      </td>`;

code = code.replace(oldTd, newTd);
fs.writeFileSync('app/admin/companies/page.tsx', code);
console.log('Fixed Companies Created By');
