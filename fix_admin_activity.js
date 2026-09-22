const fs = require('fs');

let code = fs.readFileSync('app/admin/activity/page.tsx', 'utf8');

const oldJobsQuery = /let jobsQuery = supabase\.from\("jobs"\)\.select\("\*"\);[\s\S]*?const \{ data: jobsData \} = await jobsQuery;/;

const newJobsQuery = `let jobsQuery = supabase.from("jobs").select("*");
      
      if (start) {
        jobsQuery = jobsQuery.gte("posted_date", start + "T00:00:00Z");
      }
      if (end) {
        const nextDay = new Date(end);
        nextDay.setDate(nextDay.getDate() + 1);
        jobsQuery = jobsQuery.lt("posted_date", nextDay.toISOString().split("T")[0] + "T00:00:00Z");
      }
      
      const { data: rawJobsData } = await jobsQuery;
      
      let jobsData = rawJobsData || [];
      if (!isCEO) {
        jobsData = jobsData.filter((job: any) => !job.author_id || job.author_id === user.id);
      }`;

if (code.match(oldJobsQuery)) {
  code = code.replace(oldJobsQuery, newJobsQuery);
  fs.writeFileSync('app/admin/activity/page.tsx', code);
}
