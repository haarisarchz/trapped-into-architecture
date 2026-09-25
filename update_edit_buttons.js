const fs = require('fs');
let c = fs.readFileSync('app/admin/jobs/page.tsx', 'utf-8');

const regex = /\{\/\* EDIT \*\/\}\s*<button[\s\S]*?Edit\s*<\/button>\s*\{\/\* DELETE \*\/\}\s*<button[\s\S]*?Delete\s*<\/button>/m;

const replacement = '{(() => {\\n' +
'  const myRole = (loggedProfile?.role || "").toLowerCase().replace(/[\\\\s_]+/g, "");\\n' +
'  const canEdit = myRole === "ceo" || loggedProfile?.id === job.author_id;\\n' +
'  if (!canEdit) return null;\\n' +
'  return (\\n' +
'    <>\\n' +
'      {/* EDIT */}\\n' +
'      <button onClick={(e) => { e.stopPropagation(); window.open(/admin/add-job?id=\\, "_blank"); }} className="px-4 py-2 rounded-xl border hover:bg-white transition">Edit</button>\\n' +
'      {/* DELETE */}\\n' +
'      <button onClick={(e) => { e.stopPropagation(); deleteJob(job.id); }} className="px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition">Delete</button>\\n' +
'    </>\\n' +
'  );\\n' +
'})()}';

c = c.replace(regex, replacement);
fs.writeFileSync('app/admin/jobs/page.tsx', c);
console.log('Fixed edit buttons');