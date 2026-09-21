"use client";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Search, MapPin, Building2, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import CompanyActions from "@/components/CompanyActions";
import { generateCompanySlug } from "@/utils/jobUrl";

export default function CompaniesPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [realCompanies, setRealCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false); // Mobile toggle

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const { data: jobsData, error: jobsError } = await supabase.from("jobs").select("*").eq("status", "published");
    if (jobsError) console.log(jobsError);
    else setJobs(jobsData || []);

    const { data: companiesData, error: compError } = await supabase.from("companies").select("*");
    if (compError) console.log(compError);
    else setRealCompanies(companiesData || []);

    setLoading(false);
  };

    const companies = useMemo(() => {
    const grouped: any = {};
    const idToName: any = {};

    // 1. Add all REAL companies
    realCompanies.forEach((comp) => {
      grouped[comp.firm_name] = {
        company: comp.firm_name,
        slug: comp.slug,
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
      let name = job.firm_name || "Unknown Company";
      
      // If job has a company_id and we know it, use the real company's name
      if (job.company_id && idToName[job.company_id]) {
        name = idToName[job.company_id];
      }

      if (!grouped[name]) {
        grouped[name] = {
          company: name,
          slug: generateCompanySlug(name),
          city: job.city || "",
          state: job.state || "",
          organizationType: job.organization_type || "Architecture Firm",
          logo: job.company_logo || job.image || "",
          totalJobs: 0,
        };
      }
      grouped[name].totalJobs++;
    });

    return Object.values(grouped);
  }, [jobs, realCompanies]);

  const categories = useMemo(() => [...new Set(companies.map((c: any) => c.organizationType))].filter(Boolean).sort(), [companies]);
  const states = useMemo(() => [...new Set(companies.map((c: any) => c.state))].filter(Boolean).sort(), [companies]);
  const cities = useMemo(() => {
    const filtered = selectedStates.length === 0 ? companies : companies.filter((c: any) => selectedStates.includes(c.state));
    return [...new Set(filtered.map((c: any) => c.city))].filter(Boolean).sort();
  }, [companies, selectedStates]);

  const filteredCompanies = useMemo(() => {
    let data = [...companies];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((c: any) => 
        c.company.toLowerCase().includes(q) || 
        c.city?.toLowerCase().includes(q) ||
        c.state?.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      data = data.filter((c: any) => selectedCategories.includes(c.organizationType));
    }
    if (selectedStates.length > 0) {
      data = data.filter((c: any) => selectedStates.includes(c.state));
    }
    if (selectedCities.length > 0) {
      data = data.filter((c: any) => selectedCities.includes(c.city));
    }

    return data;
  }, [companies, search, selectedCategories, selectedStates, selectedCities]);

  const toggleFilter = (list: string[], setList: (v: string[]) => void, value: string) => {
    if (list.includes(value)) setList(list.filter((x) => x !== value));
    else setList([...list, value]);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedStates([]);
    setSelectedCities([]);
    setSelectedCategories([]);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl font-bold animate-pulse text-gray-500">Loading Companies...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <Navbar />

      <section className="w-full px-6 lg:px-12 py-10 max-w-[1440px] mx-auto flex-1">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Companies</h1>
          <p className="text-lg text-gray-600">Explore architecture firms across India.</p>
        </div>

        {/* Mobile Search & Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 lg:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search companies or locations..."
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full font-semibold shrink-0"
          >
            <SlidersHorizontal size={20} />
            Filters
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 w-full">
          
          {/* Sidebar Filters */}
          <aside className={`lg:w-72 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-black">Clear All</button>
              </div>

              {/* Desktop Search */}
              <div className="hidden lg:block relative mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search..."
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-sm text-gray-900">Category</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {categories.map((cat: any) => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => toggleFilter(selectedCategories, setSelectedCategories, cat)}
                        />
                        <span className="text-sm text-gray-600 group-hover:text-black">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* State Filter */}
              {states.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-sm text-gray-900">State</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {states.map((st: any) => (
                      <label key={st} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                          checked={selectedStates.includes(st)}
                          onChange={() => toggleFilter(selectedStates, setSelectedStates, st)}
                        />
                        <span className="text-sm text-gray-600 group-hover:text-black">{st}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* City Filter */}
              {cities.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-gray-900">City</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {cities.map((city: any) => (
                      <label key={city} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                          checked={selectedCities.includes(city)}
                          onChange={() => toggleFilter(selectedCities, setSelectedCities, city)}
                        />
                        <span className="text-sm text-gray-600 group-hover:text-black">{city}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            {filteredCompanies.length === 0 ? (
              <div className="bg-white p-16 rounded-3xl border border-gray-100 shadow-sm text-center">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No companies found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search query.</p>
                <button onClick={clearFilters} className="text-black font-semibold hover:underline">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 text-sm font-medium text-gray-500">
                  Showing {filteredCompanies.length} compan{filteredCompanies.length === 1 ? 'y' : 'ies'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCompanies.map((company: any) => (
                    <div key={company.slug} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col h-full group">
                      
                      <div className="flex justify-between items-start mb-4">
                        <Link href={`/companies/${company.slug}`} className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0 group-hover:scale-105 transition-transform">
                          {company.logo ? (
                            <img src={company.logo} alt={company.company} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-8 h-8 text-gray-300" />
                          )}
                        </Link>
                        {/* Removed CompanyActions from grid card to keep it clean, can add back if needed */}
                      </div>

                      <div className="flex-1">
                        <Link href={`/companies/${company.slug}`}>
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition line-clamp-1 mb-1">
                            {company.company}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-1">{company.organizationType}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs font-medium pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin size={14} />
                          <span className="line-clamp-1">{company.city || company.state || "India"}</span>
                        </div>
                        <div className="bg-gray-100 px-3 py-1 rounded-full text-black">
                          {company.totalJobs} {company.totalJobs === 1 ? "Job" : "Jobs"}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
        </div>
      </section>
      <Footer />
    </main>
  );
}