const fs = require('fs');
let code = fs.readFileSync('app/admin/activity/page.tsx', 'utf8');

// 1. Fix fetchData to allow all profiles and filter drafts based on role
const oldFetchData = `    if (!isCEO) {
      profilesQuery = profilesQuery.eq("id", user.id);
    }
    const { data: profilesData } = await profilesQuery.order("created_at", { ascending: false });
    
    if (profilesData) {
      const allAdmins = profilesData.filter(p => ["admin", "superadmin", "ceo"].includes((p.role || "").toLowerCase().replace(/[\\s_]+/g, "")));
      setAdmins(allAdmins);

      // Fetch all jobs, we will filter by date in JS to properly handle different date columns
      let jobsQuery = supabase.from("jobs").select("*");
      
      const { data: rawJobsData } = await jobsQuery;
      
      let jobsData = rawJobsData || [];
      if (!isCEO) {
        jobsData = jobsData.filter((job: any) => job.author_id === user.id);
      }`;

const newFetchData = `    const { data: profilesData } = await profilesQuery.order("created_at", { ascending: false });
    
    if (profilesData) {
      const allAdmins = profilesData.filter(p => ["admin", "superadmin", "ceo"].includes((p.role || "").toLowerCase().replace(/[\\s_]+/g, "")));
      setAdmins(allAdmins);

      // Fetch all jobs, we will filter by date in JS to properly handle different date columns
      let jobsQuery = supabase.from("jobs").select("*");
      
      const { data: rawJobsData } = await jobsQuery;
      
      let jobsData = rawJobsData || [];`;

code = code.replace(oldFetchData, newFetchData);

const oldJobsLoop = `      jobsData.forEach((job: any) => {
        const id = job.author_id || "unknown";
        if (!jobsMap[id]) jobsMap[id] = [];
        jobsMap[id].push(job);
      });`;

const newJobsLoop = `      jobsData.forEach((job: any) => {
        const id = job.author_id || "unknown";
        
        // Draft visibility rule: Creator + CEO only
        if (job.status === 'draft' && !isCEO && id !== user.id) {
          return;
        }
        
        if (!jobsMap[id]) jobsMap[id] = [];
        jobsMap[id].push(job);
      });`;

code = code.replace(oldJobsLoop, newJobsLoop);

// 2. Add the Period Selector to the UI
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
                  <label className="block text-sm text-gray-500 mb-1">From:</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">To:</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2" />
                </div>
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

// 3. Mask name in Card Title and Activity Feed
const oldCardTitle = `                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900">{admin.display_name || admin.full_name || admin.username}</h3>
                      <div className="text-sm text-gray-500 mb-1">{admin.email}</div>
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full capitalize font-medium">
                        {admin.role}
                      </span>
                    </div>`;

const newCardTitle = `                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900">
                        {(() => {
                          let displayName = admin.display_name || admin.full_name || admin.username;
                          if (userRole !== "ceo" && admin.id !== currentUser.id) {
                            const pRole = (admin.role || "").toLowerCase().replace(/[\\s_]+/g, "");
                            if (pRole === "ceo") return "CEO";
                            if (pRole === "superadmin") return "Super Admin";
                            return "Admin";
                          }
                          return displayName;
                        })()}
                      </h3>
                      { (userRole === "ceo" || admin.id === currentUser.id) && (
                        <div className="text-sm text-gray-500 mb-1">{admin.email}</div>
                      )}
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full capitalize font-medium">
                        {admin.role}
                      </span>
                    </div>`;

code = code.replace(oldCardTitle, newCardTitle);

const oldFeedItem = `                              <div key={j} className="flex justify-between items-center text-sm p-3 rounded-lg border border-gray-100 bg-gray-50">
                                <div className="font-medium text-gray-800 max-w-[150px] truncate">{job.position}</div>
                                <div className="text-gray-500 text-xs">
                                  {new Date(job.posted_date || job.created_at).toLocaleDateString('en-GB', {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                  })}
                                </div>
                                <div className={\`text-xs px-2 py-1 rounded-full capitalize \${job.status === 'published' ? 'bg-green-100 text-green-800' : job.status === 'draft' ? 'bg-gray-200 text-gray-800' : 'bg-blue-100 text-blue-800'}\`}>
                                  {job.status === 'published' ? 'Published' : job.status === 'draft' ? 'Saved Draft' : 'Scheduled'}
                                </div>
                              </div>`;

const newFeedItem = `                              <div key={j} className="flex justify-between items-center text-sm p-3 rounded-lg border border-gray-100 bg-gray-50">
                                <div>
                                  <div className="font-medium text-gray-800 max-w-[150px] truncate">{job.position}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {(() => {
                                      let displayName = admin.display_name || admin.full_name || admin.username;
                                      if (userRole !== "ceo" && admin.id !== currentUser.id) {
                                        const pRole = (admin.role || "").toLowerCase().replace(/[\\s_]+/g, "");
                                        if (pRole === "ceo") displayName = "CEO";
                                        else if (pRole === "superadmin") displayName = "Super Admin";
                                        else displayName = "Admin";
                                      }
                                      if (job.status === 'published') return \`Posted By: \${displayName}\`;
                                      if (job.status === 'draft') return \`Draft Saved — \${displayName}\`;
                                      return \`Scheduled By: \${displayName}\`;
                                    })()}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={\`text-xs px-2 py-1 rounded-full capitalize inline-block mb-1 \${job.status === 'published' ? 'bg-green-100 text-green-800' : job.status === 'draft' ? 'bg-gray-200 text-gray-800' : 'bg-blue-100 text-blue-800'}\`}>
                                    {job.status === 'published' ? 'Published' : job.status === 'draft' ? 'Saved Draft' : 'Scheduled'}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {job.posted_date || job.created_at ? new Date(job.posted_date || job.created_at).toLocaleDateString('en-GB', {
                                      day: '2-digit', month: 'short', year: 'numeric'
                                    }) : ''}
                                  </div>
                                </div>
                              </div>`;

code = code.replace(oldFeedItem, newFeedItem);

fs.writeFileSync('app/admin/activity/page.tsx', code);
console.log('Fixed Activity page script generated 2');
