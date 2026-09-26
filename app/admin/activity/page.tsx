"use client";
import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function AdminActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState("");
  
  const [admins, setAdmins] = useState<any[]>([]);
  const [adminJobsMap, setAdminJobsMap] = useState<Record<string, any[]>>({});
  const [expandedAdmin, setExpandedAdmin] = useState<string | null>(null);

  // Date range and config
  const [datePreset, setDatePreset] = useState("this_month");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0]; // first of current month
  });
  const [endDate, setEndDate] = useState("");
  const [rupeesPerPost, setRupeesPerPost] = useState(10); // Global config fallback
  
  // CEO Filter
  const [selectedAdminId, setSelectedAdminId] = useState<string>("all");

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
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

    const roleStr = (realProfile.role || "").toLowerCase().replace(/[\s_]+/g, "");
    if (!["superadmin", "admin", "ceo"].includes(roleStr)) {
      router.push("/");
      return;
    }
    setCurrentUser(realProfile);
    setUserRole(roleStr);
    fetchData(realProfile, roleStr, startDate, endDate);
  };

  const fetchData = async (user: any, role: string, start?: string, end?: string) => {
    setLoading(true);
    
    const { data: settingsData } = await supabase.from("site_settings").select("*").single();
    if (settingsData && settingsData.rupees_per_post) {
      setRupeesPerPost(settingsData.rupees_per_post);
    }

    const isCEO = role === "ceo";

    let profilesQuery = supabase.from("profiles").select("*");
    const { data: profilesData } = await profilesQuery.order("created_at", { ascending: false });
    
    if (profilesData) {
      const allAdmins = profilesData.filter(p => ["admin", "superadmin", "ceo"].includes((p.role || "").toLowerCase().replace(/[\s_]+/g, "")));
      setAdmins(allAdmins);

      // Fetch all jobs, we will filter by date in JS to properly handle different date columns
      let jobsQuery = supabase.from("jobs").select("*");
      
      const { data: rawJobsData } = await jobsQuery;
      
      let jobsData = rawJobsData || [];
      
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
      setAdminJobsMap(jobsMap);
    }
    setLoading(false);
  };

  const filterByDate = (jobs: any[]) => {
    return jobs.filter(job => {
      let jobDate = "";
      if (job.status === "published") {
        jobDate = (job.posted_date || "").split("T")[0].split(" ")[0];
      } else if (job.status === "scheduled") {
        jobDate = (job.scheduled_date || "").split("T")[0].split(" ")[0];
      } else if (job.status === "draft") {
        jobDate = (job.posted_date || job.created_at || "").split("T")[0].split(" ")[0]; 
      }
      
      if (!jobDate) return true; // If we can't find a date, include it

      if (startDate && jobDate < startDate) return false;
      if (endDate && jobDate > endDate) return false;
      return true;
    });
  };

  
  useEffect(() => {
    if (datePreset === "custom") return;
    if (!currentUser || !userRole) return;
    
    const now = new Date();
    let start = "";
    let end = "";
    
    if (datePreset === "this_month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (datePreset === "previous_month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    } else if (datePreset === "last_3_months") {
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (datePreset === "last_6_months") {
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0];
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (datePreset === "last_1_year") {
      start = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1).toISOString().split('T')[0];
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (datePreset === "lifetime") {
      start = "";
      end = "";
    }
    
    setStartDate(start);
    setEndDate(end);
    fetchData(currentUser, userRole, start, end);
  }, [datePreset]);

  const handleSubmitDateRange = () => {
    if (currentUser && userRole) {
      fetchData(currentUser, userRole, startDate, endDate);
    }
  };

  const [editingRateAdminId, setEditingRateAdminId] = useState<string | null>(null);
  const [editingRateValue, setEditingRateValue] = useState("");

  const handleUpdateIndividualRate = async (adminId: string, newRate: number) => {
    // Graceful fail if column doesn't exist yet
    try {
      await supabase.from("profiles").update({ rupees_per_post: newRate }).eq("id", adminId);
      setAdmins(admins.map(a => a.id === adminId ? { ...a, rupees_per_post: newRate } : a));
      setEditingRateAdminId(null);
    } catch(e) {}
  };
  const updateRupeesPerPost = async (val: number) => {
    setRupeesPerPost(val);
    if (userRole === "ceo") {
      await supabase.from("site_settings").update({ rupees_per_post: val }).eq("id", 1);
    }
  };

  const displayAdmins = useMemo(() => {
  if (userRole !== "ceo") return admins.filter(a => a.id === currentUser?.id);
  if (selectedAdminId === "all") return admins;
  return admins.filter(a => a.id === selectedAdminId);
}, [admins, selectedAdminId, userRole, currentUser]);

  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col">
      <Navbar />
      <section className="flex-1 w-full px-6 lg:px-12 py-10 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Admin Activity</h1>
            <p className="text-gray-600 mt-2">
              {currentUser?.display_name || currentUser?.full_name || currentUser?.username}
            </p>
          </div>
          <button onClick={() => router.push("/admin")} className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition flex items-center gap-2 shrink-0">
            ← Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading data...</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap gap-6 items-end justify-between">
              
              <div className="flex flex-wrap gap-4 items-end w-full lg:w-auto">
                {userRole === "ceo" && (
                  <div className="w-full sm:w-auto">
                    <label className="block text-sm text-gray-800 md:text-gray-500 mb-1">Administrator:</label>
                    <select
                      value={selectedAdminId}
                      onChange={(e) => setSelectedAdminId(e.target.value)}
                      className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2 bg-white"
                    >
                      <option value="all">All Administrators —</option>
                      {admins.map(a => (
                        <option key={a.id} value={a.id}>{a.display_name || a.full_name || a.username}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="w-full sm:w-auto">
                  <label className="block text-sm text-gray-800 md:text-gray-500 mb-1">Period:</label>
                  <select
                    value={datePreset}
                    onChange={(e) => setDatePreset(e.target.value)}
                    className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2 bg-white"
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
                    <div className="w-full sm:w-auto">
                      <label className="block text-sm text-gray-800 md:text-gray-500 mb-1">From:</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2" />
                    </div>
                    <div className="w-full sm:w-auto">
                      <label className="block text-sm text-gray-800 md:text-gray-500 mb-1">To:</label>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2" />
                    </div>
                    <button 
                      onClick={handleSubmitDateRange}
                      className="w-full sm:w-auto bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                    >
                      Apply
                    </button>
                  </>
                )}
              </div>

              
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayAdmins.map((admin, i) => {
                const allAdminJobs = adminJobsMap[admin.id] || [];
                // Filter only jobs that fall in the date range
                const filteredAdminJobs = filterByDate(allAdminJobs);
                
                // Strictly use the filtered date range jobs for counts
                const uniqueJobs = [];
                const seenPostIds = new Set();
                for (const j of filteredAdminJobs) {
                  const key = j.admin_post_id || j.id;
                  if (!seenPostIds.has(key)) {
                    seenPostIds.add(key);
                    uniqueJobs.push({ ...j });
                  } else {
                    const existing = uniqueJobs.find(u => (u.admin_post_id || u.id) === key);
                    if (existing && existing.position && !existing.position.includes(j.position)) {
                       existing.position += `, ${j.position}`;
                    }
                  }
                }
                
                const publishedCount = filteredAdminJobs.filter(j => j.status === 'published').length;
                const draftsCount = filteredAdminJobs.filter(j => j.status === 'draft').length;
                const scheduledCount = filteredAdminJobs.filter(j => j.status === 'scheduled').length;
                
                const earnings = publishedCount * (admin.rupees_per_post || rupeesPerPost || 10);
                
                const isExpanded = expandedAdmin === admin.id;

                return (
                  <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {(() => {
                            let displayName = admin.display_name || admin.full_name || admin.username;
                            if (userRole !== "ceo" && admin.id !== currentUser.id) {
                              const pRole = (admin.role || "").toLowerCase().replace(/[\s_]+/g, "");
                              if (pRole === "ceo") return "CEO";
                              if (pRole === "superadmin") return "Super Admin";
                              return "Admin";
                            }
                            return displayName;
                          })()}
                        </h3>
                        { (userRole === "ceo" || admin.id === currentUser.id) && (
                          <div className="text-sm text-gray-800 md:text-gray-500 mb-1">{admin.email}</div>
                        )}
                        <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full capitalize font-medium mt-1">
                          {admin.role}
                        </span>
                      </div>
                      
                      {userRole === "ceo" && (
                        <div className="text-right flex flex-col items-end">
                          <div className="text-xs text-gray-800 md:text-gray-500 mb-1 font-semibold uppercase tracking-wider">Amount Paid Per Post</div>
                          {editingRateAdminId === admin.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 font-bold">₹</span>
                              <input 
                                type="number" 
                                value={editingRateValue} 
                                onChange={e => setEditingRateValue(e.target.value)} 
                                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-black"
                              />
                              <button 
                                onClick={() => handleUpdateIndividualRate(admin.id, parseInt(editingRateValue) || 0)}
                                className="text-xs bg-black text-white px-2 py-1 rounded hover:bg-gray-800"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="text-lg font-bold text-gray-900">
                                ₹ {admin.rupees_per_post ?? rupeesPerPost ?? 10}
                              </div>
                              <button 
                                onClick={() => {
                                  setEditingRateAdminId(admin.id);
                                  setEditingRateValue((admin.rupees_per_post ?? rupeesPerPost ?? 10).toString());
                                }}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50/50">
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                        <div className="text-sm text-gray-800 md:text-gray-500 mb-1">Jobs Posted</div>
                        <div className="text-2xl font-bold text-gray-900">{publishedCount}</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                        <div className="text-sm text-gray-800 md:text-gray-500 mb-1">Amount Earned</div>
                        <div className="text-2xl font-bold text-green-600">₹{earnings}</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                        <div className="text-sm text-gray-800 md:text-gray-500 mb-1">Drafts Saved</div>
                        <div className="text-xl font-semibold text-gray-700">{draftsCount}</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                        <div className="text-sm text-gray-800 md:text-gray-500 mb-1">Jobs Scheduled</div>
                        <div className="text-xl font-semibold text-gray-700">{scheduledCount}</div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setExpandedAdmin(isExpanded ? null : admin.id)} 
                      className="w-full p-4 text-center text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 transition border-t border-gray-100 flex items-center justify-center gap-2"
                    >
                      {isExpanded ? <>Hide Details <ChevronUp size={16} /></> : <>Activity History <ChevronDown size={16} /></>}
                    </button>
                    
                    {isExpanded && (
                      <div className="p-6 bg-white border-t border-gray-100 max-h-[300px] overflow-y-auto">
                        <h4 className="font-semibold text-gray-900 mb-4">Activity History</h4>
                        {uniqueJobs.length > 0 ? (
                          <div className="space-y-3">
                            {uniqueJobs.sort((a,b) => new Date(b.posted_date || b.created_at).getTime() - new Date(a.posted_date || a.created_at).getTime()).map((job, j) => (
                              <div key={j} className="flex justify-between items-center text-sm p-3 rounded-lg border border-gray-100 bg-gray-50">
                                <div>
                                  <div className="font-medium text-gray-800 max-w-[150px] truncate">{job.position}</div>
                                  <div className="text-xs text-gray-800 md:text-gray-500 mt-1">
                                    {(() => {
                                      let displayName = admin.display_name || admin.full_name || admin.username;
                                      if (userRole !== "ceo" && admin.id !== currentUser.id) {
                                        const pRole = (admin.role || "").toLowerCase().replace(/[\s_]+/g, "");
                                        if (pRole === "ceo") displayName = "CEO";
                                        else if (pRole === "superadmin") displayName = "Super Admin";
                                        else displayName = "Admin";
                                      }
                                      if (job.status === 'published') return `Posted By: ${displayName}`;
                                      if (job.status === 'draft') return `Draft Saved — ${displayName}`;
                                      return `Scheduled By: ${displayName}`;
                                    })()}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-xs px-2 py-1 rounded-full capitalize inline-block mb-1 ${job.status === 'published' ? 'bg-green-100 text-green-800' : job.status === 'draft' ? 'bg-gray-200 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {job.status === 'published' ? 'Published' : job.status === 'draft' ? 'Saved Draft' : 'Scheduled'}
                                  </div>
                                  <div className="text-gray-700 md:text-gray-400 text-xs">
                                    {job.posted_date || job.created_at ? new Date(job.posted_date || job.created_at).toLocaleDateString('en-GB', {
                                      day: '2-digit', month: 'short', year: 'numeric'
                                    }) : ''}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-800 md:text-gray-500 text-sm py-4">No activity in this period.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}




