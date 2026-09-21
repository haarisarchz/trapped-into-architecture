const fs = require('fs');
let code = fs.readFileSync('app/admin/users/page.tsx', 'utf8');

// 1. Add expandedAdmin state
code = code.replace(/const \[jobCounts, setJobCounts\] = useState<Record<string, number>>\(\{\}\);/, 
  'const [jobCounts, setJobCounts] = useState<Record<string, number>>({});\n  const [adminJobsMap, setAdminJobsMap] = useState<Record<string, any[]>>({});\n  const [expandedAdmin, setExpandedAdmin] = useState<string | null>(null);');

// 2. Fetch admin jobs mapping
const jobsDataFetch = `      const { data: jobsData } = await supabase.from("jobs").select("*");
      if (jobsData) {
        const counts: Record<string, number> = {};
        const jobsMap: Record<string, any[]> = {};
        jobsData.forEach(job => {
          if (job.username) {
            counts[job.username] = (counts[job.username] || 0) + 1;
            if (!jobsMap[job.username]) jobsMap[job.username] = [];
            jobsMap[job.username].push(job);
          }
        });
        setJobCounts(counts);
        setAdminJobsMap(jobsMap);
      }`;
      
code = code.replace(/      const \{ data: jobsData \} = await supabase\.from\("jobs"\)\.select\("username"\);\n      if \(jobsData\) \{\n        const counts: Record<string, number> = \{\};\n        jobsData\.forEach\(job => \{\n          if \(job\.username\) \{\n            counts\[job\.username\] = \(counts\[job\.username\] \|\| 0\) \+ 1;\n          \}\n        \}\);\n        setJobCounts\(counts\);\n      \}/, jobsDataFetch);

// 3. Render expanded row
const tableBodyEnd = `              ))}
              {(activeTab === 'users' ? users : admins).length === 0 && (`;
              
const newTableBody = `              ))}
              {(activeTab === 'users' ? users : admins).length === 0 && (`;
              
// Wait, I can just replace the row mapping to include a Fragment with the row AND the expanded row.
const rowMapStart = `{(activeTab === 'users' ? users : admins).map((user) => (`;
const rowMapEnd = `                </tr>
              ))}`;
              
if (code.includes(rowMapStart)) {
  const newRowMap = `{(activeTab === 'users' ? users : admins).map((user) => (
                <import-react-fragment key={user.id}>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">
                    <div className="flex items-center gap-2">
                      {user.full_name || user.displayName || user.username}
                      {activeTab === 'admins' && (
                        <button 
                          onClick={() => setExpandedAdmin(expandedAdmin === user.id ? null : user.id)}
                          className="ml-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
                        >
                          {expandedAdmin === user.id ? 'Hide Posts' : 'View Posts'}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">{user.email || "N/A"}</div>
                    {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  {activeTab === 'admins' && (
                    <td className="p-4 text-sm font-bold">
                      {jobCounts[user.username] || 0}
                    </td>
                  )}
                  <td className="p-4">
                    <select 
                      value={user.role || 'user'} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="border rounded p-1 text-sm bg-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                      <option value="ceo">CEO</option>
                    </select>
                  </td>
                </tr>
                {expandedAdmin === user.id && activeTab === 'admins' && (
                  <tr className="bg-gray-50 border-b">
                    <td colSpan={5} className="p-6">
                      <h4 className="font-bold text-sm mb-4">Posts by {user.username}</h4>
                      {!(adminJobsMap[user.username] && adminJobsMap[user.username].length > 0) ? (
                        <p className="text-sm text-gray-500">No jobs posted yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {adminJobsMap[user.username].map((job: any) => (
                            <div key={job.id} className="flex justify-between items-center bg-white p-3 border rounded shadow-sm text-sm">
                              <div>
                                <div className="font-semibold">{job.position}</div>
                                <div className="text-gray-500 text-xs">{job.firm_name}</div>
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(job.created_at).toLocaleDateString()}
                              </div>
                              <div>
                                <span className={\`px-2 py-1 rounded-full text-xs \${job.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}\`}>
                                  {job.status}
                                </span>
                              </div>
                              <a href={\`/jobs/\${job.id}\`} target="_blank" className="text-blue-600 hover:underline text-xs">
                                View Job
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
                </import-react-fragment>
              ))}`;
  
  // Need to replace Fragment import and the block
  let blockRegex = /\{\(activeTab === 'users' \? users : admins\)\.map\(\(user\) => \([\s\S]*?\n\s*\)\)\}/;
  code = code.replace(blockRegex, newRowMap.replace(/import-react-fragment/g, 'React.Fragment'));
  if (!code.includes('import React')) {
      code = code.replace(/import \{ useState/, 'import React, { useState');
  }
}

fs.writeFileSync('app/admin/users/page.tsx', code);
console.log('Fixed admin users page expanded rows');
