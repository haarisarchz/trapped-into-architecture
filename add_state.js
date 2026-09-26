const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

if (!content.includes('const [jobToDelete, setJobToDelete] = useState')) {
  const target = `const [loggedProfile, setLoggedProfile] = useState<any>(null);`;
  const repl = `const [loggedProfile, setLoggedProfile] = useState<any>(null);\n  const [jobToDelete, setJobToDelete] = useState<any>(null);`;
  content = content.replace(target, repl);
  fs.writeFileSync('app/admin/jobs/page.tsx', content);
  console.log("State added");
}