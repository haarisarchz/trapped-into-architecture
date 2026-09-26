const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

// 1. Update positions initial state
c = c.replace(/const \[positions, setPositions\] = useState\(\[\s*\{\s*position: "",\s*experience: "",\s*salary: "",\s*description: ""\s*\}\s*\]\);/, 'const [positions, setPositions] = useState([{ position: "", role: "", experience: "", salary: "", description: "", qualifications: "", skills: [] }]);\\n  const [sameRequirements, setSameRequirements] = useState(true);');

// 2. Update addPosition
c = c.replace(/const addPosition = \(\) => \{\s*setPositions\(\[\.\.\.positions, \{ position: "", experience: "", salary: "", description: "" \}\]\);\s*\};/, 'const addPosition = () => { setPositions([...positions, { position: "", role: "", experience: "", salary: "", description: "", qualifications: "", skills: [] }]); };');

// 3. Update publicJobs map payload
const pubJobOld = 'position: pos.position,\\n      experience: pos.experience,\\n      salary: pos.salary,\\n      job_description: pos.description,\\n      qualifications: qualifications,\\n      skills_required: skills,';
const pubJobNew = 'position: pos.position,\\n      experience: pos.experience,\\n      salary: pos.salary,\\n      job_description: pos.role ? **Job Role:** \\\\n\\n\\ : pos.description,\\n      qualifications: sameRequirements ? qualifications : pos.qualifications,\\n      skills_required: sameRequirements ? skills : pos.skills,';
c = c.replace(pubJobOld, pubJobNew);

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Done state updates');