const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

if (!content.includes('const [country, setCountry] = useState')) {
  content = content.replace(
    'const [state, setState] = useState("");',
    'const [state, setState] = useState("");\n  const [country, setCountry] = useState("India");'
  );
  fs.writeFileSync('app/admin/add-job/page.tsx', content);
  console.log("Added useState for country");
} else {
  console.log("Already exists");
}