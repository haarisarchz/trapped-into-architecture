const fs = require('fs');
let code = fs.readFileSync('app/admin/users/page.tsx', 'utf8');

// 1. Normalize the display value in the <select> element so that "Super_Admin" or "superadmin" both map to "superadmin"
// Wait, we can just change the options to match the DB exactly, or map it.
// The DB has "CEO" and "Super_Admin" (and "admin", "user").
// It's safer to change the options to exactly match what we want to save.
// Wait, if we save "Super_Admin", we should keep it exactly that.
const optionReplace = `<select 
                      value={user.role || 'user'} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="border rounded p-1 text-sm bg-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="Super_Admin">Super Admin</option>
                      <option value="CEO">CEO</option>
                    </select>`;

code = code.replace(/<select[\s\S]*?<\/select>/g, optionReplace);

fs.writeFileSync('app/admin/users/page.tsx', code);
