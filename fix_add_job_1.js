const fs = require('fs');
let c = fs.readFileSync('temp_add_job.tsx', 'utf-8');

c = c.replace(/const \[selectedExperience, setSelectedExperience\] =[\s\S]*?useState<string\[\]>\(\[\]\);/, '');

c = c.replace(/const \[positions, setPositions\] = useState\(\[\{position: "", experience: "", salary: "", description: "", completed: false\}\]\);/, 
  'const [positions, setPositions] = useState([{position: "", experience: [], salary: "", description: "", completed: false}]);\n' +
  'const updatePosition = (index, field, value) => {\n' +
  '  const newPositions = [...positions];\n' +
  '  newPositions[index][field] = value;\n' +
  '  setPositions(newPositions);\n' +
  '};\n' +
  'const addPosition = () => {\n' +
  '  setPositions([...positions, {position: "", experience: [], salary: "", description: "", completed: false}]);\n' +
  '};\n' +
  'const removePosition = (index) => {\n' +
  '  if (positions.length > 1) {\n' +
  '    const newPositions = [...positions];\n' +
  '    newPositions.splice(index, 1);\n' +
  '    setPositions(newPositions);\n' +
  '  }\n' +
  '};\n');

c = c.replace(/setSelectedExperience\([\s\S]*?\);/, '');
c = c.replace(/setPositions\(\[\{ \.\.\.positions\[0\], salary: data\.salary \|\| '' \}\]\);/, '');
c = c.replace(/setJobDescription\(data\.job_description \|\| ""\);/, '');
c = c.replace(/setPositions\(\[\{ \.\.\.positions\[0\], position: data\.position \|\| '' \}\]\);/, 
  'setPositions([{ \n' +
  '  position: data.position || "",\n' +
  '  salary: data.salary || "",\n' +
  '  description: data.job_description || "",\n' +
  '  experience: Array.isArray(data.experience) ? data.experience : (data.experience ? [data.experience] : []),\n' +
  '  completed: false\n' +
  '}]);\n');

c = c.replace(/setPositions\(\[\{ \.\.\.positions\[0\], position: ai\.position \|\| ai\.job_title \|\| '' \}\]\);/, '');
c = c.replace(/if \(Array\.isArray\(ai\.experience\)\) setSelectedExperience\(ai\.experience\);\n\s*else if \(ai\.experience\) setSelectedExperience\(\[ai\.experience\]\);/, '');
c = c.replace(/setJobDescription\(ai\.description \|\| ai\.job_description \|\| ""\);/, 
  'setPositions([{\n' +
  '  position: ai.position || ai.job_title || "",\n' +
  '  experience: Array.isArray(ai.experience) ? ai.experience : (ai.experience ? [ai.experience] : []),\n' +
  '  salary: ai.salary || "",\n' +
  '  description: ai.description || ai.job_description || "",\n' +
  '  completed: false\n' +
  '}]);\n');

fs.writeFileSync('temp_add_job.tsx', c);