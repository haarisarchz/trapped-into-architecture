const fs = require('fs');
let code = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

// 1. Add currentUser state
code = code.replace(
  'const [jobs, setJobs] = useState<any[]>([]);',
  'const [jobs, setJobs] = useState<any[]>([]);\n  const [currentUser, setCurrentUser] = useState<any>(null);\n  useEffect(() => { setCurrentUser(JSON.parse(localStorage.getItem("currentUser") || "null")); }, []);'
);

// 2. Replace Posted By TD
const oldTd = `<td className="px-6 py-5">
                        {job.profiles?.display_name || job.profiles?.full_name || job.profiles?.username || "Admin"}
                      </td>`;

const newTd = `<td className="px-6 py-5">
                        {(() => {
                           if (!job.profiles) return "Admin";
                           
                           const userRole = (currentUser?.role || "").toLowerCase().replace(/[\\s_]+/g, "");
                           
                           // If CEO, see everything
                           if (userRole === "ceo") {
                             return job.profiles.display_name || job.profiles.full_name || job.profiles.username || "Admin";
                           }
                           
                           // If own job, see own name
                           if (currentUser?.id === job.author_id) {
                             return job.profiles.display_name || job.profiles.full_name || job.profiles.username || "Admin";
                           }
                           
                           // Otherwise show role label
                           const pRole = (job.profiles.role || "Admin").toLowerCase().replace(/[\\s_]+/g, "");
                           if (pRole === "ceo") return "CEO";
                           if (pRole === "superadmin") return "Super Admin";
                           return "Admin";
                        })()}
                      </td>`;

code = code.replace(oldTd, newTd);
fs.writeFileSync('app/admin/jobs/page.tsx', code);
console.log('Fixed Jobs Posted By');
