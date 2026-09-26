const fs = require('fs');

// 1. Update Jobs Page
let jobsContent = fs.readFileSync('app/jobs/page.tsx', 'utf8');
const jobsRegex = /if \(error\) \{\s*console\.log\(error\);\s*\} else \{\s*setJobs\(data \|\| \[\]\);\s*\}/s;
const jobsReplacement = `if (error) {
        console.log(error);
      } else {
        const filteredData = (data || []).filter(job => !job.position?.toLowerCase().includes("intern"));
        setJobs(filteredData);
      }`;
if (jobsContent.match(jobsRegex)) {
  jobsContent = jobsContent.replace(jobsRegex, jobsReplacement);
  fs.writeFileSync('app/jobs/page.tsx', jobsContent);
  console.log("Success updating jobs page");
} else {
  console.log("Regex not found in jobs page");
}

// 2. Update Internships Page
let intContent = fs.readFileSync('app/internships/page.tsx', 'utf8');
const intRegex = /if \(error\) \{\s*console\.log\(error\);\s*\} else \{\s*setJobs\(data \|\| \[\]\);\s*\}/s;
const intReplacement = `if (error) {
        console.log(error);
      } else {
        const filteredData = (data || []).filter(job => job.position?.toLowerCase().includes("intern"));
        setJobs(filteredData);
      }`;
if (intContent.match(intRegex)) {
  intContent = intContent.replace(intRegex, intReplacement);
  // Also fix the sorting logic in internships page to match what I did in jobs page, just in case!
  const sortRegex = /\.sort\(\(a, b\) => \{[\s\S]*?return 0;\s*\}\)/;
  const sortReplacement = `.sort((a, b) => {
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
  intContent = intContent.replace(sortRegex, sortReplacement);

  fs.writeFileSync('app/internships/page.tsx', intContent);
  console.log("Success updating internships page");
} else {
  console.log("Regex not found in internships page");
}
