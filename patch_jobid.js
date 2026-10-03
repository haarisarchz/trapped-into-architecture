const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// Replace the faulty useState
file = file.replace(
  'const [jobId, setJobId] = useState<string | null>(() => { if (typeof window !== "undefined") { return new URLSearchParams(window.location.search).get("id"); } return null; });',
  'const [jobId, setJobId] = useState<string | null>(null);\n  useEffect(() => {\n    if (typeof window !== "undefined") {\n      const id = new URLSearchParams(window.location.search).get("id");\n      if (id) setJobId(id);\n    }\n  }, []);'
);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Fixed jobId hydration bug!");
