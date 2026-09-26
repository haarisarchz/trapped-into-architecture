const fs = require('fs');
let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');

const regex = /\.sort\(\(a, b\) => \{[\s\S]*?return 0;\s*\}\)/;

const replacement = `.sort((a, b) => {
      const getSal = (s) => {
        if (!s || s.toLowerCase().includes("not disclosed") || s.toLowerCase().includes("negotiable") || s.toLowerCase().includes("as per")) return null;
        const cl = s.replace(/,/g, "");
        const m = cl.match(/\\d+/);
        return m ? Number(m[0]) : null;
      };

      const dateA = new Date(a.posted_date || 0).getTime();
      const dateB = new Date(b.posted_date || 0).getTime();

      if (sortBy === "salaryLow" || sortBy === "salaryHigh") {
        const salA = getSal(a.salary);
        const salB = getSal(b.salary);
        if (salA !== null && salB !== null) {
          return sortBy === "salaryLow" ? salA - salB : salB - salA;
        }
        if (salA !== null) return -1;
        if (salB !== null) return 1;
        return dateB - dateA;
      }

      if (sortBy === "expiry") {
        const expA = a.post_expiry_date ? new Date(a.post_expiry_date).getTime() : Infinity;
        const expB = b.post_expiry_date ? new Date(b.post_expiry_date).getTime() : Infinity;
        if (expA !== expB) return expA - expB;
        return dateB - dateA;
      }

      return dateB - dateA;
    })`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/jobs/page.tsx', content);
  console.log("Success updating sort logic");
} else {
  console.log("Regex not found");
}
