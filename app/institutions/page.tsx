"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import InstitutionCard from "@/components/institutions/InstitutionCard";
import CollegeCompareModal from "@/components/institutions/CollegeCompareModal";
import PaginationControls from "@/components/PaginationControls";
import {
  Search,
  MapPin,
  Building2,
  SlidersHorizontal,
  X,
  GraduationCap,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowUpDown,
  Filter,
  Award,
  ShieldCheck,
  BookOpen,
  Check,
} from "lucide-react";

const MAJOR_STATES = [
  "All India",
  "Tamil Nadu",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Delhi",
  "Gujarat",
  "Telangana",
  "Andhra Pradesh",
  "Uttar Pradesh",
];

const INTAKE_RANGES = [
  { label: "All Intake Sizes", value: "all" },
  { label: "Up to 40 seats", value: "0-40" },
  { label: "41 to 80 seats", value: "41-80" },
  { label: "81 to 120 seats", value: "81-120" },
  { label: "120+ seats", value: "121-500" },
];

function InstitutionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State from URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedState, setSelectedState] = useState(searchParams.get("state") || "All India");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "");
  const [selectedUniversity, setSelectedUniversity] = useState(searchParams.get("university") || "");
  const [selectedIntakeRange, setSelectedIntakeRange] = useState(searchParams.get("intake") || "all");
  const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "latest");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "name_asc");
  const [selectedProgram, setSelectedProgram] = useState<"all" | "ug" | "pg" | "diploma">(
    (searchParams.get("program") as any) || "all"
  );
  const [selectedSpecialization, setSelectedSpecialization] = useState(searchParams.get("specialization") || "");
  const [filterMultiYear, setFilterMultiYear] = useState(searchParams.get("multiYear") === "true");
  const [filterNirf, setFilterNirf] = useState(searchParams.get("nirf") === "true");
  const [filterActiveOnly, setFilterActiveOnly] = useState(searchParams.get("activeOnly") === "true");

  // Data
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [annualRecords, setAnnualRecords] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Comparison State
  const [comparedInstitutions, setComparedInstitutions] = useState<any[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  // Fetch Data on mount
  useEffect(() => {
    fetchInstitutionsData();
  }, []);

  const fetchInstitutionsData = async () => {
    try {
      setLoading(true);

      // 1. Fetch institutions
      const { data: instData, error: instError } = await supabase
        .from("institutions")
        .select("*")
        .eq("is_active", true)
        .order("institution_name", { ascending: true });

      if (instError) throw instError;

      // 2. Fetch annual intake records with pagination to load complete history (>3,000 records)
      let allAnnualRecords: any[] = [];
      let annPage = 0;
      const pageSize = 1000;
      while (true) {
        const { data: chunk, error: chunkErr } = await supabase
          .from("institution_annual_records")
          .select("*")
          .order("academic_year", { ascending: false })
          .range(annPage * pageSize, (annPage + 1) * pageSize - 1);

        if (chunkErr) {
          console.warn("Annual records error:", chunkErr.message);
          break;
        }
        if (!chunk || chunk.length === 0) break;
        allAnnualRecords = allAnnualRecords.concat(chunk);
        if (chunk.length < pageSize) break;
        annPage++;
      }

      // 3. Fetch rankings (NIRF)
      const { data: rankData } = await supabase
        .from("institution_rankings")
        .select("*")
        .order("ranking_year", { ascending: false });

      setInstitutions(instData || []);
      setAnnualRecords(allAnnualRecords || []);
      setRankings(rankData || []);
    } catch (err: any) {
      console.error("Error fetching institutions:", err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedState && selectedState !== "All India") params.set("state", selectedState);
    if (selectedCity) params.set("city", selectedCity);
    if (selectedUniversity) params.set("university", selectedUniversity);
    if (selectedIntakeRange !== "all") params.set("intake", selectedIntakeRange);
    if (selectedYear !== "latest") params.set("year", selectedYear);
    if (sortBy !== "name_asc") params.set("sort", sortBy);
    if (selectedProgram !== "all") params.set("program", selectedProgram);
    if (selectedSpecialization) params.set("specialization", selectedSpecialization);
    if (filterMultiYear) params.set("multiYear", "true");
    if (filterNirf) params.set("nirf", "true");
    if (filterActiveOnly) params.set("activeOnly", "true");

    const newUrl = params.toString() ? `/institutions?${params.toString()}` : "/institutions";
    router.replace(newUrl, { scroll: false });
  }, [
    searchQuery,
    selectedState,
    selectedCity,
    selectedUniversity,
    selectedIntakeRange,
    selectedYear,
    sortBy,
    selectedProgram,
    selectedSpecialization,
    filterMultiYear,
    filterNirf,
    filterActiveOnly,
    router,
  ]);

  // Derived filter options
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    institutions.forEach((i) => {
      if (selectedState === "All India" || i.state?.toLowerCase() === selectedState.toLowerCase()) {
        let c = (i.city || i.district || "").trim();
        if (i.state) {
          const reg = new RegExp(`\\b${i.state.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, "gi");
          c = c.replace(reg, "").trim();
        }
        c = c.replace(/[-–_,.:;]+/g, " ").replace(/\s+/g, " ").trim();
        if (c && c.length > 1) {
          set.add(c);
        }
      }
    });
    return Array.from(set).sort();
  }, [institutions, selectedState]);

  const uniqueUniversities = useMemo(() => {
    const set = new Set<string>();
    institutions.forEach((i) => {
      if (selectedState === "All India" || i.state?.toLowerCase() === selectedState.toLowerCase()) {
        if (i.affiliated_university) set.add(i.affiliated_university.trim());
      }
    });
    return Array.from(set).sort();
  }, [institutions, selectedState]);

  const uniqueAcademicYears = useMemo(() => {
    const set = new Set<string>();
    annualRecords.forEach((r) => {
      if (r.academic_year) set.add(r.academic_year);
    });
    return Array.from(set).sort().reverse();
  }, [annualRecords]);

  const latestAcademicYear = uniqueAcademicYears[0] || "2024-2025";

  // Build institution view models with attached latest record, all records, and best rank
  const enrichedInstitutions = useMemo(() => {
    const recordsByInst: Record<string, any[]> = {};
    annualRecords.forEach((r) => {
      if (!recordsByInst[r.institution_id]) recordsByInst[r.institution_id] = [];
      recordsByInst[r.institution_id].push(r);
    });

    const ranksByInst: Record<string, any[]> = {};
    rankings.forEach((rk) => {
      if (!ranksByInst[rk.institution_id]) ranksByInst[rk.institution_id] = [];
      ranksByInst[rk.institution_id].push(rk);
    });

    return institutions.map((inst) => {
      const records = recordsByInst[inst.id] || [];
      const instRanks = ranksByInst[inst.id] || [];
      const latest = records[0] || null;
      const bestRank = instRanks.length > 0 ? instRanks[0] : null;

      return {
        ...inst,
        annual_records: records,
        latest_record: latest,
        best_rank: bestRank,
      };
    });
  }, [institutions, annualRecords, rankings]);

  // Program Counts across catalog
  const programCounts = useMemo(() => {
    let ug = 0;
    let pg = 0;
    let diploma = 0;
    enrichedInstitutions.forEach((inst) => {
      const recs = inst.annual_records || [];
      const hasUG = recs.some((r: any) => (r.course_name || "B.Arch") === "B.Arch" || r.course_name?.includes("Bachelor"));
      const hasPG = recs.some((r: any) => r.course_name && (r.course_name.startsWith("M.Arch") || r.course_name.includes("Master")));
      const hasDiploma = recs.some((r: any) => r.course_name && r.course_name.includes("Diploma")) || inst.institution_type === "Polytechnic / Diploma Institution";
      if (hasUG) ug++;
      if (hasPG) pg++;
      if (hasDiploma) diploma++;
    });
    return {
      all: enrichedInstitutions.length,
      ug,
      pg,
      diploma,
    };
  }, [enrichedInstitutions]);

  // Available specializations for dropdown when on PG or Diploma
  const availableSpecializations = useMemo(() => {
    const set = new Set<string>();
    annualRecords.forEach((r) => {
      const c = (r.course_name || "").trim();
      if (!c) return;
      if (selectedProgram === "pg" && (c.startsWith("M.Arch") || c.includes("Master"))) {
        set.add(c);
      } else if (selectedProgram === "diploma" && c.includes("Diploma")) {
        set.add(c);
      }
    });
    return Array.from(set).sort();
  }, [annualRecords, selectedProgram]);

  // Filtering
  const filteredInstitutions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return enrichedInstitutions.filter((inst) => {
      // 0. Program Level Tab Filter
      if (selectedProgram === "ug") {
        const hasUG = inst.annual_records?.some((r: any) => (r.course_name || "B.Arch") === "B.Arch" || r.course_name?.includes("Bachelor"));
        if (!hasUG) return false;
      } else if (selectedProgram === "pg") {
        const hasPG = inst.annual_records?.some((r: any) => r.course_name && (r.course_name.startsWith("M.Arch") || r.course_name.includes("Master")));
        if (!hasPG) return false;
      } else if (selectedProgram === "diploma") {
        const hasDiploma = inst.annual_records?.some((r: any) => r.course_name && r.course_name.includes("Diploma")) || inst.institution_type === "Polytechnic / Diploma Institution";
        if (!hasDiploma) return false;
      }

      // 0.1 Specialization Filter
      if (selectedSpecialization) {
        const hasSpec = inst.annual_records?.some((r: any) => (r.course_name || "") === selectedSpecialization);
        if (!hasSpec) return false;
      }

      // 0.2 Quick Chips: Multi-Year Statutory Approval
      if (filterMultiYear) {
        const hasMulti = inst.annual_records?.some((r: any) => r.academic_year && r.academic_year >= "2027-2028" && r.approved_intake > 0 && !/closure|discontinued/i.test(r.approval_status || ""));
        if (!hasMulti) return false;
      }

      // 0.3 Quick Chips: NIRF Ranked
      if (filterNirf) {
        if (!inst.best_rank) return false;
      }

      // 0.4 Quick Chips: Active Admissions Only
      if (filterActiveOnly) {
        if (inst.institution_type && /closed|terminated|discontinued|progressive/i.test(inst.institution_type)) {
          return false;
        }
      }
      // 1. Text Search across Name, COA Code, City, District, State, Affiliated University
      if (q) {
        const matchesName = inst.institution_name?.toLowerCase().includes(q);
        const matchesCode = inst.coa_code?.toLowerCase().includes(q);
        const matchesCity = inst.city?.toLowerCase().includes(q);
        const matchesDistrict = inst.district?.toLowerCase().includes(q);
        const matchesState = inst.state?.toLowerCase().includes(q);
        const matchesUniv = inst.affiliated_university?.toLowerCase().includes(q);
        const matchesLocality = inst.locality?.toLowerCase().includes(q);

        if (!matchesName && !matchesCode && !matchesCity && !matchesDistrict && !matchesState && !matchesUniv && !matchesLocality) {
          return false;
        }
      }

      // 2. State
      if (selectedState !== "All India" && inst.state?.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }

      // 3. City / District
      if (selectedCity) {
        const c = inst.city?.toLowerCase();
        const d = inst.district?.toLowerCase();
        const target = selectedCity.toLowerCase();
        if (c !== target && d !== target) return false;
      }

      // 4. University
      if (selectedUniversity && inst.affiliated_university?.toLowerCase() !== selectedUniversity.toLowerCase()) {
        return false;
      }

      // 5. Intake Range
      if (selectedIntakeRange !== "all") {
        const intake = inst.latest_record?.approved_intake ?? 0;
        const [minStr, maxStr] = selectedIntakeRange.split("-");
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);
        if (intake < min || intake > max) return false;
      }

      // 6. Year specific intake presence
      if (selectedYear !== "latest") {
        const hasYear = inst.annual_records?.some((r: any) => r.academic_year === selectedYear);
        if (!hasYear) return false;
      }

      return true;
    });
  }, [
    enrichedInstitutions,
    searchQuery,
    selectedState,
    selectedCity,
    selectedUniversity,
    selectedIntakeRange,
    selectedYear,
    selectedProgram,
    selectedSpecialization,
    filterMultiYear,
    filterNirf,
    filterActiveOnly,
  ]);

  // Sorting
  const sortedInstitutions = useMemo(() => {
    return [...filteredInstitutions].sort((a, b) => {
      if (sortBy === "nirf_asc") {
        const rankA = a.best_rank ? a.best_rank.rank_number : 9999;
        const rankB = b.best_rank ? b.best_rank.rank_number : 9999;
        if (rankA !== rankB) return rankA - rankB;
        return a.institution_name.localeCompare(b.institution_name);
      }
      if (sortBy === "name_asc") return a.institution_name.localeCompare(b.institution_name);
      if (sortBy === "name_desc") return b.institution_name.localeCompare(a.institution_name);
      if (sortBy === "intake_desc") {
        const intA = a.latest_record?.approved_intake || 0;
        const intB = b.latest_record?.approved_intake || 0;
        return intB - intA;
      }
      if (sortBy === "intake_asc") {
        const intA = a.latest_record?.approved_intake || 0;
        const intB = b.latest_record?.approved_intake || 0;
        return intA - intB;
      }
      if (sortBy === "code_asc") {
        return (a.coa_code || "").localeCompare(b.coa_code || "");
      }
      return 0;
    });
  }, [filteredInstitutions, sortBy]);

  // Paginated Slicing
  const totalItems = sortedInstitutions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedInstitutions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedInstitutions.slice(start, start + itemsPerPage);
  }, [sortedInstitutions, currentPage, itemsPerPage]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedState("All India");
    setSelectedCity("");
    setSelectedUniversity("");
    setSelectedIntakeRange("all");
    setSelectedYear("latest");
    setSortBy("name_asc");
    setSelectedProgram("all");
    setSelectedSpecialization("");
    setFilterMultiYear(false);
    setFilterNirf(false);
    setFilterActiveOnly(false);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    (selectedState && selectedState !== "All India") ||
    Boolean(selectedCity) ||
    Boolean(selectedUniversity) ||
    selectedIntakeRange !== "all" ||
    selectedYear !== "latest" ||
    selectedProgram !== "all" ||
    Boolean(selectedSpecialization) ||
    filterMultiYear ||
    filterNirf ||
    filterActiveOnly;

  // Comparison toggle handlers
  const handleToggleCompare = (inst: any) => {
    const isAlready = comparedInstitutions.some((c) => c.id === inst.id);
    if (isAlready) {
      setComparedInstitutions(comparedInstitutions.filter((c) => c.id !== inst.id));
    } else {
      if (comparedInstitutions.length >= 3) return;
      setComparedInstitutions([...comparedInstitutions, inst]);
    }
  };

  const handleRemoveCompare = (id: string) => {
    setComparedInstitutions(comparedInstitutions.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* HERO / INTRO SECTION */}
        <section className="bg-black text-white pt-12 pb-14 px-4 sm:px-6 border-b border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                  <GraduationCap size={14} className="text-white" />
                  National Directory
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
                  Architecture Institutions in India
                </h1>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  Discover, explore, and compare official Council of Architecture (COA) recognized institutions across India.
                  Access validated annual approved intake figures, university affiliations, and regulatory approval records.
                </p>
              </div>

              {/* Latest Record Badge */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 shrink-0 self-start md:self-auto">
                <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Reporting Year Data
                </div>
                <div className="text-2xl font-extrabold text-white flex items-center gap-2">
                  <span>{latestAcademicYear}</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                  <Info size={12} /> Source: Official Council of Architecture
                </div>
              </div>
            </div>

            {/* SEARCH BAR */}
            <div className="mt-8 bg-white rounded-2xl p-2 sm:p-2.5 shadow-xl flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1 flex items-center">
                <Search size={20} className="absolute left-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by college name, COA code (e.g. TN01), city, district, or university..."
                  className="w-full pl-11 pr-10 py-3 text-sm sm:text-base text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 p-1 text-gray-400 hover:text-black transition"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="md:hidden flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
                >
                  <SlidersHorizontal size={16} /> Filters
                  {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                </button>
              </div>
            </div>

            {/* STATE PILLS CAROUSEL / SHORTCUTS */}
            <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-gray-400 font-medium shrink-0 mr-1">Explore States:</span>
              {MAJOR_STATES.map((st) => {
                const active = selectedState === st;
                return (
                  <button
                    key={st}
                    onClick={() => {
                      setSelectedState(st);
                      setSelectedCity("");
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-full font-semibold transition shrink-0 whitespace-nowrap ${
                      active
                        ? "bg-white text-black shadow-sm"
                        : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* MAIN DIRECTORY VIEW */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
          {/* CATALOG METRICS SUMMARY */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Accredited Institutions</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">583</div>
              <div className="text-[11px] text-gray-500 mt-0.5">COA Recognized Nationwide</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Verified Annual Intakes</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">3,014</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Historical Session Logs</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Postgraduate Programs</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 mt-1">38+</div>
              <div className="text-[11px] text-gray-500 mt-0.5">M.Arch Specializations</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Statutory Session</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">2026–27</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Official COA Gazettes Live</div>
            </div>
          </div>

          {/* PROGRAM SWITCHER TABS */}
          <div className="bg-white rounded-2xl border border-gray-200 p-1.5 shadow-2xs mb-4 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => {
                setSelectedProgram("all");
                setSelectedSpecialization("");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition ${
                selectedProgram === "all"
                  ? "bg-black text-white shadow-xs"
                  : "text-gray-600 hover:text-black hover:bg-gray-50"
              }`}
            >
              <span>All Institutions</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                  selectedProgram === "all" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {programCounts.all}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedProgram("ug");
                setSelectedSpecialization("");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition ${
                selectedProgram === "ug"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
              }`}
            >
              <GraduationCap size={16} />
              <span>B.Arch (UG)</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                  selectedProgram === "ug" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"
                }`}
              >
                {programCounts.ug}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedProgram("pg");
                setSelectedSpecialization("");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition ${
                selectedProgram === "pg"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
              }`}
            >
              <BookOpen size={16} />
              <span>M.Arch (PG Specializations)</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                  selectedProgram === "pg" ? "bg-white/20 text-white" : "bg-purple-50 text-purple-700"
                }`}
              >
                {programCounts.pg}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedProgram("diploma");
                setSelectedSpecialization("");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition ${
                selectedProgram === "diploma"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50"
              }`}
            >
              <Building2 size={16} />
              <span>Diploma & Polytechnics</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                  selectedProgram === "diploma" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-800"
                }`}
              >
                {programCounts.diploma}
              </span>
            </button>
          </div>

          {/* QUICK FILTER CHIPS & SPECIALIZATION BAR */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button
              onClick={() => {
                setFilterMultiYear(!filterMultiYear);
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                filterMultiYear
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              <ShieldCheck size={14} className={filterMultiYear ? "text-white" : "text-emerald-600"} />
              <span>Multi-Year Advance Sanction</span>
              {filterMultiYear && <Check size={12} className="ml-0.5" />}
            </button>

            <button
              onClick={() => {
                setFilterNirf(!filterNirf);
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                filterNirf
                  ? "bg-amber-500 text-white border-amber-500 shadow-2xs"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              <Award size={14} className={filterNirf ? "text-white" : "text-amber-500"} />
              <span>NIRF Ranked Architecture Colleges</span>
              {filterNirf && <Check size={12} className="ml-0.5" />}
            </button>

            <button
              onClick={() => {
                setFilterActiveOnly(!filterActiveOnly);
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                filterActiveOnly
                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${filterActiveOnly ? "bg-white" : "bg-green-500"}`}></span>
              <span>Active Admissions Only</span>
              {filterActiveOnly && <Check size={12} className="ml-0.5" />}
            </button>

            {/* Dynamic Specialization Dropdown if PG or Diploma or available */}
            {availableSpecializations.length > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 hidden sm:inline">Specialization:</span>
                <select
                  value={selectedSpecialization}
                  onChange={(e) => {
                    setSelectedSpecialization(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs font-semibold bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-gray-800 focus:outline-none focus:border-black max-w-[260px] truncate"
                >
                  <option value="">
                    {selectedProgram === "pg" ? "All M.Arch Specializations (38+)" : "All Diploma Courses"}
                  </option>
                  {availableSpecializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* SIDEBAR FILTERS (DESKTOP) */}
            <aside className={`md:block ${showMobileFilters ? "block" : "hidden"} md:col-span-1 space-y-6`}>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs sticky top-24">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                    <Filter size={16} /> Filter Institutions
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Program Level Filter */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Program Level</label>
                  <select
                    value={selectedProgram}
                    onChange={(e) => {
                      setSelectedProgram(e.target.value as any);
                      setSelectedSpecialization("");
                      setCurrentPage(1);
                    }}
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-black"
                  >
                    <option value="all">All Programs ({programCounts.all})</option>
                    <option value="ug">B.Arch / UG ({programCounts.ug})</option>
                    <option value="pg">M.Arch / PG ({programCounts.pg})</option>
                    <option value="diploma">Diploma / Polytechnics ({programCounts.diploma})</option>
                  </select>
                </div>

                {/* State Filter */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedCity("");
                      setCurrentPage(1);
                    }}
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-black"
                  >
                    {MAJOR_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City / District Filter */}
                {uniqueCities.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">City / District</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-black"
                    >
                      <option value="">All Cities & Districts</option>
                      {uniqueCities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Affiliated University */}
                {uniqueUniversities.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Affiliated University
                    </label>
                    <select
                      value={selectedUniversity}
                      onChange={(e) => {
                        setSelectedUniversity(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-black"
                    >
                      <option value="">All Universities</option>
                      {uniqueUniversities.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Approved Intake Range */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Approved Seats</label>
                  <select
                    value={selectedIntakeRange}
                    onChange={(e) => {
                      setSelectedIntakeRange(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-black"
                  >
                    {INTAKE_RANGES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Academic Reporting Year Filter */}
                {uniqueAcademicYears.length > 1 && (
                  <div className="space-y-1.5 mb-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Reporting Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-black"
                    >
                      <option value="latest">Latest Year ({latestAcademicYear})</option>
                      {uniqueAcademicYears.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Statutory & Accolade Toggles */}
                <div className="pt-3 border-t border-gray-100 space-y-2 mb-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                    Accreditation & Quality
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterMultiYear}
                      onChange={(e) => {
                        setFilterMultiYear(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span>Multi-Year Advance Sanction</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterNirf}
                      onChange={(e) => {
                        setFilterNirf(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span>NIRF Ranked Architecture</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterActiveOnly}
                      onChange={(e) => {
                        setFilterActiveOnly(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span>Hide Closed Programs</span>
                  </label>
                </div>

                {/* Disclaimer note */}
                <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 leading-normal">
                  All listings are based on published Council of Architecture records.
                </div>
              </div>
            </aside>

            {/* RESULTS CONTENT */}
            <div className="md:col-span-3">
              {/* Results Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white p-4 rounded-2xl border border-gray-200">
                <div className="text-sm font-bold text-gray-900">
                  Showing <span className="text-black">{filteredInstitutions.length}</span> institutions
                  {selectedState !== "All India" && <span className="text-gray-500 font-normal"> in {selectedState}</span>}
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-black"
                  >
                    <option value="name_asc">Institution Name (A-Z)</option>
                    <option value="nirf_asc">NIRF Rank: Top First</option>
                    <option value="name_desc">Institution Name (Z-A)</option>
                    <option value="intake_desc">Intake: High to Low</option>
                    <option value="intake_asc">Intake: Low to High</option>
                    <option value="code_asc">COA Code</option>
                  </select>
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse space-y-4">
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                      <div className="h-10 bg-gray-100 rounded-xl mt-4"></div>
                    </div>
                  ))}
                </div>
              ) : paginatedInstitutions.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-xl mx-auto my-8">
                  <GraduationCap size={48} className="mx-auto text-gray-300 mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No institutions found</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {hasActiveFilters
                      ? "No institutions matched your current search or filter criteria. Try adjusting or clearing your filters."
                      : "Institution records are currently being imported from official COA sources. Check back shortly!"}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              ) : (
                /* Cards Grid */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {paginatedInstitutions.map((inst) => (
                      <InstitutionCard
                        key={inst.id}
                        institution={inst}
                        isCompared={comparedInstitutions.some((c) => c.id === inst.id)}
                        onToggleCompare={handleToggleCompare}
                        canCompare={comparedInstitutions.length < 3}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
                        onPageChange={(p) => {
                          setCurrentPage(p);
                          window.scrollTo({ top: 380, behavior: "smooth" });
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* FLOATING COMPARE BAR */}
        {comparedInstitutions.length > 0 && (
          <aside aria-label="Institution Comparison Bar" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 max-w-lg w-[92vw] border border-gray-700">
            <div className="flex-1 truncate">
              <div className="text-xs text-gray-400 font-semibold uppercase">Comparison ({comparedInstitutions.length}/3)</div>
              <div className="text-xs font-bold text-white truncate">
                {comparedInstitutions.map((c) => c.coa_code || c.institution_name).join(", ")}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="bg-white text-black px-4 py-2 rounded-xl text-xs font-extrabold hover:bg-gray-100 transition shadow-sm"
              >
                Compare Now
              </button>
              <button
                onClick={() => setComparedInstitutions([])}
                className="p-2 text-gray-400 hover:text-white transition"
                title="Clear comparison"
              >
                <X size={16} />
              </button>
            </div>
          </aside>
        )}

        {/* COMPARE MODAL */}
        <CollegeCompareModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          institutions={comparedInstitutions}
          onRemove={handleRemoveCompare}
        />
      </main>

      <Footer />
    </div>
  );
}

export default function InstitutionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-sm font-semibold text-gray-500">Loading Institutions Directory...</div>
        </div>
      }
    >
      <InstitutionsContent />
    </Suspense>
  );
}
