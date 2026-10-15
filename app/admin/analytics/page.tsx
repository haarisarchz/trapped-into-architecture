"use client";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const formatDuration = (seconds: any) => {
  const s = Number(seconds);
  if (!s) return "0s";
  const m = Math.floor(s / 60);
  const rem = Math.floor(s % 60);
  return m > 0 ? `${m}m ${rem}s` : `${rem}s`;
};

const ProgressBar = ({ value, max }: { value: number, max: number }) => (
  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
    <div className="bg-black h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }}></div>
  </div>
);

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState("1");
  const [pageTab, setPageTab] = useState<"all" | "main" | "jobs" | "companies">("all");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/ga/report?days=${days}`);
        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          throw new Error("Failed to load analytics: " + text.slice(0, 50));
        }
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [days]);

  return (
    <main className="min-h-screen bg-gray-50 text-black font-sans">
      <Navbar />
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-10">
        
        {/* HEADER & CONTROLS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-4">
<AdminQuickMenu />
<h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics</h1>
</div>
            <p className="text-gray-500 mt-1">Real-time traffic and user insights</p>
          </div>
          <select 
              value={days} 
              onChange={(e) => setDays(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-black focus:border-black block p-2.5 shadow-sm font-medium"
            >
              <option value="1h">Last 1 Hour</option>
              <option value="1">Last 24 Hours</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last 365 Days</option>
              <option value="lifetime">Lifetime</option>
            </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold mb-2">Failed to load analytics</h3>
            <p className="text-sm">{error}</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            
            {/* OVERVIEW METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 lg:gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="text-sm font-medium text-gray-500">Realtime (Live)</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{data.overview.realtimeUsers}</p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500"></div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Active Users</h3>
                <p className="text-3xl font-bold text-gray-900">{data.overview.activeUsers}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Sessions</h3>
                <p className="text-3xl font-bold text-gray-900">{data.overview.sessions}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Page Views</h3>
                <p className="text-3xl font-bold text-gray-900">{data.overview.pageViews}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Avg Session</h3>
                <p className="text-3xl font-bold text-gray-900">{formatDuration(data.overview.avgSessionDuration)}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Bounce Rate</h3>
                <p className="text-3xl font-bold text-gray-900">{data.overview.bounceRate || "0%"}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm bg-gradient-to-br from-white to-orange-50/40">
                <h3 className="text-sm font-medium text-orange-600 mb-1">Total Actions</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {((data.conversions?.applyClicks || 0) + (data.conversions?.emailClicks || 0) + (data.conversions?.contactClicks || 0) + (data.conversions?.totalShares || 0) + (data.conversions?.totalSaves || 0))}
                </p>
              </div>
            </div>

            {/* CANDIDATE CONVERSIONS & ACTIONS */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span>⚡ Candidate Conversions &amp; Actions</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Direct candidate interactions: applications, inquiries, shares, and bookmarks</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-800 rounded-full w-fit">
                  Live Tracking Active
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Apply Clicks</span>
                  <p className="text-2xl font-bold text-gray-900">{data.conversions?.applyClicks || 0}</p>
                  <p className="text-[11px] text-gray-400 mt-1">External link applications</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Email Now</span>
                  <p className="text-2xl font-bold text-gray-900">{data.conversions?.emailClicks || 0}</p>
                  <p className="text-[11px] text-gray-400 mt-1">Direct email inquiries</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">WhatsApp / Call</span>
                  <p className="text-2xl font-bold text-gray-900">{data.conversions?.contactClicks || 0}</p>
                  <p className="text-[11px] text-gray-400 mt-1">Direct studio inquiries</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Job Shares</span>
                  <p className="text-2xl font-bold text-gray-900">{data.conversions?.totalShares || data.conversions?.shareClicks || 0}</p>
                  <p className="text-[11px] text-gray-400 mt-1">WhatsApp &amp; social shares</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Saved Jobs</span>
                  <p className="text-2xl font-bold text-gray-900">{data.conversions?.totalSaves || data.conversions?.saveClicks || 0}</p>
                  <p className="text-[11px] text-gray-400 mt-1">User bookmarks</p>
                </div>
              </div>

              {/* TOP ENGAGED JOBS */}
              {data.conversions?.topEngagedJobs && data.conversions.topEngagedJobs.length > 0 && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider text-xs">Top Shared &amp; Saved Listings</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {data.conversions.topEngagedJobs.slice(0, 4).map((j: any) => (
                      <div key={j.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200/70 text-xs">
                        <p className="font-bold text-gray-900 truncate" title={j.position}>{j.position}</p>
                        <p className="text-gray-500 truncate mt-0.5">{j.firm_name}</p>
                        <div className="flex items-center gap-3 mt-2 text-gray-600 font-semibold text-[11px]">
                          <span>🔗 {j.share_count || 0} shares</span>
                          <span>🔖 {j.save_count || 0} saves</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DETAILED TABLES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* TOP PAGES */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[500px]">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                  <h3 className="text-lg font-bold">Top Pages</h3>
                  <div className="flex bg-gray-100 p-1 rounded-full text-xs shrink-0 overflow-x-auto no-scrollbar">
                    <button onClick={() => setPageTab("all")} className={`px-3 py-1.5 rounded-full transition ${pageTab === "all" ? "bg-white shadow text-black font-semibold" : "text-gray-500 hover:text-black"}`}>All</button>
                    <button onClick={() => setPageTab("main")} className={`px-3 py-1.5 rounded-full transition ${pageTab === "main" ? "bg-white shadow text-black font-semibold" : "text-gray-500 hover:text-black"}`}>Pages</button>
                    <button onClick={() => setPageTab("jobs")} className={`px-3 py-1.5 rounded-full transition ${pageTab === "jobs" ? "bg-white shadow text-black font-semibold" : "text-gray-500 hover:text-black"}`}>Posts</button>
                    <button onClick={() => setPageTab("companies")} className={`px-3 py-1.5 rounded-full transition ${pageTab === "companies" ? "bg-white shadow text-black font-semibold" : "text-gray-500 hover:text-black"}`}>Companies</button>
                  </div>
                </div>
                <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                  {(() => {
                    const filteredPages = data.pages.filter((p: any) => {
                      const pathClean = (p.path || "").split("?")[0];
                      
                      // Filter out admin, profile, and backend pages from ALL views
                      if (pathClean.startsWith("/profile") || pathClean.startsWith("/admin") || pathClean.startsWith("/api")) {
                        return false;
                      }
                      
                      if (pageTab === "main") return ["/", "/jobs", "/internships", "/companies", "/contact", "/about"].includes(pathClean);
                      if (pageTab === "jobs") return pathClean.startsWith("/jobs/") && pathClean !== "/jobs";
                      if (pageTab === "companies") return pathClean.startsWith("/companies/") && pathClean !== "/companies";
                      return true;
                    });
                    
                    if (filteredPages.length === 0) return <p className="text-gray-400 text-sm">No data available for this category.</p>;
                    
                    const maxViews = Math.max(...filteredPages.map((p: any) => Number(p.views) || 0));
                    
                    return filteredPages.map((item: any, i: number) => (
                      <div key={i} className="text-sm group">
                        <div className="flex justify-between items-center mb-1">
                          {(() => {
                            let displayTitle = item.title && item.title !== "(not set)" ? item.title.replace(" | Trapped Into Architecture", "") : item.path;
                            const p = (item.path || "").split("?")[0];
                            if (p === "/") displayTitle = "Home Page";
                            if (p === "/jobs") displayTitle = "Jobs Page";
                            if (p === "/companies") displayTitle = "Companies Page";
                            if (p === "/internships") displayTitle = "Internships Page";
                            if (p === "/contact") displayTitle = "Contact Page";
                            
                            return (
                              <a 
                                href={item.path} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="font-medium truncate max-w-[70%] hover:text-blue-600 hover:underline transition cursor-pointer" 
                                title={displayTitle}
                              >
                                {displayTitle}
                              </a>
                            );
                          })()}
                          <span className="font-semibold text-gray-700">{item.views}</span>
                        </div>
                        <ProgressBar value={Number(item.views) || 0} max={maxViews || 1} />
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* TRAFFIC SOURCES */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Top Referrers</h3>
                <div className="space-y-4">
                  {data.sources.length === 0 && <p className="text-gray-400 text-sm">No data available.</p>}
                  {data.sources.map((item: any, i: number) => (
                    <div key={i} className="text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium capitalize">{item.source === '(direct)' ? 'Direct Traffic' : item.source}</span>
                        <span className="font-semibold text-gray-700">{item.sessions}</span>
                      </div>
                      <ProgressBar value={item.sessions} max={Math.max(...data.sources.map((p: any) => p.sessions))} />
                    </div>
                  ))}
                </div>
              </div>

              {/* COUNTRIES */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Countries</h3>
                <div className="space-y-4">
                  {data.countries.length === 0 && <p className="text-gray-400 text-sm">No data available.</p>}
                  {data.countries.map((item: any, i: number) => (
                    <div key={i} className="text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{item.country}</span>
                        <span className="font-semibold text-gray-700">{item.users}</span>
                      </div>
                      <ProgressBar value={item.users} max={Math.max(...data.countries.map((p: any) => p.users))} />
                    </div>
                  ))}
                </div>
              </div>

              {/* BROWSERS */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Browsers</h3>
                <div className="space-y-4">
                  {data.browsers.length === 0 && <p className="text-gray-400 text-sm">No data available.</p>}
                  {data.browsers.map((item: any, i: number) => (
                    <div key={i} className="text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{item.browser}</span>
                        <span className="font-semibold text-gray-700">{item.users}</span>
                      </div>
                      <ProgressBar value={item.users} max={Math.max(...data.browsers.map((p: any) => p.users))} />
                    </div>
                  ))}
                </div>
              </div>

           
              {/* DEVICES */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Devices</h3>
                <div className="space-y-4">
                  {!data.devices || data.devices.length === 0 ? <p className="text-gray-400 text-sm">No data available.</p> : null}
                  {data.devices && data.devices.map((item: any, i: number) => (
                    <div key={i} className="text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium capitalize">{item.deviceCategory}</span>
                        <span className="font-semibold text-gray-700">{item.users}</span>
                      </div>
                      <ProgressBar value={item.users} max={Math.max(...data.devices.map((p: any) => p.users))} />
                    </div>
                  ))}
                </div>
              </div>

              {/* CITIES */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Top Cities</h3>
                <div className="space-y-4">
                  {!data.cities || data.cities.length === 0 ? <p className="text-gray-400 text-sm">No data available.</p> : null}
                  {data.cities && data.cities.map((item: any, i: number) => (
                    <div key={i} className="text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{item.city}</span>
                        <span className="font-semibold text-gray-700">{item.users}</span>
                      </div>
                      <ProgressBar value={item.users} max={Math.max(...data.cities.map((p: any) => p.users))} />
                    </div>
                  ))}
                </div>
              </div>
 </div>
          </div>
        ) : null}
      
          
</section>
      <Footer />
    </main>
  );
}
