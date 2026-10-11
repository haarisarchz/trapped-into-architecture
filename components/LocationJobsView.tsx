// @ts-nocheck
"use client";

import JobCard from "@/components/Jobcard";
import { EXPERIENCE_OPTIONS } from "@/app/constants/jobFilters";
import { LayoutGrid, Rows3, List, MapPin, ArrowRight, Bell, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useRouter } from "next/navigation";

export default function LocationJobsView({
  initialJobs,
  locationName,
  locationType, // "city" | "state"
}: {
  initialJobs: any[];
  locationName: string;
  locationType: "city" | "state";
}) {
  const router = useRouter();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("visual");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [excludeExpired, setExcludeExpired] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Position aggregation
  const positionStats = useMemo(() => {
    const counts: { [key: string]: number } = {};
    initialJobs.forEach((job) => {
      const pos = job.position?.trim();
      if (pos) counts[pos] = (counts[pos] || 0) + 1;
    });
    return Object.keys(counts)
      .map((name) => ({ name, count: counts[name] }))
      .sort((a, b) => b.count - a.count);
  }, [initialJobs]);

  // Filtering & Sorting
  const filteredJobs = useMemo(() => {
    return initialJobs
      .filter((job) => {
        // Position filter
        if (selectedPositions.length > 0 && !selectedPositions.includes(job.position)) {
          return false;
        }

        // Experience filter
        if (selectedExperience.length > 0) {
          const jobExp = Array.isArray(job.experience)
            ? job.experience.join(" ")
            : String(job.experience || "");
          const hasMatch = selectedExperience.some((exp) =>
            jobExp.toLowerCase().includes(exp.toLowerCase())
          );
          if (!hasMatch) return false;
        }

        // Exclude expired
        if (excludeExpired && job.post_expiry_date) {
          if (new Date(job.post_expiry_date) < new Date()) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchFirm = job.firm_name?.toLowerCase().includes(q);
          const matchPos = job.position?.toLowerCase().includes(q);
          const matchDesc = job.job_description?.toLowerCase().includes(q);
          if (!matchFirm && !matchPos && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.posted_date || 0).getTime();
        const dateB = new Date(b.posted_date || 0).getTime();
        const createdA = new Date(a.created_at || a.posted_date || 0).getTime();
        const createdB = new Date(b.created_at || b.posted_date || 0).getTime();

        if (sortBy === "oldest") {
          return dateA !== dateB ? dateA - dateB : createdA - createdB;
        }
        // Default latest
        return dateB !== dateA ? dateB - dateA : createdB - createdA;
      });
  }, [initialJobs, selectedPositions, selectedExperience, excludeExpired, searchQuery, sortBy]);

  // Filter Sidebar
  const renderFilters = (isMobile = false) => (
    <div
      className={
        isMobile
          ? "w-full"
          : "hidden lg:block w-72 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 lg:sticky lg:top-24 h-fit max-h-[calc(100vh-7rem)] overflow-y-auto"
      }
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Filters</h2>
        <button
          onClick={() => {
            setSelectedPositions([]);
            setSelectedExperience([]);
            setExcludeExpired(false);
            setSearchQuery("");
            // User requested: Clearing filter / unchecking city takes them to all jobs
            router.push("/jobs");
          }}
          className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
          title="Clearing filters will take you to the full jobs directory"
        >
          Clear Filters →
        </button>
      </div>

      <div className="space-y-6">
        {/* CURRENT LOCATION (PRE-CHECKED) */}
        <div>
          <h3 className="font-bold text-sm text-gray-900 mb-2 flex items-center justify-between">
            <span>{locationType === "city" ? "City" : "State"}</span>
            <span className="text-xs font-normal text-gray-400">Locked</span>
          </h3>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-900">
              <input
                type="checkbox"
                checked={true}
                onChange={() => {
                  // User requested: unchecking city/state takes user to general jobs directory
                  router.push("/jobs");
                }}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
              />
              <span>{locationName}</span>
            </label>
            <span className="text-xs text-gray-500">({initialJobs.length})</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 italic">
            Unchecking will take you to the main jobs directory.
          </p>
        </div>

        {/* POSITIONS */}
        {positionStats.length > 0 && (
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-3">
              Position ({positionStats.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto text-sm pr-1">
              {positionStats.map((pos) => (
                <label
                  key={pos.name}
                  className="flex items-center justify-between gap-2 cursor-pointer group py-0.5"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <input
                      type="checkbox"
                      checked={selectedPositions.includes(pos.name)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPositions([...selectedPositions, pos.name]);
                        else setSelectedPositions(selectedPositions.filter((p) => p !== pos.name));
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="truncate text-gray-700 group-hover:text-black transition text-xs sm:text-sm">
                      {pos.name}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs font-medium">({pos.count})</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* EXPERIENCE */}
        <div>
          <h3 className="font-bold text-sm text-gray-900 mb-3">Experience</h3>
          <div className="space-y-2 text-sm">
            {EXPERIENCE_OPTIONS.map((exp) => (
              <label
                key={exp}
                className="flex items-center gap-2.5 cursor-pointer text-gray-700 hover:text-black py-0.5"
              >
                <input
                  type="checkbox"
                  checked={selectedExperience.includes(exp)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedExperience([...selectedExperience, exp]);
                    else setSelectedExperience(selectedExperience.filter((x) => x !== exp));
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-xs sm:text-sm">{exp}</span>
              </label>
            ))}
          </div>
        </div>

        {/* EXPIRED TOGGLE */}
        <div className="pt-2 border-t border-gray-100">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={excludeExpired}
              onChange={(e) => setExcludeExpired(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-xs font-semibold text-gray-700">Exclude Expired Posts</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* DESKTOP FILTERS */}
      {renderFilters(false)}

      {/* MOBILE DRAWER */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white overflow-y-auto shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="text-2xl p-1">
                ✕
              </button>
            </div>
            {renderFilters(true)}
          </div>
        </div>
      )}

      {/* MAIN LISTINGS AREA */}
      <div className="flex-1 w-full">
        {/* MOBILE VIEW & SEARCH BAR */}
        <div className="lg:hidden mb-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Search ${locationName} jobs...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-xl px-2 py-2 text-sm bg-white"
            >
              <option value="latest">Latest Posted</option>
              <option value="oldest">Oldest Posts</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">View:</span>
              <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode("visual")}
                  className={`p-2 ${viewMode === "visual" ? "bg-black text-white" : "text-gray-700"}`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("balanced")}
                  className={`p-2 ${viewMode === "balanced" ? "bg-black text-white" : "text-gray-700"}`}
                >
                  <Rows3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode("dense")}
                  className={`p-2 ${viewMode === "dense" ? "bg-black text-white" : "text-gray-700"}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowFilters(true)}
              className="px-4 py-2 bg-black text-white rounded-xl text-sm font-bold shadow-sm"
            >
              Filter ({filteredJobs.length})
            </button>
          </div>
        </div>

        {/* DESKTOP VIEW & SORT CONTROLS BAR */}
        <div className="hidden lg:flex items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          {/* VIEW BY */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-700">View By:</span>
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("visual")}
                className={`p-2.5 transition ${viewMode === "visual" ? "bg-black text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                title="Grid / Visual View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("balanced")}
                className={`p-2.5 transition ${viewMode === "balanced" ? "bg-black text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                title="Balanced Card View"
              >
                <Rows3 size={18} />
              </button>
              <button
                onClick={() => setViewMode("dense")}
                className={`p-2.5 transition ${viewMode === "dense" ? "bg-black text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                title="Dense List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* SEARCH */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder={`Search in ${locationName}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* SORT BY */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-700">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white font-medium focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="latest">Latest Posted</option>
              <option value="oldest">Oldest Posts</option>
            </select>
          </div>
        </div>

        {/* RESULTS COUNT */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            Showing <strong className="text-gray-900">{filteredJobs.length}</strong> openings in {locationName}
          </p>
          {(selectedPositions.length > 0 || selectedExperience.length > 0 || excludeExpired || searchQuery) && (
            <button
              onClick={() => {
                setSelectedPositions([]);
                setSelectedExperience([]);
                setExcludeExpired(false);
                setSearchQuery("");
              }}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Reset local filters
            </button>
          )}
        </div>

        {/* JOB CARDS */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2">No matching jobs found</h3>
            <p className="text-gray-500 text-sm mb-4">
              Try adjusting your filters or search keywords.
            </p>
            <button
              onClick={() => {
                setSelectedPositions([]);
                setSelectedExperience([]);
                setExcludeExpired(false);
                setSearchQuery("");
              }}
              className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === "visual"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : viewMode === "balanced"
                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                firm_name={job.firm_name}
                organization_type={job.organization_type}
                area={job.area || ""}
                city={job.city || ""}
                state={job.state || ""}
                position={job.position || ""}
                experience={job.experience || ""}
                salary={job.salary || ""}
                qualifications={job.qualifications || []}
                skills_required={job.skills_required || []}
                posted_date={job.posted_date || ""}
                last_date_to_apply={job.last_date_to_apply || ""}
                post_expiry_date={job.post_expiry_date || ""}
                job_description={job.job_description || ""}
                application_type={job.application_type || ""}
                apply_link={job.apply_link}
                application_email={job.application_email}
                source={job.source || ""}
                image={job.image || ""}
                viewMode={viewMode}
                save_count={job.save_count || 0}
                share_count={job.share_count || 0}
                employment_type={job.employment_type}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
