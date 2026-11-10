"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  ClipboardPaste,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Trash2,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Save,
  X,
  Layers,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Plus,
} from "lucide-react";

type SortField =
  | "sno"
  | "coa_code"
  | "institution_name"
  | "city"
  | "state"
  | "affiliated_university"
  | "approved_intake";

type SortDirection = "asc" | "desc";

export default function AdminInstitutionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Tabs: "import" | "manage" | "history"
  const [activeTab, setActiveTab] = useState<"import" | "manage" | "history">("manage");

  // --- TAB 1 (IMPORT) STATE ---
  const [importMode, setImportMode] = useState<"excel" | "pdf" | "paste">("excel");
  const [targetState, setTargetState] = useState("All India");
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [documentTitle, setDocumentTitle] = useState("COA Approved Institutions 2024-2025");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Extracted preview rows
  const [extractedRows, setExtractedRows] = useState<any[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<{ A: number; B: number; C: number; D: number }>({
    A: 0,
    B: 0,
    C: 0,
    D: 0,
  });
  const [filterCategory, setFilterCategory] = useState<"ALL" | "A" | "B" | "C" | "D">("ALL");
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(
    null
  );

  // --- TAB 2 (MANAGE) STATE ---
  const [liveInstitutions, setLiveInstitutions] = useState<any[]>([]);
  const [liveSearchQuery, setLiveSearchQuery] = useState("");
  const [liveStateFilter, setLiveStateFilter] = useState("ALL");
  const [liveCityFilter, setLiveCityFilter] = useState("ALL");
  const [liveYearFilter, setLiveYearFilter] = useState("ALL");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("coa_code");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Intake Editing Modal State
  const [selectedInstForIntake, setSelectedInstForIntake] = useState<any | null>(null);
  const [intakeModalList, setIntakeModalList] = useState<any[]>([]);
  const [newYearInput, setNewYearInput] = useState("");
  const [newSeatsInput, setNewSeatsInput] = useState<number | "">("");
  const [isSavingIntakes, setIsSavingIntakes] = useState(false);

  // --- TAB 3 (AUDIT HISTORY) STATE ---
  const [auditDocs, setAuditDocs] = useState<any[]>([]);

  // Check Admin Access
  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem("currentUser") || "null");
      if (!stored) {
        router.push("/");
        return;
      }
      setCurrentUser(stored);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("username", stored.username)
        .single();

      const role = (profile?.role || "").toLowerCase().replace(/[\s_]+/g, "");
      const allowed = ["superadmin", "ceo"];

      if (!allowed.includes(role)) {
        router.push("/");
        return;
      }

      setUserRole(role);
      await loadInitialData();
    } catch (e) {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    // Load live institutions with all annual records
    const { data: insts, error } = await supabase
      .from("institutions")
      .select("*, institution_annual_records(id, academic_year, course_name, approved_intake, approval_status)")
      .order("coa_code", { ascending: true })
      .range(0, 999);

    if (error) {
      console.error("Error fetching institutions:", error.message);
    }

    setLiveInstitutions(insts || []);

    // Load audit logs
    const { data: docs } = await supabase
      .from("source_documents")
      .select("*")
      .order("created_at", { ascending: false });

    setAuditDocs(docs || []);
  };

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // --- SORTING TOGGLE HANDLER ---
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Derived filter options: Unique States
  const availableStates = useMemo(() => {
    const set = new Set<string>();
    liveInstitutions.forEach((i) => {
      if (i.state) set.add(i.state.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [liveInstitutions]);

  // Derived filter options: Unique Cities (based on selected state)
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    liveInstitutions.forEach((i) => {
      if (liveStateFilter === "ALL" || (i.state && i.state.toLowerCase() === liveStateFilter.toLowerCase())) {
        const c = i.city || i.district;
        if (c) set.add(c.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [liveInstitutions, liveStateFilter]);

  // Derived filter options: All Unique Academic Years across records
  const availableAcademicYears = useMemo(() => {
    const set = new Set<string>();
    liveInstitutions.forEach((i) => {
      (i.institution_annual_records || []).forEach((r: any) => {
        if (r.academic_year) set.add(r.academic_year);
      });
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a)); // Descending e.g. 2024-2025 first
  }, [liveInstitutions]);

  // --- FILTERED & SORTED LIVE INSTITUTIONS ---
  const processedLiveInstitutions = useMemo(() => {
    const q = liveSearchQuery.toLowerCase().trim();

    // 1. Filter
    let list = liveInstitutions.filter((inst, index) => {
      // Store original serial index for S.No sort
      inst._originalIndex = index + 1;

      // State Filter
      if (liveStateFilter !== "ALL" && inst.state?.toLowerCase() !== liveStateFilter.toLowerCase()) {
        return false;
      }

      // City Filter
      if (liveCityFilter !== "ALL") {
        const c = (inst.city || inst.district || "").toLowerCase();
        if (c !== liveCityFilter.toLowerCase()) return false;
      }

      // Year Intake Filter
      if (liveYearFilter !== "ALL") {
        const hasYear = (inst.institution_annual_records || []).some(
          (r: any) => r.academic_year === liveYearFilter
        );
        if (!hasYear) return false;
      }

      // Search Query
      if (q) {
        const matchName = inst.institution_name?.toLowerCase().includes(q);
        const matchCode = inst.coa_code?.toLowerCase().includes(q);
        const matchCity = (inst.city || "").toLowerCase().includes(q);
        const matchDistrict = (inst.district || "").toLowerCase().includes(q);
        const matchState = (inst.state || "").toLowerCase().includes(q);
        const matchAffiliation = (inst.affiliated_university || "").toLowerCase().includes(q);
        const matchHead = (inst.head_of_institution || "").toLowerCase().includes(q);
        const matchEmail = (inst.official_email || "").toLowerCase().includes(q);
        return (
          matchName ||
          matchCode ||
          matchCity ||
          matchDistrict ||
          matchState ||
          matchAffiliation ||
          matchHead ||
          matchEmail
        );
      }

      return true;
    });

    // 2. Sort
    list.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "sno":
          comparison = (a._originalIndex || 0) - (b._originalIndex || 0);
          break;
        case "coa_code":
          comparison = (a.coa_code || "").localeCompare(b.coa_code || "", undefined, { numeric: true });
          break;
        case "institution_name":
          comparison = (a.institution_name || "").localeCompare(b.institution_name || "");
          break;
        case "city": {
          const cityA = a.city || a.district || "";
          const cityB = b.city || b.district || "";
          comparison = cityA.localeCompare(cityB);
          break;
        }
        case "state":
          comparison = (a.state || "").localeCompare(b.state || "");
          break;
        case "affiliated_university":
          comparison = (a.affiliated_university || "").localeCompare(b.affiliated_university || "");
          break;
        case "approved_intake": {
          const getIntake = (item: any) => {
            const records = item.institution_annual_records || [];
            if (liveYearFilter !== "ALL") {
              const r = records.find((rec: any) => rec.academic_year === liveYearFilter);
              return r ? r.approved_intake : -1;
            }
            return records.length > 0 ? records[0].approved_intake : -1;
          };
          comparison = getIntake(a) - getIntake(b);
          break;
        }
        default:
          comparison = 0;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return list;
  }, [liveInstitutions, liveSearchQuery, liveStateFilter, liveCityFilter, liveYearFilter, sortField, sortDirection]);

  // Paginated View
  const paginatedInstitutions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedLiveInstitutions.slice(start, start + pageSize);
  }, [processedLiveInstitutions, currentPage, pageSize]);

  const totalPages = Math.ceil(processedLiveInstitutions.length / pageSize) || 1;

  // --- INTAKE HISTORY MODAL ACTIONS ---
  const handleOpenIntakeModal = (inst: any) => {
    setSelectedInstForIntake(inst);
    // Sort annual records chronologically descending
    const recs = [...(inst.institution_annual_records || [])].sort((a, b) =>
      b.academic_year.localeCompare(a.academic_year)
    );
    setIntakeModalList(recs);
    setNewYearInput("");
    setNewSeatsInput("");
  };

  const handleUpdateModalIntakeSeat = (index: number, seats: number) => {
    setIntakeModalList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, approved_intake: seats } : item))
    );
  };

  const handleAddNewYearToIntakeModal = () => {
    if (!newYearInput.trim()) {
      showToast("error", "Please enter an academic year (e.g., 2025-2026)");
      return;
    }
    const seats = typeof newSeatsInput === "number" ? newSeatsInput : 0;
    const exists = intakeModalList.some(
      (r) => r.academic_year.toLowerCase() === newYearInput.trim().toLowerCase()
    );
    if (exists) {
      showToast("error", `Academic year ${newYearInput} is already present.`);
      return;
    }

    setIntakeModalList((prev) => [
      {
        academic_year: newYearInput.trim(),
        course_name: "B.Arch",
        approved_intake: seats,
        approval_status: seats > 0 ? "Approved" : "Zero Intake / Discontinued",
      },
      ...prev,
    ]);
    setNewYearInput("");
    setNewSeatsInput("");
  };

  const handleSaveIntakeModalChanges = async () => {
    if (!selectedInstForIntake) return;
    try {
      setIsSavingIntakes(true);

      for (const rec of intakeModalList) {
        const seats = typeof rec.approved_intake === "number" ? rec.approved_intake : 0;
        const status = seats > 0 ? "Approved" : "Zero Intake / Discontinued";

        await supabase.from("institution_annual_records").upsert(
          {
            institution_id: selectedInstForIntake.id,
            academic_year: rec.academic_year,
            course_name: rec.course_name || "B.Arch",
            approved_intake: seats,
            approval_status: status,
            reviewed_at: new Date().toISOString(),
          },
          { onConflict: "institution_id,academic_year,course_name" }
        );
      }

      showToast("success", `Updated intakes for ${selectedInstForIntake.institution_name}`);
      setSelectedInstForIntake(null);
      await loadInitialData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to save intakes");
    } finally {
      setIsSavingIntakes(false);
    }
  };

  // --- TAB 1: HANDLE EXTRACTION ---
  const handleExtract = async () => {
    try {
      setIsExtracting(true);
      setExtractedRows([]);

      const formData = new FormData();
      formData.append("mode", importMode);
      formData.append("state", targetState);
      formData.append("academic_year", academicYear);

      if (importMode === "paste") {
        if (!pastedText.trim()) {
          showToast("error", "Please paste text into the box before analyzing.");
          setIsExtracting(false);
          return;
        }
        formData.append("pasted_text", pastedText);
      } else {
        if (!selectedFile) {
          showToast("error", "Please select a file to upload.");
          setIsExtracting(false);
          return;
        }
        formData.append("file", selectedFile);
      }

      const res = await fetch("/api/admin/institutions/extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Extraction failed");
      }

      setExtractedRows(data.rows || []);
      setCategoryCounts(data.categoryCounts || { A: 0, B: 0, C: 0, D: 0 });
      showToast(
        "success",
        `Extracted ${data.totalExtracted} records: ${data.categoryCounts.A} new, ${data.categoryCounts.B} updates, ${data.categoryCounts.C} unchanged, ${data.categoryCounts.D} warnings.`
      );
    } catch (err: any) {
      showToast("error", err.message || "Failed to extract records");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCellChange = (id: string, field: string, value: any) => {
    setExtractedRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleRemoveRow = (id: string) => {
    setExtractedRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleConfirmImport = async () => {
    try {
      if (extractedRows.length === 0) return;
      setIsImporting(true);

      const payload = {
        documentTitle,
        sourceName: "Council of Architecture",
        academicYear,
        fileType: importMode.toUpperCase(),
        records: extractedRows,
      };

      const res = await fetch("/api/admin/institutions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Import failed");
      }

      showToast("success", data.message || "Records successfully imported into database!");
      setExtractedRows([]);
      setSelectedFile(null);
      setPastedText("");
      await loadInitialData();
      setActiveTab("manage");
    } catch (err: any) {
      showToast("error", err.message || "Failed to import records");
    } finally {
      setIsImporting(false);
    }
  };

  // Helper render sort icon
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-gray-300 group-hover:text-gray-500" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={12} className="text-black font-bold" />
    ) : (
      <ArrowDown size={12} className="text-black font-bold" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-sm font-semibold text-gray-500 flex items-center gap-2">
          <RefreshCw size={16} className="animate-spin text-black" />
          <span>Checking authorization...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* HEADER / QUICK NAV */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-black text-white rounded-xl shadow-xs">
                <GraduationCap size={22} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Institution Data Management
                </h1>
                <p className="text-xs text-gray-500">
                  National architecture college directory, multi-year intakes & COA intake management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AdminQuickMenu />
            </div>
          </div>

          {/* TABS HEADER */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-6 text-sm font-bold border-t border-gray-100">
            <button
              onClick={() => setActiveTab("manage")}
              className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
                activeTab === "manage"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              <Layers size={16} /> Live Institutions Directory ({liveInstitutions.length})
            </button>

            <button
              onClick={() => setActiveTab("import")}
              className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
                activeTab === "import"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              <UploadCloud size={16} /> Upload & Historical Intake Ingestion
              {extractedRows.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800">
                  {extractedRows.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
                activeTab === "history"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              <FileText size={16} /> Audit History ({auditDocs.length})
            </button>
          </div>
        </div>

        {/* NOTIFICATION TOAST */}
        {notification && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
            <div
              className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between border shadow-xs ${
                notification.type === "success"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : notification.type === "error"
                  ? "bg-red-50 text-red-800 border-red-200"
                  : "bg-blue-50 text-blue-800 border-blue-200"
              }`}
            >
              <span>{notification.message}</span>
              <button onClick={() => setNotification(null)} className="p-1 hover:opacity-75">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          {/* ============================================================== */}
          {/* TAB 1: LIVE INSTITUTIONS DIRECTORY (WITH ADVANCED FILTERS)     */}
          {/* ============================================================== */}
          {activeTab === "manage" && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5">
              {/* FILTER & CONTROLS TOOLBAR */}
              <div className="flex flex-col gap-4 border-b border-gray-100 pb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      Live Architectural Institutions ({processedLiveInstitutions.length} of{" "}
                      {liveInstitutions.length})
                    </h2>
                    <p className="text-xs text-gray-500">
                      Filter, sort, inspect contact information, and map annual intake seat histories
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-80">
                    <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={liveSearchQuery}
                      onChange={(e) => {
                        setLiveSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search name, code, city, university, email..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-black shadow-2xs"
                    />
                    {liveSearchQuery && (
                      <button
                        onClick={() => setLiveSearchQuery("")}
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-black"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* FILTER CONTROLS BAR: State, City, Academic Year */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <Filter size={14} /> Filters:
                  </div>

                  {/* State Filter */}
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                    <span className="text-[11px] font-semibold text-gray-400">State:</span>
                    <select
                      value={liveStateFilter}
                      onChange={(e) => {
                        setLiveStateFilter(e.target.value);
                        setLiveCityFilter("ALL"); // Reset city when state changes
                        setCurrentPage(1);
                      }}
                      className="text-xs font-bold bg-transparent text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All States ({availableStates.length})</option>
                      {availableStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City Filter */}
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                    <span className="text-[11px] font-semibold text-gray-400">City / District:</span>
                    <select
                      value={liveCityFilter}
                      onChange={(e) => {
                        setLiveCityFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="text-xs font-bold bg-transparent text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Cities ({availableCities.length})</option>
                      {availableCities.map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Academic Year Filter */}
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                    <span className="text-[11px] font-semibold text-gray-400">Intake Year:</span>
                    <select
                      value={liveYearFilter}
                      onChange={(e) => {
                        setLiveYearFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="text-xs font-bold bg-transparent text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Years Overview</option>
                      {availableAcademicYears.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reset Filters */}
                  {(liveStateFilter !== "ALL" ||
                    liveCityFilter !== "ALL" ||
                    liveYearFilter !== "ALL" ||
                    liveSearchQuery) && (
                    <button
                      onClick={() => {
                        setLiveStateFilter("ALL");
                        setLiveCityFilter("ALL");
                        setLiveYearFilter("ALL");
                        setLiveSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1 ml-auto"
                    >
                      <X size={12} /> Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {/* TABLE CONTAINER */}
              <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 font-bold uppercase tracking-wider text-gray-500">
                    <tr>
                      {/* S.No */}
                      <th
                        onClick={() => handleSort("sno")}
                        className="p-3 w-14 cursor-pointer select-none hover:bg-gray-100 group transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>#</span>
                          {renderSortIndicator("sno")}
                        </div>
                      </th>

                      {/* COA Code */}
                      <th
                        onClick={() => handleSort("coa_code")}
                        className="p-3 w-28 cursor-pointer select-none hover:bg-gray-100 group transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>COA Code</span>
                          {renderSortIndicator("coa_code")}
                        </div>
                      </th>

                      {/* College / Institution Name */}
                      <th
                        onClick={() => handleSort("institution_name")}
                        className="p-3 min-w-[240px] cursor-pointer select-none hover:bg-gray-100 group transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>Institution Name</span>
                          {renderSortIndicator("institution_name")}
                        </div>
                      </th>

                      {/* City */}
                      <th
                        onClick={() => handleSort("city")}
                        className="p-3 min-w-[120px] cursor-pointer select-none hover:bg-gray-100 group transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>City / District</span>
                          {renderSortIndicator("city")}
                        </div>
                      </th>

                      {/* State */}
                      <th
                        onClick={() => handleSort("state")}
                        className="p-3 min-w-[120px] cursor-pointer select-none hover:bg-gray-100 group transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>State</span>
                          {renderSortIndicator("state")}
                        </div>
                      </th>

                      {/* Affiliation */}
                      <th
                        onClick={() => handleSort("affiliated_university")}
                        className="p-3 min-w-[180px] cursor-pointer select-none hover:bg-gray-100 group transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>Affiliated University</span>
                          {renderSortIndicator("affiliated_university")}
                        </div>
                      </th>

                      {/* Annual Intakes */}
                      <th
                        onClick={() => handleSort("approved_intake")}
                        className="p-3 min-w-[200px] cursor-pointer select-none hover:bg-gray-100 group transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>
                            {liveYearFilter === "ALL" ? "Annual Intakes (History)" : `${liveYearFilter} Intake`}
                          </span>
                          {renderSortIndicator("approved_intake")}
                        </div>
                      </th>

                      {/* Contact & Profile */}
                      <th className="p-3 min-w-[160px]">Contact Info</th>

                      {/* Actions */}
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedInstitutions.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-gray-400">
                          No institutions match your search and filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedInstitutions.map((inst) => {
                        const records = inst.institution_annual_records || [];
                        const sortedRecords = [...records].sort((a, b) =>
                          b.academic_year.localeCompare(a.academic_year)
                        );

                        return (
                          <tr key={inst.id} className="hover:bg-gray-50/70 transition font-medium">
                            {/* S.No */}
                            <td className="p-3 text-gray-400 font-mono text-[11px]">
                              {inst._originalIndex || "—"}
                            </td>

                            {/* COA Code */}
                            <td className="p-3 font-mono font-bold text-gray-900">
                              <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-800">
                                {inst.coa_code || "—"}
                              </span>
                            </td>

                            {/* College Name & Head */}
                            <td className="p-3">
                              <div className="font-bold text-gray-900">{inst.institution_name}</div>
                              {inst.head_of_institution && (
                                <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                                  {inst.head_of_institution}
                                </div>
                              )}
                              <div className="text-[10px] text-gray-400 font-mono">/{inst.slug}</div>
                            </td>

                            {/* City */}
                            <td className="p-3 text-gray-700">
                              {inst.city || inst.district || "—"}
                            </td>

                            {/* State */}
                            <td className="p-3">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-100">
                                {inst.state || "All India"}
                              </span>
                            </td>

                            {/* Affiliation */}
                            <td className="p-3 text-gray-600 text-[11px] max-w-[200px] truncate" title={inst.affiliated_university}>
                              {inst.affiliated_university || "—"}
                            </td>

                            {/* Annual Intakes */}
                            <td className="p-3">
                              {liveYearFilter !== "ALL" ? (
                                (() => {
                                  const r = sortedRecords.find((rec) => rec.academic_year === liveYearFilter);
                                  return r ? (
                                    <span
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                        r.approved_intake > 0
                                          ? "bg-green-50 text-green-800 border-green-200"
                                          : "bg-red-50 text-red-700 border-red-200"
                                      }`}
                                    >
                                      {r.approved_intake > 0 ? `${r.approved_intake} seats` : "Zero Intake"}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 italic">Not reported</span>
                                  );
                                })()
                              ) : sortedRecords.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-1 max-w-[240px]">
                                  {sortedRecords.slice(0, 4).map((rec: any) => {
                                    const shortYr = rec.academic_year.replace("20", "").replace("-20", "-");
                                    return (
                                      <span
                                        key={rec.id || rec.academic_year}
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                          rec.approved_intake > 0
                                            ? "bg-gray-50 text-gray-800 border-gray-200"
                                            : "bg-red-50 text-red-700 border-red-200"
                                        }`}
                                        title={`${rec.academic_year}: ${rec.approved_intake} seats (${rec.approval_status})`}
                                      >
                                        {shortYr}: {rec.approved_intake}
                                      </span>
                                    );
                                  })}
                                  {sortedRecords.length > 4 && (
                                    <span className="text-[10px] text-gray-400 font-bold">
                                      +{sortedRecords.length - 4} more
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>

                            {/* Contact Details */}
                            <td className="p-3 text-[11px] text-gray-600 space-y-0.5">
                              {inst.official_email && (
                                <div className="flex items-center gap-1 truncate max-w-[160px]" title={inst.official_email}>
                                  <Mail size={11} className="text-gray-400 shrink-0" />
                                  <a href={`mailto:${inst.official_email}`} className="hover:underline">
                                    {inst.official_email}
                                  </a>
                                </div>
                              )}
                              {inst.official_phone && (
                                <div className="flex items-center gap-1 truncate max-w-[160px]">
                                  <Phone size={11} className="text-gray-400 shrink-0" />
                                  <span>{inst.official_phone}</span>
                                </div>
                              )}
                              {inst.website && (
                                <div className="flex items-center gap-1 truncate max-w-[160px]">
                                  <Globe size={11} className="text-gray-400 shrink-0" />
                                  <a
                                    href={inst.website.startsWith("http") ? inst.website : `http://${inst.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline truncate"
                                  >
                                    {inst.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                                  </a>
                                </div>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenIntakeModal(inst)}
                                className="px-2 py-1 text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-black hover:text-white rounded-lg transition"
                                title="Manage Annual Intakes"
                              >
                                Intakes
                              </button>
                              <a
                                href={`/institutions/${inst.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 p-1 text-gray-500 hover:text-black transition"
                                title="View Public Profile"
                              >
                                <ExternalLink size={14} />
                              </a>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION TOOLBAR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs text-gray-600 font-medium">
                <div className="flex items-center gap-2">
                  <span>Showing</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 font-bold text-gray-800"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                  </select>
                  <span>
                    records per page (Total {processedLiveInstitutions.length} institutions)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 font-bold hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    Previous
                  </button>
                  <span className="font-bold text-gray-900">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 font-bold hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: INTAKE EDITING MODAL                                    */}
          {/* ============================================================== */}
          {selectedInstForIntake && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-800 border">
                        {selectedInstForIntake.coa_code}
                      </span>
                      <h3 className="font-bold text-base text-gray-900">
                        {selectedInstForIntake.institution_name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Manage year-by-year approved seats and map new intake years
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedInstForIntake(null)}
                    className="p-1 text-gray-400 hover:text-black"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* ADD NEW YEAR INTAKE ROW */}
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-2">
                  <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                    <Plus size={12} /> Map Another Year's Intake (Future / Past)
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 2025-2026"
                      value={newYearInput}
                      onChange={(e) => setNewYearInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl font-mono"
                    />
                    <input
                      type="number"
                      placeholder="Seats (e.g. 80)"
                      value={newSeatsInput}
                      onChange={(e) =>
                        setNewSeatsInput(e.target.value === "" ? "" : parseInt(e.target.value, 10))
                      }
                      className="w-28 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl font-bold"
                    />
                    <button
                      onClick={handleAddNewYearToIntakeModal}
                      className="px-3 py-1.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* EXISTING ANNUAL RECORDS LIST */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Existing Mapped Intakes
                  </div>
                  {intakeModalList.length === 0 ? (
                    <div className="text-xs text-gray-400 italic py-2">No intakes mapped yet.</div>
                  ) : (
                    intakeModalList.map((rec, i) => (
                      <div
                        key={rec.academic_year}
                        className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                      >
                        <div className="font-mono font-bold text-gray-900">{rec.academic_year}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-[11px]">Approved Seats:</span>
                          <input
                            type="number"
                            value={rec.approved_intake ?? 0}
                            onChange={(e) =>
                              handleUpdateModalIntakeSeat(i, parseInt(e.target.value, 10) || 0)
                            }
                            className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-xs font-bold text-right"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* MODAL ACTIONS */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedInstForIntake(null)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveIntakeModalChanges}
                    disabled={isSavingIntakes}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 disabled:opacity-40 transition"
                  >
                    {isSavingIntakes ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    <span>Save All Changes</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: BULK UPLOAD & AI EXTRACTION                             */}
          {/* ============================================================== */}
          {activeTab === "import" && (
            <div className="space-y-6">
              {/* UPLOAD FORM CARD */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Source Document & Intake Year Ingestion</h2>
                    <p className="text-xs text-gray-500">
                      Import single-year or multi-year intakes (Excel, PDF, or text table) without overwriting past years
                    </p>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-start sm:self-auto text-xs font-bold">
                    <button
                      onClick={() => setImportMode("excel")}
                      className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                        importMode === "excel" ? "bg-white text-black shadow-xs" : "text-gray-600 hover:text-black"
                      }`}
                    >
                      <FileSpreadsheet size={14} /> Excel / CSV
                    </button>
                    <button
                      onClick={() => setImportMode("pdf")}
                      className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                        importMode === "pdf" ? "bg-white text-black shadow-xs" : "text-gray-600 hover:text-black"
                      }`}
                    >
                      <FileText size={14} /> Official PDF
                    </button>
                    <button
                      onClick={() => setImportMode("paste")}
                      className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                        importMode === "paste" ? "bg-white text-black shadow-xs" : "text-gray-600 hover:text-black"
                      }`}
                    >
                      <ClipboardPaste size={14} /> Copy-Paste
                    </button>
                  </div>
                </div>

                {/* Document Metadata Form */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Target State</label>
                    <select
                      value={targetState}
                      onChange={(e) => setTargetState(e.target.value)}
                      className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:border-black"
                    >
                      <option value="All India">All India / National</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Target Academic Year</label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      placeholder="e.g. 2025-2026 or 2024-2025"
                      className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Document Reference / Title</label>
                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="e.g. COA Approved Institutions List 2024-2025"
                      className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Input Area (Dropzone or Textarea) */}
                {importMode === "paste" ? (
                  <div className="space-y-2 mb-6">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Paste Data Table / Text
                    </label>
                    <textarea
                      rows={6}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste tabular rows from PDF or spreadsheet here..."
                      className="w-full p-4 text-xs font-mono bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-black"
                    />
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="border-2 border-dashed border-gray-200 hover:border-black rounded-2xl p-8 text-center transition bg-gray-50/50">
                      <input
                        type="file"
                        id="institution-file"
                        accept={importMode === "excel" ? ".xlsx, .xls, .csv" : ".pdf"}
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <label htmlFor="institution-file" className="cursor-pointer block space-y-2">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-xs border border-gray-200 flex items-center justify-center mx-auto text-gray-600">
                          {importMode === "excel" ? <FileSpreadsheet size={24} /> : <FileText size={24} />}
                        </div>
                        <div className="text-xs font-bold text-gray-900">
                          {selectedFile ? selectedFile.name : `Click or drag your ${importMode.toUpperCase()} file here`}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {importMode === "excel" ? "Supports .xlsx, .csv multi-year tables" : "Official Council of Architecture PDF list"}
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Analyze Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleExtract}
                    disabled={isExtracting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition disabled:opacity-40 shadow-xs"
                  >
                    {isExtracting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Analyzing & Reconciling Document...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Extract & Reconcile Intakes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* REVIEW GRID */}
              {extractedRows.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        Staged Reconciliation Grid ({extractedRows.length} colleges parsed)
                      </h2>
                      <p className="text-xs text-gray-500">
                        Review detected seats mapped to academic year {academicYear} before saving to database
                      </p>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                      <button
                        onClick={() => setFilterCategory("ALL")}
                        className={`px-3 py-1.5 rounded-lg transition ${
                          filterCategory === "ALL" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:text-black"
                        }`}
                      >
                        All ({extractedRows.length})
                      </button>
                      <button
                        onClick={() => setFilterCategory("A")}
                        className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                          filterCategory === "A" ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        A: New ({categoryCounts.A})
                      </button>
                      <button
                        onClick={() => setFilterCategory("B")}
                        className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                          filterCategory === "B" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        }`}
                      >
                        B: Updates ({categoryCounts.B})
                      </button>
                      <button
                        onClick={() => setFilterCategory("C")}
                        className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                          filterCategory === "C" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        C: Same ({categoryCounts.C})
                      </button>
                      <button
                        onClick={() => setFilterCategory("D")}
                        className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                          filterCategory === "D" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        D: Warnings ({categoryCounts.D})
                      </button>
                    </div>
                  </div>

                  {/* Review Table */}
                  <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200 font-bold uppercase tracking-wider text-gray-500">
                        <tr>
                          <th className="p-3 w-10">Cat</th>
                          <th className="p-3 w-28">COA Code</th>
                          <th className="p-3">College Name</th>
                          <th className="p-3">City / District</th>
                          <th className="p-3">State</th>
                          <th className="p-3">Affiliation</th>
                          <th className="p-3">Target Year Intake</th>
                          <th className="p-3">Diff / Audit Note</th>
                          <th className="p-3 text-center w-12">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {extractedRows
                          .filter((r) => filterCategory === "ALL" || r.category === filterCategory)
                          .map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50/70 transition">
                              <td className="p-3">
                                <span
                                  className={`inline-block w-6 h-6 rounded-md text-center leading-6 font-extrabold text-[10px] ${
                                    row.category === "A"
                                      ? "bg-green-100 text-green-800"
                                      : row.category === "B"
                                      ? "bg-blue-100 text-blue-800"
                                      : row.category === "C"
                                      ? "bg-gray-100 text-gray-600"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {row.category}
                                </span>
                              </td>
                              <td className="p-2 font-mono font-bold">
                                <input
                                  type="text"
                                  value={row.coa_code || ""}
                                  onChange={(e) => handleCellChange(row.id, "coa_code", e.target.value)}
                                  className="w-full p-1.5 uppercase font-mono font-bold bg-transparent border border-transparent hover:border-gray-300 focus:border-black rounded focus:bg-white"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.institution_name || ""}
                                  onChange={(e) => handleCellChange(row.id, "institution_name", e.target.value)}
                                  className="w-full p-1.5 font-semibold bg-transparent border border-transparent hover:border-gray-300 focus:border-black rounded focus:bg-white"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.city || row.district || ""}
                                  onChange={(e) => handleCellChange(row.id, "city", e.target.value)}
                                  className="w-full p-1.5 bg-transparent border border-transparent hover:border-gray-300 focus:border-black rounded focus:bg-white"
                                  placeholder="City"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.state || targetState}
                                  onChange={(e) => handleCellChange(row.id, "state", e.target.value)}
                                  className="w-full p-1.5 bg-transparent border border-transparent hover:border-gray-300 focus:border-black rounded focus:bg-white"
                                  placeholder="State"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.affiliated_university || ""}
                                  onChange={(e) => handleCellChange(row.id, "affiliated_university", e.target.value)}
                                  className="w-full p-1.5 bg-transparent border border-transparent hover:border-gray-300 focus:border-black rounded focus:bg-white"
                                  placeholder="University"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={row.approved_intake ?? 0}
                                  onChange={(e) =>
                                    handleCellChange(row.id, "approved_intake", parseInt(e.target.value, 10) || 0)
                                  }
                                  className="w-24 p-1.5 font-bold text-gray-900 bg-transparent border border-transparent hover:border-gray-300 focus:border-black rounded focus:bg-white"
                                />
                              </td>
                              <td className="p-2.5 text-[11px] leading-tight">
                                {row.diffDetails ? (
                                  <div className="text-blue-700 font-semibold">{row.diffDetails.message}</div>
                                ) : row.category === "A" ? (
                                  <div className="text-green-700 font-semibold">New Institution</div>
                                ) : row.category === "C" ? (
                                  <div className="text-gray-500">Intake unchanged</div>
                                ) : (
                                  <div className="text-amber-700 font-semibold">
                                    {row.warnings?.join(", ") || "Review required"}
                                  </div>
                                )}
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  onClick={() => handleRemoveRow(row.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 rounded transition"
                                  title="Discard row from import"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Commit Action Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setExtractedRows([])}
                      className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-100 transition"
                    >
                      Discard Batch
                    </button>

                    <button
                      onClick={handleConfirmImport}
                      disabled={isImporting || extractedRows.length === 0}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition disabled:opacity-40 shadow-xs"
                    >
                      {isImporting ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Saving to Supabase...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Approve & Save {extractedRows.length} Records to Directory</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: AUDIT HISTORY                                           */}
          {/* ============================================================== */}
          {activeTab === "history" && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900">Document Upload & Audit Logs</h2>
                <p className="text-xs text-gray-500">
                  Traceable log of all imported official COA PDFs, Excel files, and timestamps
                </p>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 font-bold uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Document Title</th>
                      <th className="p-3">Source Org</th>
                      <th className="p-3">Reporting Year</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Extracted</th>
                      <th className="p-3">Imported</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {auditDocs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-400">
                          No document imports logged yet.
                        </td>
                      </tr>
                    ) : (
                      auditDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50/70 transition font-medium">
                          <td className="p-3 text-gray-500">
                            {new Date(doc.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-3 font-bold text-gray-900">{doc.document_title}</td>
                          <td className="p-3 text-gray-600">{doc.source_name}</td>
                          <td className="p-3 font-mono text-gray-900">{doc.academic_year}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-gray-100 text-gray-700">
                              {doc.file_type}
                            </span>
                          </td>
                          <td className="p-3">{doc.total_records_extracted}</td>
                          <td className="p-3 font-bold text-green-700">{doc.total_records_imported}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                              {doc.processing_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
