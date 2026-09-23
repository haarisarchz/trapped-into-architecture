const fs = require('fs');
let code = fs.readFileSync('app/admin/users/page.tsx', 'utf8');

// Insert role change handler
const handlerCode = `
  const handleRoleChange = async (userId: string, userName: string, oldRole: string, newRole: string) => {
    if (newRole === oldRole) return;
    if (window.confirm(\`Change \${userName} from \${oldRole || 'User'} to \${newRole}?\`)) {
      setLoading(true);
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (!error) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert("Failed to update role");
      }
      setLoading(false);
    }
  };
`;
code = code.replace('useEffect(() => {', handlerCode + '\n  useEffect(() => {');

// Change role TD
const oldRoleTd = `<td className="px-6 py-4 capitalize text-gray-700">
                      {u.role || "User"}
                    </td>`;
const newRoleTd = `<td className="px-6 py-4 capitalize text-gray-700">
                      <select
                        value={u.role || "user"}
                        onChange={(e) => handleRoleChange(u.id, u.display_name || u.full_name || u.username || 'User', u.role, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm bg-white cursor-pointer hover:border-gray-400 focus:outline-none"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super_Admin</option>
                        <option value="ceo">CEO</option>
                      </select>
                    </td>`;
code = code.replace(oldRoleTd, newRoleTd);

fs.writeFileSync('app/admin/users/page.tsx', code);
console.log('Fixed users page');
