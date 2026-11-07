// @ts-nocheck
"use client";

import { useState } from "react";
import { formatSalary } from "@/utils/formatJobDetails";
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
  GraduationCap,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { parseChannels, DEFAULT_WHATSAPP_CHANNELS, DEFAULT_TELEGRAM_CHANNELS } from "@/lib/channels";
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
  const [expandedSocial, setExpandedSocial] = useState<"whatsapp" | "telegram" | null>(null);

  const whatsappChannels = parseChannels(siteSettings?.whatsapp_channel_url, DEFAULT_WHATSAPP_CHANNELS);
  const telegramChannels = parseChannels(siteSettings?.website_url, DEFAULT_TELEGRAM_CHANNELS);

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
      
      {/* 1. HERO SECTION (LEGIBLE & BALANCED) */}
      <section className="bg-white py-10 md:py-14 px-4 sm:px-6 lg:px-12 text-center border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
            Every Architect's Destination
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Trapped into Architecture helps in finding jobs, knowing companies, improving knowledge, and exploring architecture.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="bg-gray-50 p-2 rounded-2xl border border-gray-200 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 shadow-xs mb-4">
            <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 bg-white rounded-xl border border-gray-200">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search role, firm, or skill (e.g. Junior Architect, Revit)..." 
                className="w-full text-sm sm:text-base bg-transparent outline-none text-gray-800 placeholder-gray-400"
              />
            </div>
            <div className="flex-1 sm:max-w-[210px] flex items-center gap-2.5 px-3.5 py-2.5 bg-white rounded-xl border border-gray-200">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="text" 
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="City (Mumbai, Bangalore)..." 
                className="w-full text-sm sm:text-base bg-transparent outline-none text-gray-800 placeholder-gray-400"
              />
            </div>
            <button 
              type="submit" 
              className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm sm:text-base font-semibold transition cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Popular Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
            <span className="text-gray-400 font-medium">Popular:</span>
            <Link href="/jobs?search=Junior%20Architect" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md transition font-medium">Junior Architect</Link>
            <Link href="/internships" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md transition font-medium">Internships</Link>
            <Link href="/jobs?search=Landscape" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md transition font-medium">Landscape</Link>
            <Link href="/jobs?city=Bengaluru" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md transition font-medium">Bengaluru</Link>
            <Link href="/jobs?city=Mumbai" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md transition font-medium">Mumbai</Link>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM STATISTICS (SLIM COMPACT STRIP) */}
      <section className="py-5 px-4 sm:px-6 lg:px-12 bg-black text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800">
          <Link 
            href="/jobs" 
            className="p-3 rounded-xl hover:bg-white/10 transition group block"
            title="Browse all Architecture Jobs"
          >
            <div className="text-3xl md:text-4xl font-extrabold mb-1 group-hover:scale-105 transition-transform">{stats?.jobs || 0}</div>
            <div className="text-gray-400 group-hover:text-gray-200 font-medium flex items-center justify-center gap-1 text-sm md:text-base">
              <span>Jobs Available</span>
              <span className="text-sm">&rarr;</span>
            </div>
          </Link>

          <Link 
            href="/internships" 
            className="p-3 rounded-xl hover:bg-white/10 transition group block"
            title="Explore Architectural Internships"
          >
            <div className="text-3xl md:text-4xl font-extrabold mb-1 group-hover:scale-105 transition-transform">{stats?.internships || 0}</div>
            <div className="text-gray-400 group-hover:text-gray-200 font-medium flex items-center justify-center gap-1 text-sm md:text-base">
              <span>Internship Opportunities</span>
              <span className="text-sm">&rarr;</span>
            </div>
          </Link>

          <Link 
            href="/companies" 
            className="p-3 rounded-xl hover:bg-white/10 transition group block"
            title="Explore Architecture Studios"
          >
            <div className="text-3xl md:text-4xl font-extrabold mb-1 group-hover:scale-105 transition-transform">{stats?.companies || 0}</div>
            <div className="text-gray-400 group-hover:text-gray-200 font-medium flex items-center justify-center gap-1 text-sm md:text-base">
              <span>Companies Listed</span>
              <span className="text-sm">&rarr;</span>
            </div>
          </Link>

          <div className="p-3 select-none">
            <div className="text-3xl md:text-4xl font-extrabold mb-1">{stats?.pageVisits ? stats.pageVisits.toLocaleString() : (stats?.users || 0)}</div>
            <div className="text-gray-400 font-medium text-sm md:text-base">Total Page Visits</div>
          </div>
        </div>
      </section>

      {/* 3. REVENUE SECTION: SUBSCRIBE FOR INSTANT WHATSAPP ALERTS */}
      <section className="py-4 px-4 sm:px-6 lg:px-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-800">
            <div className="flex items-center gap-3.5">
              <span className="text-xl text-emerald-400 shrink-0">⚡</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg text-white">Subscribe for Instant WhatsApp Job Alerts</h3>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold px-2 py-0.5 rounded-full uppercase">Instant Drops</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                  Top studios close applications quickly. Receive direct alerts on WhatsApp as soon as vacancies are published.
                </p>
              </div>
            </div>

            <Link 
              href="/subscriptions"
              className="w-full sm:w-auto bg-white hover:bg-gray-100 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition text-center shrink-0"
            >
              Subscribe for Alerts &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 4. THE TWIN GATEWAYS: EXPLORE JOBS & EXPLORE INTERNSHIPS */}
      {/* DESKTOP: Clean 50/50 Vertical Split */}
      {/* MOBILE: Clean Sibling Panels stacked without confusion */}
      <section className="py-8 md:py-10 px-4 sm:px-6 lg:px-12 w-full bg-gray-50">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* GATEWAY 1: EXPLORE JOBS (CLEAR, HIGH-LEGIBILITY CARDS) */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-black"></span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Explore Jobs</h2>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded-full">
                    {stats?.jobs || 0}+ Vacancies
                  </span>
                </div>

                {/* 4 Job Cards (Larger Logo, Legible Typography, Proper Spacing) */}
                {recentJobs.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-2xl mb-4">
                    No active job vacancies found.
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    {recentJobs.slice(0, 4).map((job) => (
                      <Link 
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="block bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 hover:border-gray-400 hover:shadow-xs transition group"
                      >
                        <div className="flex items-start gap-3.5 mb-2.5">
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 shadow-2xs">
                            {job.image ? (
                              <img src={job.image} alt={job.firm_name} className="w-full h-full object-cover" />
                            ) : (
                              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-black transition truncate leading-snug">
                              {job.position}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
                              {job.firm_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 flex-wrap">
                          <span className="bg-gray-100 px-2.5 py-1 rounded-md text-gray-700 flex items-center gap-1 font-medium">
                            <MapPin size={12} className="text-gray-400" />
                            {job.city || "India"}
                          </span>
                          {job.workplace_type && (
                            <span className="bg-gray-100 px-2.5 py-1 rounded-md text-gray-700 font-medium">
                              {job.workplace_type}
                            </span>
                          )}
                          {formatSalary(job.salary) ? (
                            <span className="bg-gray-100 px-2.5 py-1 rounded-md font-semibold text-gray-900">
                              {formatSalary(job.salary)}
                            </span>
                          ) : (
                            <span className="bg-gray-100 px-2.5 py-1 rounded-md text-gray-600">
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
                className="w-full text-center bg-black hover:bg-gray-800 text-white text-sm font-semibold py-3 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Browse More Jobs</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* GATEWAY 2: EXPLORE INTERNSHIPS (CLEAR, HIGH-LEGIBILITY CARDS) */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-black"></span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Explore Internships</h2>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded-full">
                    {stats?.internships || 0}+ Opportunities
                  </span>
                </div>

                {/* 4 Small Internship Cards */}
                {recentInternships.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-2xl mb-4">
                    No active internship postings found.
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    {recentInternships.slice(0, 4).map((internship) => (
                      <Link 
                        key={internship.id}
                        href={`/jobs/${internship.id}`}
                        className="block bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 hover:border-gray-400 hover:shadow-xs transition group"
                      >
                        <div className="flex items-start gap-3.5 mb-2.5">
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 shadow-2xs">
                            {internship.image ? (
                              <img src={internship.image} alt={internship.firm_name} className="w-full h-full object-cover" />
                            ) : (
                              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-black transition truncate leading-snug">
                              {internship.position}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
                              {internship.firm_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 flex-wrap">
                          <span className="bg-gray-100 px-2.5 py-1 rounded-md text-gray-700 flex items-center gap-1 font-medium">
                            <MapPin size={12} className="text-gray-400" />
                            {internship.city || "India"}
                          </span>
                          <span className="bg-gray-100 px-2.5 py-1 rounded-md text-gray-700 font-medium">
                            Internship
                          </span>
                          {formatSalary(internship.salary) ? (
                            <span className="bg-gray-100 px-2.5 py-1 rounded-md font-semibold text-gray-900">
                              {formatSalary(internship.salary)}
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Browse More Internships Button */}
              <Link 
                href="/internships" 
                className="w-full text-center bg-black hover:bg-gray-800 text-white text-sm font-semibold py-3 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Browse More Internships</span>
                <span>&rarr;</span>
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 5. JOB POSTING & MONETIZATION (CLEAN & PUNCHY) */}
      <section className="py-8 md:py-10 px-4 sm:px-6 lg:px-12 bg-black text-white border-y border-gray-800">
        <div className="max-w-7xl mx-auto space-y-5">
          
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">For Recruiters &amp; Practices</h2>
            <span className="text-xs text-gray-400 font-mono">Employer Suite</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            
            {/* Card 1: Do you have a job to post? */}
            <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 flex flex-col justify-between hover:border-gray-700 transition">
              <div className="mb-4">
                <span className="text-xs bg-white text-black font-bold px-2.5 py-0.5 rounded uppercase">Post a Vacancy</span>
                <h3 className="font-bold text-base sm:text-lg text-white mt-2.5 leading-snug">Do you have a job to post?</h3>
              </div>
              <Link 
                href="/post-job" 
                className="block w-full text-center bg-white hover:bg-gray-200 text-black font-bold py-2.5 rounded-xl text-sm transition"
              >
                Post a Job &rarr;
              </Link>
            </div>

            {/* Card 2: Do you want your job featured? */}
            <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 flex flex-col justify-between hover:border-gray-700 transition">
              <div className="mb-4">
                <span className="text-xs bg-white text-black font-bold px-2.5 py-0.5 rounded uppercase">5X Applicants</span>
                <h3 className="font-bold text-base sm:text-lg text-white mt-2.5 leading-snug">Do you want your job to be featured?</h3>
              </div>
              <Link 
                href="/contact?service=feature-job" 
                className="block w-full text-center bg-white hover:bg-gray-200 text-black font-bold py-2.5 rounded-xl text-sm transition"
              >
                Feature Your Job &rarr;
              </Link>
            </div>

            {/* Card 3: Do you want your company featured? */}
            <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 flex flex-col justify-between hover:border-gray-700 transition">
              <div className="mb-4">
                <span className="text-xs bg-gray-800 text-gray-200 font-bold px-2.5 py-0.5 rounded border border-gray-700 uppercase">Spotlight</span>
                <h3 className="font-bold text-base sm:text-lg text-white mt-2.5 leading-snug">Do you want your company to be featured?</h3>
              </div>
              <Link 
                href="/contact?service=feature-company" 
                className="block w-full text-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-2.5 rounded-xl text-sm transition border border-gray-700"
              >
                Feature Your Studio &rarr;
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 6. EXPLORE ARCHITECTURE STUDIOS (VERTICALLY DIVIDED: STUDIOS ON LEFT, CLAIM/REGISTER ON RIGHT) */}
      <section className="py-8 md:py-10 px-4 sm:px-6 lg:px-12 bg-[#EEF0F4] w-full text-black border-b border-gray-200">
        <div className="max-w-7xl mx-auto space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Explore Architecture Studios</h2>
              <p className="text-sm text-gray-600 mt-1">Discover leading design firms and active vacancies across India.</p>
            </div>
            
            <div className="flex bg-white p-1 rounded-full w-fit border border-gray-200 shadow-2xs text-xs font-semibold">
              <button 
                onClick={() => setCompanyTab("latest")} 
                className={`px-4 py-1.5 rounded-full text-xs transition ${companyTab === "latest" ? "bg-black text-white shadow-xs" : "text-gray-500 hover:text-black"}`}
              >
                Latest
              </button>
              <button 
                onClick={() => setCompanyTab("most-jobs")} 
                className={`px-4 py-1.5 rounded-full text-xs transition ${companyTab === "most-jobs" ? "bg-black text-white shadow-xs" : "text-gray-500 hover:text-black"}`}
              >
                Most Jobs
              </button>
            </div>
          </div>

          {/* Vertical Division: 2 Columns (Studios List on Left, Claim/Register Box on Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* LEFT PART (8 Cols): Studio Grid with Legible Typography */}
            <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs flex flex-col justify-between">
              {displayCompanies.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 text-center text-sm text-gray-500 mb-4">
                  No architecture studios listed yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {displayCompanies.map((company) => (
                    <Link 
                      href={`/companies/${company.slug}`}
                      key={company.slug}
                      className="bg-gray-50 hover:bg-gray-100 p-3 rounded-2xl flex items-center gap-3 transition group border border-gray-200"
                    >
                      <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden shadow-2xs">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.firm_name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="text-gray-400 w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-black transition truncate">
                          {company.firm_name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {company.city || "Studio"} &bull; {company.job_count} {company.job_count === 1 ? 'Job' : 'Jobs'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="text-center pt-3 border-t border-gray-100">
                <Link 
                  href="/companies" 
                  className="text-sm font-semibold text-black hover:underline inline-flex items-center gap-1.5"
                >
                  <span>View All {stats?.companies || 0}+ Studios</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* RIGHT PART (4 Cols): Claim & Register Studio Box */}
            <div className="lg:col-span-4 bg-black text-white p-5 sm:p-6 rounded-3xl flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Practice Directory</span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1.5 mb-2.5">Do you find your studio here?</h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6">
                  {stats?.companies ? `Over ${stats.companies} architecture studios are listed. Claim ownership to manage your vacancies or register your new practice.` : 'Architecture studios across India are listed. Claim ownership to manage your vacancies or register your new practice.'}
                </p>
              </div>

              <div className="space-y-2.5">
                <Link 
                  href="/companies" 
                  className="block w-full text-center bg-white hover:bg-gray-200 text-black font-bold py-2.5 rounded-xl text-sm transition"
                >
                  Claim Your Studio &rarr;
                </Link>
                <Link 
                  href="/contact?service=register-practice" 
                  className="block w-full text-center border border-gray-700 hover:border-gray-500 text-gray-300 font-semibold py-2.5 rounded-xl text-sm transition"
                >
                  Register Your Practice
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. ARCHITECTURE SERVICES & TOOLS (LEGIBLE & BALANCED) */}
      <section className="py-8 md:py-10 px-4 sm:px-6 lg:px-12 bg-white text-black w-full border-b border-gray-200">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Architecture Services &amp; Tools</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Specialized resources, portfolio builders, and expert mentorship.</p>
            </div>
            <span className="text-xs text-gray-400 font-mono hidden sm:inline">Specialized Shelf</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            
            {/* Cosmofolio Portfolio Builder (Compact) */}
            <div className="bg-gray-50 hover:bg-gray-100 p-4 sm:p-5 rounded-2xl border border-gray-200 flex flex-col justify-between transition group">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">📐</span>
                  <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded">COSMOFOLIO</span>
                </div>
                <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-1">Portfolio Builder</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">
                  Build a professional architecture folio in seconds without code.
                </p>
              </div>
              <a 
                href="https://thecosmofolio.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full text-center bg-black hover:bg-gray-800 text-white font-bold py-2 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5"
              >
                <span>Build Portfolio</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Hire a Software Tutor */}
            <div className="bg-gray-50 hover:bg-gray-100 p-4 sm:p-5 rounded-2xl border border-gray-200 flex flex-col justify-between transition group">
              <div>
                <div className="text-base mb-2">💻</div>
                <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-1">Hire a Software Tutor</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">
                  Master Revit, Rhino, Grasshopper &amp; Enscape 1-on-1 with industry experts.
                </p>
              </div>
              <Link 
                href="/contact?service=software-tutor" 
                className="w-full text-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold py-2 rounded-xl text-xs sm:text-sm transition"
              >
                Find Tutor &rarr;
              </Link>
            </div>

            {/* Hire an Architect */}
            <div className="bg-gray-50 hover:bg-gray-100 p-4 sm:p-5 rounded-2xl border border-gray-200 flex flex-col justify-between transition group">
              <div>
                <div className="text-base mb-2">🏛️</div>
                <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-1">Hire an Architect</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">
                  Find vetted freelance architects for concept design &amp; working drawings.
                </p>
              </div>
              <Link 
                href="/contact?service=freelance-architect" 
                className="w-full text-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold py-2 rounded-xl text-xs sm:text-sm transition"
              >
                Request Architect &rarr;
              </Link>
            </div>

            {/* Portfolio Review */}
            <div className="bg-gray-50 hover:bg-gray-100 p-4 sm:p-5 rounded-2xl border border-gray-200 flex flex-col justify-between transition group">
              <div>
                <div className="text-base mb-2">🔍</div>
                <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-1">Portfolio &amp; Resume Review</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">
                  Get line-by-line critique on your design sheets before studio applications.
                </p>
              </div>
              <Link 
                href="/contact?service=portfolio-review" 
                className="w-full text-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold py-2 rounded-xl text-xs sm:text-sm transition"
              >
                Book Critique &rarr;
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 8. SUGGESTION BOX & MULTI-CHANNEL COMMUNITY */}
      <section className="py-8 md:py-10 px-4 sm:px-6 lg:px-12 bg-gray-50 w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Suggestion Box Form */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold mb-2">
                💡 COMMUNITY VOICE
              </div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1">Suggestion Box</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-4">
                Missing a studio? Want a new salary filter or feature? Tell us what you need.
              </p>
            </div>

            <form onSubmit={handleSuggestionSubmit} className="space-y-3">
              <input 
                type="text"
                value={suggestionSender}
                onChange={(e) => setSuggestionSender(e.target.value)}
                placeholder="Your name or studio (optional)..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-gray-400"
              />
              <div>
                <textarea 
                  rows={2}
                  maxLength={1000}
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  required
                  placeholder="Type your suggestion here..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-gray-400 resize-none max-h-28 overflow-y-auto"
                />
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1 px-1">
                  <span>Scroll for more text</span>
                  <span>{suggestionText.length}/1000</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {suggestionStatus === "success" ? (
                    <span className="text-emerald-600 font-semibold">✓ Suggestion received! Thank you.</span>
                  ) : suggestionStatus === "error" ? (
                    <span className="text-red-500">Failed to submit. Please try again.</span>
                  ) : (
                    <Link href="/contact?subject=Platform+Suggestion" className="hover:text-black underline">
                      Or send via Contact Form &rarr;
                    </Link>
                  )}
                </span>
                <button 
                  type="submit" 
                  disabled={suggestionStatus === "submitting"}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition disabled:opacity-50 cursor-pointer"
                >
                  {suggestionStatus === "submitting" ? "Sending..." : "Send Suggestion"}
                </button>
              </div>
            </form>
          </div>

          {/* Followers & Community Channels (WhatsApp & Telegram Ecosystem) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 flex flex-col justify-between shadow-2xs">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1">Follow &amp; Connect</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-4">
                Join our expanding network of WhatsApp &amp; Telegram channels for city-wise job drops, portfolio reviews, and architecture discussions.
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs sm:text-sm">
                {/* WhatsApp Button */}
                {whatsappChannels.length > 1 ? (
                  <button 
                    type="button"
                    onClick={() => setExpandedSocial(expandedSocial === "whatsapp" ? null : "whatsapp")}
                    className={`flex items-center justify-center gap-1.5 p-3 rounded-xl border transition cursor-pointer font-medium ${
                      expandedSocial === "whatsapp" 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-500 font-bold shadow-2xs" 
                        : "border-gray-200 hover:border-black text-gray-700 bg-gray-50 hover:bg-white"
                    }`}
                    title="View all available WhatsApp groups & channels"
                  >
                    <MessageCircle size={17} className={expandedSocial === "whatsapp" ? "text-emerald-600" : ""} />
                    <span>WhatsApp</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                      {whatsappChannels.length}
                    </span>
                    {expandedSocial === "whatsapp" ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                ) : (
                  <a 
                    href={ensureHttp(whatsappChannels[0]?.url || siteSettings?.whatsapp_channel_url || "https://whatsapp.com/channel/0029Vaz1p0kCRs1uBTCWpJ2X")} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-black font-medium text-gray-700 bg-gray-50 hover:bg-white transition"
                    title="Join WhatsApp Channel"
                  >
                    <MessageCircle size={17} /> WhatsApp
                  </a>
                )}

                {/* Telegram Button */}
                {telegramChannels.length > 1 ? (
                  <button 
                    type="button"
                    onClick={() => setExpandedSocial(expandedSocial === "telegram" ? null : "telegram")}
                    className={`flex items-center justify-center gap-1.5 p-3 rounded-xl border transition cursor-pointer font-medium ${
                      expandedSocial === "telegram" 
                        ? "bg-sky-50 text-[#1d8bc0] border-sky-400 font-bold shadow-2xs" 
                        : "border-gray-200 hover:border-black text-gray-700 bg-gray-50 hover:bg-white"
                    }`}
                    title="View regional Telegram channels & groups"
                  >
                    <Send size={17} className={expandedSocial === "telegram" ? "text-[#229ED9]" : ""} />
                    <span>Telegram</span>
                    <span className="text-[10px] bg-sky-100 text-[#1d8bc0] px-1.5 py-0.2 rounded-full font-bold">
                      {telegramChannels.length}
                    </span>
                    {expandedSocial === "telegram" ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                ) : (
                  <a 
                    href={ensureHttp(telegramChannels[0]?.url || siteSettings?.website_url || "https://t.me/ArchitectJobsTi2A")} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-black font-medium text-gray-700 bg-gray-50 hover:bg-white transition"
                    title="Join Telegram Channel"
                  >
                    <Send size={17} /> Telegram
                  </a>
                )}

                {/* Instagram Direct Link */}
                <a 
                  href={ensureHttp(siteSettings?.instagram || "https://www.instagram.com/trappedintoarchitecture/")} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-black font-medium text-gray-700 bg-gray-50 hover:bg-white transition"
                  title="Follow on Instagram"
                >
                  <InstagramIcon size={17} /> Instagram
                </a>

                {/* Facebook Direct Link */}
                <a 
                  href={ensureHttp(siteSettings?.facebook || "https://www.facebook.com/trappedintoarchitecture")} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-black font-medium text-gray-700 bg-gray-50 hover:bg-white transition"
                  title="Visit Facebook Page"
                >
                  <FacebookIcon size={17} /> Facebook
                </a>

                {/* X (Twitter) Direct Link */}
                <a 
                  href={ensureHttp(siteSettings?.twitter || "https://x.com/trappedin2archz")} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-black font-medium text-gray-700 bg-gray-50 hover:bg-white transition"
                  title="Follow on X (Twitter)"
                >
                  <TwitterIcon size={17} /> X (Twitter)
                </a>

                {/* Quizzes Direct Link */}
                <Link 
                  href="/quizzes" 
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-black font-medium text-gray-700 bg-gray-50 hover:bg-white transition"
                  title="Practice Architectural Quizzes"
                >
                  <span>🧠</span> Quizzes
                </Link>
              </div>

              {/* EXPANDED CHANNELS LIST (Shows available groups/channels below) */}
              {expandedSocial && (
                <div className="mt-3 pt-3 border-t border-gray-100 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-1.5">
                      {expandedSocial === "whatsapp" ? (
                        <MessageCircle size={15} className="text-emerald-600" />
                      ) : (
                        <Send size={15} className="text-[#229ED9]" />
                      )}
                      <span className="text-xs font-bold text-gray-900">
                        Available {expandedSocial === "whatsapp" ? "WhatsApp" : "Telegram"} Channels ({expandedSocial === "whatsapp" ? whatsappChannels.length : telegramChannels.length})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedSocial(null)}
                      className="text-gray-400 hover:text-black text-xs font-semibold px-2 py-0.5 rounded-md hover:bg-gray-100 transition cursor-pointer"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {(expandedSocial === "whatsapp" ? whatsappChannels : telegramChannels).map((ch, idx) => (
                      <a
                        key={idx}
                        href={ensureHttp(ch.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 hover:border-black bg-gray-50/60 hover:bg-white transition group shadow-2xs"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-gray-900 group-hover:text-black truncate">
                              {ch.name}
                            </p>
                            {ch.badge && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold shrink-0">
                                {ch.badge}
                              </span>
                            )}
                          </div>
                          {ch.description && (
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">
                              {ch.description}
                            </p>
                          )}
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 text-white transition ${
                          expandedSocial === "whatsapp"
                            ? "bg-emerald-600 group-hover:bg-emerald-700"
                            : "bg-[#229ED9] group-hover:bg-[#1d8bc0]"
                        }`}>
                          <span>Join</span>
                          <ExternalLink size={10} />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
