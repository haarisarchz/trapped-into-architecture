const fs = require('fs');
let code = fs.readFileSync('app/admin/activity/page.tsx', 'utf8');

// 1. Update dropdown options (add Previous Month and reorder)
const oldControls = `              <div className="flex flex-wrap gap-4 items-end">
                {userRole === "ceo" && (
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Administrator:</label>
                    <select
                      value={selectedAdminId}
                      onChange={(e) => setSelectedAdminId(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
                    >
                      <option value="all">All Administrators ▼</option>
                      {admins.map(a => (
                        <option key={a.id} value={a.id}>{a.display_name || a.full_name || a.username}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Period:</label>
                  <select
                    value={datePreset}
                    onChange={(e) => setDatePreset(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
                  >
                    <option value="this_month">This Month</option>
                    <option value="last_3_months">Last 3 Months</option>
                    <option value="last_6_months">Last 6 Months</option>
                    <option value="last_1_year">Last 1 Year</option>
                    <option value="lifetime">Lifetime</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                </div>
                {datePreset === "custom" && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">From:</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">To:</label>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2" />
                    </div>
                    <button 
                      onClick={handleSubmitDateRange}
                      className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                    >
                      Apply
                    </button>
                  </>
                )}
              </div>`;

const newControls = `              <div className="flex flex-wrap gap-4 items-end">
                {userRole === "ceo" && (
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Administrator:</label>
                    <select
                      value={selectedAdminId}
                      onChange={(e) => setSelectedAdminId(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
                    >
                      <option value="all">All Administrators ▼</option>
                      {admins.map(a => (
                        <option key={a.id} value={a.id}>{a.display_name || a.full_name || a.username}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Period:</label>
                  <select
                    value={datePreset}
                    onChange={(e) => setDatePreset(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
                  >
                    <option value="this_month">This Month</option>
                    <option value="previous_month">Previous Month</option>
                    <option value="last_3_months">Last 3 Months</option>
                    <option value="last_6_months">Last 6 Months</option>
                    <option value="last_1_year">Last 1 Year</option>
                    <option value="lifetime">Lifetime</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                </div>
                {datePreset === "custom" && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">From:</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">To:</label>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2" />
                    </div>
                    <button 
                      onClick={handleSubmitDateRange}
                      className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                    >
                      Apply
                    </button>
                  </>
                )}
              </div>`;
code = code.replace(oldControls, newControls);

// 2. Update date preset handling to include Previous Month and correct calendar math
const oldEffect = `  useEffect(() => {
    if (datePreset === "custom") return;
    if (!currentUser || !userRole) return;
    
    const now = new Date();
    let start = "";
    let end = "";
    
    if (datePreset === "this_month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    } else if (datePreset === "last_month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    } else if (datePreset === "last_3_months") {
      start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString().split('T')[0];
    } else if (datePreset === "last_6_months") {
      start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString().split('T')[0];
    } else if (datePreset === "last_1_year") {
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString().split('T')[0];
    } else if (datePreset === "lifetime") {
      start = "";
      end = "";
    }
    
    setStartDate(start);
    setEndDate(end);
    fetchData(currentUser, userRole, start, end);
  }, [datePreset]);`;

const newEffect = `  useEffect(() => {
    if (datePreset === "custom") return;
    if (!currentUser || !userRole) return;
    
    const now = new Date();
    let start = "";
    let end = "";
    
    if (datePreset === "this_month") {
      // First day of current month → today
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      end = ""; // empty means up to today handled by fetchData default
    } else if (datePreset === "previous_month") {
      // Full previous calendar month
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start = new Date(prev.getFullYear(), prev.getMonth(), 1).toISOString().split('T')[0];
      // last day of that month
      const lastDay = new Date(prev.getFullYear(), prev.getMonth() + 1, 0);
      end = lastDay.toISOString().split('T')[0];
    } else if (datePreset === "last_3_months") {
      // First day of month two months ago → today
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
    } else if (datePreset === "last_6_months") {
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0];
    } else if (datePreset === "last_1_year") {
      start = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString().split('T')[0];
    } else if (datePreset === "lifetime") {
      start = "";
      end = "";
    }
    
    setStartDate(start);
    setEndDate(end);
    fetchData(currentUser, userRole, start, end);
  }, [datePreset]);`;
code = code.replace(oldEffect, newEffect);

// 3. Update fetchData to apply server‑side date filters for published and scheduled jobs
const oldFetchData = `    // Fetch all jobs, we will filter by date in JS to properly handle different date columns
    let jobsQuery = supabase.from("jobs").select("*");
    
    const { data: rawJobsData } = await jobsQuery;
    
    let jobsData = rawJobsData || [];
    if (!isCEO) {
      jobsData = jobsData.filter((job: any) => job.author_id === user.id);
    }
    
    const jobsMap: Record<string, any[]> = {};
    jobsData.forEach((job: any) => {
      const id = job.author_id || "unknown";
      
      // Draft visibility rule: Creator + CEO only
      if (job.status === 'draft' && !isCEO && id !== user.id) {
        return;
      }
      
      if (!jobsMap[id]) jobsMap[id] = [];
      jobsMap[id].push(job);
    });
    setAdminJobsMap(jobsMap);`;

const newFetchData = `    // Build server‑side date constraints
    let jobsQuery = supabase.from("jobs").select("*");
    if (start) {
      // Apply inclusive start for both published and scheduled dates
      jobsQuery = jobsQuery.or(
        `posted_date.gte.${start},scheduled_date.gte.${start}`
      );
    }
    if (end) {
      // Make end inclusive by adding one day and using <
      const exclusiveEnd = new Date(end);
      exclusiveEnd.setDate(exclusiveEnd.getDate() + 1);
      const exclusiveStr = exclusiveEnd.toISOString().split('T')[0];
      jobsQuery = jobsQuery.or(
        `posted_date.lt.${exclusiveStr},scheduled_date.lt.${exclusiveStr}`
      );
    }
    const { data: rawJobsData } = await jobsQuery;
    let jobsData = rawJobsData || [];
    if (!isCEO) {
      jobsData = jobsData.filter((job: any) => job.author_id === user.id);
    }
    const jobsMap: Record<string, any[]> = {};
    jobsData.forEach((job: any) => {
      const id = job.author_id || "unknown";
      // Draft visibility rule: Creator + CEO only
      if (job.status === 'draft' && !isCEO && id !== user.id) {
        return;
      }
      if (!jobsMap[id]) jobsMap[id] = [];
      jobsMap[id].push(job);
    });
    setAdminJobsMap(jobsMap);`;
code = code.replace(oldFetchData, newFetchData);

// 4. Adjust filterByDate to simply return jobs (now server filtered), but keep for safety
const oldFilter = `  const filterByDate = (jobs: any[]) => jobs; // Handled server-side now`;
const newFilter = `  const filterByDate = (jobs: any[]) => jobs;`;
code = code.replace(oldFilter, newFilter);

fs.writeFileSync('app/admin/activity/page.tsx', code);
console.log('Applied date‑preset and server‑side filtering updates');
