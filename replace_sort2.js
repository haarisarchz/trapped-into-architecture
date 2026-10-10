const fs = require('fs');

const replacement = `.sort((a, b) => {
      const getSal = (s) => {
        if (!s || s.toLowerCase().includes("not disclosed") || s.toLowerCase().includes("negotiable") || s.toLowerCase().includes("as per")) return null;
        const cl = s.replace(/,/g, "");
        const m = cl.match(/\\d+/);
        return m ? Number(m[0]) : null;
      };

      const dateA = new Date(a.posted_date || 0).getTime();
      const createdA = new Date(a.created_at || a.updated_at || a.posted_date || 0).getTime();
      const dateB = new Date(b.posted_date || 0).getTime();
      const createdB = new Date(b.created_at || b.updated_at || b.posted_date || 0).getTime();

      if (sortBy === "salaryLow" || sortBy === "salaryHigh") {
        const salA = getSal(a.salary);
        const salB = getSal(b.salary);
        if (salA !== null && salB !== null) {
          return sortBy === "salaryLow" ? salA - salB : salB - salA;
        }
        if (salA !== null) return -1;
        if (salB !== null) return 1;
      }
      
      if (sortBy === "oldest") {
        return dateA !== dateB ? dateA - dateB : createdA - createdB;
      }

      return dateB !== dateA ? dateB - dateA : createdB - createdA;
    });
  }, [`;

function patchInternships() {
  let content = fs.readFileSync('app/internships/page.tsx', 'utf8');
  content = content.replace(/\.sort\(\(a, b\) => \{[\s\S]*?return 0;\s*\}\);\s*\}, \[/, replacement);
  fs.writeFileSync('app/internships/page.tsx', content);
  console.log("Patched internships sort logic");
}

function patchJobs() {
  let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');
  content = content.replace(/\.sort\(\(a, b\) => \{[\s\S]*?return dateB !== dateA \? dateB \- dateA : createdB \- createdA;\s*\}\);\s*\}, \[/, replacement);
  fs.writeFileSync('app/jobs/page.tsx', content);
  console.log("Patched jobs sort logic");
}

patchInternships();
patchJobs();
