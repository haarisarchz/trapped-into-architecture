const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// 1. Fix jobId initial state to be synchronous
file = file.replace(
  'const [jobId, setJobId] = useState<string | null>(null);',
  'const [jobId, setJobId] = useState<string | null>(() => { if (typeof window !== "undefined") { return new URLSearchParams(window.location.search).get("id"); } return null; });'
);
// Remove the useEffect that sets jobId asynchronously to prevent double renders
file = file.replace(
  /useEffect\(\(\) => \{\s*const params = new URLSearchParams\(window\.location\.search\);\s*setJobId\(params\.get\("id"\)\);\s*\}, \[\]\);/g,
  ''
);

// 2. Fix the qualifications and skills state arrays crashing due to strings
file = file.replace(
  'setQualifications(job.qualifications || "");',
  'setQualifications(Array.isArray(job.qualifications) ? job.qualifications : (job.qualifications ? [job.qualifications] : []));'
);
file = file.replace(
  'setSkills(job.skills_required || "");',
  'setSkills(Array.isArray(job.skills_required) ? job.skills_required : (job.skills_required ? [job.skills_required] : []));'
);

// 3. Fix the position mapping array handling
file = file.replace(
  'qualifications: s.qualifications || "",',
  'qualifications: Array.isArray(s.qualifications) ? s.qualifications.join(", ") : (s.qualifications || ""), // Prevent array object Object rendering'
);
file = file.replace(
  'skills: s.skills_required || [],',
  'skills: Array.isArray(s.skills_required) ? s.skills_required : (s.skills_required ? [s.skills_required] : []), // Prevent map crash'
);

// 4. Wrap fetchJob in a try...catch for safety and add strict Apply/Email loading
file = file.replace(
  `        if (job.apply_link) {
          setApplicationType("apply");
          setapply_link(job.apply_link);
        } else if (job.application_email) {
          setApplicationType("email");
          setapplication_email(job.application_email);
        }`,
  `        if (job.apply_link && job.apply_link.trim() !== "") {
          setApplicationType("apply");
          setapply_link(job.apply_link);
        } else if (job.application_email && job.application_email.trim() !== "") {
          setApplicationType("email");
          setapplication_email(job.application_email);
        } else {
          setApplicationType("apply");
          setapply_link("");
        }`
);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log('Fixed fetchJob logic');
