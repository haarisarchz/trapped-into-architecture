"use client";

import { useState } from "react";
import Link from "next/link";
import { generateJobUrl } from "@/utils/jobUrl";
import { Search, MapPin, Building2, ArrowRight, MessageCircle, Globe, Mail, Smartphone, Send } from "lucide-react";
import { InstagramIcon, FacebookIcon, TwitterIcon } from "@/components/icons/SocialIcons";

export default function InteractiveHome({
  recentJobs = [],
  popularJobs = [],
  recentCompanies = [],
  popularCompanies = [],
  mostJobsCompanies = [],
  stats,
  siteSettings
}: {
  recentJobs: any[];
  popularJobs: any[];
  recentCompanies: any[];
  popularCompanies: any[];
  mostJobsCompanies: any[];
  stats: any;
  siteSettings: any;
}) {
  const [jobTab, setJobTab] = useState<"recent" | "popular">("recent");
  const displayJobs = (jobTab === "popular" ? popularJobs : recentJobs).slice(0, 8);

  const [companyTab, setCompanyTab] = useState<"latest" | "popular" | "most-jobs">("latest");
  const displayCompanies = (companyTab === "popular" ? popularCompanies : companyTab === "most-jobs" ? mostJobsCompanies : recentCompanies).slice(0, 6);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. INTRODUCTION */}
      <section className="bg-white py-8 md:py-8 px-6 lg:px-12 text-center border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-5">Every Architect's Destination</h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-4xl mx-auto leading-relaxed">Trapped into Architecture helps in finding jobs, knowing companies, improving knowledge, and exploring architecture.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/jobs" className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition w-full sm:w-auto">
              Browse Jobs
            </Link>
            <Link href="/companies" className="bg-white text-black border border-gray-300 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition w-full sm:w-auto">
              Explore Companies
            </Link>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM STATISTICS */}
      <section className="py-6 px-6 lg:px-12 bg-black text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800">
          <div className="pt-4 md:pt-0">
            <div className="text-4xl md:text-5xl font-bold mb-1">{stats?.jobs || 0}</div>
            <div className="text-gray-400 font-medium">Jobs Available</div>
          </div>
          <div className="pt-4 md:pt-0">
            <div className="text-4xl md:text-5xl font-bold mb-1">{stats?.internships || 0}</div>
            <div className="text-gray-400 font-medium">Internship Opportunities</div>
          </div>
          <div className="pt-4 md:pt-0">
            <div className="text-4xl md:text-5xl font-bold mb-1">{stats?.companies || 0}</div>
            <div className="text-gray-400 font-medium">Companies Listed</div>
          </div>
          <div className="pt-4 md:pt-0">
            <div className="text-4xl md:text-5xl font-bold mb-1">{stats?.users || 0}</div>
            <div className="text-gray-400 font-medium">Registered Users</div>
          </div>
        </div>
      </section>

      {/* 3. JOBS SECTION */}
      <section className="py-8 px-6 lg:px-12 w-full">
        <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Latest Opportunities</h2>
          
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {displayJobs.map((job, index) => (
              <Link 
                href={`/jobs/${job.id}`} 
                key={job.id}
                className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group ${index >= 4 ? "hidden md:block" : ""}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
                    {job.image ? (
                      <img src={job.image} alt={job.firm_name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="text-gray-400 w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900 group-hover:text-orange-600 transition line-clamp-1">{job.position}</h3>
                    <p className="text-gray-500 text-xs">{job.firm_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                    <MapPin size={12} />
                    {job.city || "India"}
                  </span>
                  {job.workplace_type && (
                    <span className="bg-gray-50 px-2 py-1 rounded-md">{job.workplace_type}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        
        <div className="mt-4 mb-2 text-center">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-black font-semibold hover:gap-3 transition-all">
            View All Jobs <ArrowRight size={18} />
          </Link>
        </div>
              </div>
      </section>

      <div className="w-full border-t-[3px] border-black my-2"></div>

      {/* 4. COMPANIES SECTION */}
      <section className="py-8 px-6 lg:px-12 bg-white w-full text-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Explore Companies</h2>
            
            <div className="flex bg-gray-100 p-1 rounded-full w-fit border border-gray-200">
              <button onClick={() => setCompanyTab("latest")} className={`px-4 py-2 rounded-full text-sm font-medium transition ${companyTab === "latest" ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"}`}>Latest</button>
              <button onClick={() => setCompanyTab("popular")} className={`px-4 py-2 rounded-full text-sm font-medium transition ${companyTab === "popular" ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"}`}>Popular</button>
              <button onClick={() => setCompanyTab("most-jobs")} className={`px-4 py-2 rounded-full text-sm font-medium transition ${companyTab === "most-jobs" ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"}`}>Most Jobs Posted</button>
            </div>
          </div>

          {displayCompanies.length === 0 ? (
            <div className="bg-gray-50 p-12 rounded-3xl border border-gray-200 text-center text-gray-500">
              No companies listed yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {displayCompanies.map((company, index) => (
                <Link 
                  href={`/companies/${company.slug}`}
                  key={company.slug}
                  className={`bg-gray-50 hover:bg-gray-100 p-3 py-5 rounded-2xl flex flex-col items-center justify-center text-center transition group border border-transparent hover:border-gray-200 shadow-sm aspect-auto ${index === 5 ? "lg:hidden" : ""}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-2 overflow-hidden shadow-sm">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.firm_name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="text-gray-300 w-6 h-6" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{company.firm_name}</h3>
                  {company.city && <p className="text-xs text-gray-500 mt-1">{company.city}</p>}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/companies" className="inline-flex items-center gap-2 text-black font-semibold hover:gap-3 transition-all">
              View All Companies <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      
      {/* 5. ARCHITECTURE SERVICES (White Background) */}
      <section className="py-8 px-6 lg:px-12 bg-white text-black w-full border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Architecture Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/contact?service=software-tutor" className="bg-gray-50 hover:bg-gray-100 p-5 py-6 rounded-xl transition border border-gray-200 hover:border-gray-300 flex flex-col justify-center text-center shadow-sm hover:shadow-md">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Hire a Software Tutor</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Master BIM, CAD, and rendering tools with expert tutors.</p>
            </Link>
            <Link href="/contact?service=freelance-architect" className="bg-gray-50 hover:bg-gray-100 p-5 py-6 rounded-xl transition border border-gray-200 hover:border-gray-300 flex flex-col justify-center text-center shadow-sm hover:shadow-md">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Hire an Architect</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Find top-tier freelance architects for your projects.</p>
            </Link>
            <Link href="/contact?service=portfolio-review" className="bg-gray-50 hover:bg-gray-100 p-5 py-6 rounded-xl transition border border-gray-200 hover:border-gray-300 flex flex-col justify-center text-center shadow-sm hover:shadow-md">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Get your portfolio critiqued ready</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Get expert feedback to help you land your dream job.</p>
            </Link>
          </div>
        </div>
      </section>
      
      {/* 5.5 PORTFOLIO BUILDER */}
      <section className="py-8 px-6 lg:px-12 bg-gray-50 text-black w-full border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900 tracking-tight">Portfolio Builder</h2>
          <p className="text-gray-600 mb-5 text-lg max-w-2xl text-center">Build your professional architecture portfolio in seconds.</p>
          <a href="https://thecosmofolio.com/" target="_blank" rel="noopener noreferrer" className="bg-black text-white font-bold py-3 px-8 rounded-full hover:bg-gray-800 transition shadow-md inline-block border border-transparent">
            Build Your Portfolio
          </a>
        </div>
      </section>

      {/* 6. CONNECT WITH US */}
      <section className="py-10 px-6 lg:px-12 bg-white text-center w-full border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Follow Us</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {siteSettings?.whatsapp_channel_url ? (
            <a href={siteSettings.whatsapp_channel_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-green-600 font-medium">
              <MessageCircle size={20} /> WhatsApp
            </a>
          ) : (
            <Link href="/unavailable?service=WhatsApp" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-green-600 font-medium">
              <MessageCircle size={20} /> WhatsApp
            </Link>
          )}

          {siteSettings?.instagram ? (
            <a href={siteSettings.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-pink-600 font-medium">
              <InstagramIcon size={20} /> Instagram
            </a>
          ) : (
            <Link href="/unavailable?service=Instagram" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-pink-600 font-medium">
              <InstagramIcon size={20} /> Instagram
            </Link>
          )}

          {siteSettings?.facebook ? (
            <a href={siteSettings.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-blue-800 font-medium">
              <FacebookIcon size={20} /> Facebook
            </a>
          ) : (
            <Link href="/unavailable?service=Facebook" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-blue-800 font-medium">
              <FacebookIcon size={20} /> Facebook
            </Link>
          )}

          {siteSettings?.twitter ? (
            <a href={siteSettings.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-blue-400 font-medium">
              <TwitterIcon size={20} /> X
            </a>
          ) : (
            <Link href="/unavailable?service=X" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-blue-400 font-medium">
              <TwitterIcon size={20} /> X
            </Link>
          )}

          {siteSettings?.telegram_channel_url ? (
            <a href={siteSettings.telegram_channel_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-blue-500 font-medium">
              <Send size={20} /> Telegram
            </a>
          ) : (
            <Link href="/unavailable?service=Telegram" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-blue-500 font-medium">
              <Send size={20} /> Telegram
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
