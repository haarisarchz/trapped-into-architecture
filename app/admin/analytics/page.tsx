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
  const [listingMode, setListingMode] = useState<"top" | "recent">("top");
  const [filterAdminShares, setFilterAdminShares] = useState(false);
  const [trafficTab, setTrafficTab] = useState<"outside" | "inside">("outside");
  const [pageMode, setPageMode] = useState<"views" | "landing">("views");
  const [gscData, setGscData] = useState<any>(null);
  const [gscLoading, setGscLoading] = useState(false);
  const [gscTab, setGscTab] = useState<"keywords" | "pages">("keywords");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activityMetricMode, setActivityMetricMode] = useState<"avg" | "total">("avg");

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

    async function fetchGsc() {
      setGscLoading(true);
      try {
        const res = await fetch(`/api/gsc/report?days=${days}`);
        const json = await res.json();
        setGscData(json);
      } catch (e) {
        console.warn("GSC fetch error", e);
      } finally {
        setGscLoading(false);
      }
    }

    fetchData();
    fetchGsc();
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
                  {((data.conversions?.applyClicks || 0) + (data.conversions?.emailClicks || 0) + (data.conversions?.contactClicks || 0) + (data.conversions?.shareClicks || 0) + (data.conversions?.saveClicks || 0))}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">In selected time period</p>
              </div>
            </div>

            {/* CANDIDATE CONVERSIONS & ACTIONS */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span>⚡ Candidate Conversions &amp; Actions</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Direct candidate interactions within the selected time period</p>
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
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Job Shares</span>
                    {(data.conversions?.candidateSharesCount > 0 || data.conversions?.unregisteredSharesCount > 0) && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded" title="Candidate vs Unregistered Breakdown">
                        {data.conversions.candidateSharesCount || 0} user · {data.conversions.unregisteredSharesCount || 0} unregistered
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.conversions?.shareClicks || 0}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {days === 'lifetime' || days === 'all' 
                      ? 'All-time lifetime shares' 
                      : `${days === '1h' ? 'Last 60 mins' : days === '1' ? 'Last 24 hours' : days === '7' ? 'Last 7 days' : 'In period'} · ${data.conversions?.totalLifetimeShares || 0} all-time`}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Saved Jobs</span>
                  <p className="text-2xl font-bold text-gray-900">{data.conversions?.saveClicks || 0}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {days === 'lifetime' || days === 'all' 
                      ? 'All-time lifetime bookmarks' 
                      : `${days === '1h' ? 'Last 60 mins' : days === '1' ? 'Last 24 hours' : days === '7' ? 'Last 7 days' : 'In period'} · ${data.conversions?.totalLifetimeSaves || 0} all-time`}
                  </p>
                </div>
              </div>

              {/* TOP SHARED & RECENT LISTINGS (WITH VIEW TOGGLE & LOCATION) */}
              {(() => {
                const listPool = listingMode === "top" 
                  ? (data.conversions?.topSharedJobs || data.conversions?.topEngagedJobs || [])
                  : (data.conversions?.recentJobs || data.conversions?.topSharedJobs || []);
                
                const displayedJobs = listPool.filter((j: any) => {
                  if (filterAdminShares) {
                    return (j.candidate_shares || 0) > 0 || (j.unregistered_shares || 0) > 0 || (j.period_saves || 0) > 0;
                  }
                  return true;
                });

                return (
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                          <button 
                            type="button"
                            onClick={() => setListingMode("top")}
                            className={`px-3 py-1.5 rounded-lg transition ${listingMode === "top" ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"}`}
                          >
                            🔥 Top Shared &amp; Saved
                          </button>
                          <button 
                            type="button"
                            onClick={() => setListingMode("recent")}
                            className={`px-3 py-1.5 rounded-lg transition ${listingMode === "recent" ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"}`}
                          >
                            🕒 Recent Activity / Trendings
                          </button>
                        </div>
                      </div>

                      {data.conversions?.adminSharesCount > 0 && (
                        <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={filterAdminShares} 
                            onChange={(e) => setFilterAdminShares(e.target.checked)}
                            className="rounded border-gray-300 text-black focus:ring-black"
                          />
                          <span>Exclude admin shares (organic only)</span>
                        </label>
                      )}
                    </div>

                    {displayedJobs.length === 0 ? (
                      <p className="text-gray-400 text-xs italic py-4">No job engagement recorded in this time period yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {displayedJobs.slice(0, 8).map((j: any) => (
                          <div key={j.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 text-xs flex flex-col justify-between hover:border-gray-300 transition">
                            <div>
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <p className="font-bold text-gray-900 truncate flex-1" title={j.position}>{j.position}</p>
                              </div>
                              <p className="text-gray-600 truncate font-medium">{j.firm_name}</p>
                              
                              {/* Location Badge */}
                              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                                <span className="truncate">📍 {j.location || [j.city, j.state].filter(Boolean).join(", ") || "India"}</span>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-gray-200/50">
                              <div className="flex items-center justify-between text-gray-700 font-semibold text-[11px]">
                                <span>🔗 {j.period_shares ?? j.share_count ?? 0} shares</span>
                                <span>🔖 {j.period_saves ?? j.save_count ?? 0} saves</span>
                              </div>

                              {/* Who Shared Badges */}
                              {j.who_shared && j.who_shared.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {j.who_shared.slice(0, 2).map((ws: string, wIdx: number) => (
                                    <span 
                                      key={wIdx} 
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate max-w-[130px] ${
                                        ws.startsWith("Unregistered") ? "bg-purple-100 text-purple-800" : "bg-emerald-100 text-emerald-800"
                                      }`}
                                      title={ws}
                                    >
                                      {ws}
                                    </span>
                                  ))}
                                  {j.who_shared.length > 2 && (
                                    <span className="text-[9px] text-gray-400 font-bold">+{j.who_shared.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* CANDIDATE ON-SITE SEARCHES & UNMET DEMAND */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span>🔍 Candidate Search Demand &amp; Missing Jobs</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Exact keywords, job roles, and locations searched by visitors on the jobs page</p>
                </div>
                {data.searches?.totalCount > 0 && (
                  <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded-full w-fit">
                    {data.searches.totalCount} searches recorded
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Top Search Keywords */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center justify-between">
                    <span>Top Keywords Searched</span>
                    <span className="text-[10px] text-gray-400 font-normal">Hits</span>
                  </h4>
                  <p className="text-[10px] text-gray-500 mb-3">Job titles &amp; software searched on the jobs page</p>
                  {(!data.searches?.topKeywords || data.searches.topKeywords.length === 0) ? (
                    <div className="py-4 text-center">
                      <p className="text-xs text-gray-400 italic">No keyword searches logged in this period yet.</p>
                      <p className="text-[10px] text-gray-400 mt-1">Live logger active — searches on /jobs will appear here automatically.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {data.searches.topKeywords.map((k: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-800 capitalize truncate max-w-[180px]">{k.keyword}</span>
                          <span className="bg-white px-2 py-0.5 rounded border border-gray-200 font-mono font-bold text-gray-700">{k.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Searched Cities */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center justify-between">
                    <span>Top Locations Filtered</span>
                    <span className="text-[10px] text-gray-400 font-normal">Filters</span>
                  </h4>
                  <p className="text-[10px] text-gray-500 mb-3">Cities candidates filtered by on the jobs page</p>
                  {(!data.searches?.topCities || data.searches.topCities.length === 0) ? (
                    <div className="py-4 text-center">
                      <p className="text-xs text-gray-400 italic">No location filters used in this period yet.</p>
                      <p className="text-[10px] text-gray-400 mt-1">Live logger active — city filters on /jobs will appear here automatically.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {data.searches.topCities.map((c: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-800 truncate max-w-[180px]">📍 {c.city}</span>
                          <span className="bg-white px-2 py-0.5 rounded border border-gray-200 font-mono font-bold text-gray-700">{c.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Unmet Demand (Zero Result Searches) */}
                <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/90">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center justify-between">
                    <span>⚠️ Missing Jobs (0 Results Found)</span>
                    <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-bold">Market Demand</span>
                  </h4>
                  <p className="text-[10px] text-amber-700 mb-3">Roles candidates searched for where NO jobs were found. Post these next!</p>
                  
                  {(!data.searches?.zeroResults || data.searches.zeroResults.length === 0) ? (
                    <div className="py-4 text-center">
                      <p className="text-xs text-amber-800/60 italic">No missing job searches detected yet.</p>
                      <p className="text-[10px] text-amber-700/60 mt-1">When someone searches for a role with 0 results, it flags here.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {data.searches.zeroResults.map((z: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-white/80 p-2 rounded-lg border border-amber-200/50">
                          <div className="truncate pr-2">
                            <span className="font-bold text-gray-900 block truncate">{z.query}</span>
                            <span className="text-[10px] text-gray-500">in {z.city}</span>
                          </div>
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono font-bold text-[11px] shrink-0">
                            {z.count} {z.count === 1 ? 'search' : 'searches'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* GOOGLE SEARCH CONSOLE (SEO KEYWORDS & SEARCH RANKINGS) */}
            {gscData && gscData.connected ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <span>🔎 Google Search Console (SEO Keywords &amp; Google Rankings)</span>
                      <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">Connected</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Exact keywords people typed on Google Search, clicks, impressions, and your average Google ranking
                    </p>
                  </div>
                  <div className="flex bg-gray-100 p-1 rounded-full text-xs shrink-0">
                    <button 
                      onClick={() => setGscTab("keywords")} 
                      className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 ${gscTab === "keywords" ? "bg-white shadow text-black font-semibold" : "text-gray-500 hover:text-black"}`}
                    >
                      <span>🔑 Top Google Queries ({gscData.keywords?.length || 0})</span>
                    </button>
                    <button 
                      onClick={() => setGscTab("pages")} 
                      className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 ${gscTab === "pages" ? "bg-white shadow text-black font-semibold" : "text-gray-500 hover:text-black"}`}
                    >
                      <span>📄 Top Ranking Pages ({gscData.pages?.length || 0})</span>
                    </button>
                  </div>
                </div>

                {/* 4 Macro SEO Badges */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl">
                    <p className="text-[11px] font-medium text-blue-700 uppercase tracking-wider">Google Clicks</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{gscData.totals?.clicks?.toLocaleString() || 0}</p>
                    <p className="text-[10px] text-blue-600 mt-0.5">Direct visitors from Google</p>
                  </div>
                  <div className="bg-purple-50/60 border border-purple-100 p-4 rounded-xl">
                    <p className="text-[11px] font-medium text-purple-700 uppercase tracking-wider">Google Impressions</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">{gscData.totals?.impressions?.toLocaleString() || 0}</p>
                    <p className="text-[10px] text-purple-600 mt-0.5">Times seen in Google search</p>
                  </div>
                  <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl">
                    <p className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">Average CTR</p>
                    <p className="text-2xl font-bold text-emerald-900 mt-1">{gscData.totals?.ctr || "0%"}</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">Click-through percentage</p>
                  </div>
                  <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-xl">
                    <p className="text-[11px] font-medium text-amber-700 uppercase tracking-wider">Average Position</p>
                    <p className="text-2xl font-bold text-amber-900 mt-1">#{gscData.totals?.position || 0}</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">Average Google search rank</p>
                  </div>
                </div>

                {/* Content Tables */}
                {gscTab === "keywords" ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          <th className="pb-3 pl-1">Search Query / Keyword</th>
                          <th className="pb-3 text-right">Clicks</th>
                          <th className="pb-3 text-right">Impressions</th>
                          <th className="pb-3 text-right">CTR</th>
                          <th className="pb-3 text-right pr-1">Google Rank</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(!gscData.keywords || gscData.keywords.length === 0) ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-400 italic">No Google search query data recorded in this period.</td>
                          </tr>
                        ) : (
                          gscData.keywords.map((k: any, i: number) => {
                            const rank = k.position;
                            const rankBadgeColor = rank <= 3 
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : rank <= 10 
                                ? "bg-blue-100 text-blue-800 border-blue-200" 
                                : "bg-gray-100 text-gray-700 border-gray-200";

                            return (
                              <tr key={i} className="hover:bg-gray-50/70 transition">
                                <td className="py-3 pl-1 font-medium text-gray-900">
                                  <span className="capitalize">{k.query}</span>
                                </td>
                                <td className="py-3 text-right font-mono font-bold text-gray-800">{k.clicks}</td>
                                <td className="py-3 text-right font-mono text-gray-500">{k.impressions}</td>
                                <td className="py-3 text-right font-mono text-gray-600">{k.ctr}%</td>
                                <td className="py-3 text-right pr-1">
                                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold border ${rankBadgeColor}`}>
                                    #{rank}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          <th className="pb-3 pl-1">Page URL</th>
                          <th className="pb-3 text-right">Google Clicks</th>
                          <th className="pb-3 text-right">Impressions</th>
                          <th className="pb-3 text-right">CTR</th>
                          <th className="pb-3 text-right pr-1">Rank</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(!gscData.pages || gscData.pages.length === 0) ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-400 italic">No ranking pages recorded in this period.</td>
                          </tr>
                        ) : (
                          gscData.pages.map((p: any, i: number) => {
                            let path = p.page;
                            try {
                              const u = new URL(p.page);
                              path = u.pathname;
                            } catch (_) {}

                            return (
                              <tr key={i} className="hover:bg-gray-50/70 transition">
                                <td className="py-3 pl-1 max-w-[320px] truncate">
                                  <a href={p.page} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                                    {path || p.page}
                                  </a>
                                </td>
                                <td className="py-3 text-right font-mono font-bold text-gray-800">{p.clicks}</td>
                                <td className="py-3 text-right font-mono text-gray-500">{p.impressions}</td>
                                <td className="py-3 text-right font-mono text-gray-600">{p.ctr}%</td>
                                <td className="py-3 text-right pr-1 font-mono text-gray-700">#{p.position}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : gscData && !gscData.connected ? (
              <div className="bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-white p-6 rounded-2xl border border-blue-200/80 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <span>🔎 Google Search Console (SEO Analytics)</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Setup Guide</span>
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 max-w-2xl">
                      View the exact search queries candidates type on Google, your impressions, CTR, and average Google ranking right here in this dashboard.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setGscLoading(true);
                      fetch(`/api/gsc/report?days=${days}`)
                        .then(r => r.json())
                        .then(j => setGscData(j))
                        .finally(() => setGscLoading(false));
                    }}
                    className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition shrink-0"
                  >
                    {gscLoading ? "Checking..." : "🔄 Test Connection"}
                  </button>
                </div>

                <div className="bg-white/90 p-4 rounded-xl border border-blue-100 space-y-3 text-xs text-gray-700">
                  <p className="font-semibold text-gray-900">2-Minute Quick Setup:</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">1</span>
                      <div className="flex-1">
                        <span>In <strong>Google Cloud Console</strong>, ensure <strong>Google Search Console API</strong> is enabled</span>
                        {gscData.projectId && <span className="text-gray-500 font-mono"> (Project: {gscData.projectId})</span>}.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">2</span>
                      <div className="flex-1">
                        <span>In <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Google Search Console</a>, go to <strong>Settings ➔ Users and permissions ➔ Add user</strong> and paste your service account email:</span>
                        {gscData.clientEmail && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <code className="bg-gray-100 border border-gray-200 px-2 py-1 rounded text-[11px] font-mono text-gray-800 select-all truncate max-w-md">
                              {gscData.clientEmail}
                            </code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(gscData.clientEmail);
                                setCopiedEmail(true);
                                setTimeout(() => setCopiedEmail(false), 2000);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
                            >
                              {copiedEmail ? "✓ Copied!" : "Copy Email"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {gscData.error && (
                    <div className="border-t border-gray-100 pt-3">
                      {(gscData.error.includes("console.developers.google.com") || gscData.error.includes("disabled") || gscData.error.includes("has not been used")) ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-amber-900">⚠️ Final Step Required: Enable API in Google Cloud</p>
                            <p className="text-[11px] text-amber-700 mt-0.5">
                              You added the user in Search Console. Now click the button below to enable the Search Console API for your project:
                            </p>
                          </div>
                          <a
                            href={`https://console.developers.google.com/apis/api/webmasters.googleapis.com/overview?project=${gscData.projectId || "667017739967"}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shrink-0 text-center shadow-sm transition"
                          >
                            👉 Enable API on Google Cloud
                          </a>
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-500 font-mono">
                          Status: {gscData.error}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* HOURLY & DAY-OF-WEEK CANDIDATE TRAFFIC (COMPACT SIDE-BY-SIDE) */}
            {data.peakTimes && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <span>⏱️ Candidate Activity Patterns</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Hourly 24-hour distribution and 7-day weekly visitor volume
                    </p>
                  </div>

                  {/* Average / Day vs Total Volume Toggle */}
                  <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs shrink-0 self-start sm:self-auto">
                    <button
                      onClick={() => setActivityMetricMode("avg")}
                      className={`px-3 py-1.5 rounded-lg font-medium transition ${
                        activityMetricMode === "avg"
                          ? "bg-white text-gray-900 shadow-sm font-semibold"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Average / Day
                    </button>
                    <button
                      onClick={() => setActivityMetricMode("total")}
                      className={`px-3 py-1.5 rounded-lg font-medium transition ${
                        activityMetricMode === "total"
                          ? "bg-white text-gray-900 shadow-sm font-semibold"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Total Volume
                    </button>
                  </div>
                </div>

                {/* SIDE BY SIDE 2-COLUMN GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* LEFT: 24-HOUR ACTIVITY BAR CHART */}
                  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">24-Hour Distribution</h4>
                        <p className="text-[11px] text-gray-400">12:00 AM (00) to 11:00 PM (23)</p>
                      </div>
                      <span className="text-[11px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                        {activityMetricMode === "avg" ? "Avg Users / Hour" : "Total Users"}
                      </span>
                    </div>

                    {(!data.peakTimes.hourly || data.peakTimes.hourly.length === 0) ? (
                      <p className="text-xs text-gray-400 italic py-10 text-center">Hourly activity data is aggregating...</p>
                    ) : (
                      (() => {
                        const numDays = days === "1h" || days === "1" ? 1 : days === "7" ? 7 : days === "30" ? 30 : days === "90" ? 90 : days === "365" ? 365 : 30;
                        const hourValues = data.peakTimes.hourly.map((h: any) => {
                          const raw = Number(h.users) || 0;
                          const val = activityMetricMode === "avg" && numDays > 1 ? Number((raw / numDays).toFixed(1)) : raw;
                          return { ...h, displayVal: val, rawVal: raw };
                        });
                        const maxVal = Math.max(...hourValues.map((h: any) => h.displayVal), 0.1);

                        return (
                          <div className="grid grid-cols-12 md:grid-cols-24 gap-1 items-end h-36 pt-4">
                            {hourValues.map((h: any, i: number) => {
                              const isPeak = h.displayVal === maxVal && h.displayVal > 0;
                              const heightPct = Math.max(6, Math.round((h.displayVal / maxVal) * 100));

                              return (
                                <div key={i} className="flex flex-col items-center group relative h-full justify-end">
                                  {/* Tooltip */}
                                  <div className="absolute -top-8 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                                    <div className="bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                                      {h.label || `${h.hour}:00`}: {h.displayVal} {activityMetricMode === "avg" && numDays > 1 ? "avg/day" : "users"}
                                    </div>
                                  </div>
                                  <div 
                                    className={`w-full rounded-t transition-all ${
                                      isPeak 
                                        ? 'bg-blue-600 shadow-sm shadow-blue-200' 
                                        : h.displayVal > 0 
                                        ? 'bg-blue-300 hover:bg-blue-400' 
                                        : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                                    style={{ height: `${heightPct}%` }}
                                  />
                                  <span className="text-[9px] text-gray-400 mt-1.5 font-mono">{h.hour}</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()
                    )}
                  </div>

                  {/* RIGHT: 7-DAY WEEK ACTIVITY BAR CHART */}
                  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">Day-of-Week Distribution</h4>
                        <p className="text-[11px] text-gray-400">Monday through Sunday</p>
                      </div>
                      <span className="text-[11px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                        {activityMetricMode === "avg" ? "Avg Users / Day" : "Total Users"}
                      </span>
                    </div>

                    {(!data.peakTimes.days || data.peakTimes.days.length === 0) ? (
                      <p className="text-xs text-gray-400 italic py-10 text-center">Day-of-week data is aggregating...</p>
                    ) : (
                      (() => {
                        const numDays = days === "1h" || days === "1" ? 1 : days === "7" ? 7 : days === "30" ? 30 : days === "90" ? 90 : days === "365" ? 365 : 30;
                        const weekDivisor = numDays > 7 ? numDays / 7 : 1;
                        const dayValues = data.peakTimes.days.map((d: any) => {
                          const raw = Number(d.users) || 0;
                          const val = activityMetricMode === "avg" && numDays > 7 ? Number((raw / weekDivisor).toFixed(1)) : raw;
                          return { ...d, displayVal: val, rawVal: raw };
                        });
                        const maxDayVal = Math.max(...dayValues.map((d: any) => d.displayVal), 0.1);

                        return (
                          <div className="grid grid-cols-7 gap-2.5 items-end h-36 pt-4">
                            {dayValues.map((d: any, i: number) => {
                              const isPeak = d.displayVal === maxDayVal && d.displayVal > 0;
                              const heightPct = Math.max(8, Math.round((d.displayVal / maxDayVal) * 100));

                              return (
                                <div key={i} className="flex flex-col items-center group relative h-full justify-end">
                                  {/* Tooltip */}
                                  <div className="absolute -top-8 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                                    <div className="bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                                      {d.day}: {d.displayVal} {activityMetricMode === "avg" && numDays > 7 ? "avg/day" : "visitors"}
                                    </div>
                                  </div>
                                  <div 
                                    className={`w-full rounded-t transition-all ${
                                      isPeak 
                                        ? 'bg-blue-600 shadow-md shadow-blue-200' 
                                        : d.displayVal > 0 
                                        ? 'bg-blue-300 hover:bg-blue-400' 
                                        : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                                    style={{ height: `${heightPct}%` }}
                                  />
                                  <span className={`text-[11px] mt-2 font-medium truncate ${isPeak ? 'text-blue-700 font-bold' : 'text-gray-500'}`}>
                                    {d.short || d.day.slice(0, 3)}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    {d.displayVal}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* CANDIDATE APPLICATION & CONVERSION FUNNEL */}
            {data.funnel && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <span>🎯 Candidate Conversion &amp; Drop-off Funnel</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Track the step-by-step candidate journey from first arrival to applied vacancy, identifying where candidates drop off
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 self-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Overall Conversion</p>
                      <p className="text-lg font-bold text-emerald-600">{data.funnel.overallConversionRate}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">View-to-Apply Rate</p>
                      <p className="text-lg font-bold text-blue-600">{data.funnel.jobToApplyRate}</p>
                    </div>
                  </div>
                </div>

                {/* 4-Step Funnel Visual Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data.funnel.steps.map((step: any, idx: number) => {
                    const stepColors = [
                      { bg: "bg-blue-50/60", border: "border-blue-100", bar: "bg-blue-600", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" },
                      { bg: "bg-indigo-50/60", border: "border-indigo-100", bar: "bg-indigo-600", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-800" },
                      { bg: "bg-purple-50/60", border: "border-purple-100", bar: "bg-purple-600", text: "text-purple-700", badge: "bg-purple-100 text-purple-800" },
                      { bg: "bg-emerald-50/60", border: "border-emerald-100", bar: "bg-emerald-600", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-800" },
                    ][idx] || { bg: "bg-gray-50", border: "border-gray-100", bar: "bg-gray-600", text: "text-gray-700", badge: "bg-gray-100 text-gray-800" };

                    return (
                      <div key={step.id} className={`p-4 rounded-xl border ${stepColors.border} ${stepColors.bg} flex flex-col justify-between relative`}>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">Step {step.id}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${stepColors.badge}`}>{step.badge}</span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm">{step.name}</h4>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{step.description}</p>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-baseline justify-between mb-1.5">
                            <span className="text-2xl font-black text-gray-900">{Number(step.count).toLocaleString()}</span>
                            <span className={`text-xs font-bold ${stepColors.text}`}>{step.percentage}%</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
                            <div className={`h-2 rounded-full ${stepColors.bar} transition-all duration-500`} style={{ width: `${Math.max(6, step.percentage)}%` }} />
                          </div>

                          {/* Drop-off stat */}
                          {step.dropoff > 0 && (
                            <p className="text-[10px] text-rose-600 font-medium mt-2 flex items-center gap-1">
                              <span>↓ {step.dropoff}% drop-off from previous step</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2-COLUMN GRID: FIRMS LEADERBOARD & EXPERIENCE RADAR */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* FIRMS DEMAND LEADERBOARD */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span>🏢 Top Architecture Firms Leaderboard</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Firms with highest candidate views, job shares, and engagement
                      </p>
                    </div>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                      Top {data.topFirms ? data.topFirms.length : 0}
                    </span>
                  </div>

                  {(!data.topFirms || data.topFirms.length === 0) ? (
                    <p className="text-xs text-gray-400 italic py-8 text-center">No firm data available for this period.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {data.topFirms.map((firm: any, i: number) => {
                        const rankMedals = ["🥇", "🥈", "🥉"];
                        return (
                          <div key={i} className="py-3 flex items-center justify-between gap-3 group">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-7 text-center font-bold text-sm shrink-0">
                                {i < 3 ? rankMedals[i] : <span className="text-xs text-gray-400 font-mono">#{i + 1}</span>}
                              </span>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition">
                                  {firm.name}
                                </p>
                                <p className="text-[11px] text-gray-400 truncate">
                                  📍 {firm.locations} {firm.positions && firm.positions.length > 0 ? `• ${firm.positions.join(", ")}` : ""}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 text-right">
                              <div className="hidden sm:block">
                                <p className="text-xs font-semibold text-gray-700">{firm.totalJobs} {firm.totalJobs === 1 ? 'job' : 'jobs'}</p>
                                <p className="text-[10px] text-gray-400">{firm.totalShares + firm.totalSaves} interactions</p>
                              </div>
                              <div className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                                {firm.engagementScore} pts
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* EXPERIENCE LEVEL DEMAND VS SUPPLY RADAR */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span>⚖️ Experience Level Demand vs. Supply</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Candidate search interest compared to actual posted job inventory
                      </p>
                    </div>
                  </div>

                  {(!data.experienceGap || data.experienceGap.length === 0) ? (
                    <p className="text-xs text-gray-400 italic py-8 text-center">No experience data available for this period.</p>
                  ) : (
                    <div className="space-y-4">
                      {data.experienceGap.map((tier: any, i: number) => {
                        const isShortage = tier.statusColor === "amber";
                        const isSurplus = tier.statusColor === "blue";

                        return (
                          <div key={i} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm">{tier.tier}</h4>
                                <p className="text-[11px] text-gray-400">{tier.subtitle}</p>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isShortage ? "bg-amber-100 text-amber-800" : isSurplus ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {tier.status}
                              </span>
                            </div>

                            {/* Comparison Bars */}
                            <div className="space-y-1.5 mt-3">
                              <div>
                                <div className="flex justify-between text-[11px] mb-0.5">
                                  <span className="text-gray-500 font-medium">Candidate Search Demand</span>
                                  <span className="font-bold text-gray-800">{tier.demandPct}% ({tier.demandCount} searches)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div className="h-1.5 rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${Math.min(100, Math.max(5, tier.demandPct))}%` }} />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-[11px] mb-0.5">
                                  <span className="text-gray-500 font-medium">Posted Job Supply</span>
                                  <span className="font-bold text-gray-800">{tier.supplyPct}% ({tier.supplyCount} jobs)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(100, Math.max(5, tier.supplyPct))}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* DETAILED TABLES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* TOP PAGES & ENTRY DOORS */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[520px]">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                  <div className="flex bg-gray-100 p-1 rounded-full text-xs shrink-0">
                    <button 
                      onClick={() => setPageMode("views")} 
                      className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 ${pageMode === "views" ? "bg-white shadow text-black font-semibold" : "text-gray-500 hover:text-black"}`}
                    >
                      <span>📄</span>
                      <span>Top Pages (Views)</span>
                    </button>
                    <button 
                      onClick={() => setPageMode("landing")} 
                      className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 ${pageMode === "landing" ? "bg-white shadow text-black font-semibold" : "text-gray-500 hover:text-black"}`}
                    >
                      <span>🚪</span>
                      <span>Entry Doors (First Visited)</span>
                    </button>
                  </div>
                  {pageMode === "views" && (
                    <div className="flex bg-gray-100 p-1 rounded-full text-xs shrink-0 overflow-x-auto no-scrollbar">
                      <button onClick={() => setPageTab("all")} className={`px-2.5 py-1 rounded-full transition ${pageTab === "all" ? "bg-white shadow text-black font-semibold" : "text-gray-500 hover:text-black"}`}>All</button>
                      <button onClick={() => setPageTab("main")} className={`px-2.5 py-1 rounded-full transition ${pageTab === "main" ? "bg-white shadow text-black font-semibold" : "text-gray-500 hover:text-black"}`}>Pages</button>
                      <button onClick={() => setPageTab("jobs")} className={`px-2.5 py-1 rounded-full transition ${pageTab === "jobs" ? "bg-white shadow text-black font-semibold" : "text-gray-500 hover:text-black"}`}>Posts</button>
                      <button onClick={() => setPageTab("companies")} className={`px-2.5 py-1 rounded-full transition ${pageTab === "companies" ? "bg-white shadow text-black font-semibold" : "text-gray-500 hover:text-black"}`}>Companies</button>
                    </div>
                  )}
                </div>

                <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                  {pageMode === "views" ? (
                    (() => {
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
                      
                      if (filteredPages.length === 0) return <p className="text-gray-400 text-sm py-8 text-center">No data available for this category.</p>;
                      
                      const maxViews = Math.max(...filteredPages.map((p: any) => Number(p.views) || 0));
                      
                      return filteredPages.map((item: any, i: number) => (
                        <div key={i} className="text-sm group">
                          <div className="flex justify-between items-center mb-1">
                            {(() => {
                              let displayTitle = item.title && item.title !== "(not set)" ? item.title.replace(/ \| Trapped Into Architecture/gi, "") : item.path;
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
                    })()
                  ) : (
                    (() => {
                      const list = (data.landingPages || []).filter((p: any) => {
                        const pathClean = (p.path || "").split("?")[0].toLowerCase();
                        return !pathClean.includes("admin") && !pathClean.includes("api");
                      });

                      if (list.length === 0) return <p className="text-gray-400 text-sm py-8 text-center">No entry door data recorded yet.</p>;

                      const maxSessions = Math.max(...list.map((p: any) => Number(p.sessions) || 0));

                      return list.map((item: any, i: number) => {
                        const pathClean = (item.path || "").split("?")[0].replace(/\/+$/, "") || "/";
                        let displayTitle = pathClean;
                        if (pathClean === "/" || pathClean === "") displayTitle = "Home Page (/)";
                        else if (pathClean === "/jobs") displayTitle = "Jobs Board (/jobs)";
                        else if (pathClean === "/companies") displayTitle = "Companies Directory (/companies)";
                        else if (pathClean === "/internships") displayTitle = "Internships Page (/internships)";
                        else if (pathClean.startsWith("/jobs/city/")) {
                          const slug = pathClean.replace("/jobs/city/", "");
                          displayTitle = `Jobs in ${decodeURIComponent(slug).replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase())}`;
                        } else {
                          const matched = data.pages?.find((p: any) => (p.path || "").split("?")[0].replace(/\/+$/, "") === pathClean);
                          if (matched && matched.title && matched.title !== "(not set)") {
                            displayTitle = matched.title.replace(/ \| Trapped Into Architecture/gi, "").replace(/ - Trapped Into Architecture/gi, "").trim();
                          }
                        }

                        const sessions = Number(item.sessions) || 0;

                        return (
                          <div key={i} className="text-sm">
                            <div className="flex justify-between items-center mb-1">
                              <a
                                href={item.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium truncate max-w-[70%] hover:text-blue-600 hover:underline transition cursor-pointer"
                                title={displayTitle}
                              >
                                {displayTitle}
                              </a>
                              <span className="font-semibold text-gray-700">{sessions} {sessions === 1 ? 'entry' : 'entries'}</span>
                            </div>
                            <ProgressBar value={sessions} max={maxSessions || 1} />
                          </div>
                        );
                      });
                    })()
                  )}
                </div>
              </div>

              {/* TRAFFIC SOURCES & REFERRALS (OUTSIDE TRAFFIC VS INSIDE NAVIGATION) */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[520px]">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-bold">Inbound Traffic &amp; Referrals</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {trafficTab === "outside" 
                        ? "External apps & websites bringing visitors (WhatsApp, Instagram, etc.)" 
                        : "Internal page-to-page navigation across the website (Excludes Admin)"}
                    </p>
                  </div>
                  <div className="flex bg-gray-100 p-1 rounded-full text-xs shrink-0">
                    <button 
                      onClick={() => setTrafficTab("outside")} 
                      className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 ${trafficTab === "outside" ? "bg-white shadow text-black font-semibold" : "text-gray-500 hover:text-black"}`}
                    >
                      <span>🌐</span>
                      <span>Outside Traffic</span>
                    </button>
                    <button 
                      onClick={() => setTrafficTab("inside")} 
                      className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 ${trafficTab === "inside" ? "bg-white shadow text-black font-semibold" : "text-gray-500 hover:text-black"}`}
                    >
                      <span>🔄</span>
                      <span>Inside Navigation</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                  {trafficTab === "outside" ? (
                    (() => {
                      const list = (data.outsideReferrers && data.outsideReferrers.length > 0)
                        ? data.outsideReferrers
                        : (data.referrers || data.sources || []);
                      
                      // Safety filter: NEVER allow admin references in outside traffic
                      const cleanList = list.filter((item: any) => {
                        const raw = (item.referrer || item.source || item.label || "").toLowerCase();
                        return !raw.includes("admin");
                      });

                      // 1. Group and sum by resolved clean label so identical sources are never repeated
                      const aggMap: Record<string, { label: string; count: number; category: string; rawName: string }> = {};

                      cleanList.forEach((item: any) => {
                        const rawName = (item.label || item.referrer || item.source || "Direct Traffic").trim();
                        const lower = rawName.toLowerCase();
                        
                        // Ignore uninformative or empty entries
                        if (!rawName || lower === "(not set)" || lower === "(empty)" || lower === "not set") return;

                        let label = item.label || rawName;
                        let category = item.category || "website";

                        if (lower.includes("whatsapp")) {
                          category = "whatsapp";
                          if (lower.includes("web") || lower.includes("desktop")) {
                            label = "WhatsApp Web (Desktop)";
                          } else {
                            label = "WhatsApp (Mobile App)";
                          }
                        } else if (lower.includes("facebook") || lower.includes("fb.me")) {
                          category = "facebook";
                          if (lower.includes("mobile") || lower.includes("m.facebook") || lower.includes("lm.facebook")) {
                            label = "Facebook (Mobile App)";
                          } else {
                            label = "Facebook (Desktop / Web)";
                          }
                        } else if (lower.includes("instagram")) {
                          label = "Instagram (Bio / Story Link)";
                          category = "instagram";
                        } else if (lower.includes("linkedin") || lower === "in" || lower.includes("lnkd.in")) {
                          label = "LinkedIn";
                          category = "linkedin";
                        } else if (lower.includes("google")) {
                          label = "Google Organic Search";
                          category = "google";
                        } else if (lower.includes("twitter") || lower.includes("x.com") || lower.includes("t.co")) {
                          label = "X / Twitter";
                          category = "twitter";
                        } else if (lower === "(direct)" || lower.includes("direct")) {
                          label = "Direct / Bookmark / Typing URL";
                          category = "direct";
                        }

                        const val = Number(item.users || item.sessions || item.count) || 0;
                        if (!aggMap[label]) {
                          aggMap[label] = { label, count: 0, category, rawName };
                        }
                        aggMap[label].count += val;
                      });

                      const aggregatedList = Object.values(aggMap).sort((a, b) => b.count - a.count);

                      if (aggregatedList.length === 0) {
                        return <p className="text-gray-400 text-sm py-8 text-center">No external referrer traffic recorded in this period yet.</p>;
                      }

                      const maxVal = Math.max(...aggregatedList.map((p: any) => p.count || 0));

                      const getIcon = (cat: string, label: string) => {
                        const l = (label || "").toLowerCase();
                        if (cat === "whatsapp" || l.includes("whatsapp")) return "💬";
                        if (cat === "instagram" || l.includes("instagram")) return "📸";
                        if (cat === "linkedin" || l.includes("linkedin")) return "💼";
                        if (cat === "google" || l.includes("google")) return "🔍";
                        if (cat === "facebook" || l.includes("facebook")) return "👥";
                        if (cat === "twitter" || l.includes("twitter") || l.includes("x.com")) return "🐦";
                        if (cat === "direct" || l.includes("direct")) return "🔗";
                        return "🌐";
                      };

                      return aggregatedList.map((item: any, i: number) => {
                        const icon = getIcon(item.category, item.label);
                        return (
                          <div key={i} className="text-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium truncate max-w-[75%] flex items-center gap-1.5" title={item.rawName}>
                                <span className="text-base">{icon}</span>
                                <span>{item.label}</span>
                              </span>
                              <span className="font-semibold text-gray-700">{item.count}</span>
                            </div>
                            <ProgressBar value={item.count} max={maxVal || 1} />
                          </div>
                        );
                      });
                    })()
                  ) : (
                    (() => {
                      const list = (data.insideReferrers || []).filter((item: any) => {
                        const path = (item.path || item.referrer || item.label || "").toLowerCase();
                        return !path.includes("admin");
                      });

                      if (list.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <p className="text-gray-400 text-sm">No internal page navigation recorded in this period.</p>
                            <p className="text-[11px] text-gray-400 mt-1">Shows when candidates move between pages (e.g. Home → Jobs)</p>
                          </div>
                        );
                      }

                      const maxVal = Math.max(...list.map((p: any) => Number(p.users || p.sessions) || 0));

                      return list.map((item: any, i: number) => {
                        const val = Number(item.users || item.sessions) || 0;
                        const displayLabel = item.label || item.path;
                        return (
                          <div key={i} className="text-sm">
                            <div className="flex justify-between items-center mb-1">
                              <div className="truncate max-w-[75%] flex items-center gap-2">
                                <span className="text-xs text-gray-400">↳</span>
                                <a 
                                  href={item.path || "#"} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="font-medium truncate hover:text-blue-600 hover:underline transition cursor-pointer" 
                                  title={displayLabel}
                                >
                                  {displayLabel}
                                </a>
                              </div>
                              <span className="font-semibold text-gray-700">{val}</span>
                            </div>
                            <ProgressBar value={val} max={maxVal || 1} />
                          </div>
                        );
                      });
                    })()
                  )}
                </div>
              </div>

              {/* ACQUISITION CHANNELS */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold">Acquisition Channels</h3>
                    <p className="text-xs text-gray-400 mt-0.5">High-level audience discovery mix</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {(!data.channels || data.channels.length === 0) && <p className="text-gray-400 text-sm">No channel data available.</p>}
                  {data.channels && (() => {
                    const maxCh = Math.max(...data.channels.map((c: any) => Number(c.sessions) || 0));
                    return data.channels.map((item: any, i: number) => {
                      const ch = (item.channel || "").toLowerCase();
                      let label = item.channel;
                      let icon = "🌐";
                      if (ch.includes("social")) { label = "Organic Social (WhatsApp, FB, Insta, LinkedIn)"; icon = "📱"; }
                      else if (ch.includes("direct")) { label = "Direct (Typing URL, Bookmarks)"; icon = "🔗"; }
                      else if (ch.includes("search")) { label = "Organic Search (Google, Bing)"; icon = "🔍"; }
                      else if (ch.includes("referral")) { label = "Referrals (Partner websites)"; icon = "🌐"; }

                      const val = Number(item.sessions) || 0;

                      return (
                        <div key={i} className="text-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium flex items-center gap-1.5 truncate max-w-[75%]">
                              <span>{icon}</span>
                              <span>{label}</span>
                            </span>
                            <span className="font-semibold text-gray-700">{val} {val === 1 ? 'session' : 'sessions'}</span>
                          </div>
                          <ProgressBar value={val} max={maxCh || 1} />
                        </div>
                      );
                    });
                  })()}
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
