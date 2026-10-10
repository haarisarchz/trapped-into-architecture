"use client";

import Navbar from "@/components/Navbar";
import JobCard from "@/components/Jobcard";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

import {
  LayoutGrid,
  Rows3,
  List,
} from "lucide-react";

import { useState, useEffect, useMemo } from "react";

export default function JobsPage() {

  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  const [selectedQualifications, setSelectedQualifications] = useState<string[]>([]);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");

 const [viewMode, setViewMode] = useState("visual");

 const [sortBy, setSortBy] = useState("latest");

 const [jobs, setJobs] = useState<any[]>([]);
 const [excludeExpired, setExcludeExpired] =
  useState(false);

  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);

const [selectedSalary, setSelectedSalary] = useState<string[]>([]);
const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

const [showFilters, setShowFilters] = useState(false);

 
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

  const stateStats = getAggregatedList(jobs, 'state');
  const displayedStates = showAllStates ? stateStats : stateStats.slice(0, 10);
  const cityStats = getAggregatedList(jobs, 'city', (job: any) => selectedStates.length === 0 || selectedStates.includes(job.state));
  const displayedCities = showAllCities ? cityStats : cityStats.slice(0, 10);

  useEffect(() => {

  const fetchJobs = async () => {

    const { data, error } =
      await supabase
        .from("jobs").select("*").eq("status", "published");

    if (error) {

      console.log(error);

    } else {

      const filteredData = data.filter((job: any) => job.employment_type === 'Internship' || (job.position && job.position.toLowerCase().includes('intern')));

      setJobs(
        filteredData.map((job) => ({
          id: job.id,
          firmName: job.firm_name,
          organizationType: job.organization_type,
          area: job.area,
          city: job.city,
          state: job.state,
          position: job.position,
            employment_type: job.employment_type,
            experience: Array.isArray(job.experience)
            ? job.experience
            : [],
          salary: job.salary,
          qualifications: Array.isArray(job.qualifications)
            ? job.qualifications
            : [],
          skills_required: Array.isArray(job.skills_required)
            ? job.skills_required
            : [],
          postedDate: job.posted_date,
          lastDateToApply: job.last_date_to_apply,
          postExpiryDate: job.post_expiry_date,
          jobDescription: job.job_description,
          applicationType: job.application_type,
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

  fetchJobs();

}, []);

  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  const filteredJobs = useMemo(() => {
    return jobs
  .filter((job: any) => {

    const stateMatch =
      selectedStates.length === 0 ||
      selectedStates.includes(job.state);

    const cityMatch =
      selectedCities.length === 0 ||
      selectedCities.includes(job.city);

    const positionMatch =
      selectedPositions.length === 0 ||
      selectedPositions.includes(job.position);

    const qualificationMatch =
      selectedQualifications.length === 0 ||

      job.qualifications?.some(
        (qualification: string) =>

          selectedQualifications.includes(
            qualification
          )
      );

    const skillsMatch =
      selectedSkills.length === 0 ||

      job.skillsRequired?.some(
        (skill: string) =>

          selectedSkills.includes(skill)
      );

    const experienceMatch =
      selectedExperience.length === 0 ||

      job.experience?.some(
        (exp: string) =>

          selectedExperience.includes(exp)
      );

    const salaryMatch =
      selectedSalary.length === 0 ||
      selectedSalary.includes(job.salary);

    const searchMatch =
      searchQuery === "" ||

      job.firmName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||

      job.position
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||

      job.city
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||

      job.skillsRequired?.some(
        (skill: string) =>

          skill
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            )
      );

    const expiryMatch =
      !excludeExpired ||

      !job.postExpiryDate ||

      new Date(job.postExpiryDate) >=
        new Date();

    return (
      stateMatch &&
      cityMatch &&
      positionMatch &&
      qualificationMatch &&
      skillsMatch &&
      experienceMatch &&
      salaryMatch &&
      searchMatch &&
      expiryMatch
    );

  })

  .sort((a, b) => {

    if (sortBy === "salaryLow") {

      return (
        Number(a.salary.replace(/\D/g, "")) -
        Number(b.salary.replace(/\D/g, ""))
      );

    }

    if (sortBy === "salaryHigh") {

      return (
        Number(b.salary.replace(/\D/g, "")) -
        Number(a.salary.replace(/\D/g, ""))
      );

    }

    if (sortBy === "expiry") {

      return (
        new Date(a.postExpiryDate).getTime() -
        new Date(b.postExpiryDate).getTime()
      );

    }

    return 0;

  });
  }, [selectedStates, selectedCities, selectedPositions, selectedQualifications, selectedSkills, searchQuery, viewMode, sortBy, jobs, selectedExperience, selectedSalary, mobileFiltersOpen, showFilters, showAllStates, showAllCities, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredJobs.length]);

  return (
    <main className="min-h-screen bg-gray-100 text-black">

      <Navbar />

      <section className="px-4 py-6 md:p-10">

        <h1 className="text-2xl md:text-5xl font-bold mb-4">
         Architecture Internships
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">

  {/* FILTER SIDEBAR */}

<div className="hidden lg:block w-full lg:w-72 bg-white p-6 rounded-2xl shadow-md border border-gray-200 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

  <div className="flex items-center justify-between mb-6">

    <h2 className="text-2xl font-bold">
      Filters
    </h2>

    <button
      onClick={() => {
        setSelectedStates([]);
        setSelectedCities([]);
        setSelectedPositions([]);
        setSelectedQualifications([]);
        setSelectedSkills([]);
        setSelectedExperience([]);
setSelectedSalary([]);
      }}
      className="text-sm text-orange-500 font-medium"
    >
      Clear Filters
    </button>

  </div>

  <div className="space-y-8">

    {/* STATE */}

    <div>

      <h3 className="font-semibold mb-3">
        State ({stateStats.length})
      </h3>
      <div className="space-y-2 text-sm">
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

    {/* CITY */}

    <div>

      <h3 className="font-semibold mb-3">
        City ({cityStats.length})
      </h3>
      <div className="space-y-2 text-sm">
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

    {/* EXPERIENCE */}

<div>

  <h3 className="font-semibold mb-3">
    Experience
  </h3>

  <div className="space-y-2 text-sm">

    {[
      ...new Set(
        jobs.flatMap((job) =>

          Array.isArray(job.experience)
            ? job.experience.map((exp: any) => typeof exp === 'string' ? exp.trim() : String(exp || ''))
            : []

        )
      ),
    ]
      .filter(Boolean)
      .map((experience: string, index) => (

        <label
          key={`${experience}-${index}`}
          className="flex items-center gap-2"
        >

          <input
            type="checkbox"

            checked={selectedExperience.includes(experience)}

            onChange={(e) => {

              if (e.target.checked) {

                setSelectedExperience([
                  ...selectedExperience,
                  experience
                ]);

              } else {

                setSelectedExperience(
                  selectedExperience.filter(
                    (exp) => exp !== experience
                  )
                );

              }

            }}
          />

          {experience}

        </label>

      ))}

  </div>

</div>

    {/* SALARY */}

<div>

  <h3 className="font-semibold mb-3">
    Salary Range
  </h3>

  <div className="space-y-2 text-sm">

    {[
      ...new Set(
        jobs.map((job) => job.salary)
      ),
    ].map((salary) => (

      <label
        key={salary}
        className="flex items-center gap-2"
      >

        <input
          type="checkbox"

          checked={selectedSalary.includes(salary)}

          onChange={(e) => {

            if (e.target.checked) {

              setSelectedSalary([
                ...selectedSalary,
                salary
              ]);

            } else {

              setSelectedSalary(
                selectedSalary.filter(
                  (sal) => sal !== salary
                )
              );

            }

          }}
        />

        {salary}

      </label>

    ))}

  </div>

</div>

    {/* QUALIFICATION */}

<div>

  <h3 className="font-semibold mb-3">
    Qualification
  </h3>

  <div className="space-y-2 text-sm">

    {[
      ...new Set(
        jobs.flatMap((job) =>

          Array.isArray(job.qualifications)
            ? job.qualifications.map((q: any) => typeof q === 'string' ? q.trim() : String(q || ''))
            : []

        )
      ),
    ]
      .filter(Boolean)
      .map((qualification, index) => (

        <label
          key={`${qualification}-${index}`}
          className="flex items-center gap-2"
        >

          <input
            type="checkbox"

            checked={selectedQualifications.includes(qualification)}

            onChange={(e) => {

              if (e.target.checked) {

                setSelectedQualifications([
                  ...selectedQualifications,
                  qualification
                ]);

              } else {

                setSelectedQualifications(
                  selectedQualifications.filter(
                    (q) => q !== qualification
                  )
                );

              }

            }}
          />

          {qualification}

        </label>

      ))}

  </div>

</div>

    {/* SKILLS */}

<div>

  <h3 className="font-semibold mb-3">
    Skills Required
  </h3>

  <div className="space-y-2 text-sm">

    {[
      ...new Set(
        jobs.flatMap((job) =>

          Array.isArray(job.skills_required)
            ? job.skills_required.map((skill: any) => typeof skill === 'string' ? skill.trim() : String(skill || ''))
            : []

        )
      ),
    ]
      .filter(Boolean)
      .map((skill: string, index) => (

        <label
          key={`${skill}-${index}`}
          className="flex items-center gap-2"
        >

          <input
            type="checkbox"

            checked={selectedSkills.includes(skill)}

            onChange={(e) => {

              if (e.target.checked) {

                setSelectedSkills([
                  ...selectedSkills,
                  skill
                ]);

              } else {

                setSelectedSkills(
                  selectedSkills.filter(
                    (s) => s !== skill
                  )
                );

              }

            }}
          />

          {skill}

        </label>

      ))}

  </div>

</div>

<div className="mt-6 flex items-center gap-3">

  <h3 className="font-semibold">
    Exclude Expired Jobs
  </h3>

  <input
    type="checkbox"
    checked={excludeExpired}
    onChange={() =>
      setExcludeExpired(!excludeExpired)
    }
  />

</div>

    </div>

  </div>


{/* RIGHT SIDE */}

{/* MOBILE FILTER DRAWER */}

{mobileFiltersOpen && (
  <div className="fixed inset-0 z-50 lg:hidden">

    {/* Dark overlay */}

    <div
      className="absolute inset-0 bg-black/50"
      onClick={() => setMobileFiltersOpen(false)}
    />

    {/* Drawer */}

    <div className="absolute right-0 top-0 h-full w-[85%] bg-white overflow-y-auto shadow-xl p-5">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-xl font-bold">
          Filters
        </h2>

        <button
          onClick={() => setMobileFiltersOpen(false)}
          className="text-2xl"
        >
          ✕
        </button>

      </div>

      {/* Move all your filter sections here later */}
      
    </div>

  </div>
)}

<div className="flex-1">

  {/* MOBILE CONTROLS */}

<div className="lg:hidden mb-4 space-y-3">

  {/* ROW 1 */}

  <div className="flex gap-2">

    <input
      type="text"
      placeholder="Search jobs..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="flex-1 border rounded-lg px-3 py-2 text-sm"
    />

    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="w-40 border rounded-lg px-2 py-2 text-sm"
    >
      <option value="latest">Latest Posted</option>
       <option value="oldest">Older Posts</option>
      <option value="salaryHigh">High Salary</option>
      <option value="salaryLow">Low Salary</option>
      
    </select>

  </div>

  {/* ROW 2 */}

  <div className="flex items-center justify-between">

    <div className="flex items-center gap-2">

      <span className="text-sm font-medium">
        View
      </span>

      <div className="flex border rounded-xl overflow-hidden">

        <button
          onClick={() => setViewMode("visual")}
          className={`px-3 py-2 ${
            viewMode === "visual"
              ? "bg-black text-white"
              : "bg-white"
          }`}
        >
          <LayoutGrid size={16} />
        </button>

        <button
          onClick={() => setViewMode("balanced")}
          className={`px-3 py-2 ${
            viewMode === "balanced"
              ? "bg-black text-white"
              : "bg-white"
          }`}
        >
          <Rows3 size={16} />
        </button>

        <button
          onClick={() => setViewMode("dense")}
          className={`px-3 py-2 ${
            viewMode === "dense"
              ? "bg-black text-white"
              : "bg-white"
          }`}
        >
          <List size={16} />
        </button>

      </div>

    </div>

    <button
      onClick={() => setShowFilters(true)}
      className="border rounded-xl px-4 py-2 flex items-center gap-2 bg-white"
    >
      Filter
    </button>

  </div>

</div>

  {/* VIEW + SORT BAR */}

<div className="hidden lg:flex flex-col lg:flex-row justify-between items-start lg:items-center mb-3 gap-4">

  {/* VIEW BY */}

<div className="flex items-center gap-4">

  <p className="font-medium whitespace-nowrap">
    View By :
  </p>

  <div className="flex border rounded-xl overflow-hidden">

  <button
    onClick={() => setViewMode("visual")}
    className={`px-4 py-3 ${
      viewMode === "visual"
        ? "bg-black text-white"
        : "bg-white text-black"
    }`}
  >
    <LayoutGrid size={18} />
  </button>

  <button
    onClick={() => setViewMode("balanced")}
    className={`px-4 py-3 ${
      viewMode === "balanced"
        ? "bg-black text-white"
        : "bg-white text-black"
    }`}
  >
    <Rows3 size={18} />
  </button>

  <button
  onClick={() => setViewMode("dense")}
  className={`px-4 py-3 transition ${
    viewMode === "dense"
      ? "bg-black text-white"
      : "bg-white text-black hover:bg-gray-100"
  }`}
>
  <List size={18} />
</button>

</div>

</div>

  {/* SEARCH */}

  <input
    type="text"
    placeholder="Search jobs..."
    value={searchQuery}
    onChange={(e) =>
      setSearchQuery(e.target.value)
    }
    className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
  />

  {/* SORT BY */}

  <div className="flex items-center gap-4">

    <p className="font-medium">
      Sort By :
    </p>

<select
  value={sortBy}
  onChange={(e) =>
    setSortBy(e.target.value)
  }
  className="border border-gray-300 rounded-lg px-4 py-2">
     <option value="latest">
  Latest Posted
</option>

<option value="salaryHigh">
  Salary High to Low
</option>

<option value="salaryLow">
  Salary Low to High
</option>



    </select>

  </div>

</div>
{/* ALWAYS VISIBLE COUNT & ACTIVE FILTERS WRAPPER */}
<div className="flex flex-wrap items-center gap-3 mb-4">
  <span className="text-sm font-semibold text-gray-600 shrink-0">Showing {filteredJobs.length} internships</span>

  {/* ACTIVE FILTERS */}
  {(
    selectedStates.length > 0 ||
    selectedCities.length > 0 ||
    selectedPositions.length > 0 ||
    selectedQualifications.length > 0 ||
    selectedSkills.length > 0
  ) && (
    <div className="flex flex-wrap gap-2">

    {/* STATES */}

    {selectedStates.map((state) => (

      <div
        key={state}
        className="bg-white border border-gray-300 rounded-full px-2 py-1 text-sm flex items-center gap-2 shadow-sm"
      >

        {state}

        <button
          onClick={() =>
            setSelectedStates(
              selectedStates.filter(
                (s) => s !== state
              )
            )
          }
          className="text-gray-500 hover:text-black"
        >
          ×
        </button>

      </div>

    ))}

    {/* CITIES */}

    {selectedCities.map((city) => (

      <div
        key={city}
        className="bg-white border border-gray-300 rounded-full px-2 py-1 text-sm flex items-center gap-2 shadow-sm"
      >

        {city}

        <button
          onClick={() =>
            setSelectedCities(
              selectedCities.filter(
                (c) => c !== city
              )
            )
          }
          className="text-gray-500 hover:text-black"
        >
          ×
        </button>

      </div>

    ))}

    {/* POSITIONS */}

    {selectedPositions.map((position) => (

      <div
        key={position}
        className="bg-white border border-gray-300 rounded-full px-2 py-1 text-sm flex items-center gap-2 shadow-sm"
      >

        {position}

        <button
          onClick={() =>
            setSelectedPositions(
              selectedPositions.filter(
                (p) => p !== position
              )
            )
          }
          className="text-gray-500 hover:text-black"
        >
          ×
        </button>

      </div>

    ))}

    {/* QUALIFICATIONS */}

    {selectedQualifications.map((qualification) => (

      <div
        key={qualification}
        className="bg-white border border-gray-300 rounded-full px-2 py-1 text-sm flex items-center gap-2 shadow-sm"
      >

        {qualification}

        <button
          onClick={() =>
            setSelectedQualifications(
              selectedQualifications.filter(
                (q) => q !== qualification
              )
            )
          }
          className="text-gray-500 hover:text-black"
        >
          ×
        </button>

      </div>

    ))}

    {/* SKILLS */}

    {selectedSkills.map((skill) => (

      <div
        key={skill}
        className="bg-white border border-gray-300 rounded-full px-2 py-1 text-sm flex items-center gap-2 shadow-sm"
      >

        {skill}

        <button
          onClick={() =>
            setSelectedSkills(
              selectedSkills.filter(
                (s) => s !== skill
              )
            )
          }
          className="text-gray-500 hover:text-black"
        >
          ×
        </button>

      </div>

    ))}

  </div>

)}
</div>

  {/* JOB LIST */}

<div
  className={
    viewMode === "visual"
      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"

      : viewMode === "balanced"
      ? "grid grid-cols-1 xl:grid-cols-2 gap-5"

      : viewMode === "dense"
      ? "grid grid-cols-1 md:grid-cols-2 gap-3"

      : ""
  }
>

  
 
{paginatedJobs.length > 0 ? (
  paginatedJobs.map((job: any, index: number) => (
    <JobCard
      key={index}
      id={job.id}
      viewMode={viewMode}
      firm_name={job.firm_name || job.firmName}
      organization_type={job.organization_type || job.organizationType}
      area={job.area}
      city={job.city}
      state={job.state}
      position={job.position}
      experience={job.experience}
      qualifications={job.qualifications}
      skills={job.skills}
      employment_type={job.employment_type || job.employmentType}
      work_mode={job.work_mode || job.workMode}
      salary_min={job.salary_min || job.salaryMin}
      salary_max={job.salary_max || job.salaryMax}
      currency={job.currency}
      post_expiry_date={job.post_expiry_date || job.postExpiryDate}
      posted_date={job.posted_date || job.created_at || job.createdAt}
      save_count={job.save_count || job.saveCount || 0}
      image={job.image}
    />
  ))
) : (
  <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
    <p className="text-xl font-semibold">No internships available at the moment.</p>
    <p className="mt-2 text-sm">Try adjusting your filters or search query.</p>
  </div>
)}

   
    </div> {/* closes job grid */}
    {/* Pagination Controls */}
    {filteredJobs.length > 0 && (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 bg-white p-4 rounded-3xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>Internships per page:</span>
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
  

</div> {/* closes flex-1 */}

</div> {/* closes flex gap-8 */}

</section>

{/* MOBILE FILTER DRAWER */}

{showFilters && (

  <div className="fixed inset-0 z-50 lg:hidden">

    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setShowFilters(false)}
    />

    <div className="absolute right-0 top-0 h-full w-[85%] bg-white shadow-xl overflow-y-auto p-5">

      <div className="flex items-center justify-between mb-5">

        <h2 className="text-xl font-bold">
          Filters
        </h2>

        <button
          onClick={() => setShowFilters(false)}
          className="text-2xl"
        >
          ×
        </button>

      </div>

      {/* CUT & PASTE YOUR ENTIRE FILTER CONTENT HERE */}

    </div>

  </div>

)}

<Footer />

</main>
  );
}


