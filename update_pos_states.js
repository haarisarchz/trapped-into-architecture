const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(/const \[positions, setPositions\] = useState\(\[\{position: "", experience: \[\], salary: "", description: "", completed: false\}\]\);\s*const updatePosition = \(index, field, value\) => \{\s*const newPositions = \[\.\.\.positions\];\s*newPositions\[index\]\[field\] = value;\s*setPositions\(newPositions\);\s*\};\s*const addPosition = \(\) => \{\s*setPositions\(\[\.\.\.positions, \{position: "", experience: \[\], salary: "", description: "", completed: false\}\]\);\s*\};/m, 
'const [positions, setPositions] = useState([{position: "", role: "", experience: [], salary: "", description: "", qualifications: "", skills: [], completed: false}]);\\n' +
'const [sameRequirements, setSameRequirements] = useState(true);\\n' +
'const updatePosition = (index, field, value) => {\\n' +
'  const newPositions = [...positions];\\n' +
'  newPositions[index][field] = value;\\n' +
'  setPositions(newPositions);\\n' +
'};\\n' +
'const addPosition = () => {\\n' +
'  setPositions([...positions, {position: "", role: "", experience: [], salary: "", description: "", qualifications: "", skills: [], completed: false}]);\\n' +
'};'
);

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Fixed states');