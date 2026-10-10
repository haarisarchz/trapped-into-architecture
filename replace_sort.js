const fs = require('fs');

function replaceSortBlock(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Find .sort((a, b) => {
  const sortStartIdx = content.indexOf('.sort((a, b) => {');
  if (sortStartIdx === -1) {
     console.log("Could not find sort block in " + file);
     return;
  }
  
  // Find the end of the sort block (we know it's followed by "}, [selectedStates" or "}, [" or just "});")
  // Let's find the `  }, [` which marks the end of the useMemo.
  const useMemoEndIdx = content.indexOf('}, [', sortStartIdx);
  if (useMemoEndIdx === -1) {
     console.log("Could not find end of useMemo in " + file);
     return;
  }

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
  `;

  content = content.substring(0, sortStartIdx) + replacement + content.substring(useMemoEndIdx);
  fs.writeFileSync(file, content);
  console.log("Replaced sort block in " + file);
}

replaceSortBlock('app/jobs/page.tsx');
replaceSortBlock('app/internships/page.tsx');
