// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Building2, 
  ArrowRight, 
  MessageCircle, 
  Globe, 
  Mail, 
  Smartphone, 
  Send,
  ExternalLink,
  GraduationCap
} from "lucide-react";
import { InstagramIcon, FacebookIcon, TwitterIcon } from "@/components/icons/SocialIcons";

const ensureHttp = (url?: string) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "https://" + trimmed;
};

export default function InteractiveHome({
  recentJobs = [],
  recentInternships = [],
  popularJobs = [],
  recentCompanies = [],
  popularCompanies = [],
  mostJobsCompanies = [],
  stats,
  siteSettings
}: {
  recentJobs: any[];
  recentInternships: any[];
  popularJobs: any[];
  recentCompanies: any[];
  popularCompanies: any[];
  mostJobsCompanies: any[];
  stats: any;
  siteSettings: any;
}) {
  const router = useRouter();

  // Search Bar State
  const [searchQuery, setSearchQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (cityQuery.trim()) params.set("city", cityQuery.trim());
    router.push(`/jobs?${params.toString()}`);
  };

  // Companies Tabs
  const [companyTab, setCompanyTab] = useState<"latest" | "most-jobs">("latest");
  const displayCompanies = (companyTab === "most-jobs" ? mostJobsCompanies : recentCompanies).slice(0, 6);

  // Suggestion Box State
  const [suggestionText, setSuggestionText] = useState("");
  const [suggestionSender, setSuggestionSender] = useState("");
  const [suggestionStatus, setSuggestionStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;

    setSuggestionStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: suggestionSender.trim() || "Anonymous Architect",
          email: "suggestion@trappedintoarchitecture.com",
          subject: "💡 Homepage Suggestion Box Submission",
          message: suggestionText.trim()
        })
      });

      if (res.ok) {
        setSuggestionStatus("success");
        setSuggestionText("");
        setSuggestionSender("");
        setTimeout(() => setSuggestionStatus("idle"), 4000);
      } else {
        setSuggestionStatus("error");
      }
    } catch (err) {
      setSuggestionStatus("error");
    }
  };

  // Handler for Post a Job CTA (Auth trigger or direct route)
  const handlePostJobClick = (e: React.MouseEvent) => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (!stored) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("open-auth", { detail: "register" }));
      }
    } catch (err) {
      // Allow standard link navigation
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* 1. HERO SECTION (CLEAN MONOCHROME WITH COMPACT SEARCH) */}
      <section className="bg-white py-8 md:py-10 px-4 sm:px-6 lg:px-12 text-center border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
            Every Architect's Destination
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
            Trapped into Architecture helps in finding jobs, knowing companies, improving knowledge, and exploring architecture.
          </p>

          {/* Compact Search Bar */}
          <form onSubmit={handleSearchSubmit} className="bg-gray-50 p-1.5 rounded-2xl border border-gray-200 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 shadow-xs mb-3">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search role, firm, or skill (e.g. Junior Architect, Revit)..." 
                className="w-full text-xs sm:text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
              />
            </div>
            <div className="flex-1 sm:max-w-[190px] flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="text" 
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="City (Mumbai, Bangalore)..." 
                className="w-full text-xs sm:text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
              />
            </div>
            <button 
              type="submit" 
              className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Popular Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-gray-500">
            <span className="text-gray-400 text-[11px]">Popular:</span>
            <Link href="/jobs?search=Junior%20Architect" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-md transition text-[11px]">Junior Architect</Link>
            <Link href="/internships" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-md transition text-[11px]">Internships</Link>
            <Link href="/jobs?search=Landscape" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-md transition text-[11px]">Landscape</Link>
            <Link href="/jobs?city=Bengaluru" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-md transition text-[11px]">Bengaluru</Link>
            <Link href="/jobs?city=Mumbai" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-md transition text-[11px]">Mumbai</Link>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM STATISTICS (SLIM COMPACT STRIP) */}
      <section className="py-4 px-4 sm:px-6 lg:px-12 bg-black text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800">
          <Link 
            href="/jobs" 
            className="p-2 rounded-xl hover:bg-white/10 transition group block"
            title="Browse all Architecture Jobs"
          >
            <div className="text-2xl md:text-3xl font-bold mb-0.5 group-hover:scale-105 transition-transform">{stats?.jobs || 0}</div>
            <div className="text-gray-400 group-hover:text-gray-200 font-medium flex items-center justify-center gap-1 text-xs">
              <span>Jobs Available</span>
              <span className="text-xs">&rarr;</span>
            </div>
          </Link>

          <Link 
            href="/internships" 
            className="p-2 rounded-xl hover:bg-white/10 transition group block"
            title="Explore Architectural Internships"
          >
            <div className="text-2xl md:text-3xl font-bold mb-0.5 group-hover:scale-105 transition-transform">{stats?.internships || 0}</div>
            <div className="text-gray-400 group-hover:text-gray-200 font-medium flex items-center justify-center gap-1 text-xs">
              <span>Internship Opportunities</span>
              <span className="text-xs">&rarr;</span>
            </div>
          </Link>

          <Link 
            href="/companies" 
            className="p-2 rounded-xl hover:bg-white/10 transition group block"
            title="Explore Architecture Studios"
          >
            <div className="text-2xl md:text-3xl font-bold mb-0.5 group-hover:scale-105 transition-transform">{stats?.companies || 0}</div>
            <div className="text-gray-400 group-hover:text-gray-200 font-medium flex items-center justify-center gap-1 text-xs">
              <span>Companies Listed</span>
              <span className="text-xs">&rarr;</span>
            </div>
          </Link>

          <div className="p-2 select-none">
            <div className="text-2xl md:text-3xl font-bold mb-0.5">{stats?.pageVisits ? stats.pageVisits.toLocaleString() : (stats?.users || 0)}</div>
            <div className="text-gray-400 font-medium text-xs">Total Page Visits</div>
          </div>
        </div>
      </section>

      {/* 3. REVENUE SECTION: SUBSCRIBE FOR INSTANT WHATSAPP ALERTS */}
      <section className="py-2.5 px-4 sm:px-6 lg:px-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900 text-white rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border border-gray-800">
            <div className="flex items-center gap-3">
              <span className="text-base text-emerald-400">⚡</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-white">Subscribe for Instant WhatsApp Job Alerts</h3>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold px-1.5 py-0.5 rounded uppercase">Instant Drops</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  Top studios close applications quickly. Receive direct alerts on WhatsApp as soon as vacancies are published.
                </p>
              </div>
            </div>

            <Link 
              href="/contact?service=whatsapp-alerts"
              className="w-full sm:w-auto bg-white hover:bg-gray-100 text-black font-bold px-4 py-1.5 rounded-lg text-xs transition text-center shrink-0"
            >
              Subscribe for Alerts &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 4. THE TWIN GATEWAYS: EXPLORE JOBS & EXPLORE INTERNSHIPS */}
      {/* DESKTOP: Clean 50/50 Vertical Split */}
      {/* MOBILE: Clean Sibling Panels stacked without confusion */}
      <section className="py-6 md:py-8 px-4 sm:px-6 lg:px-12 w-full bg-gray-50">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* GATEWAY 1: EXPLORE JOBS (4 COMPACT CARDS IN REAL WEBSITE CARD STYLE) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-black"></span>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">Explore Jobs</h2>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {stats?.jobs || 0}+ Vacancies
                  </span>
                </div>

                {/* 4 Small Job Cards (Compact & Tight) */}
                {recentJobs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl mb-3">
                    No active job vacancies found.
                  </div>
                ) : (
                  <div className="space-y-2 mb-3">
                    {recentJobs.slice(0, 4).map((job) => (
                      <Link 
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="block bg-white p-2.5 rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-2xs transition group"
                      >
                        <div className="flex items-start gap-2.5 mb-1.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                            {job.image ? (
                              <img src={job.image} alt={job.firm_name} className="w-full h-full object-cover" />
                            ) : (
                              <Building2 className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-xs text-gray-900 group-hover:text-black transition truncate">
                              {job.position}
                            </h3>
                            <p className="text-gray-500 text-[11px] truncate mt-0.5">
                              {job.firm_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                            📍 {job.city || "India"}
                          </span>
                          {job.workplace_type && (
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                              {job.workplace_type}
                            </span>
                          )}
                          {job.salary ? (
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded font-semibold text-gray-900">
                              {job.salary}
                            </span>
                          ) : (
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                              {job.employment_type || "Vacancy"}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Browse More Jobs Button */}
              <Link 
                href="/jobs" 
                className="w-full text-center bg-black hover:bg-gray-800 text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-1"
              >
                <span>Browse More Jobs</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* GATEWAY 2: EXPLORE INTERNSHIPS (4 COMPACT CARDS) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-black"></span>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">Explore Internships</h2>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {stats?.internships || 0}+ Opportunities
                  </span>
                </div>

                {/* 4 Small Internship Cards */}
                {recentInternships.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl mb-3">
                    No active internship postings found.
                  </div>
                ) : (
                  <div className="space-y-2 mb-3">
                    {recentInternships.slice(0, 4).map((internship) => (
                      <Link 
                        key={internship.id}
                        href={`/jobs/${internship.id}`}
                        className="block bg-white p-2.5 rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-2xs transition group"
                      >
                        <div className="flex items-start gap-2.5 mb-1.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                            {internship.image ? (
                              <img src={internship.image} alt={internship.firm_name} className="w-full h-full object-cover" />
                            ) : (
                              <GraduationCap className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-xs text-gray-900 group-hover:text-black transition truncate">
                              {internship.position}
                            </h3>
                            <p className="text-gray-500 text-[11px] truncate mt-0.5">
                              {internship.firm_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                            📍 {internship.city || "India"}
                          </span>
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                            Internship
                          </span>
                          {internship.salary && (
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded font-semibold text-gray-900">
                              {internship.salary}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Browse More Internships Button */}
              <Link 
                href="/internships" 
                className="w-full text-center bg-black hover:bg-gray-800 text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-1"
              >
                <span>Browse More Internships</span>
                <span>&rarr;</span>
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 5. JOB POSTING & MONETIZATION (NO HEAVY SUBTEXT - JUST PUNCHY HEADINGS & BUTTONS) */}
      <section className="py-6 md:py-8 px-4 sm:px-6 lg:px-12 bg-black text-white border-y border-gray-800">
        <div className="max-w-7xl mx-auto space-y-4">
          
          <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">For Recruiters &amp; Practices</h2>
            <span className="text-[11px] text-gray-400 font-mono">Employer Suite</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            
            {/* Card 1: Do you have a job to post? */}
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col justify-between hover:border-gray-700 transition">
              <div className="mb-3">
                <span className="text-[10px] bg-white text-black font-bold px-2 py-0.5 rounded uppercase">Post a Vacancy</span>
                <h3 className="font-bold text-sm text-white mt-2 leading-snug">Do you have a job to post?</h3>
              </div>
              <Link 
                href="/post-job" 
                onClick={handlePostJobClick}
                className="block w-full text-center bg-white hover:bg-gray-200 text-black font-bold py-2 rounded-lg text-xs transition"
              >
                Post a Job &rarr;
              </Link>
            </div>

            {/* Card 2: Do you want your job featured? */}
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col justify-between hover:border-gray-700 transition">
              <div className="mb-3">
                <span className="text-[10px] bg-white text-black font-bold px-2 py-0.5 rounded uppercase">5X Applicants</span>
                <h3 className="font-bold text-sm text-white mt-2 leading-snug">Do you want your job to be featured?</h3>
              </div>
              <Link 
                href="/contact?service=feature-job" 
                className="block w-full text-center bg-white hover:bg-gray-200 text-black font-bold py-2 rounded-lg text-xs transition"
              >
                Feature Your Job &rarr;
              </Link>
            </div>

            {/* Card 3: Do you want your company featured? */}
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col justify-between hover:border-gray-700 transition">
              <div className="mb-3">
                <span className="text-[10px] bg-gray-800 text-gray-200 font-bold px-2 py-0.5 rounded border border-gray-700 uppercase">Spotlight</span>
                <h3 className="font-bold text-sm text-white mt-2 leading-snug">Do you want your company to be featured?</h3>
              </div>
              <Link 
                href="/contact?service=feature-company" 
                className="block w-full text-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 rounded-lg text-xs transition border border-gray-700"
              >
                Feature Your Studio &rarr;
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 6. EXPLORE ARCHITECTURE STUDIOS (VERTICALLY DIVIDED: STUDIOS ON LEFT, CLAIM/REGISTER ON RIGHT) */}
      <section className="py-6 md:py-8 px-4 sm:px-6 lg:px-12 bg-[#EEF0F4] w-full text-black border-b border-gray-200">
        <div className="max-w-7xl mx-auto space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Explore Architecture Studios</h2>
              <p className="text-xs text-gray-500">Discover leading design firms across India.</p>
            </div>
            
            <div className="flex bg-white p-1 rounded-full w-fit border border-gray-200 shadow-2xs text-xs font-semibold">
              <button 
                onClick={() => setCompanyTab("latest")} 
                className={`px-3 py-1 rounded-full text-[11px] transition ${companyTab === "latest" ? "bg-black text-white shadow-xs" : "text-gray-500 hover:text-black"}`}
              >
                Latest
              </button>
              <button 
                onClick={() => setCompanyTab("most-jobs")} 
                className={`px-3 py-1 rounded-full text-[11px] transition ${companyTab === "most-jobs" ? "bg-black text-white shadow-xs" : "text-gray-500 hover:text-black"}`}
              >
                Most Jobs
              </button>
            </div>
          </div>

          {/* Vertical Division: 2 Columns (Studios List on Left, Claim/Register Box on Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* LEFT PART (8 Cols): Compact Studio Grid */}
            <div className="lg:col-span-8 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
              {displayCompanies.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center text-xs text-gray-500 mb-3">
                  No architecture studios listed yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
                  {displayCompanies.map((company) => (
                    <Link 
                      href={`/companies/${company.slug}`}
                      key={company.slug}
                      className="bg-gray-50 hover:bg-gray-100 p-2.5 rounded-xl flex items-center gap-2.5 transition group border border-gray-100"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.firm_name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="text-gray-400 w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 group-hover:text-black transition truncate">
                          {company.firm_name}
                        </h4>
                        <p className="text-[10px] text-gray-500 truncate">
                          {company.city || "Studio"} &bull; {company.job_count} {company.job_count === 1 ? 'Job' : 'Jobs'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="text-center pt-2 border-t border-gray-100">
                <Link 
                  href="/companies" 
                  className="text-xs font-semibold text-black hover:underline inline-flex items-center gap-1"
                >
                  <span>View All {stats?.companies || 0}+ Studios</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* RIGHT PART (4 Cols): Claim & Register Studio Box */}
            <div className="lg:col-span-4 bg-black text-white p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Practice Directory</span>
                <h3 className="text-base font-bold text-white mt-1 mb-2">Do you find your studio here?</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">
                  Over 850 architecture studios are listed. Claim ownership to manage your vacancies or register your new practice.
                </p>
              </div>

              <div className="space-y-2">
                <Link 
                  href="/companies" 
                  className="block w-full text-center bg-white hover:bg-gray-200 text-black font-bold py-2 rounded-xl text-xs transition"
                >
                  Claim Your Studio &rarr;
                </Link>
                <Link 
                  href="/contact?service=register-practice" 
                  className="block w-full text-center border border-gray-700 hover:border-gray-500 text-gray-300 font-semibold py-2 rounded-xl text-xs transition"
                >
                  Register Your Practice
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. ARCHITECTURE SERVICES & PORTFOLIO BUILDER (MERGED COMPACT ROW) */}
      <section className="py-6 md:py-8 px-4 sm:px-6 lg:px-12 bg-white text-black w-full border-b border-gray-200">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Architecture Services &amp; Tools</h2>
            <span className="text-[11px] text-gray-400 font-mono">Specialized Shelf</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            
            {/* Cosmofolio Portfolio Builder (Compact) */}
            <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-xl border border-gray-200 flex flex-col justify-between transition group">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-base">📐</span>
                  <span className="text-[9px] font-bold bg-black text-white px-1.5 py-0.5 rounded">COSMOFOLIO</span>
                </div>
                <h3 className="font-bold text-xs text-gray-900 mb-0.5">Portfolio Builder</h3>
                <p className="text-gray-600 text-[11px] leading-relaxed mb-2.5">
                  Build a professional architecture folio in seconds without code.
                </p>
              </div>
              <a 
                href="https://thecosmofolio.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full text-center bg-black hover:bg-gray-800 text-white font-bold py-1.5 rounded-lg text-[11px] transition flex items-center justify-center gap-1"
              >
                <span>Build Portfolio</span>
                <ExternalLink size={11} />
              </a>
            </div>

            {/* Hire a Software Tutor */}
            <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-xl border border-gray-200 flex flex-col justify-between transition group">
              <div>
                <span className="text-base mb-1.5 block">💻</span>
                <h3 className="font-bold text-xs text-gray-900 mb-0.5">Hire a Software Tutor</h3>
                <p className="text-gray-600 text-[11px] leading-relaxed mb-2.5">
                  Master Revit, Rhino, Grasshopper &amp; Enscape 1-on-1.
                </p>
              </div>
              <Link 
                href="/contact?service=software-tutor" 
                className="w-full text-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold py-1.5 rounded-lg text-[11px] transition"
              >
                Find Tutor &rarr;
              </Link>
            </div>

            {/* Hire an Architect */}
            <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-xl border border-gray-200 flex flex-col justify-between transition group">
              <div>
                <span className="text-base mb-1.5 block">🏛️</span>
                <h3 className="font-bold text-xs text-gray-900 mb-0.5">Hire an Architect</h3>
                <p className="text-gray-600 text-[11px] leading-relaxed mb-2.5">
                  Find vetted freelance architects for concept &amp; working drawings.
                </p>
              </div>
              <Link 
                href="/contact?service=freelance-architect" 
                className="w-full text-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold py-1.5 rounded-lg text-[11px] transition"
              >
                Request Architect &rarr;
              </Link>
            </div>

            {/* Portfolio Review */}
            <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-xl border border-gray-200 flex flex-col justify-between transition group">
              <div>
                <span className="text-base mb-1.5 block">🔍</span>
                <h3 className="font-bold text-xs text-gray-900 mb-0.5">Portfolio &amp; Resume Review</h3>
                <p className="text-gray-600 text-[11px] leading-relaxed mb-2.5">
                  Get line-by-line critique before studio applications.
                </p>
              </div>
              <Link 
                href="/contact?service=portfolio-review" 
                className="w-full text-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold py-1.5 rounded-lg text-[11px] transition"
              >
                Book Critique &rarr;
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 8. SUGGESTION BOX & MULTI-CHANNEL COMMUNITY */}
      <section className="py-6 md:py-8 px-4 sm:px-6 lg:px-12 bg-gray-50 w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Suggestion Box Form */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-[10px] font-semibold mb-1.5">
                💡 COMMUNITY VOICE
              </div>
              <h3 className="font-bold text-sm text-gray-900 mb-0.5">Suggestion Box</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
                Missing a studio? Want a new salary filter or feature? Tell us what you need.
              </p>
            </div>

            <form onSubmit={handleSuggestionSubmit} className="space-y-2">
              <input 
                type="text"
                value={suggestionSender}
                onChange={(e) => setSuggestionSender(e.target.value)}
                placeholder="Your name or studio (optional)..."
                className="w-full text-xs p-2 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-gray-400"
              />
              <textarea 
                rows={2}
                value={suggestionText}
                onChange={(e) => setSuggestionText(e.target.value)}
                required
                placeholder="Type your suggestion here..."
                className="w-full text-xs p-2 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-gray-400 resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  {suggestionStatus === "success" ? (
                    <span className="text-emerald-600 font-semibold">✓ Suggestion received! Thank you.</span>
                  ) : suggestionStatus === "error" ? (
                    <span className="text-red-500">Failed to submit. Please try again.</span>
                  ) : (
                    "Direct to founder's desk"
                  )}
                </span>
                <button 
                  type="submit" 
                  disabled={suggestionStatus === "submitting"}
                  className="bg-black hover:bg-gray-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                >
                  {suggestionStatus === "submitting" ? "Sending..." : "Send Suggestion"}
                </button>
              </div>
            </form>
          </div>

          {/* Followers & Community Channels (WhatsApp & Telegram Ecosystem) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 flex flex-col justify-between shadow-2xs">
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-0.5">Follow &amp; Connect</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
                Join our expanding network of WhatsApp &amp; Telegram channels for city-wise job drops, portfolio reviews, and architecture discussions.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {siteSettings?.whatsapp_channel_url ? (
                <a 
                  href={ensureHttp(siteSettings.whatsapp_channel_url)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-200 hover:border-black font-medium text-gray-700 bg-gray-50 hover:bg-white transition text-xs"
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
              ) : (
                <Link 
                  href="/unavailable?service=WhatsApp" 
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-200 hover:border-black font-medium text-gray-700 bg-gray-50 hover:bg-white transition text-xs"
                >
                  <MessageCircle size={15} /> WhatsApp
                </Link>
              )}

              <a 
                href={ensureHttp(siteSettings?.website_url || siteSettings?.telegram_channel_url || "https://t.me/ArchitectJobsTi2A")} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-200 hover:border-black font-medium text-gray-700 bg-gray-50 hover:bg-white transition text-xs"
                title="Join All India Architecture Jobs on Telegram"
              >
                <Send size={15} /> Telegram
              </a>

              {siteSettings?.instagram ? (
                <a 
                  href={ensureHttp(siteSettings.instagram)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-200 hover:border-black font-medium text-gray-700 bg-gray-50 hover:bg-white transition text-xs"
                >
                  <InstagramIcon size={15} /> Instagram
                </a>
              ) : (
                <Link 
                  href="/unavailable?service=Instagram" 
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-200 hover:border-black font-medium text-gray-700 bg-gray-50 hover:bg-white transition text-xs"
                >
                  <InstagramIcon size={15} /> Instagram
                </Link>
              )}

              {siteSettings?.facebook ? (
                <a 
                  href={ensureHttp(siteSettings.facebook)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-200 hover:border-black font-medium text-gray-700 bg-gray-50 hover:bg-white transition text-xs"
                >
                  <FacebookIcon size={15} /> Facebook
                </a>
              ) : (
                <Link 
                  href="/unavailable?service=Facebook" 
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-200 hover:border-black font-medium text-gray-700 bg-gray-50 hover:bg-white transition text-xs"
                >
                  <FacebookIcon size={15} /> Facebook
                </Link>
              )}

              {siteSettings?.twitter ? (
                <a 
                  href={ensureHttp(siteSettings.twitter)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-200 hover:border-black font-medium text-gray-700 bg-gray-50 hover:bg-white transition text-xs"
                >
                  <TwitterIcon size={15} /> X (Twitter)
                </a>
              ) : (
                <Link 
                  href="/unavailable?service=X" 
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-200 hover:border-black font-medium text-gray-700 bg-gray-50 hover:bg-white transition text-xs"
                >
                  <TwitterIcon size={15} /> X (Twitter)
                </Link>
              )}

              <Link 
                href="/quizzes" 
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-200 hover:border-black font-medium text-gray-700 bg-gray-50 hover:bg-white transition text-xs"
              >
                <span>🧠</span> Quizzes
              </Link>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
