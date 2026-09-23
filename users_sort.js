const fs = require('fs');
let code = fs.readFileSync('app/admin/users/page.tsx', 'utf8');

// 1. Add state and sort logic
const sortState = `
  const [sortOption, setSortOption] = useState("recent");
  
  const sortedUsers = [...users].sort((a, b) => {
     if (sortOption === "username_asc") {
        const nameA = a.display_name || a.full_name || a.username || '';
        const nameB = b.display_name || b.full_name || b.username || '';
        return nameA.localeCompare(nameB);
     }
     if (sortOption === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
     }
     // recent
     return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
`;
code = code.replace('const [users, setUsers] = useState<any[]>([]);', 'const [users, setUsers] = useState<any[]>([]);' + sortState);

// 2. Add Sort Dropdown
const titleBlock = `
          <div>
            <h1 className="text-4xl font-bold">Manage Users</h1>
            <p className="text-gray-600 mt-2">View and manage registered users and administrators.</p>
          </div>
`;
const titleBlockWithSort = `
          <div>
            <h1 className="text-4xl font-bold">Manage Users</h1>
            <p className="text-gray-600 mt-2 mb-4">View and manage registered users and administrators.</p>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm bg-white cursor-pointer focus:outline-none">
               <option value="recent">Date Joined - Recent First</option>
               <option value="oldest">Date Joined - Oldest First</option>
               <option value="username_asc">Username - Ascending</option>
            </select>
          </div>
`;
code = code.replace(titleBlock, titleBlockWithSort);

// 3. Add S.No header
code = code.replace(
  '<th className="px-6 py-4 font-semibold">User</th>',
  '<th className="px-6 py-4 font-semibold w-16">S.No.</th>\n                  <th className="px-6 py-4 font-semibold">User</th>'
);

// 4. Use sortedUsers and add S.No td
code = code.replace(
  '{users.map((u, i) => (',
  '{sortedUsers.map((u, i) => ('
);

const trStart = `<tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{u.display_name || u.full_name || u.username || 'User'}</div>`;
const trStartWithSNo = `<tr key={u.id || i} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-500 font-medium">{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{u.display_name || u.full_name || u.username || 'User'}</div>`;
code = code.replace(trStart, trStartWithSNo);

// Write changes
fs.writeFileSync('app/admin/users/page.tsx', code);
console.log('Added Users Sorting and S.No');
