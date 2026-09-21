"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateJobUrl } from "@/utils/jobUrl";
import { Search, MapPin, Building2, ArrowRight, MessageCircle, Globe, Mail, Smartphone, Send } from "lucide-react";


export default function InteractiveHome({
  recentJobs = [],
  recentCompanies = [],
  stats,
  siteSettings
}: {
  recentJobs: any[];
  recentCompanies: any[];
  stats: any;
  siteSettings: any;
}) {
  const router = useRouter();
  const [jobTab, setJobTab] = useState<"recent" | "popular">("recent");
  const [companyTab, setCompanyTab] = useState<"featured" | "popular" | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const displayJobs = recentJobs.slice(0, 6);
  const heroJobs = recentJobs.slice(0, 4);
  const displayCompanies = recentCompanies.slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="bg-white border-b border-gray-100 py-12 lg:py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            
            {/* LEFT: Intro & Search */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
                Trapped Into Architecture
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl">
                Find your next opportunity in architecture.
                <br/>
                <span className="text-gray-500 text-base md:text-lg">Jobs • Internships • Companies • Career Connections</span>
              </p>
              
              <form onSubmit={handleSearch} className="flex items-center w-full max-w-2xl bg-gray-50 border border-gray-200 rounded-full p-2 mb-10 shadow-sm focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all">
                <Search className="text-gray-400 ml-4 mr-2" size={24} />
                <input
                  type="text"
                  placeholder="Search jobs, companies, positions..."
                  className="flex-1 bg-transparent border-none outline-none py-3 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition">
                  Search
                </button>
              </form>

              {/* STATS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 border-t border-gray-100 pt-8">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats?.jobs || 0}</div>
                  <div className="text-sm text-gray-500 font-medium">Open Jobs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats?.internships || 0}</div>
                  <div className="text-sm text-gray-500 font-medium">Internships</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats?.companies || 0}</div>
                  <div className="text-sm text-gray-500 font-medium">Companies</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{heroJobs.length || 0}</div>
                  <div className="text-sm text-gray-500 font-medium">New Opportunities</div>
                </div>
              </div>
            </div>

            {/* RIGHT: Latest Opportunities Widget */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Latest Opportunities
                  </h2>
                  <Link href="/jobs" className="text-sm text-gray-500 hover:text-black font-medium transition">
                    View all →
                  </Link>
                </div>
                
                <div className="flex flex-col gap-4">
                  {heroJobs.length === 0 ? (
                    <div className="text-gray-500 py-4 text-center text-sm">No current opportunities. <Link href="/companies" className="text-black underline">Explore Companies</Link></div>
                  ) : (
                    heroJobs.map(job => (
                      <Link href={`/jobs/${job.id}`} key={job.id} className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-gray-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-gray-900 line-clamp-1">{job.position}</h3>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Building2 size={14} /> <span className="line-clamp-1">{job.company}</span>
                          </div>
                        </div>
                        {job.city && (
                          <div className="text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full whitespace-nowrap w-fit">
                            {job.city}
                          </div>
                        )}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. EXPLORE COMPANIES / HIRING WIDGET */}
      <section className="bg-white py-12 px-6 lg:px-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Companies Hiring</h2>
            <Link href="/companies" className="text-sm font-semibold text-gray-500 hover:text-black transition">
              View all companies →
            </Link>
          </div>

          {displayCompanies.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-2xl border border-gray-100">Companies will appear here as opportunities are added.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {displayCompanies.map((company) => (
                <Link 
                  href={`/companies/${company.slug}`}
                  key={company.slug}
                  className="bg-gray-50 hover:bg-gray-100 p-4 rounded-3xl flex flex-col items-center justify-center text-center transition group border border-transparent hover:border-gray-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-3 overflow-hidden shadow-sm">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.firm_name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="text-gray-300 w-6 h-6" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 w-full">{company.firm_name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1 w-full">{company.city || "Various"}</p>
                  <div className="mt-3 text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                    {company.open_jobs || 0} open jobs
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. CONNECT WITH US (SOCIAL & CHANNELS) */}
      <section className="py-12 px-6 lg:px-12 bg-gray-50 text-center w-full border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect With Us</h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">Stay connected with architecture opportunities and community updates across our official channels.</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            
            {siteSettings?.whatsapp && (
              <a href={siteSettings.whatsapp.startsWith('http') ? siteSettings.whatsapp : 'https://wa.me/' + siteSettings.whatsapp.replace(/[^0-9]/g, '')} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center gap-3 bg-white hover:bg-green-50 border border-gray-200 px-6 py-4 rounded-2xl transition group w-full sm:w-auto min-w-[200px]">
                <div className="bg-green-100 p-2 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition"><MessageCircle size={20} /></div>
                <span className="font-bold text-gray-800 text-sm">Direct WhatsApp</span>
              </a>
            )}
            {siteSettings?.email && (
              <a href={'mailto:' + siteSettings.email} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center gap-3 bg-white hover:bg-red-50 border border-gray-200 px-6 py-4 rounded-2xl transition group w-full sm:w-auto min-w-[200px]">
                <div className="bg-red-100 p-2 rounded-full text-red-600 group-hover:bg-red-600 group-hover:text-white transition"><Mail size={20} /></div>
                <span className="font-bold text-gray-800 text-sm">Email Us</span>
              </a>
            )}
            {siteSettings?.website_url && (
              <a href={siteSettings.website_url} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center gap-3 bg-white hover:bg-purple-50 border border-gray-200 px-6 py-4 rounded-2xl transition group w-full sm:w-auto min-w-[200px]">
                <div className="bg-purple-100 p-2 rounded-full text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition"><Globe size={20} /></div>
                <span className="font-bold text-gray-800 text-sm">Website</span>
              </a>
            )}
            {siteSettings?.whatsapp_channel_url && (
              <a href={siteSettings.whatsapp_channel_url} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center gap-3 bg-white hover:bg-green-50 border border-gray-200 px-6 py-4 rounded-2xl transition group w-full sm:w-auto min-w-[200px]">
                <div className="bg-green-100 p-2 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition"><MessageCircle size={20} /></div>
                <span className="font-bold text-gray-800 text-sm">WhatsApp Channel</span>
              </a>
            )}
            {siteSettings?.telegram_channel_url && (
              <a href={siteSettings.telegram_channel_url} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center gap-3 bg-white hover:bg-blue-50 border border-gray-200 px-6 py-4 rounded-2xl transition group w-full sm:w-auto min-w-[200px]">
                <div className="bg-blue-100 p-2 rounded-full text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition"><Send size={20} /></div>
                <span className="font-bold text-gray-800 text-sm">Telegram Channel</span>
              </a>
            )}
            {siteSettings?.instagram && (
              <a href={siteSettings.instagram} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center gap-3 bg-white hover:bg-pink-50 border border-gray-200 px-6 py-4 rounded-2xl transition group w-full sm:w-auto min-w-[200px]">
                <div className="bg-pink-100 p-2 rounded-full text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition"><Globe size={20} /></div>
                <span className="font-bold text-gray-800 text-sm">Instagram Page</span>
              </a>
            )}
            {siteSettings?.facebook && (
              <a href={siteSettings.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center gap-3 bg-white hover:bg-blue-50 border border-gray-200 px-6 py-4 rounded-2xl transition group w-full sm:w-auto min-w-[200px]">
                <div className="bg-blue-100 p-2 rounded-full text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition"><Globe size={20} /></div>
                <span className="font-bold text-gray-800 text-sm">Facebook Page</span>
              </a>
            )}
            {siteSettings?.twitter && (
              <a href={siteSettings.twitter} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center gap-3 bg-white hover:bg-gray-100 border border-gray-200 px-6 py-4 rounded-2xl transition group w-full sm:w-auto min-w-[200px]">
                <div className="bg-gray-200 p-2 rounded-full text-black group-hover:bg-black group-hover:text-white transition"><Globe size={20} /></div>
                <span className="font-bold text-gray-800 text-sm">X Page</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 4. MAIN JOBS SECTION (Keeping the original expanded view if they scroll down) */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 md:mb-0">Explore More Jobs</h2>
          <div className="flex bg-gray-100 p-1 rounded-full w-fit">
            <button 
              onClick={() => setJobTab("recent")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${jobTab === "recent" ? "bg-white shadow text-black" : "text-gray-600 hover:text-black"}`}
            >
              Recent Jobs
            </button>
            <button 
              onClick={() => setJobTab("popular")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${jobTab === "popular" ? "bg-white shadow text-black" : "text-gray-600 hover:text-black"}`}
            >
              Popular Jobs
            </button>
          </div>
        </div>

        {displayJobs.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-gray-500">
            No jobs available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayJobs.map((job) => (
              <Link 
                href={`/jobs/${job.id}`} 
                key={job.id}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition">{job.position}</h3>
                    <p className="text-gray-500 text-sm mt-1">{job.company}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.city && (
                    <span className="flex items-center gap-1 bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                      <MapPin size={12} /> {job.city}
                    </span>
                  )}
                  {job.employment_type && (
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                      {job.employment_type}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <span className="text-xs font-medium text-gray-400">
                    {job.created_at ? new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ''}
                  </span>
                  <span className="text-black font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    View <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-black font-semibold hover:gap-3 transition-all">
            View All Jobs <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* 5. ARCHITECTURE SERVICES & ALERTS */}
      <section className="py-16 px-6 lg:px-12 bg-gray-900 text-white w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Services */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Architecture Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="#" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl transition border border-gray-700 hover:border-gray-600">
                <h3 className="font-semibold text-lg mb-2">Hire a Software Tutor</h3>
                <p className="text-gray-400 text-sm">Master BIM, CAD, and rendering tools with expert tutors.</p>
              </Link>
              <Link href="#" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl transition border border-gray-700 hover:border-gray-600">
                <h3 className="font-semibold text-lg mb-2">Hire an Architect</h3>
                <p className="text-gray-400 text-sm">Find the perfect architect for your next project.</p>
              </Link>
              <Link href="#" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl transition border border-gray-700 hover:border-gray-600">
                <h3 className="font-semibold text-lg mb-2">Portfolio Critique</h3>
                <p className="text-gray-400 text-sm">Get expert feedback on your architecture portfolio.</p>
              </Link>
              <Link href="#" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl transition border border-gray-700 hover:border-gray-600">
                <h3 className="font-semibold text-lg mb-2">Resume Builder</h3>
                <p className="text-gray-400 text-sm">Create an ATS-friendly architecture resume.</p>
              </Link>
            </div>
          </div>

          {/* Job Alerts */}
          <div className="bg-white text-black p-8 md:p-10 rounded-3xl shadow-xl flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4">Get Instant Job Updates</h2>
            <p className="text-gray-600 mb-8">Subscribe to receive instant notifications via Email, WhatsApp, or Telegram when new jobs match your criteria.</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <select className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none">
                  <option>Select Notification Channel</option>
                  <option>Email</option>
                  <option>WhatsApp</option>
                  <option>Telegram</option>
                </select>
                <select className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none">
                  <option>Select Duration</option>
                  <option>1 Month — ₹199</option>
                  <option>3 Months — ₹1249</option>
                  <option>6 Months — ₹1449</option>
                  <option>1 Year — ₹1799</option>
                </select>
              </div>
            </div>

            <button className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition">
              Subscribe Now (Pending Payment)
            </button>
            <p className="text-xs text-center text-gray-400 mt-4">*Payment integration coming soon.</p>
          </div>

        </div>
      </section>

    </main>
  );
}
