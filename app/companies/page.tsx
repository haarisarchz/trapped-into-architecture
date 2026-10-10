"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Search, MapPin, Building2, SlidersHorizontal, X, LayoutGrid, Rows3, List, Share2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { generateCompanySlug } from "@/utils/jobUrl";
import FavoriteCompanyButton from "@/components/FavoriteCompanyButton";

function CompaniesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL State persistence for search and filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedStates, setSelectedStates] = useState<string[]>(searchParams.get("state") ? [searchParams.get("state") as string] : []);
  const [selectedCities, setSelectedCities] = useState<string[]>(searchParams.get("city") ? [searchParams.get("city") as string] : []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.get("organization_type") ? [searchParams.get("organization_type") as string] : []);
  
  const [viewMode, setViewMode] = useState(searchParams.get("view") || "visual");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "date_added");

  const [jobs, setJobs] = useState<any[]>([]);
  const [favoritesCount, setFavoritesCount] = useState<any>({});
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
    if (sortBy !== "date_added") params.set("sort", sortBy);

    const newUrl = params.toString() ? `/companies?${params.toString()}` : '/companies';
    // Use replace to not bloat history stack while filtering
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedStates, selectedCities, selectedCategories, viewMode, sortBy, router]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setErrorState(null);

      // 1. Fetch only necessary fields from jobs (non-fatal)
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, firm_name, company_id, city, state, organization_type")
        .eq("status", "published");

      if (jobsError) {
        console.warn("Jobs fetch warning:", jobsError.message);
      }

      // 2. Fetch real companies
      const { data: companiesData, error: compError } = await supabase
        .from("companies")
        .select("id, firm_name, slug, city, state, organization_type, logo_url, created_at, founded_year, description");
        
      // Non-fatal: log warning but don't crash page
      if (compError && compError.code !== "PGRST116") {
        console.warn("Companies fetch warning:", compError.message);
      }

      setJobs(jobsData || []);
      setRealCompanies(companiesData || []);

      // Isolated: if favorite_companies table doesn't exist yet, silently skip
      try {
        const { data: favData, error: favError } = await supabase
          .from("favorite_companies")
          .select("company_slug");
        if (!favError && favData) {
          const counts: any = {};
          favData.forEach((f: any) => {
            counts[f.company_slug] = (counts[f.company_slug] || 0) + 1;
          });
          setFavoritesCount(counts);
        }
      } catch {
        // Table not ready yet — page still works, favorites show 0
      }
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
          created_at: comp.created_at || null,
          founded_year: comp.founded_year || null,
          favoriteCount: favoritesCount[comp.slug || generateCompanySlug(comp.firm_name)] || 0,
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
            created_at: job.posted_date || null,
            founded_year: null,
            favoriteCount: favoritesCount[generateCompanySlug(name)] || 0,
        };
      }
      
      // Increment open jobs count
      grouped[name].totalJobs += 1;
    });

    return Object.values(grouped).filter((c: any) => c.totalJobs > 0);
  }, [jobs, realCompanies, favoritesCount]);

  const categories = useMemo(() => [...new Set(companies.map((c: any) => c.organizationType))].filter(Boolean).sort(), [companies]);
  
  const getAggregatedList = (items: any[], key: string, additionalFilter: (item: any) => boolean = () => true) => {
    const counts: { [key: string]: number } = {};
    const latestDate: { [key: string]: number } = {};
    items.filter(additionalFilter).forEach(item => {
      let val = item[key];
      if (!val || typeof val !== 'string') return;
      val = val.trim();
      if (val === '') return;
      counts[val] = (counts[val] || 0) + 1;
      const itemDate = new Date(item.posted_date || item.created_at || item.postedDate || 0).getTime();
      if (!latestDate[val] || itemDate > latestDate[val]) {
        latestDate[val] = itemDate;
      }
    });
    return Object.keys(counts).map(val => ({
      name: val,
      count: counts[val],
      latest: latestDate[val]
    })).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.latest - a.latest;
    });
  };

  const [showAllStates, setShowAllStates] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);

  const stateStats = getAggregatedList(companies || realCompanies || [], 'state');
  const displayedStates = showAllStates ? stateStats : stateStats.slice(0, 10);
  const cityStats = getAggregatedList(companies || realCompanies || [], 'city', (c: any) => selectedStates.length === 0 || selectedStates.includes(c.state));
  const displayedCities = showAllCities ? cityStats : cityStats.slice(0, 10);

  

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
    if (sortBy === "name_asc") {
      data.sort((a: any, b: any) => a.company.localeCompare(b.company));
    } else if (sortBy === "name_desc") {
      data.sort((a: any, b: any) => b.company.localeCompare(a.company));
    } else if (sortBy === "jobs") {
      data.sort((a: any, b: any) => b.totalJobs - a.totalJobs);
    } else if (sortBy === "date_added") {
      data.sort((a: any, b: any) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });
    } else if (sortBy === "date_oldest") {
      data.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeA - timeB;
      });
    } else if (sortBy === "year_founded") {
      data.sort((a: any, b: any) => {
        const yearA = parseInt(a.founded_year) || 0;
        const yearB = parseInt(b.founded_year) || 0;
        return yearB - yearA;
      });
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
    <main className="min-h-screen bg-gray-50 text-black flex flex-col overflow-x-hidden">
      <Navbar />

      <section className="w-full px-6 lg:px-12 py-10 max-w-[1440px] mx-auto flex-1">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Companies</h1>
          <p className="text-lg text-gray-600">Explore architecture firms and discover open opportunities.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <div className={`lg:w-72 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 -mx-6 -mt-6 px-6 py-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                {(selectedCategories.length > 0 || selectedStates.length > 0 || selectedCities.length > 0) && (
                  <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-black font-medium">
                    Clear all
                  </button>
                )}
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
              {stateStats.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
        State ({stateStats.length})
      </h3>
      <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {displayedStates.map((stateObj) => (
          <label key={stateObj.name} className="flex items-center justify-between gap-2 w-full pr-2 cursor-pointer group">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedStates.includes(stateObj.name)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedStates([...selectedStates, stateObj.name]);
                  else setSelectedStates(selectedStates.filter((s) => s !== stateObj.name));
                }}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="truncate text-gray-700 group-hover:text-black transition-colors">{stateObj.name}</span>
            </div>
            <span className="text-gray-400 text-xs font-medium">({stateObj.count})</span>
          </label>
        ))}
        {stateStats.length > 10 && (
          <button type="button" onClick={() => setShowAllStates(!showAllStates)} className="text-blue-600 hover:underline text-xs mt-2 font-medium block">
            {showAllStates ? "Show Less" : "Show More"}
          </button>
        )}
      </div>
</div>
              )}

              {/* City Filter */}
              {cityStats.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
        City ({cityStats.length})
      </h3>
      <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {displayedCities.map((cityObj) => (
          <label key={cityObj.name} className="flex items-center justify-between gap-2 w-full pr-2 cursor-pointer group">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedCities.includes(cityObj.name)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedCities([...selectedCities, cityObj.name]);
                  else setSelectedCities(selectedCities.filter((c) => c !== cityObj.name));
                }}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="truncate text-gray-700 group-hover:text-black transition-colors">{cityObj.name}</span>
            </div>
            <span className="text-gray-400 text-xs font-medium">({cityObj.count})</span>
          </label>
        ))}
        {cityStats.length > 10 && (
          <button 
            type="button" 
            onClick={() => {
              if (selectedStates.length === 0 && !showAllCities) {
                alert("Please select a state to view more specific cities.");
                return;
              }
              setShowAllCities(!showAllCities);
            }} 
            className="text-blue-600 hover:underline text-xs mt-2 font-medium block"
          >
            {showAllCities ? "Show Less" : (selectedStates.length === 0 ? "Select state to see more" : "Show More")}
          </button>
        )}
      </div>
</div>
              )}

            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            
            {/* MOBILE CONTROLS */}
            <div className="lg:hidden mb-4 space-y-3">
              {/* ROW 1 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-40 border border-gray-300 rounded-lg px-2 py-2 text-sm"
                >
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="date_added">Latest Added</option>
                    <option value="date_oldest">Oldest Added</option>
                  <option value="jobs">Most Jobs</option>
                  <option value="year_founded">Year Founded</option>
                </select>
              </div>
              {/* ROW 2 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">View</span>
                  <div className="flex border rounded-xl overflow-hidden">
                    <button onClick={() => setViewMode("visual")} className={`px-3 py-2 ${viewMode === "visual" ? "bg-black text-white" : "bg-white"}`}><LayoutGrid size={16} /></button>
                    <button onClick={() => setViewMode("detailed")} className={`px-3 py-2 ${viewMode === "detailed" ? "bg-black text-white" : "bg-white"}`}><Rows3 size={16} /></button>
                    <button onClick={() => setViewMode("compact")} className={`px-3 py-2 ${viewMode === "compact" ? "bg-black text-white" : "bg-white"}`}><List size={16} /></button>
                  </div>
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className="border rounded-xl px-4 py-2 flex items-center gap-2 bg-white text-sm font-medium">
                  Filter
                </button>
              </div>
            </div>

            {/* VIEW + SORT BAR (DESKTOP) */}
            <div className="hidden lg:flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              {/* VIEW BY */}
              <div className="flex items-center gap-4">
                <p className="font-medium whitespace-nowrap">View By :</p>
                <div className="flex border rounded-xl overflow-hidden">
                  <button onClick={() => setViewMode("visual")} className={`px-4 py-3 ${viewMode === "visual" ? "bg-black text-white" : "bg-white text-black"}`}><LayoutGrid size={18} /></button>
                  <button onClick={() => setViewMode("detailed")} className={`px-4 py-3 ${viewMode === "detailed" ? "bg-black text-white" : "bg-white text-black"}`}><Rows3 size={18} /></button>
                  <button onClick={() => setViewMode("compact")} className={`px-4 py-3 transition ${viewMode === "compact" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}><List size={18} /></button>
                </div>
              </div>

              {/* SEARCH */}
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
              />

              {/* SORT BY */}
              <div className="flex items-center gap-4">
                <p className="font-medium whitespace-nowrap">Sort By :</p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="name_asc">Name A to Z (Ascending)</option>
                  <option value="name_desc">Name Z to A (Descending)</option>
                  <option value="date_added">Latest Added</option>
                  <option value="date_oldest">Oldest Added</option>
                  <option value="jobs">Number of jobs posted</option>
                  <option value="year_founded">Year Founded</option>
                </select>
              </div>
            </div>

            {/* Showing count indicator */}
            <div className="text-gray-500 font-medium text-sm mb-4">
              Showing <span className="text-black font-bold">{filteredCompanies.length}</span> {filteredCompanies.length === 1 ? 'company' : 'companies'}
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
                {paginatedCompanies.map((company: any) => {
                  if (viewMode === "visual") {
                    return (
                      <Link href={`/companies/${company.slug}`} key={company.slug} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col h-full">
                        <div className="h-32 bg-gray-50 flex items-center justify-center p-6 border-b border-gray-100 relative">
                          {company.logo ? (
                            <img src={company.logo} alt={company.company} className="h-full w-auto object-contain max-w-[140px] group-hover:scale-105 transition-transform" />
                          ) : (
                            <Building2 className="w-12 h-12 text-gray-300 group-hover:scale-105 transition-transform" />
                          )}
                          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm border border-gray-100 px-3 py-1 rounded-full text-xs font-bold text-black shadow-sm">
                            {company.totalJobs} {company.totalJobs === 1 ? 'Job' : 'Jobs'}
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-500 transition line-clamp-1 mb-1">
                            {company.company}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-1 mb-4">{company.organizationType}</p>
                          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-medium">
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin size={14} />
                              <span className="line-clamp-1">{[company.city, company.state].filter(Boolean).join(', ') || "India"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FavoriteCompanyButton companySlug={company.slug} initialFavorites={company.favoriteCount || 0} variant="icon" />
                              <button 
                                onClick={(e) => { e.preventDefault(); handleShare(company.slug); }}
                                className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition relative z-10"
                                title="Share Company"
                              >
                                <Share2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  }

                  if (viewMode === "detailed") {
                    return (
                      <Link href={`/companies/${company.slug}`} key={company.slug} className="group bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0 group-hover:scale-105 transition-transform">
                          {company.logo ? (
                            <img src={company.logo} alt={company.company} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-10 h-10 md:w-12 md:h-12 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                            <h3 className="font-bold text-xl text-gray-900 group-hover:text-red-500 transition line-clamp-1">
                              {company.company}
                            </h3>
                            <span className="inline-block px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-200 whitespace-nowrap w-fit">
                              {company.organizationType}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{[company.city, company.state].filter(Boolean).join(', ') || "India"}</span>
                            </div>
                          </div>
                          {company.description ? (
                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed max-w-3xl mt-1">
                              {company.description}
                            </p>
                          ) : null}
                        </div>
                        <div className="w-full md:w-auto shrink-0 flex items-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                          <div className="flex flex-col md:items-end w-full">
                            <div className="text-center md:text-right mb-4 flex-1 w-full">
                              <span className="block text-2xl font-black text-black leading-none">{company.totalJobs}</span>
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{company.totalJobs === 1 ? 'Open Job' : 'Open Jobs'}</span>
                            </div>
                            <div className="flex gap-2 items-center w-full md:w-auto">
                              <FavoriteCompanyButton companySlug={company.slug} initialFavorites={company.favoriteCount || 0} variant="icon" />
                              <button 
                                onClick={(e) => { e.preventDefault(); handleShare(company.slug); }}
                                className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition relative z-10 shrink-0"
                                title="Share Company"
                              >
                                <Share2 size={16} />
                              </button>
                              <div className="flex-1 md:flex-none text-center bg-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition">
                                View Profile
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  }

                  // Compact View
                  return (
                    <Link href={`/companies/${company.slug}`} key={company.slug} className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-gray-300 hover:shadow-sm transition flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                        {company.logo ? (
                          <img src={company.logo} alt={company.company} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-5 flex flex-col min-w-0">
                          <h3 className="font-bold text-base text-gray-900 group-hover:text-red-500 transition line-clamp-1">
                            {company.company}
                          </h3>
                          <span className="text-xs text-gray-500 line-clamp-1 block md:hidden mt-1">{company.organizationType} • {[company.city, company.state].filter(Boolean).join(', ') || "India"}</span>
                        </div>
                        <div className="hidden md:flex md:col-span-4 items-center text-sm text-gray-500">
                          <MapPin size={14} className="mr-1.5 shrink-0" />
                          <span className="line-clamp-1">{[company.city, company.state].filter(Boolean).join(', ') || "India"}</span>
                        </div>
                        <div className="hidden md:block md:col-span-3 text-sm text-gray-600 line-clamp-1">
                          {company.organizationType}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        <span className="px-3 py-1 bg-gray-50 text-black text-xs font-bold rounded-lg whitespace-nowrap border border-gray-100">
                          {company.totalJobs} {company.totalJobs === 1 ? 'Job' : 'Jobs'}
                        </span>
                        <FavoriteCompanyButton companySlug={company.slug} initialFavorites={company.favoriteCount || 0} variant="icon" />
                        <button 
                          onClick={(e) => { e.preventDefault(); handleShare(company.slug); }}
                          className="hidden md:flex p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition relative z-10"
                          title="Share Company"
                        >
                          <Share2 size={16} />
                        </button>
                      </div>
                    </Link>
                  );
                })}
              
                </div>
              )}

              {/* Pagination Controls */}
              {filteredCompanies.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 bg-white p-4 rounded-3xl shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>Companies per page:</span>
                    <select 
                      value={itemsPerPage} 
                      onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="border border-gray-200 rounded-lg px-2 py-1 outline-none"
                    >
                      <option value={20}>20</option>
                      <option value={24}>24</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition"
                    >
                      Previous
                    </button>
                    
                    <span className="text-sm font-medium px-4">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    
                    <button 
                      onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition"
                    >
                      Next
                    </button>
                  </div>
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

