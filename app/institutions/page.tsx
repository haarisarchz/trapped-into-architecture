"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import InstitutionCard from "@/components/institutions/InstitutionCard";
import CollegeCompareModal from "@/components/institutions/CollegeCompareModal";
import PaginationControls from "@/components/PaginationControls";
import dynamic from "next/dynamic";
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
  LayoutGrid,
  Map as MapIcon,
} from "lucide-react";

const InstitutionsMapView = dynamic(
  () => import("@/components/institutions/InstitutionsMapView"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[750px] w-full rounded-3xl bg-gray-100 animate-pulse flex flex-col items-center justify-center text-gray-400 gap-3 border border-gray-200">
        <div className="w-10 h-10 rounded-full border-2 border-black border-t-transparent animate-spin" />
        <span className="text-sm font-semibold text-gray-600">Loading Interactive India Architecture Map...</span>
      </div>
    ),
  }
);

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
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "nirf_asc");
  const [selectedProgram, setSelectedProgram] = useState<"all" | "ug" | "pg" | "diploma">(
    (searchParams.get("program") as any) || "all"
  );
  const [selectedSpecialization, setSelectedSpecialization] = useState(searchParams.get("specialization") || "");
  const [filterMultiYear, setFilterMultiYear] = useState(searchParams.get("multiYear") === "true");
  const [filterNirf, setFilterNirf] = useState(searchParams.get("nirf") === "true");
  const [filterActiveOnly, setFilterActiveOnly] = useState(searchParams.get("activeOnly") === "true");
  const [viewMode, setViewMode] = useState<"split" | "grid">(
    (searchParams.get("view") as any) === "grid" ? "grid" : "split"
  );

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
    if (viewMode === "grid") params.set("view", "grid");

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
    viewMode,
    router,
  ]);

  // Derived filter options
  const allStatesList = useMemo(() => {
    const map = new Map<string, string>();
    institutions.forEach((i) => {
      const s = (i.state || "").trim();
      if (!s) return;
      const lower = s.toLowerCase();
      if (lower === "all india" || lower === "india") return;
      if (!map.has(lower)) {
        // Format to clean title case if all uppercase
        const isUpper = s === s.toUpperCase() && s.length > 3;
        const cleanName = isUpper
          ? s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
          : s;
        map.set(lower, cleanName);
      }
    });
    const sorted = Array.from(map.values()).sort((a, b) => a.localeCompare(b));
    return ["All India", ...sorted];
  }, [institutions]);

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
    setSortBy("nirf_asc");
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
        {/* HYBRID A: COMPACT ARCHITECTURAL COMMAND BAR (~125px) */}
        <section className="bg-zinc-950 text-white border-b border-zinc-800 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 space-y-3">
            {/* ROW 1: Branding/Title + Compact Search + State Dropdown */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-base shrink-0 shadow-sm">
                  🏛️
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-tight">
                      Architecture Institutions in India
                    </h1>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10 shrink-0">
                      COA National Directory
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    <span className="text-amber-400 font-bold">{institutions.length || 583}</span> Accredited Colleges &bull;{" "}
                    <span className="text-white font-medium">3,014</span> Verified Annual Logs &bull;{" "}
                    <span className="text-emerald-400 font-medium">{latestAcademicYear} Statutory Session</span>
                  </p>
                </div>
              </div>

              {/* Integrated Search Bar + State Select */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative flex-1 sm:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search college, COA code, city..."
                    className="w-full bg-zinc-900 text-white placeholder-gray-400 text-xs sm:text-sm pl-9 pr-8 py-2 rounded-xl border border-zinc-700/80 focus:outline-none focus:border-amber-400 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-white transition"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCity("");
                    setCurrentPage(1);
                  }}
                  className="bg-zinc-900 text-white text-xs sm:text-sm px-3 py-2 rounded-xl border border-zinc-700/80 focus:outline-none focus:border-amber-400 font-medium shrink-0 cursor-pointer max-w-[160px] truncate"
                >
                  {allStatesList.map((st) => (
                    <option key={st} value={st} className="bg-zinc-900 text-white">
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ROW 2: Program Level Tabs + Accolade Chips + View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1.5 border-t border-zinc-800/80 text-xs">
              {/* Program Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => {
                    setSelectedProgram("all");
                    setSelectedSpecialization("");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 flex items-center gap-1.5 ${
                    selectedProgram === "all"
                      ? "bg-white text-black shadow-xs"
                      : "bg-zinc-900 text-gray-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <span>All</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedProgram === "all" ? "bg-black/10 text-black font-bold" : "bg-zinc-800 text-gray-400"
                  }`}>
                    {programCounts.all}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSelectedProgram("ug");
                    setSelectedSpecialization("");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 flex items-center gap-1.5 ${
                    selectedProgram === "ug"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-zinc-900 text-gray-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <GraduationCap size={13} />
                  <span>B.Arch (UG)</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedProgram === "ug" ? "bg-white/20 text-white font-bold" : "bg-zinc-800 text-gray-400"
                  }`}>
                    {programCounts.ug}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSelectedProgram("pg");
                    setSelectedSpecialization("");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 flex items-center gap-1.5 ${
                    selectedProgram === "pg"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-zinc-900 text-gray-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <BookOpen size={13} />
                  <span>M.Arch (PG)</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedProgram === "pg" ? "bg-white/20 text-white font-bold" : "bg-zinc-800 text-gray-400"
                  }`}>
                    {programCounts.pg}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSelectedProgram("diploma");
                    setSelectedSpecialization("");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 flex items-center gap-1.5 ${
                    selectedProgram === "diploma"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-zinc-900 text-gray-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <Building2 size={13} />
                  <span>Diploma</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedProgram === "diploma" ? "bg-white/20 text-white font-bold" : "bg-zinc-800 text-gray-400"
                  }`}>
                    {programCounts.diploma}
                  </span>
                </button>
              </div>

              {/* Accolade Chips & View Switcher */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none justify-between sm:justify-end">
                {/* NIRF Chip */}
                <button
                  onClick={() => {
                    setFilterNirf(!filterNirf);
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                    filterNirf
                      ? "bg-amber-400 text-black border-amber-300 shadow-xs font-black"
                      : "bg-zinc-900 text-gray-300 border-zinc-700/80 hover:bg-zinc-800"
                  }`}
                >
                  <Award size={13} className={filterNirf ? "text-black" : "text-amber-400"} />
                  <span>NIRF Ranked (46)</span>
                </button>

                {/* Multi-Year Sanction */}
                <button
                  onClick={() => {
                    setFilterMultiYear(!filterMultiYear);
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                    filterMultiYear
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-xs font-black"
                      : "bg-zinc-900 text-gray-300 border-zinc-700/80 hover:bg-zinc-800"
                  }`}
                >
                  <ShieldCheck size={13} className={filterMultiYear ? "text-white" : "text-emerald-400"} />
                  <span>Multi-Year</span>
                </button>

                {/* View Switcher: Split Explorer vs Grid */}
                <div className="flex items-center p-0.5 bg-zinc-900 rounded-lg border border-zinc-700/80 shrink-0 ml-1">
                  <button
                    onClick={() => setViewMode("split")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition ${
                      viewMode === "split"
                        ? "bg-amber-400 text-black shadow-xs font-extrabold"
                        : "text-gray-300 hover:text-white"
                    }`}
                    title="Split-Screen Explorer: Colleges List + Live India Map"
                  >
                    <MapIcon size={12} />
                    <span>Split Explorer</span>
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition ${
                      viewMode === "grid"
                        ? "bg-white text-black shadow-xs font-extrabold"
                        : "text-gray-300 hover:text-white"
                    }`}
                    title="Classic Grid Directory Cards"
                  >
                    <LayoutGrid size={12} />
                    <span>Grid</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BODY CONTAINER */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
          {viewMode === "split" ? (
            /* ================= VIEW 1: SPLIT-SCREEN EXPLORER (DEFAULT) ================= */
            <div>
              {loading ? (
                <div className="h-[calc(100vh-220px)] min-h-[650px] w-full rounded-3xl bg-gray-100 animate-pulse flex flex-col items-center justify-center text-gray-400 gap-3 border border-gray-200">
                  <div className="w-10 h-10 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span className="text-sm font-semibold text-gray-600">Loading Architecture Directory & India Map...</span>
                </div>
              ) : (
                <InstitutionsMapView
                  institutions={sortedInstitutions}
                  selectedProgram={selectedProgram}
                />
              )}
            </div>
          ) : (
            /* ================= VIEW 2: FULL DIRECTORY GRID ================= */
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
                      {allStatesList.map((st) => (
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

              {/* RESULTS CONTENT (GRID) */}
              <div className="md:col-span-3">
                {/* Results Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white p-4 rounded-2xl border border-gray-200">
                  <div className="text-sm font-bold text-gray-900">
                    Showing <span className="text-black">{filteredInstitutions.length}</span> institutions
                    {selectedState !== "All India" && <span className="text-gray-500 font-normal"> in {selectedState}</span>}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* View Mode Switcher */}
                    <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200">
                      <button
                        onClick={() => setViewMode("split")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          viewMode === "split"
                            ? "bg-black text-white shadow-2xs"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                        title="Split Explorer (Map + Colleges)"
                      >
                        <MapIcon size={13} />
                        <span>Split Explorer</span>
                      </button>
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          viewMode === "grid"
                            ? "bg-black text-white shadow-2xs"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                        title="Grid Cards View"
                      >
                        <LayoutGrid size={13} />
                        <span>Grid</span>
                      </button>
                    </div>

                    {/* Sort selector */}
                    <div className="flex items-center gap-2">
                      <ArrowUpDown size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500 font-medium">Sort:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-black"
                      >
                        <option value="nirf_asc">NIRF Rank: Top First</option>
                        <option value="name_asc">Institution Name (A-Z)</option>
                        <option value="name_desc">Institution Name (Z-A)</option>
                        <option value="intake_desc">Intake: High to Low</option>
                        <option value="intake_asc">Intake: Low to High</option>
                        <option value="code_asc">COA Code</option>
                      </select>
                    </div>
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
                            window.scrollTo({ top: 120, behavior: "smooth" });
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
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
