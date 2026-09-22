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
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!user) {
      router.push("/");
      return;
    }
    const roleStr = (user.role || "").toLowerCase().replace(/[\s_]+/g, "");
    if (!["superadmin", "admin", "ceo"].includes(roleStr)) {
      router.push("/");
      return;
    }
    setCurrentUser(user);
    setUserRole(roleStr);
    fetchData(user, roleStr, startDate, endDate);
  };

  const fetchData = async (user: any, role: string, start?: string, end?: string) => {
    setLoading(true);
    
    const { data: settingsData } = await supabase.from("site_settings").select("*").single();
    if (settingsData && settingsData.rupees_per_post) {
      setRupeesPerPost(settingsData.rupees_per_post);
    }

    const isCEO = role === "ceo";

    let profilesQuery = supabase.from("profiles").select("*");
    if (!isCEO) {
      profilesQuery = profilesQuery.eq("id", user.id);
    }
    const { data: profilesData } = await profilesQuery.order("created_at", { ascending: false });
    
    if (profilesData) {
      const allAdmins = profilesData.filter(p => ["admin", "superadmin", "ceo"].includes((p.role || "").toLowerCase().replace(/[\s_]+/g, "")));
      setAdmins(allAdmins);

      let jobsQuery = supabase.from("jobs").select("*");
      
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
      }
    }
    setLoading(false);
  };

  const filterByDate = (jobs: any[]) => jobs; // Handled server-side now

  const handleSubmitDateRange = () => {
    if (currentUser && userRole) {
      fetchData(currentUser, userRole, startDate, endDate);
    }
  };

  const updateRupeesPerPost = async (val: number) => {
    setRupeesPerPost(val);
    if (userRole === "ceo") {
      await supabase.from("site_settings").update({ rupees_per_post: val }).eq("id", 1);
    }
  };

  const displayAdmins = useMemo(() => {
    if (userRole !== "ceo") return admins;
    if (selectedAdminId === "all") return admins;
    return admins.filter(a => a.id === selectedAdminId);
  }, [admins, selectedAdminId, userRole]);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
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
              
              <div className="flex flex-wrap gap-4 items-end">
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
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">₹ per Post</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-medium">₹</span>
                  <input 
                    type="number" 
                    value={rupeesPerPost} 
                    onChange={e => updateRupeesPerPost(Number(e.target.value))} 
                    disabled={userRole !== "ceo"}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-24 text-right disabled:bg-gray-100" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayAdmins.map((admin, i) => {
                const allAdminJobs = adminJobsMap[admin.id] || [];
                // Filter only jobs that fall in the date range
                const filteredAdminJobs = filterByDate(allAdminJobs);
                
                // Strictly use the filtered date range jobs for counts
                const publishedCount = filteredAdminJobs.filter(j => j.status === 'published').length;
                const draftsCount = filteredAdminJobs.filter(j => j.status === 'draft').length;
                const scheduledCount = filteredAdminJobs.filter(j => j.status === 'scheduled').length;
                
                const earnings = publishedCount * rupeesPerPost;
                
                const isExpanded = expandedAdmin === admin.id;

                return (
                  <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900">{admin.display_name || admin.full_name || admin.username}</h3>
                      <div className="text-sm text-gray-500 mb-1">{admin.email}</div>
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full capitalize font-medium">
                        {admin.role}
                      </span>
                    </div>
                    
                    <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50/50">
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                        <div className="text-sm text-gray-500 mb-1">Jobs Posted</div>
                        <div className="text-2xl font-bold text-gray-900">{publishedCount}</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                        <div className="text-sm text-gray-500 mb-1">Amount Earned</div>
                        <div className="text-2xl font-bold text-green-600">₹{earnings}</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                        <div className="text-sm text-gray-500 mb-1">Drafts Saved</div>
                        <div className="text-xl font-semibold text-gray-700">{draftsCount}</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                        <div className="text-sm text-gray-500 mb-1">Jobs Scheduled</div>
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
                        {filteredAdminJobs.length > 0 ? (
                          <div className="space-y-3">
                            {filteredAdminJobs.sort((a,b) => new Date(b.posted_date || b.created_at).getTime() - new Date(a.posted_date || a.created_at).getTime()).map((job, j) => (
                              <div key={j} className="flex justify-between items-center text-sm p-3 rounded-lg border border-gray-100 bg-gray-50">
                                <div className="font-medium text-gray-800 max-w-[150px] truncate">{job.position}</div>
                                <div className="text-gray-500 text-xs">
                                  {new Date(job.posted_date || job.created_at).toLocaleDateString('en-GB', {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                  })}
                                </div>
                                <div className={`text-xs px-2 py-1 rounded-full capitalize ${job.status === 'published' ? 'bg-green-100 text-green-800' : job.status === 'draft' ? 'bg-gray-200 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                                  {job.status === 'published' ? 'Published' : job.status === 'draft' ? 'Saved Draft' : 'Scheduled'}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 text-sm py-4">No activity in this period.</div>
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
