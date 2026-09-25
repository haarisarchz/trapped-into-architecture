const fs = require('fs');
let code = fs.readFileSync('app/admin/activity/page.tsx', 'utf8');

// 1. Fix checkAccess to look up caller by username/email
const oldCheckAccess = `  const checkAccess = async () => {
    const user = JSON.parse(localStorage.getItem(\"currentUser\") || \"null\");
    if (!user) {
      router.push(\"/\");
      return;
    }
    const roleStr = (user.role || \"\").toLowerCase().replace(/[\\s_]+/g, \"\");
    if (![\"superadmin\", \"admin\", \"ceo\"].includes(roleStr)) {
      router.push(\"/\");
      return;
    }
    setCurrentUser(user);
    setUserRole(roleStr);
    fetchData(user, roleStr, startDate, endDate);
  };`;

const newCheckAccess = `  const checkAccess = async () => {
    const stored = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!stored) {
      router.push("/");
      return;
    }

    const lookupField = stored.username ? "username" : "email";
    const lookupValue = stored.username || stored.email;
    if (!lookupValue) {
      router.push("/");
      return;
    }

    const { data: realProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq(lookupField, lookupValue)
      .single();

    if (!realProfile) {
      router.push("/");
      return;
    }

    const roleStr = (realProfile.role || "").toLowerCase().replace(/[\\s_]+/g, "");
    if (!["superadmin", "admin", "ceo"].includes(roleStr)) {
      router.push("/");
      return;
    }
    setCurrentUser(realProfile);
    setUserRole(roleStr);
    fetchData(realProfile, roleStr, startDate, endDate);
  };`;

code = code.replace(oldCheckAccess, newCheckAccess);

// 2. Fix fetchData to not filter by posted_date in SQL
const oldFetchData = `      let jobsQuery = supabase.from(\"jobs\").select(\"*\");
      
      if (start) {
        jobsQuery = jobsQuery.gte(\"posted_date\", start);
      }
      if (end) {
        jobsQuery = jobsQuery.lte(\"posted_date\", end);
      }
      
      const { data: rawJobsData } = await jobsQuery;
      
      let jobsData = rawJobsData || [];
      if (!isCEO) {
        jobsData = jobsData.filter((job: any) => job.author_id === user.id);
      }
      
      const jobsMap: Record<string, any[]> = {};
      jobsData.forEach((job: any) => {
        // Fallback for missing author_id (until migration runs)
        // If CEO sees it, we group unknown jobs under a dummy or exclude them.
        // The prompt says \"split them according to their actual creator\", which requires the DB column.
        const id = job.author_id || \"unknown\";
        if (!jobsMap[id]) jobsMap[id] = [];
        jobsMap[id].push(job);
      });
      setAdminJobsMap(jobsMap);`;

const newFetchData = `      // Fetch all jobs, we will filter by date in JS to properly handle different date columns
      let jobsQuery = supabase.from("jobs").select("*");
      
      const { data: rawJobsData } = await jobsQuery;
      
      let jobsData = rawJobsData || [];
      if (!isCEO) {
        jobsData = jobsData.filter((job: any) => job.author_id === user.id);
      }
      
      const jobsMap: Record<string, any[]> = {};
      jobsData.forEach((job: any) => {
        const id = job.author_id || "unknown";
        if (!jobsMap[id]) jobsMap[id] = [];
        jobsMap[id].push(job);
      });
      setAdminJobsMap(jobsMap);`;

code = code.replace(oldFetchData, newFetchData);

// 3. Fix filterByDate to properly handle JS filtering
const oldFilterByDate = `  const filterByDate = (jobs: any[]) => jobs; // Handled server-side now`;

const newFilterByDate = `  const filterByDate = (jobs: any[]) => {
    return jobs.filter(job => {
      let jobDate = "";
      if (job.status === "published") {
        jobDate = job.posted_date || "";
      } else if (job.status === "scheduled") {
        jobDate = job.scheduled_date ? job.scheduled_date.split(" ")[0] : "";
      } else if (job.status === "draft") {
        // Drafts have no date stored in our DB right now, so we just include them
        return true; 
      }
      
      if (!jobDate) return true; // If we can't find a date, include it

      if (startDate && jobDate < startDate) return false;
      if (endDate && jobDate > endDate) return false;
      return true;
    });
  };`;

code = code.replace(oldFilterByDate, newFilterByDate);

fs.writeFileSync('app/admin/activity/page.tsx', code);
console.log('Fixed Activity page script generated');
