const fs = require('fs');
let code = fs.readFileSync('app/admin/users/page.tsx', 'utf8');

const roleComponent = `
const LockedRoleField = ({ userObj, currentUser, onSave }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(userObj.role || "User");
  const isSelf = userObj.id === currentUser?.id;
  
  const handleConfirm = () => {
     if (selectedRole === (userObj.role || "User")) {
        setIsEditing(false);
        return;
     }
     if (window.confirm(\`Change \${userObj.display_name || userObj.username || 'User'} from \${userObj.role || 'User'} to \${selectedRole}?\`)) {
        onSave(userObj.id, selectedRole);
        setIsEditing(false);
     }
  };
  
  return (
     <div className="flex items-center gap-3">
        {isEditing ? (
           <>
              <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none">
                 <option value="User">User</option>
                 <option value="Admin">Admin</option>
                 <option value="Super_Admin">Super_Admin</option>
                 <option value="CEO">CEO</option>
              </select>
              <button onClick={handleConfirm} className="bg-black text-white text-xs px-3 py-1 rounded">Save</button>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-black text-xs">Cancel</button>
           </>
        ) : (
           <>
              <span className="capitalize">{userObj.role || "User"}</span>
              {!isSelf && (
                 <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700 text-xs">
                    ✎ Edit Role
                 </button>
              )}
           </>
        )}
     </div>
  );
};
`;

code = code.replace('export default function AdminUsersPage() {', roleComponent + '\nexport default function AdminUsersPage() {');

// Update currentUser logic
code = code.replace(
  'const checkAccess = async () => {\n    const currentUser =',
  'const [loggedUser, setLoggedUser] = useState<any>(null);\n  const checkAccess = async () => {\n    const currentUser ='
);
code = code.replace(
  'router.push("/admin");\n      return;\n    }\n    \n    fetchData();',
  'router.push("/admin");\n      return;\n    }\n    setLoggedUser(currentUser);\n    fetchData();'
);

// Replace the TD content
const tdRegex = /<td className="px-6 py-4 capitalize text-gray-700">\s*<select[\s\S]*?<\/select>\s*<\/td>/;
code = code.replace(tdRegex, `<td className="px-6 py-4 text-gray-700">
                      <LockedRoleField userObj={u} currentUser={loggedUser} onSave={(uid: string, newR: string) => handleRoleChange(uid, u.display_name || u.username || 'User', u.role, newR)} />
                    </td>`);

// Update handleRoleChange to avoid the second confirm
code = code.replace(
  /if \(window\.confirm\([\s\S]*?\)\) \{/,
  'if (true) {'
);

fs.writeFileSync('app/admin/users/page.tsx', code);
console.log('Fixed Users Role');
