const fs = require('fs');
let content = fs.readFileSync('app/jobs/page.tsx', 'utf8');

// 1. Change useState and setDatePosted
content = content.replace(/useState\("all"\)/g, 'useState("")');
content = content.replace(/setDatePosted\("all"\)/g, 'setDatePosted("")');

// 2. Fix the date filter logic using Regex
const oldLogicRegex = /let dateMatch = true;[\s\S]*?dateMatch = diffDays > 30;\s*\}\s*\}/g;

const newLogic = `let dateMatch = true;
    if (datePosted !== "" && datePosted !== "all") {
      const rawDate = job.posted_date || job.created_at || job.postedDate;
      const postedDate = rawDate ? new Date(rawDate) : null;
      const now = new Date();
      if (!postedDate) {
        dateMatch = false;
      } else {
        const diffHours = (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60);
        const diffDays = diffHours / 24;
        
        if (datePosted === "24h") dateMatch = diffHours <= 24;
        else if (datePosted === "7d") dateMatch = diffDays <= 7;
        else if (datePosted === "30d") dateMatch = diffDays <= 30;
        else if (datePosted === "older") dateMatch = diffDays > 30;
      }
    }`;

content = content.replace(oldLogicRegex, newLogic);

// Ensure the return block includes dateMatch
// Currently it is: searchMatch && expiryMatch
// We want: searchMatch && expiryMatch && dateMatch
content = content.replace(/searchMatch &&\s*expiryMatch\s*\);/g, 'searchMatch &&\n      expiryMatch &&\n      dateMatch\n    );');

fs.writeFileSync('app/jobs/page.tsx', content);
console.log("Fixed dateMatch logic and state");
