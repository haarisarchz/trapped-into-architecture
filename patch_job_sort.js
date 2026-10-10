const fs = require('fs');
let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');

const filterStart = content.indexOf('const filteredJobs = useMemo(() => {');
const actualSortStart = content.indexOf('.sort((a, b) => {', filterStart);
const sortEnd = content.indexOf('});', actualSortStart) + 3;

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
    });`;

if (actualSortStart !== -1 && sortEnd !== -1) {
  content = content.substring(0, actualSortStart) + replacement + content.substring(sortEnd);
  fs.writeFileSync('app/jobs/page.tsx', content);
  console.log("Patched jobs sort safely.");
}
