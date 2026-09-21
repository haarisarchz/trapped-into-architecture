"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Search, MapPin, Building2, SlidersHorizontal, X, LayoutGrid, Rows3, List, Share2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { generateCompanySlug } from "@/utils/jobUrl";

function CompaniesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL State persistence for search and filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedStates, setSelectedStates] = useState<string[]>(searchParams.get("state") ? [searchParams.get("state") as string] : []);
  const [selectedCities, setSelectedCities] = useState<string[]>(searchParams.get("city") ? [searchParams.get("city") as string] : []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.get("organization_type") ? [searchParams.get("organization_type") as string] : []);
  
  const [viewMode, setViewMode] = useState(searchParams.get("view") || "visual");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "name");

  const [jobs, setJobs] = useState<any[]>([]);
  const [realCompanies, setRealCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Sync state to URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedStates.length > 0) params.set("state", selectedStates[0]);
    if (selectedCities.length > 0) params.set("city", selectedCities[0]);
    if (selectedCategories.length > 0) params.set("organization_type", selectedCategories[0]);
    if (viewMode !== "visual") params.set("view", viewMode);
    if (sortBy !== "name") params.set("sort", sortBy);

    const newUrl = params.toString() ? `/companies?${params.toString()}` : '/companies';
    // Use replace to not bloat history stack while filtering
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedStates, selectedCities, selectedCategories, viewMode, sortBy, router]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setErrorState(null);

      // 1. Fetch only necessary fields from jobs to avoid huge payload/OOM crashes
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, firm_name, company_id, city, state, organization_type")
        .eq("status", "published");

      if (jobsError) throw new Error(jobsError.message);

      // 2. Fetch real companies
      const { data: companiesData, error: compError } = await supabase
        .from("companies")
        .select("id, firm_name, slug, city, state, organization_type, logo_url");
        
      if (compError) throw new Error(compError.message);

      setJobs(jobsData || []);
      setRealCompanies(companiesData || []);
    } catch (err: any) {
      console.error("Error fetching companies data:", err);
      setErrorState(err.message || "Failed to load companies.");
    } finally {
      setLoading(false);
    }
  };

  const companies = useMemo(() => {
    const grouped: any = {};
    const idToName: any = {};

    // 1. Add all REAL companies
    realCompanies.forEach((comp) => {
      if (!comp.firm_name) return;
      grouped[comp.firm_name] = {
        company: comp.firm_name,
        slug: comp.slug || generateCompanySlug(comp.firm_name),
        city: comp.city || "",
        state: comp.state || "",
        organizationType: comp.organization_type || "Architecture Firm",
        logo: comp.logo_url || "",
        totalJobs: 0,
      };
      if (comp.id) {
        idToName[comp.id] = comp.firm_name;
      }
    });

    // 2. Add jobs (increment count and fallback company creation)
    jobs.forEach((job) => {
      let name = job.firm_name;
      
      // If job has a company_id and we know it, use the real company's name
      if (job.company_id && idToName[job.company_id]) {
        name = idToName[job.company_id];
      }

      if (!name) return; // Skip if somehow completely missing

      if (!grouped[name]) {
        grouped[name] = {
          company: name,
          slug: generateCompanySlug(name),
          city: job.city || "",
          state: job.state || "",
          organizationType: job.organization_type || "Firm",
          logo: "",
          totalJobs: 0,
        };
      }
      
      // Increment open jobs count
      grouped[name].totalJobs += 1;
    });

    return Object.values(grouped);
  }, [jobs, realCompanies]);

  const categories = useMemo(() => [...new Set(companies.map((c: any) => c.organizationType))].filter(Boolean).sort(), [companies]);
  const states = useMemo(() => [...new Set(companies.map((c: any) => c.state))].filter(Boolean).sort(), [companies]);
  const cities = useMemo(() => [...new Set(companies.map((c: any) => c.city))].filter(Boolean).sort(), [companies]);

  const filteredCompanies = useMemo(() => {
    let data = [...companies];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter((c: any) => 
        (c.company && c.company.toLowerCase().includes(q)) || 
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.state && c.state.toLowerCase().includes(q))
      );
    }

    // Filters
    if (selectedCategories.length > 0) {
      data = data.filter((c: any) => selectedCategories.includes(c.organizationType));
    }
    if (selectedStates.length > 0) {
      data = data.filter((c: any) => selectedStates.includes(c.state));
    }
    if (selectedCities.length > 0) {
      data = data.filter((c: any) => selectedCities.includes(c.city));
    }

    // Sort
    if (sortBy === "name") {
      data.sort((a: any, b: any) => a.company.localeCompare(b.company));
    } else if (sortBy === "jobs") {
      data.sort((a: any, b: any) => b.totalJobs - a.totalJobs);
    }

    return data;
  }, [companies, searchQuery, selectedCategories, selectedStates, selectedCities, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedStates([]);
    setSelectedCities([]);
  };

  const handleShare = async (slug: string) => {
    const url = `${window.location.origin}/companies/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "View Company Profile",
          url: url,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <Navbar />

      <section className="w-full px-6 lg:px-12 py-10 max-w-[1440px] mx-auto flex-1">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Companies</h1>
          <p className="text-lg text-gray-600">Explore architecture firms and discover open opportunities.</p>
        </div>

        {/* Mobile Search & Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 lg:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search companies or locations..."
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full font-semibold"
          >
            <SlidersHorizontal size={20} />
            Filters {(selectedCategories.length + selectedStates.length + selectedCities.length) > 0 && `(${(selectedCategories.length + selectedStates.length + selectedCities.length)})`}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <div className={`lg:w-72 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                {(selectedCategories.length > 0 || selectedStates.length > 0 || selectedCities.length > 0) && (
                  <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-black font-medium">
                    Clear all
                  </button>
                )}
              </div>

              {/* Desktop Search (hidden on mobile) */}
              <div className="hidden lg:block mb-8 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Organization Type</h3>
                  <div className="space-y-3">
                    {categories.map((cat: any) => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-lg checked:bg-black checked:border-black transition-colors"
                            checked={selectedCategories.includes(cat)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedCategories([...selectedCategories, cat]);
                              else setSelectedCategories(selectedCategories.filter(c => c !== cat));
                            }}
                          />
                          <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-600 group-hover:text-black transition-colors text-sm font-medium">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* State Filter */}
              {states.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">State</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {states.map((state: any) => (
                      <label key={state} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-lg checked:bg-black checked:border-black transition-colors"
                            checked={selectedStates.includes(state)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedStates([...selectedStates, state]);
                              else setSelectedStates(selectedStates.filter(s => s !== state));
                            }}
                          />
                          <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-600 group-hover:text-black transition-colors text-sm font-medium">{state}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* City Filter */}
              {cities.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">City</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {cities.map((city: any) => (
                      <label key={city} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-lg checked:bg-black checked:border-black transition-colors"
                            checked={selectedCities.includes(city)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedCities([...selectedCities, city]);
                              else setSelectedCities(selectedCities.filter(c => c !== city));
                            }}
                          />
                          <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-600 group-hover:text-black transition-colors text-sm font-medium">{city}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            
            {/* View Controls & Sort */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="text-gray-500 font-medium text-sm">
                Showing <span className="text-black font-bold">{filteredCompanies.length}</span> {filteredCompanies.length === 1 ? 'company' : 'companies'}
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-medium">Sort by:</span>
                  <select 
                    className="bg-transparent border-none text-sm font-bold text-black focus:outline-none cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Company Name (A-Z)</option>
                    <option value="jobs">Most Open Jobs</option>
                  </select>
                </div>

                <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                  <button 
                    onClick={() => setViewMode("visual")} 
                    className={`p-2 rounded-lg transition ${viewMode === "visual" ? "bg-gray-100 text-black shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode("detailed")} 
                    className={`p-2 rounded-lg transition ${viewMode === "detailed" ? "bg-gray-100 text-black shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <Rows3 size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode("compact")} 
                    className={`p-2 rounded-lg transition ${viewMode === "compact" ? "bg-gray-100 text-black shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
                <div className="text-lg font-bold text-gray-500">Loading Companies...</div>
              </div>
            ) : errorState ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
                <h3 className="text-xl font-bold text-red-600 mb-2">Error Loading Companies</h3>
                <p className="text-gray-500">{errorState}</p>
                <button onClick={fetchCompanies} className="mt-6 px-6 py-2 bg-black text-white rounded-xl">Try Again</button>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
                <Building2 size={48} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No companies found</h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  We couldn't find any companies matching your current filters. Try adjusting your search criteria.
                </p>
                <button 
                  onClick={clearFilters}
                  className="px-6 py-2 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className={
                viewMode === "visual" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" :
                viewMode === "detailed" ? "flex flex-col gap-4" : 
                "flex flex-col gap-2"
              }>
                {filteredCompanies.map((company: any) => (
                  <div key={company.slug} className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition flex group ${viewMode === "visual" ? "flex-col h-full" : "flex-row items-center gap-6"}`}>
                    
                    <div className={`flex justify-between items-start ${viewMode === "visual" ? "mb-4" : "mb-0 shrink-0"}`}>
                      <Link href={`/companies/${company.slug}`} className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0 group-hover:scale-105 transition-transform">
                        {company.logo ? (
                          <img src={company.logo} alt={company.company} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-8 h-8 text-gray-300" />
                        )}
                      </Link>
                    </div>

                    <div className={`flex-1 ${viewMode !== "visual" && "flex items-center justify-between gap-6"}`}>
                      <div className="flex-1">
                        <Link href={`/companies/${company.slug}`}>
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-500 transition line-clamp-1 mb-1">
                            {company.company}
                          </h3>
                        </Link>
                        <p className={`text-sm text-gray-500 line-clamp-1 ${viewMode === "visual" ? "mb-4" : "mb-0"}`}>{company.organizationType}</p>
                      </div>
                    </div>

                    <div className={`flex items-center justify-between text-xs font-medium ${viewMode === "visual" ? "pt-4 border-t border-gray-50" : "shrink-0 gap-6"}`}>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin size={14} />
                        <span className="line-clamp-1">{[company.city, company.state].filter(Boolean).join(', ') || "India"}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-red-50 text-red-600 rounded-md whitespace-nowrap font-bold">
                          {company.totalJobs} {company.totalJobs === 1 ? 'Job' : 'Jobs'}
                        </span>
                        <button 
                          onClick={(e) => { e.preventDefault(); handleShare(company.slug); }}
                          className="p-1.5 text-gray-400 hover:text-black bg-gray-50 rounded-md border border-gray-200 transition"
                          title="Share Company"
                        >
                          <Share2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div></div>}>
      <CompaniesPageContent />
    </Suspense>
  );
}