const fs = require('fs');
let code = fs.readFileSync('app/admin/activity/page.tsx', 'utf8');

// Fix date queries
const oldJobsQuery = `      if (start) {
        jobsQuery = jobsQuery.gte("posted_date", start + "T00:00:00Z");
      }
      if (end) {
        const nextDay = new Date(end);
        nextDay.setDate(nextDay.getDate() + 1);
        jobsQuery = jobsQuery.lt("posted_date", nextDay.toISOString().split("T")[0] + "T00:00:00Z");
      }`;
      
const newJobsQuery = `      if (start) {
        jobsQuery = jobsQuery.gte("posted_date", start);
      }
      if (end) {
        jobsQuery = jobsQuery.lte("posted_date", end);
      }`;
code = code.replace(oldJobsQuery, newJobsQuery);

// Fix role handling for admin/superadmin seeing their own
const oldJobsData = `      if (!isCEO) {
        jobsData = jobsData.filter((job: any) => !job.author_id || job.author_id === user.id);
      }
      if (jobsData) {
        const jobsMap: Record<string, any[]> = {};
        jobsData.forEach(job => {
          if (job.author_id) {
            if (!jobsMap[job.author_id]) jobsMap[job.author_id] = [];
            jobsMap[job.author_id].push(job);
          }
        });
        setAdminJobsMap(jobsMap);
      }`;

const newJobsData = `      if (!isCEO) {
        jobsData = jobsData.filter((job: any) => job.author_id === user.id);
      }
      
      const jobsMap: Record<string, any[]> = {};
      jobsData.forEach((job: any) => {
        // Fallback for missing author_id (until migration runs)
        // If CEO sees it, we group unknown jobs under a dummy or exclude them.
        // The prompt says "split them according to their actual creator", which requires the DB column.
        const id = job.author_id || "unknown";
        if (!jobsMap[id]) jobsMap[id] = [];
        jobsMap[id].push(job);
      });
      setAdminJobsMap(jobsMap);`;
code = code.replace(oldJobsData, newJobsData);

fs.writeFileSync('app/admin/activity/page.tsx', code);
console.log('Fixed Activity page logic');
