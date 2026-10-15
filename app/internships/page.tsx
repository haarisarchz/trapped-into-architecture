// @ts-nocheck
"use client";

import Navbar from "@/components/Navbar";
import JobCard from "@/components/Jobcard";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

import {
  LayoutGrid,
  Rows3,
  List,
  Filter,
  X,
  Search,
  ChevronDown
} from "lucide-react";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

function InternshipsPageContent() {
  const searchParams = useSearchParams();

  const [selectedStates, setSelectedStates] = useState<string[]>(
    searchParams.get("state") ? [searchParams.get("state") as string] : []
  );
  const [selectedCities, setSelectedCities] = useState<string[]>(
    searchParams.get("city") ? [searchParams.get("city") as string] : []
  );
  const [selectedOrgTypes, setSelectedOrgTypes] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [viewMode, setViewMode] = useState("visual");
  const [sortBy, setSortBy] = useState("latest");
  const [jobs, setJobs] = useState<any[]>([]);
  const [datePosted, setDatePosted] = useState("");
  const [excludeExpired, setExcludeExpired] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Show More toggles
  const [showAllStates, setShowAllStates] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
  const [showAllOrgTypes, setShowAllOrgTypes] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(24);

  // Helper for aggregating counts
  const getAggregatedList = (items: any[], key: string, additionalFilter: (item: any) => boolean = () => true) => {
    const counts: { [key: string]: number } = {};
    const latestDate: { [key: string]: number } = {};
    items.filter(additionalFilter).forEach(item => {
      let val = item[key];
      if (!val || typeof val !== 'string') return;
      val = val.trim();
      if (val === '') return;
      counts[val] = (counts[val] || 0) + 1;
      const itemDate = new Date(item.posted_date || item.created_at || 0).getTime();
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

  // Helper for aggregating array fields (skills, qualifications)
  const getAggregatedArrayList = (items: any[], key: string) => {
    const counts: { [key: string]: number } = {};
    items.forEach(item => {
      const arr = item[key];
      if (!Array.isArray(arr)) return;
      arr.forEach((val: string) => {
        if (!val || typeof val !== 'string') return;
        const clean = val.trim();
        if (!clean) return;
        counts[clean] = (counts[clean] || 0) + 1;
      });
    });
    return Object.keys(counts).map(val => ({
      name: val,
      count: counts[val]
    })).sort((a, b) => b.count - a.count);
  };

  // Aggregated options
  const stateStats = getAggregatedList(jobs, 'state');
  const displayedStates = showAllStates ? stateStats : stateStats.slice(0, 8);

  const cityStats = getAggregatedList(jobs, 'city', (job: any) => selectedStates.length === 0 || selectedStates.includes(job.state));
  const displayedCities = showAllCities ? cityStats : cityStats.slice(0, 8);

  const orgTypeStats = getAggregatedList(jobs, 'organization_type');
  const displayedOrgTypes = showAllOrgTypes ? orgTypeStats : orgTypeStats.slice(0, 6);

  const skillStats = getAggregatedArrayList(jobs, 'skills_required');
  const displayedSkills = showAllSkills ? skillStats : skillStats.slice(0, 8);

  useEffect(() => {
    const fetchInternships = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "published");

      if (error) {
        console.error("Error fetching internships:", error);
      } else if (data) {
        // Filter for internships strictly
        const filteredData = data.filter((job: any) => 
          job.employment_type === 'Internship' || 
          (job.position && job.position.toLowerCase().includes('intern'))
        );

        setJobs(
          filteredData.map((job) => ({
            id: job.id,
            firm_name: job.firm_name,
            organization_type: job.organization_type,
            area: job.area,
            city: job.city,
            state: job.state,
            position: job.position,
            employment_type: job.employment_type || "Internship",
            experience: Array.isArray(job.experience) ? job.experience : (job.experience ? [job.experience] : []),
            salary: job.salary,
            qualifications: Array.isArray(job.qualifications) ? job.qualifications : [],
            skills_required: Array.isArray(job.skills_required) ? job.skills_required : (Array.isArray(job.skills) ? job.skills : []),
            posted_date: job.posted_date || job.created_at,
            last_date_to_apply: job.last_date_to_apply,
            post_expiry_date: job.post_expiry_date,
            job_description: job.job_description,
            application_type: job.application_type,
            apply_link: job.apply_link,
            application_email: job.application_email,
            source: job.source,
            image: job.image,
            save_count: job.save_count || 0,
            share_count: job.share_count || 0,
          }))
        );
      }
    };

    fetchInternships();
  }, []);

  const clearAllFilters = () => {
    setSelectedStates([]);
    setSelectedCities([]);
    setSelectedOrgTypes([]);
    setSelectedSkills([]);
    setDatePosted("");
    setExcludeExpired(false);
    setSearchQuery("");
  };

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job: any) => {
        const stateMatch = selectedStates.length === 0 || selectedStates.includes(job.state);
        const cityMatch = selectedCities.length === 0 || selectedCities.includes(job.city);
        const orgTypeMatch = selectedOrgTypes.length === 0 || selectedOrgTypes.includes(job.organization_type);

        const skillsMatch =
          selectedSkills.length === 0 ||
          job.skills_required?.some((s: string) => selectedSkills.includes(s));

        const searchMatch =
          searchQuery.trim() === "" ||
          (job.firm_name && job.firm_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (job.position && job.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (job.city && job.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (job.state && job.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
          job.skills_required?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));

        const expiryMatch =
          !excludeExpired ||
          !job.post_expiry_date ||
          new Date(job.post_expiry_date) >= new Date();

        let dateMatch = true;
        if (datePosted && datePosted !== "all") {
          const rawDate = job.posted_date;
          const postedDate = rawDate ? new Date(rawDate) : null;
          const now = new Date();
          if (!postedDate) {
            dateMatch = false;
          } else {
            const diffDays = (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24);
            if (datePosted === "24h") dateMatch = diffDays <= 1;
            else if (datePosted === "7d") dateMatch = diffDays <= 7;
            else if (datePosted === "30d") dateMatch = diffDays <= 30;
            else if (datePosted === "older") dateMatch = diffDays > 30;
          }
        }

        return (
          stateMatch &&
          cityMatch &&
          orgTypeMatch &&
          skillsMatch &&
          searchMatch &&
          expiryMatch &&
          dateMatch
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.posted_date || 0).getTime();
        const dateB = new Date(b.posted_date || 0).getTime();
        if (sortBy === "oldest") return dateA - dateB;
        return dateB - dateA;
      });
  }, [
    jobs,
    selectedStates,
    selectedCities,
    selectedOrgTypes,
    selectedSkills,
    searchQuery,
    excludeExpired,
    datePosted,
    sortBy
  ]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredJobs.length]);

  const renderFiltersContent = (isMobile = false) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Filters</h2>
        {(selectedStates.length > 0 ||
          selectedCities.length > 0 ||
          selectedOrgTypes.length > 0 ||
          selectedSkills.length > 0 ||
          datePosted !== "" ||
          excludeExpired) && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      {/* STATE */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider">
          State ({stateStats.length})
        </h3>
        <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-1">
          {displayedStates.map((stateObj) => (
            <label key={stateObj.name} className="flex items-center justify-between gap-2 w-full cursor-pointer group">
              <div className="flex items-center gap-2.5">
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
          {stateStats.length > 8 && (
            <button
              type="button"
              onClick={() => setShowAllStates(!showAllStates)}
              className="text-blue-600 hover:underline text-xs mt-1.5 font-medium block"
            >
              {showAllStates ? "Show Less" : "Show More"}
            </button>
          )}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* CITY */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider">
          City ({cityStats.length})
        </h3>
        <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-1">
          {displayedCities.map((cityObj) => (
            <label key={cityObj.name} className="flex items-center justify-between gap-2 w-full cursor-pointer group">
              <div className="flex items-center gap-2.5">
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
          {cityStats.length > 8 && (
            <button
              type="button"
              onClick={() => {
                if (selectedStates.length === 0 && !showAllCities) {
                  alert("Please select a state to view more specific cities.");
                  return;
                }
                setShowAllCities(!showAllCities);
              }}
              className="text-blue-600 hover:underline text-xs mt-1.5 font-medium block"
            >
              {showAllCities ? "Show Less" : (selectedStates.length === 0 ? "Select state to see more" : "Show More")}
            </button>
          )}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* ORGANIZATION TYPE */}
      {orgTypeStats.length > 0 && (
        <>
          <div>
            <h3 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider">
              Studio Type ({orgTypeStats.length})
            </h3>
            <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-1">
              {displayedOrgTypes.map((org) => (
                <label key={org.name} className="flex items-center justify-between gap-2 w-full cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={selectedOrgTypes.includes(org.name)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedOrgTypes([...selectedOrgTypes, org.name]);
                        else setSelectedOrgTypes(selectedOrgTypes.filter((o) => o !== org.name));
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="truncate text-gray-700 group-hover:text-black transition-colors">{org.name}</span>
                  </div>
                  <span className="text-gray-400 text-xs font-medium">({org.count})</span>
                </label>
              ))}
              {orgTypeStats.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllOrgTypes(!showAllOrgTypes)}
                  className="text-blue-600 hover:underline text-xs mt-1.5 font-medium block"
                >
                  {showAllOrgTypes ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
          </div>
          <hr className="border-gray-100" />
        </>
      )}



      {/* SOFTWARE & SKILLS */}
      {skillStats.length > 0 && (
        <>
          <div>
            <h3 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider">
              Software & Skills
            </h3>
            <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-1">
              {displayedSkills.map((s) => (
                <label key={s.name} className="flex items-center justify-between gap-2 w-full cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(s.name)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedSkills([...selectedSkills, s.name]);
                        else setSelectedSkills(selectedSkills.filter((val) => val !== s.name));
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="truncate text-gray-700 group-hover:text-black transition-colors">{s.name}</span>
                  </div>
                  <span className="text-gray-400 text-xs font-medium">({s.count})</span>
                </label>
              ))}
              {skillStats.length > 8 && (
                <button
                  type="button"
                  onClick={() => setShowAllSkills(!showAllSkills)}
                  className="text-blue-600 hover:underline text-xs mt-1.5 font-medium block"
                >
                  {showAllSkills ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
          </div>
          <hr className="border-gray-100" />
        </>
      )}

      {/* DATE POSTED */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider">
          Date Posted
        </h3>
        <div className="space-y-2 text-sm">
          {[
            { id: "24h", label: "Within last 24 hours" },
            { id: "7d", label: "Within last week" },
            { id: "30d", label: "Within last month" },
            { id: "older", label: "Older than a month" }
          ].map((opt) => (
            <label key={opt.id} className="flex items-center gap-2.5 w-full cursor-pointer group">
              <input
                type="checkbox"
                checked={datePosted === opt.id}
                onChange={() => (datePosted === opt.id ? setDatePosted("") : setDatePosted(opt.id))}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-gray-700 group-hover:text-black transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* EXCLUDE EXPIRED */}
      <div>
        <label className="flex items-center gap-2.5 w-full cursor-pointer group">
          <input
            type="checkbox"
            checked={excludeExpired}
            onChange={(e) => setExcludeExpired(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <span className="text-gray-700 font-bold text-xs uppercase tracking-wider group-hover:text-black transition-colors">
            Exclude Expired Internships
          </span>
        </label>
      </div>

      {isMobile && (
        <button
          onClick={() => setMobileFiltersOpen(false)}
          className="w-full mt-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition"
        >
          Apply Filters ({filteredJobs.length})
        </button>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col">
      <Navbar />

      <section className="px-4 py-6 md:px-8 lg:px-12 max-w-[1500px] mx-auto w-full flex-1">
        {/* PAGE HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900">
            Architecture Internships
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Discover verified architectural, interior, and landscape internships from leading design studios.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden lg:block w-72 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full shrink-0">
            {renderFiltersContent(false)}
          </aside>

          {/* RIGHT SIDE / LISTINGS */}
          <div className="flex-1 w-full min-w-0">
            {/* SEARCH & CONTROLS BAR */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* SEARCH INPUT */}
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search internships, studios, software, cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black transition bg-gray-50/50"
                />
              </div>

              {/* CONTROLS (Sort & View) */}
              <div className="flex items-center gap-3 justify-between md:justify-end">
                {/* SORT BY */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white font-medium focus:outline-none focus:border-black cursor-pointer shadow-sm"
                  >
                    <option value="latest">Latest Posted</option>
                    <option value="oldest">Oldest Posts</option>
                  </select>
                </div>

                {/* VIEW MODE BUTTONS */}
                <div className="flex border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setViewMode("visual")}
                    className={`p-2 transition ${viewMode === "visual" ? "bg-black text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                    title="Visual Grid"
                  >
                    <LayoutGrid size={17} />
                  </button>
                  <button
                    onClick={() => setViewMode("balanced")}
                    className={`p-2 transition ${viewMode === "balanced" ? "bg-black text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                    title="Balanced Rows"
                  >
                    <Rows3 size={17} />
                  </button>
                  <button
                    onClick={() => setViewMode("dense")}
                    className={`p-2 transition ${viewMode === "dense" ? "bg-black text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                    title="Compact List"
                  >
                    <List size={17} />
                  </button>
                </div>

                {/* MOBILE FILTER TRIGGER */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-xl shadow-sm"
                >
                  <Filter size={16} /> Filters
                </button>
              </div>
            </div>

            {/* ACTIVE FILTERS & COUNT */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-sm font-bold text-gray-700 mr-2">
                Showing {filteredJobs.length} {filteredJobs.length === 1 ? "Internship" : "Internships"}
              </span>

              {/* PILLS */}
              {selectedStates.map((st) => (
                <span key={st} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-800 shadow-sm">
                  {st}
                  <button onClick={() => setSelectedStates(selectedStates.filter((s) => s !== st))} className="text-gray-400 hover:text-black">✕</button>
                </span>
              ))}

              {selectedCities.map((ct) => (
                <span key={ct} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-800 shadow-sm">
                  {ct}
                  <button onClick={() => setSelectedCities(selectedCities.filter((c) => c !== ct))} className="text-gray-400 hover:text-black">✕</button>
                </span>
              ))}

              {selectedOrgTypes.map((ot) => (
                <span key={ot} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-800 shadow-sm">
                  {ot}
                  <button onClick={() => setSelectedOrgTypes(selectedOrgTypes.filter((o) => o !== ot))} className="text-gray-400 hover:text-black">✕</button>
                </span>
              ))}

              {selectedSkills.map((sk) => (
                <span key={sk} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-800 shadow-sm">
                  {sk}
                  <button onClick={() => setSelectedSkills(selectedSkills.filter((s) => s !== sk))} className="text-gray-400 hover:text-black">✕</button>
                </span>
              ))}

              {(selectedStates.length > 0 || selectedCities.length > 0 || selectedOrgTypes.length > 0 || selectedSkills.length > 0) && (
                <button onClick={clearAllFilters} className="text-xs text-orange-600 font-semibold hover:underline ml-2">
                  Reset all
                </button>
              )}
            </div>

            {/* LISTINGS GRID */}
            <div
              className={
                viewMode === "visual"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : viewMode === "balanced"
                  ? "grid grid-cols-1 xl:grid-cols-2 gap-5"
                  : "grid grid-cols-1 md:grid-cols-2 gap-3"
              }
            >
              {paginatedJobs.length > 0 ? (
                paginatedJobs.map((job: any, index: number) => (
                  <JobCard
                    key={job.id || index}
                    id={job.id}
                    viewMode={viewMode}
                    firm_name={job.firm_name}
                    organization_type={job.organization_type}
                    area={job.area}
                    city={job.city}
                    state={job.state}
                    position={job.position}
                    experience={job.experience}
                    salary={job.salary}
                    qualifications={job.qualifications}
                    skills_required={job.skills_required}
                    employment_type={job.employment_type || "Internship"}
                    post_expiry_date={job.post_expiry_date}
                    posted_date={job.posted_date}
                    save_count={job.save_count || 0}
                    share_count={job.share_count || 0}
                    image={job.image}
                  />
                ))
              ) : (
                <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    🏛️
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No internships found</h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                    We couldn&apos;t find any active internships matching your selected filters or search query.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition shadow-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 mt-10 pt-6">
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition bg-white"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition bg-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MOBILE FILTER MODAL DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-md bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold">Filter Internships</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            {renderFiltersContent(true)}
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

export default function InternshipsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
        </div>
      }
    >
      <InternshipsPageContent />
    </Suspense>
  );
}
