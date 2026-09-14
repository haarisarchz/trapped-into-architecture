"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

import Hero from "./Hero";

export default function InteractiveHome({
  topCities,
  topPositions,
  recentCompanies,
  stats,
}: {
  topCities: string[];
  topPositions: string[];
  recentCompanies: any[];
  stats: any;
}) {
  const router = useRouter();
  
  // FALLBACK DATA IF DB IS EMPTY
  const displayCities = topCities.length > 0 ? topCities : ["New Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad"];
  const displayCompanies = recentCompanies && recentCompanies.length > 0 ? recentCompanies : [
    { slug: 'demo-1', firm_name: 'Studio Lotus', city: 'New Delhi' },
    { slug: 'demo-2', firm_name: 'Sanjay Puri Architects', city: 'Mumbai' },
    { slug: 'demo-3', firm_name: 'Morphogenesis', city: 'New Delhi' },
    { slug: 'demo-4', firm_name: 'Architecture Brio', city: 'Mumbai' },
    { slug: 'demo-5', firm_name: 'Khosla Associates', city: 'Bangalore' },
  ];

  // LIVE JOBS STATE
  const [liveJobs, setLiveJobs] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchLiveJobs("All");
  }, []);

  const fetchLiveJobs = async (filter: string) => {
    let query = supabase.from("jobs").select("*").eq("status", "published").order("posted_date", { ascending: false }).limit(6);
    
    if (filter === "Internships") {
      query = query.ilike("position", "%intern%");
    } else if (filter === "Junior") {
      query = query.ilike("position", "%junior%");
    } else if (filter === "Senior") {
      query = query.ilike("position", "%senior%");
    } else if (filter !== "All") {
      // Treat as a City filter if it's not one of the predefined ones
      query = query.eq("city", filter);
    }
    
    const { data } = await query;
    if (data && data.length > 0) {
      setLiveJobs(data);
    } else {
      // FALLBACK DATA IF DB EMPTY
      const isRole = ["All", "Internships", "Junior", "Senior"].includes(filter);
      setLiveJobs([
        { id: 'job-1', position: isRole ? (filter === 'All' ? 'Junior Architect' : filter + ' Architect') : 'Architect', firm_name: 'Studio Lotus', city: isRole ? 'New Delhi' : filter, experience: '1-3 Years', posted_date: '2023-10-01' },
        { id: 'job-2', position: 'Senior Interior Designer', firm_name: 'Morphogenesis', city: isRole ? 'Mumbai' : filter, experience: '5+ Years', posted_date: '2023-10-05' },
        { id: 'job-3', position: 'Urban Planner', firm_name: 'Bimal Patel', city: isRole ? 'Ahmedabad' : filter, experience: '3-5 Years', posted_date: '2023-10-10' }
      ]);
    }
  };

  return (
    <>
      <Hero />

      {/* ABSTRACT STYLIZED MAP / LOCATION HUB */}
      <section className="py-20 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Explore Hubs</h2>
            <p className="text-gray-500 text-lg">Click a major city to filter jobs instantly.</p>
          </div>
          
          <div className="relative w-full max-w-4xl mx-auto h-[400px] border border-gray-200 rounded-3xl bg-gray-50 overflow-hidden flex items-center justify-center p-8">
            {/* Grid background for map */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
            
            <div className="relative w-full h-full">
              {displayCities.slice(0, 5).map((city, idx) => {
                // Generate deterministic abstract positions for the top 5 cities
                const positions = [
                  { top: "20%", left: "30%" },
                  { top: "60%", left: "20%" },
                  { top: "40%", left: "60%" },
                  { top: "80%", left: "50%" },
                  { top: "30%", left: "80%" },
                ];
                return (
                  <button
                    key={city}
                    onClick={() => {
                      setActiveFilter(city);
                      fetchLiveJobs(city);
                      document.getElementById('live-feed')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="absolute group flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 z-10 cursor-pointer"
                    style={positions[idx] || { top: "50%", left: "50%" }}
                  >
                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg group-hover:bg-gray-800 transition">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="mt-3 bg-white px-4 py-2 rounded-xl shadow border font-bold text-black text-sm whitespace-nowrap opacity-90 group-hover:opacity-100">
                      {city}
                    </div>
                  </button>
                );
              })}
              
              {/* Connecting abstract lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <line x1="30%" y1="20%" x2="60%" y2="40%" stroke="black" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="60%" y1="40%" x2="50%" y2="80%" stroke="black" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="60%" y1="40%" x2="80%" y2="30%" stroke="black" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="20%" y1="60%" x2="50%" y2="80%" stroke="black" strokeWidth="2" strokeDasharray="5,5" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE JOB FEED (QUICK FILTERS) */}
      <section id="live-feed" className="py-20 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div>
              <h2 className="text-4xl font-bold">Latest Openings</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto snap-x">
              {["All", "Internships", "Junior", "Senior"].map((f) => (
                <button
                  key={f}
                  onClick={() => { setActiveFilter(f); fetchLiveJobs(f); }}
                  className={`px-6 py-3 rounded-full font-medium whitespace-nowrap snap-start transition ${activeFilter === f ? "bg-black text-white" : "bg-white text-gray-600 border hover:bg-gray-100"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveJobs.length > 0 ? liveJobs.map((job) => (
              <Link href={`/jobs/${job.id}`} key={job.id} className="bg-white border rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition group flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xl mb-1 group-hover:text-gray-600 transition">{job.position}</h3>
                  <p className="text-gray-500 mb-4">{job.firm_name}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.city && <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-medium">{job.city}</span>}
                    {job.experience && <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-medium">{job.experience}</span>}
                  </div>
                </div>
                <div className="flex justify-between items-center border-t pt-4">
                  <span className="text-sm text-gray-400">{job.posted_date}</span>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-black transition transform group-hover:translate-x-1" />
                </div>
              </Link>
            )) : (
              <p className="text-gray-500 col-span-full py-10 text-center">No jobs found for this filter.</p>
            )}
          </div>
          
          <div className="mt-10 text-center">
            <Link href="/jobs" className="inline-block bg-white border-2 border-black text-black px-8 py-4 rounded-2xl font-bold hover:bg-black hover:text-white transition">
              View All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* SWIPEABLE COMPANY CAROUSEL */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold">Featured Practices</h2>
              <p className="text-gray-400 mt-3 text-lg">Discover top architecture firms hiring now.</p>
            </div>
            <Link href="/companies" className="hidden sm:flex items-center gap-2 text-white font-medium hover:text-gray-300 transition">
              View Directory <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {displayCompanies.map((company) => (
              <Link
                key={company.slug}
                href={`/companies/${company.slug}`}
                className="snap-start shrink-0 w-[280px] md:w-[320px] bg-gray-900 border border-gray-800 rounded-3xl p-8 hover:bg-gray-800 transition transform hover:-translate-y-2 flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 rounded-full bg-black border-2 border-gray-700 flex items-center justify-center overflow-hidden mb-6 group-hover:border-white transition">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt={company.firm_name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-500 group-hover:text-white transition" />
                  )}
                </div>
                <h3 className="font-bold text-xl mb-2">{company.firm_name}</h3>
                <p className="text-gray-400 text-sm mb-6 flex items-center gap-1 justify-center"><MapPin className="w-3 h-3"/> {company.city}</p>
                <div className="mt-auto text-sm font-medium text-gray-300 group-hover:text-white transition flex items-center gap-2">
                  View Profile <ArrowRight className="w-4 h-4"/>
                </div>
              </Link>
            ))}
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            .hide-scrollbar::-webkit-scrollbar { display: none; }
          `}} />
        </div>
      </section>

      {/* STATISTICS */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="py-4">
            <h3 className="text-6xl font-bold mb-2 tracking-tighter">{stats.users}</h3>
            <p className="text-gray-500 font-medium tracking-widest uppercase text-sm">Architects</p>
          </div>
          <div className="py-4">
            <h3 className="text-6xl font-bold mb-2 tracking-tighter">{stats.jobs}</h3>
            <p className="text-gray-500 font-medium tracking-widest uppercase text-sm">Active Roles</p>
          </div>
          <div className="py-4">
            <h3 className="text-6xl font-bold mb-2 tracking-tighter">{stats.companies}</h3>
            <p className="text-gray-500 font-medium tracking-widest uppercase text-sm">Firms Listed</p>
          </div>
        </div>
      </section>
    </>
  );
}
