// @ts-nocheck
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import { supabase } from "@/lib/supabase";
import { isCoreMetro, isCoreState } from "@/lib/channels";
import { 
  Bell, 
  Mail, 
  MapPin, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Search, 
  Filter, 
  ChevronRight, 
  Sparkles, 
  Globe, 
  Briefcase, 
  MessageCircle, 
  Users, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Share2
} from "lucide-react";

// Top Architectural Hubs in India for Dynamic SEO Pages
const INDIAN_CITIES = [
  { name: "Delhi", slug: "delhi", state: "Delhi", tier: "Metro Hub" },
  { name: "Mumbai", slug: "mumbai", state: "Maharashtra", tier: "Metro Hub" },
  { name: "Bengaluru", slug: "bengaluru", state: "Karnataka", tier: "Metro Hub" },
  { name: "Chennai", slug: "chennai", state: "Tamil Nadu", tier: "Metro Hub" },
  { name: "Pune", slug: "pune", state: "Maharashtra", tier: "Key Hub" },
  { name: "Hyderabad", slug: "hyderabad", state: "Telangana", tier: "Metro Hub" },
  { name: "Kolkata", slug: "kolkata", state: "West Bengal", tier: "Metro Hub" },
  { name: "Ahmedabad", slug: "ahmedabad", state: "Gujarat", tier: "Key Hub" },
  { name: "Jaipur", slug: "jaipur", state: "Rajasthan", tier: "Key Hub" },
  { name: "Chandigarh", slug: "chandigarh", state: "Punjab / Haryana", tier: "Key Hub" },
  { name: "Kochi", slug: "kochi", state: "Kerala", tier: "Regional Hub" },
  { name: "Goa", slug: "goa", state: "Goa", tier: "Design Hub" },
  { name: "Surat", slug: "surat", state: "Gujarat", tier: "Regional Hub" },
  { name: "Lucknow", slug: "lucknow", state: "Uttar Pradesh", tier: "Regional Hub" },
  { name: "Indore", slug: "indore", state: "Madhya Pradesh", tier: "Regional Hub" },
  { name: "Coimbatore", slug: "coimbatore", state: "Tamil Nadu", tier: "Regional Hub" },
  { name: "Bhopal", slug: "bhopal", state: "Madhya Pradesh", tier: "Regional Hub" },
  { name: "Nagpur", slug: "nagpur", state: "Maharashtra", tier: "Regional Hub" },
  { name: "Vadodara", slug: "vadodara", state: "Gujarat", tier: "Regional Hub" },
  { name: "Visakhapatnam", slug: "visakhapatnam", state: "Andhra Pradesh", tier: "Regional Hub" },
];

const INDIAN_STATES = [
  { name: "Maharashtra", slug: "maharashtra", capital: "Mumbai", region: "West India" },
  { name: "Karnataka", slug: "karnataka", capital: "Bengaluru", region: "South India" },
  { name: "Tamil Nadu", slug: "tamil-nadu", capital: "Chennai", region: "South India" },
  { name: "Delhi-NCR", slug: "delhi", capital: "New Delhi", region: "North India" },
  { name: "Gujarat", slug: "gujarat", capital: "Gandhinagar", region: "West India" },
  { name: "Telangana", slug: "telangana", capital: "Hyderabad", region: "South India" },
  { name: "Kerala", slug: "kerala", capital: "Thiruvananthapuram", region: "South India" },
  { name: "West Bengal", slug: "west-bengal", capital: "Kolkata", region: "East India" },
  { name: "Rajasthan", slug: "rajasthan", capital: "Jaipur", region: "North India" },
  { name: "Uttar Pradesh", slug: "uttar-pradesh", capital: "Lucknow", region: "North India" },
  { name: "Punjab", slug: "punjab", capital: "Chandigarh", region: "North India" },
  { name: "Haryana", slug: "haryana", capital: "Chandigarh", region: "North India" },
  { name: "Madhya Pradesh", slug: "madhya-pradesh", capital: "Bhopal", region: "Central India" },
  { name: "Andhra Pradesh", slug: "andhra-pradesh", capital: "Amaravati", region: "South India" },
  { name: "Goa", slug: "goa", capital: "Panaji", region: "West India" },
  { name: "Uttarakhand", slug: "uttarakhand", capital: "Dehradun", region: "North India" },
];

interface Subscriber {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message?: string;
  created_at: string;
  is_read?: boolean;
}

export default function SubscriptionsHubPage() {
  const router = useRouter();

  // Access State
  const [authorized, setAuthorized] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Data State
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [jobCountsByCity, setJobCountsByCity] = useState<Record<string, number>>({});
  const [jobCountsByState, setJobCountsByState] = useState<Record<string, number>>({});
  const [loadingData, setLoadingData] = useState(true);

  // Active Tab: "subscribers" | "pages"
  const [activeTab, setActiveTab] = useState<"subscribers" | "pages">("subscribers");

  // Filters for Subscribers
  const [subSearch, setSubSearch] = useState("");
  const [subFilter, setSubFilter] = useState<"all" | "briefing" | "alerts">("all");

  // Filters for SEO Pages
  const [pageSearch, setPageSearch] = useState("");
  const [pageTypeFilter, setPageTypeFilter] = useState<"all" | "city" | "state">("all");

  // Copy Feedback Toast
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // 1. Verify Admin Access
  useEffect(() => {
    async function checkRole() {
      try {
        const stored = localStorage.getItem("currentUser");
        let role = "";
        if (stored) {
          const parsed = JSON.parse(stored);
          role = (parsed?.role || "").toLowerCase().replace(/[\s_]+/g, "");
        }

        if (!role) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            const { data: prof } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
            role = (prof?.role || "").toLowerCase().replace(/[\s_]+/g, "");
          }
        }

        const isAllowed = ["superadmin", "ceo"].includes(role);
        if (!isAllowed) {
          router.push("/admin");
          return;
        }
        setAuthorized(true);
      } catch (e) {
        console.error("Auth check failed:", e);
        router.push("/");
      } finally {
        setLoadingAuth(false);
      }
    }
    checkRole();
  }, [router]);

  // 2. Fetch Subscribers & Live Job Counts
  const fetchData = async () => {
    setLoadingData(true);
    try {
      // A. Fetch Subscribers from contact_inquiries
      const { data: inquiries, error: inqErr } = await supabase
        .from("contact_inquiries")
        .select("*")
        .or("subject.eq.SUBSCRIBE_FORTNIGHTLY_BRIEFING,subject.eq.SUBSCRIBE_JOB_ALERTS,subject.ilike.SUBSCRIBE%")
        .order("created_at", { ascending: false });

      if (inquiries) {
        setSubscribers(inquiries);
      }

      // B. Fetch Published Jobs to compute live count per city and state
      const { data: jobs, error: jobsErr } = await supabase
        .from("jobs")
        .select("id, city, state, status")
        .eq("status", "published");

      if (jobs) {
        const cityMap: Record<string, number> = {};
        const stateMap: Record<string, number> = {};

        jobs.forEach((j: any) => {
          if (j.city) {
            const c = j.city.trim().toLowerCase();
            cityMap[c] = (cityMap[c] || 0) + 1;
          }
          if (j.state) {
            const s = j.state.trim().toLowerCase();
            stateMap[s] = (stateMap[s] || 0) + 1;
          }
        });

        setJobCountsByCity(cityMap);
        setJobCountsByState(stateMap);
      }
    } catch (err) {
      console.error("Error fetching subscription hub data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchData();
    }
  }, [authorized]);

  // Copy helper
  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Export Subscribers to CSV
  const handleExportCSV = () => {
    if (subscribers.length === 0) return;

    const headers = ["ID", "Name", "Email", "Phone", "Type", "Preferences", "Date"];
    const rows = filteredSubscribers.map((s) => {
      let pref = "";
      try {
        if (s.message && s.message.startsWith("{")) {
          const parsed = JSON.parse(s.message);
          pref = `Plan: ${parsed.plan || ""}; Role: ${parsed.role || ""}; Loc: ${parsed.location || ""}; Freq: ${parsed.frequency || ""}`;
        } else {
          pref = (s.message || "").replace(/"/g, '""');
        }
      } catch (e) {
        pref = (s.message || "").replace(/"/g, '""');
      }

      return [
        `"${s.id}"`,
        `"${(s.name || "").replace(/"/g, '""')}"`,
        `"${s.email || ""}"`,
        `"${s.phone || ""}"`,
        `"${s.subject === "SUBSCRIBE_FORTNIGHTLY_BRIEFING" ? "Fortnightly Briefing" : "Job Alerts"}"`,
        `"${pref}"`,
        `"${new Date(s.created_at).toLocaleDateString()}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscribers_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // All SEO Pages with Automated 5-Job Rule & Core Metros Always Active
  const allSeoPages = useMemo(() => {
    const list: any[] = [];
    const seenCities = new Set<string>();

    // 1. Process curated INDIAN_CITIES
    INDIAN_CITIES.forEach((c) => {
      const slug = c.slug.toLowerCase();
      seenCities.add(slug);
      seenCities.add(c.name.toLowerCase());
      const count = jobCountsByCity[c.name.toLowerCase()] || jobCountsByCity[slug] || 0;
      const isMetro = isCoreMetro(c.name) || isCoreMetro(c.slug);
      const isActiveRule = count >= 5;

      let statusBadge = "Incubating (< 5 jobs)";
      let badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
      if (isMetro) {
        statusBadge = "Core Metro (Always Active)";
        badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
      } else if (isActiveRule) {
        statusBadge = "Active Hub (≥ 5 jobs)";
        badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
      }

      list.push({
        type: "city",
        name: c.name,
        slug: c.slug,
        subLabel: `${c.tier} · ${c.state}`,
        urlPath: `/jobs/city/${c.slug}`,
        fullUrl: `https://trappedintoarchitecture.com/jobs/city/${c.slug}`,
        activeJobs: count,
        isMetro,
        isActiveRule,
        statusBadge,
        badgeColor,
      });
    });

    // 2. Discover any additional cities from live DB
    Object.entries(jobCountsByCity).forEach(([cityName, count]) => {
      const slug = cityName.toLowerCase().replace(/\s+/g, "-");
      if (!seenCities.has(slug) && !seenCities.has(cityName.toLowerCase())) {
        seenCities.add(slug);
        seenCities.add(cityName.toLowerCase());
        const formattedName = cityName.replace(/\b\w/g, (l) => l.toUpperCase());
        const isMetro = isCoreMetro(cityName) || isCoreMetro(slug);
        const isActiveRule = count >= 5;

        let statusBadge = "Incubating (< 5 jobs)";
        let badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
        if (isMetro) {
          statusBadge = "Core Metro (Always Active)";
          badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
        } else if (isActiveRule) {
          statusBadge = "Active Hub (≥ 5 jobs)";
          badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
        }

        list.push({
          type: "city",
          name: formattedName,
          slug: slug,
          subLabel: `Auto-Discovered · Live Listings`,
          urlPath: `/jobs/city/${slug}`,
          fullUrl: `https://trappedintoarchitecture.com/jobs/city/${slug}`,
          activeJobs: count,
          isMetro,
          isActiveRule,
          statusBadge,
          badgeColor,
        });
      }
    });

    // 3. Process curated INDIAN_STATES
    const seenStates = new Set<string>();
    INDIAN_STATES.forEach((s) => {
      const slug = s.slug.toLowerCase();
      seenStates.add(slug);
      seenStates.add(s.name.toLowerCase());
      const count = jobCountsByState[s.name.toLowerCase()] || jobCountsByState[slug] || 0;
      const isCore = isCoreState(s.name) || isCoreState(s.slug);
      const isActiveRule = count >= 5;

      let statusBadge = "Incubating (< 5 jobs)";
      let badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
      if (isActiveRule || isCore) {
        statusBadge = "Active State (≥ 5 jobs)";
        badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
      }

      list.push({
        type: "state",
        name: s.name,
        slug: s.slug,
        subLabel: `${s.region} · Capital: ${s.capital}`,
        urlPath: `/jobs/state/${s.slug}`,
        fullUrl: `https://trappedintoarchitecture.com/jobs/state/${s.slug}`,
        activeJobs: count,
        isMetro: isCore,
        isActiveRule,
        statusBadge,
        badgeColor,
      });
    });

    // 4. Discover any additional states from DB
    Object.entries(jobCountsByState).forEach(([stName, count]) => {
      const slug = stName.toLowerCase().replace(/\s+/g, "-");
      if (!seenStates.has(slug) && !seenStates.has(stName.toLowerCase())) {
        seenStates.add(slug);
        seenStates.add(stName.toLowerCase());
        const formattedName = stName.replace(/\b\w/g, (l) => l.toUpperCase());
        const isCore = isCoreState(stName) || isCoreState(slug);
        const isActiveRule = count >= 5;

        let statusBadge = "Incubating (< 5 jobs)";
        let badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
        if (isActiveRule || isCore) {
          statusBadge = "Active State (≥ 5 jobs)";
          badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
        }

        list.push({
          type: "state",
          name: formattedName,
          slug: slug,
          subLabel: `Auto-Discovered State`,
          urlPath: `/jobs/state/${slug}`,
          fullUrl: `https://trappedintoarchitecture.com/jobs/state/${slug}`,
          activeJobs: count,
          isMetro: isCore,
          isActiveRule,
          statusBadge,
          badgeColor,
        });
      }
    });

    return list;
  }, [jobCountsByCity, jobCountsByState]);

  // KPI Calculations
  const totalSubscribers = subscribers.length;
  const briefingSubscribers = subscribers.filter((s) => s.subject === "SUBSCRIBE_FORTNIGHTLY_BRIEFING").length;
  const alertSubscribers = subscribers.filter((s) => s.subject !== "SUBSCRIBE_FORTNIGHTLY_BRIEFING").length;
  const totalSeoPages = allSeoPages.length;
  const activeLandingPagesCount = allSeoPages.filter((p) => p.activeJobs >= 5 || p.isMetro).length;

  // Filtered Subscribers
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((s) => {
      // Type Filter
      if (subFilter === "briefing" && s.subject !== "SUBSCRIBE_FORTNIGHTLY_BRIEFING") return false;
      if (subFilter === "alerts" && s.subject === "SUBSCRIBE_FORTNIGHTLY_BRIEFING") return false;

      // Text Search
      if (!subSearch.trim()) return true;
      const q = subSearch.toLowerCase();
      return (
        (s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        (s.phone || "").toLowerCase().includes(q) ||
        (s.message || "").toLowerCase().includes(q)
      );
    });
  }, [subscribers, subSearch, subFilter]);

  // Filtered SEO Pages
  const filteredPages = useMemo(() => {
    let result = allSeoPages;
    if (pageTypeFilter === "city") {
      result = result.filter((p) => p.type === "city");
    } else if (pageTypeFilter === "state") {
      result = result.filter((p) => p.type === "state");
    }

    if (pageSearch.trim()) {
      const q = pageSearch.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.subLabel.toLowerCase().includes(q));
    }

    // Sort: Active Hubs / Core Metros first, then by activeJobs desc
    return [...result].sort((a, b) => {
      if (a.isMetro !== b.isMetro) return a.isMetro ? -1 : 1;
      return b.activeJobs - a.activeJobs;
    });
  }, [allSeoPages, pageTypeFilter, pageSearch]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <AdminQuickMenu />
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-1">
                <Bell size={12} className="text-emerald-600" />
                <span>Audience &amp; SEO Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Subscriptions &amp; Job SEO Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage alert subscribers, review lead coordinates, and monitor dynamic City &amp; State job landing pages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchData}
              disabled={loadingData}
              className="p-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition shadow-xs flex items-center justify-center cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={loadingData ? "animate-spin text-slate-400" : ""} />
            </button>
            <button
              onClick={handleExportCSV}
              disabled={subscribers.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4 KPI METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Subscribers */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Subscribers</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{totalSubscribers}</span>
              <p className="text-[11px] text-slate-500 mt-1">Verified candidate &amp; visitor alerts</p>
            </div>
          </div>

          {/* Card 2: Fortnightly Briefing */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Fortnightly Briefing</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Mail size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{briefingSubscribers}</span>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">Dispatches 1st &amp; 15th every month</p>
            </div>
          </div>

          {/* Card 3: WhatsApp & Job Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Job Alerts (WhatsApp)</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageCircle size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{alertSubscribers}</span>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Instant drops &amp; daily digests</p>
            </div>
          </div>

          {/* Card 4: Indexed SEO Hubs */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Job SEO Landing Pages</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Globe size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{totalSeoPages}</span>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {activeLandingPagesCount} Active Hubs (≥ 5 jobs / Metros)
              </p>
            </div>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("subscribers")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "subscribers"
                  ? "bg-black text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-black border border-slate-200"
              }`}
            >
              <Users size={15} />
              <span>Subscribers Directory ({subscribers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("pages")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "pages"
                  ? "bg-black text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-black border border-slate-200"
              }`}
            >
              <MapPin size={15} />
              <span>City &amp; State SEO Pages Directory ({totalSeoPages})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: SUBSCRIBERS DIRECTORY */}
        {activeTab === "subscribers" && (
          <div className="space-y-4">
            {/* SEARCH & FILTER CONTROLS */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search subscriber email, name, phone..."
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setSubFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                    subFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All ({subscribers.length})
                </button>
                <button
                  onClick={() => setSubFilter("briefing")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                    subFilter === "briefing" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Fortnightly Briefing ({briefingSubscribers})
                </button>
                <button
                  onClick={() => setSubFilter("alerts")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                    subFilter === "alerts" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  WhatsApp &amp; Job Alerts ({alertSubscribers})
                </button>
              </div>
            </div>

            {/* SUBSCRIBERS TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Subscriber</th>
                      <th className="py-3.5 px-4">Channel / Type</th>
                      <th className="py-3.5 px-4">Contact Coordinate</th>
                      <th className="py-3.5 px-4">Preferences / Message</th>
                      <th className="py-3.5 px-4">Date Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredSubscribers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          {loadingData ? "Loading subscribers..." : "No subscribers match your search filter."}
                        </td>
                      </tr>
                    ) : (
                      filteredSubscribers.map((s) => {
                        const isBriefing = s.subject === "SUBSCRIBE_FORTNIGHTLY_BRIEFING";
                        let parsedMeta: any = null;
                        if (s.message && s.message.startsWith("{")) {
                          try {
                            parsedMeta = JSON.parse(s.message);
                          } catch (e) {}
                        }

                        return (
                          <tr key={s.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{s.name || "Subscriber"}</div>
                              <div className="text-xs text-slate-500">{s.email}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              {isBriefing ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  <Mail size={12} />
                                  <span>Briefing (1st &amp; 15th)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <MessageCircle size={12} />
                                  <span>WhatsApp Job Alerts</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {s.phone ? (
                                <span className="font-mono text-xs font-bold text-slate-800">{s.phone}</span>
                              ) : (
                                <span className="text-slate-400 text-xs italic">Email Only</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                              {parsedMeta ? (
                                <div className="space-y-0.5">
                                  {parsedMeta.role && <div><span className="font-semibold text-slate-900">Role:</span> {parsedMeta.role}</div>}
                                  {parsedMeta.location && <div><span className="font-semibold text-slate-900">Location:</span> {parsedMeta.location}</div>}
                                  {parsedMeta.frequency && <div><span className="font-semibold text-slate-900">Freq:</span> {parsedMeta.frequency}</div>}
                                </div>
                              ) : (
                                <span>{s.message || "Fortnightly Briefing Subscriber"}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                              {new Date(s.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CITY & STATE SEO PAGES DIRECTORY */}
        {activeTab === "pages" && (
          <div className="space-y-4">
            {/* POLICY BANNER */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl mt-0.5">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Automated City &amp; State Landing Page Engine</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Rule: ≥ 5 Jobs
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Every city and state with <strong className="text-white">5 or more jobs</strong> (including active, outdated, and expired openings) automatically gets a public landing page and sitemap indexation. <strong className="text-white">Core Metros</strong> (Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata, Pune, Ahmedabad) stay permanently active.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl">
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-400">
                    {activeLandingPagesCount}
                  </div>
                  <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                    Active Hubs
                  </div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-right">
                  <div className="text-xl font-black text-white">
                    {totalSeoPages}
                  </div>
                  <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                    Total Monitored
                  </div>
                </div>
              </div>
            </div>

            {/* SEARCH & FILTER CONTROLS */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search city or state..."
                  value={pageSearch}
                  onChange={(e) => setPageSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setPageTypeFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    pageTypeFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Hubs ({totalSeoPages})
                </button>
                <button
                  onClick={() => setPageTypeFilter("city")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    pageTypeFilter === "city" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Cities ({allSeoPages.filter((p) => p.type === "city").length})
                </button>
                <button
                  onClick={() => setPageTypeFilter("state")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    pageTypeFilter === "state" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  States ({allSeoPages.filter((p) => p.type === "state").length})
                </button>
              </div>
            </div>

            {/* DIRECTORY CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPages.map((page) => {
                const isCity = page.type === "city";
                const isCopied = copiedUrl === page.fullUrl;

                return (
                  <div
                    key={`${page.type}-${page.slug}`}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-black transition flex flex-col justify-between group"
                  >
                    <div>
                      {/* TOP BADGES */}
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            isCity
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {isCity ? "City Directory" : "State Directory"}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${page.badgeColor}`}
                        >
                          {page.statusBadge}
                        </span>
                      </div>

                      {/* LOCATION TITLE & SUBTITLE */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-black text-slate-900 group-hover:text-black">
                            {page.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {page.subLabel}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                          <Briefcase size={12} className="text-slate-500" />
                          <span>{page.activeJobs} Jobs</span>
                        </span>
                      </div>

                      {/* URL DISPLAY */}
                      <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-150 font-mono text-[11px] text-slate-600 break-all select-all">
                        {page.urlPath}
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(page.fullUrl)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                          title="Copy Full URL"
                        >
                          {isCopied ? (
                            <>
                              <Check size={13} className="text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>

                        <a
                          href={`https://www.google.com/search?q=site:trappedintoarchitecture.com${page.urlPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition"
                          title="Check Google SEO Index"
                        >
                          <Search size={12} />
                          <span>Google</span>
                        </a>
                      </div>

                      <Link
                        href={page.urlPath}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
                      >
                        <span>Open Page</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
