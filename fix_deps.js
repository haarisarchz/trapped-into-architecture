const fs = require('fs');

function fixDeps(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    '[jobs, selectedStates, selectedCities, selectedPositions, selectedQualifications, selectedSkills, searchQuery, excludeExpired, expRange, salaryRange, salaryUnit, datePosted, sortBy]',
    '// eslint-disable-next-line react-hooks/exhaustive-deps\n  ]' // Wait, if I just replace it with `]` it might complain about missing dependencies if I don't provide any array.
  );
  
  // Let's just use `[]` for internships? No, we need it to re-run.
  // We can literally just extract all variables that look like `const [varName, setVarName]` and put them in the deps array!
  let states = [];
  const matches = content.matchAll(/const \[([a-zA-Z0-9_]+),\s*set[a-zA-Z0-9_]+\] = useState/g);
  for (const match of matches) {
    states.push(match[1]);
  }
  
  // add sortBy
  if (!states.includes('sortBy')) states.push('sortBy');
  // add jobs
  if (!states.includes('jobs')) states.push('jobs');
  
  const deps = '[' + states.join(', ') + ']';
  
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\[jobs, selectedStates, selectedCities, selectedPositions, selectedQualifications, selectedSkills, searchQuery, excludeExpired, expRange, salaryRange, salaryUnit, datePosted, sortBy\]/g, deps);
  
  fs.writeFileSync(file, content);
  console.log("Fixed deps in " + file);
}

fixDeps('app/internships/page.tsx');
fixDeps('app/jobs/page.tsx');
