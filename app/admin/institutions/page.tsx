"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  AlertCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

type SortField =
  | "sno"
  | "coa_code"
  | "institution_name"
  | "city"
  | "state"
  | "affiliated_university"
  | "establishment_year"
  | "status"
  | "official_email"
  | "official_phone"
  | "website"
  | string;

type SortDirection = "asc" | "desc";

// Helper: get course category (B.Arch, M.Arch, Diploma)
function getCourseCategory(courseName: string | null | undefined): "B.Arch" | "M.Arch" | "Diploma" {
  if (!courseName) return "B.Arch";
  if (courseName.startsWith("M.Arch") || courseName.includes("Master")) return "M.Arch";
  if (courseName.includes("Diploma")) return "Diploma";
  return "B.Arch";
}

// Helper: parse multi-value strings and format with comma
function formatSeparatedValues(val: string | null | undefined): string {
  if (!val) return "";
  const parts = val
    .split(/[,;\n/]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.join(", ");
}

// Helper: get first URL for website href
function getFirstUrl(val: string | null | undefined): string {
  if (!val) return "";
  const first = val.split(/[,;\s\n/]+/)[0].trim();
  if (!first) return "";
  return first.startsWith("http") ? first : `http://${first}`;
}

export default function AdminInstitutionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Tabs: "manage" | "import" | "history"
  const [activeTab, setActiveTab] = useState<"manage" | "import" | "history">("manage");

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
  const [liveProgramFilter, setLiveProgramFilter] = useState("ALL");
  const [liveStatusFilter, setLiveStatusFilter] = useState<"ALL" | "ACTIVE" | "CLOSED" | "PROGRESSIVE">("ALL");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("coa_code");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Modal: Edit Details, Status & Annual Intakes
  const [selectedInstForEdit, setSelectedInstForEdit] = useState<any | null>(null);
  const [modalFormData, setModalFormData] = useState({
    institution_name: "",
    establishment_year: "",
    is_closed: false,
    closure_year: "",
    official_email: "",
    official_phone: "",
    website: "",
    affiliated_university: "",
    city: "",
    state: "",
  });
  const [modalIntakeList, setModalIntakeList] = useState<any[]>([]);
  const [newCourseInput, setNewCourseInput] = useState<"B.Arch" | "M.Arch" | "Diploma">("B.Arch");
  const [newYearInput, setNewYearInput] = useState("");
  const [newSeatsInput, setNewSeatsInput] = useState<number | "">("");
  const [isSavingModal, setIsSavingModal] = useState(false);

  // Course Column Visibility Filter: ALL, B.Arch, M.Arch, Diploma
  const [courseColumnFilter, setCourseColumnFilter] = useState<"ALL" | "B.Arch" | "M.Arch" | "Diploma">("ALL");

  // Synchronized Table Horizontal Scrollbar Refs
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const [tableScrollWidth, setTableScrollWidth] = useState(2600);

  const handleTableScroll = () => {
    if (tableScrollRef.current && topScrollRef.current) {
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
    }
  };

  const handleTopScroll = () => {
    if (tableScrollRef.current && topScrollRef.current) {
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const scrollTableBy = (delta: number) => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
    }
  };

  // Dynamically update scrollable width
  useEffect(() => {
    if (tableScrollRef.current) {
      setTableScrollWidth(tableScrollRef.current.scrollWidth || 2600);
    }
  }, [liveInstitutions, courseColumnFilter, pageSize]);

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
    // Load live institutions with all annual records and NIRF rankings
    const { data: insts, error } = await supabase
      .from("institutions")
      .select("*, institution_annual_records(id, academic_year, course_name, approved_intake, approval_status, source_reference), institution_rankings(ranking_year, rank_number, ranking_body)")
      .order("coa_code", { ascending: true, nullsFirst: false })
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

  // Helper: Detect closure/termination & progressive closure information
  const getClosureInfo = (inst: any) => {
    // 1. Check for Progressive Closure
    if (inst.institution_type && /progressive closure/i.test(inst.institution_type)) {
      const yrMatch = inst.institution_type.match(/(\d{4}[-–_]\d{4}|\b20\d\d\b)/);
      const shortYr = yrMatch ? yrMatch[1].replace(/^20/, "").replace(/[-–_]20/, "-") : "26-27";
      return {
        isClosed: false,
        isProgressive: true,
        year: shortYr,
        label: `Prog. Closure (${shortYr})`,
      };
    }

    // 2. Check records for Progressive Closure
    const records = inst.institution_annual_records || [];
    const hasProgressiveRec = records.some((r: any) => /progressive closure/i.test(r.approval_status || ""));
    if (hasProgressiveRec) {
      return {
        isClosed: false,
        isProgressive: true,
        year: "26-27",
        label: "Prog. Closure (26-27)",
      };
    }

    // 3. Full Closure
    if (inst.institution_type && /closed|terminated|discontinued/i.test(inst.institution_type)) {
      const yrMatch = inst.institution_type.match(/(\d{4}[-–_]\d{4}|\b\d{4}\b)/);
      const labelYr = yrMatch ? yrMatch[1].replace(/^20/, "").replace(/[-–_]20/, "-") : null;
      return {
        isClosed: true,
        isProgressive: false,
        year: yrMatch ? yrMatch[1] : null,
        label: labelYr ? `Closed (${labelYr})` : "Closed / Terminated",
      };
    }

    if (records.length > 0) {
      const sorted = [...records].sort((a: any, b: any) => b.academic_year.localeCompare(a.academic_year));
      const latest = sorted[0];
      const isLatestZero =
        latest.approved_intake === 0 ||
        /zero|discontinued|withdrawn/i.test(latest.approval_status || "");

      if (isLatestZero) {
        const shortYr = (latest.academic_year || "").replace(/^20/, "").replace(/[-–_]20/, "-");
        return {
          isClosed: true,
          isProgressive: false,
          year: latest.academic_year,
          label: `Zero Intake (${shortYr})`,
        };
      }
    }

    return {
      isClosed: false,
      isProgressive: false,
      year: null,
      label: "Active",
    };
  };

  // Recognized COA Courses: B.Arch (UG), M.Arch (PG/Masters), Diploma
  const COA_COURSES = useMemo(
    () => [
      { id: "B.Arch", label: "B.Arch", tag: "UG", badge: "bg-blue-50 text-blue-700 border-blue-200" },
      { id: "M.Arch", label: "M.Arch", tag: "PG", badge: "bg-purple-50 text-purple-700 border-purple-200" },
      { id: "Diploma", label: "Diploma", tag: "Dip", badge: "bg-amber-50 text-amber-700 border-amber-200" },
    ],
    []
  );

  // --- DERIVED INTAKE YEARS LIST (SEPARATE COLUMNS) ---
  const allDistinctIntakeYears = useMemo(() => {
    const set = new Set<string>();
    liveInstitutions.forEach((i) => {
      (i.institution_annual_records || []).forEach((r: any) => {
        if (r.academic_year) set.add(r.academic_year.trim());
      });
    });
    // Ensure the standard academic sessions are always present
    ["2026-2027", "2025-2026", "2024-2025", "2023-2024", "2022-2023", "2021-2022", "2020-2021"].forEach((y) => set.add(y));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [liveInstitutions]);

  // Derived Active Intake Columns for Table
  const activeIntakeColumns = useMemo(() => {
    const cols: {
      course: string;
      courseLabel: string;
      tag: string;
      badge: string;
      year: string;
      shortYear: string;
      key: string;
    }[] = [];

    COA_COURSES.forEach((c) => {
      if (courseColumnFilter === "ALL" || courseColumnFilter === c.id) {
        allDistinctIntakeYears.forEach((yr) => {
          const shortYear = yr.replace(/^20/, "").replace(/[-–_]20/, "-");
          cols.push({
            course: c.id,
            courseLabel: c.label,
            tag: c.tag,
            badge: c.badge,
            year: yr,
            shortYear,
            key: `${c.id}__${yr}`,
          });
        });
      }
    });

    return cols;
  }, [COA_COURSES, allDistinctIntakeYears, courseColumnFilter]);

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
        let c = (i.city || i.district || "").trim();
        // Remove state name if attached
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
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [liveInstitutions, liveStateFilter]);

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

  // Helper render sort icon
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={11} className="text-gray-300 group-hover:text-gray-500 shrink-0" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={11} className="text-black font-bold shrink-0" />
    ) : (
      <ArrowDown size={11} className="text-black font-bold shrink-0" />
    );
  };

  // --- FILTERED & SORTED LIVE INSTITUTIONS ---
  const processedLiveInstitutions = useMemo(() => {
    const q = liveSearchQuery.toLowerCase().trim();

    // 1. Filter
    let list = liveInstitutions.filter((inst, index) => {
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

      // Status Filter
      if (liveStatusFilter !== "ALL") {
        const closure = getClosureInfo(inst);
        if (liveStatusFilter === "ACTIVE" && (closure.isClosed || closure.isProgressive)) return false;
        if (liveStatusFilter === "PROGRESSIVE" && !closure.isProgressive) return false;
        if (liveStatusFilter === "CLOSED" && !closure.isClosed) return false;
      }

      // Program Filter
      if (liveProgramFilter !== "ALL") {
        const recs = inst.institution_annual_records || [];
        if (liveProgramFilter === "UG") {
          const hasUG = recs.some((r: any) => getCourseCategory(r.course_name) === "B.Arch");
          if (!hasUG) return false;
        } else if (liveProgramFilter === "PG") {
          const hasPG = recs.some((r: any) => getCourseCategory(r.course_name) === "M.Arch");
          if (!hasPG) return false;
        } else if (liveProgramFilter === "DIPLOMA") {
          const hasDiploma = recs.some((r: any) => getCourseCategory(r.course_name) === "Diploma");
          if (!hasDiploma) return false;
        } else if (liveProgramFilter === "POLYTECHNIC") {
          if (inst.institution_type !== "Polytechnic / Diploma Institution") return false;
        }
      }

      // Search Query
      if (q) {
        const matchName = inst.institution_name?.toLowerCase().includes(q);
        const matchCode = inst.coa_code?.toLowerCase().includes(q);
        const matchCity = (inst.city || "").toLowerCase().includes(q);
        const matchDistrict = (inst.district || "").toLowerCase().includes(q);
        const matchState = (inst.state || "").toLowerCase().includes(q);
        const matchAffiliation = (inst.affiliated_university || "").toLowerCase().includes(q);
        const matchEmail = (inst.official_email || "").toLowerCase().includes(q);
        const matchPhone = (inst.official_phone || "").toLowerCase().includes(q);
        const matchWebsite = (inst.website || "").toLowerCase().includes(q);
        const matchYear = String(inst.establishment_year || "").includes(q);
        return (
          matchName ||
          matchCode ||
          matchCity ||
          matchDistrict ||
          matchState ||
          matchAffiliation ||
          matchEmail ||
          matchPhone ||
          matchWebsite ||
          matchYear
        );
      }

      return true;
    });

    // 2. Sort
    list.sort((a, b) => {
      let comparison = 0;

      // Handle Year & Course-Specific Intake Sort (e.g. "intake_B.Arch__2024-2025" or "intake_M.Arch__2025-2026")
      if (sortField.startsWith("intake_")) {
        const key = sortField.replace("intake_", "");
        const [targetCourse, targetYear] = key.includes("__") ? key.split("__") : ["B.Arch", key];
        const getSeats = (item: any) => {
          const matching = (item.institution_annual_records || []).filter(
            (r: any) => getCourseCategory(r.course_name) === targetCourse && r.academic_year === targetYear
          );
          if (matching.length === 0) return -1;
          return matching.reduce((sum: number, r: any) => sum + (r.approved_intake || 0), 0);
        };
        comparison = getSeats(a) - getSeats(b);
        return sortDirection === "asc" ? comparison : -comparison;
      }

      switch (sortField) {
        case "sno":
          comparison = (a._originalIndex || 0) - (b._originalIndex || 0);
          break;
        case "coa_code":
          if (!a.coa_code) return 1;
          if (!b.coa_code) return -1;
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
        case "establishment_year":
          comparison = (a.establishment_year || 0) - (b.establishment_year || 0);
          break;
        case "status": {
          const aClosed = getClosureInfo(a).isClosed ? 1 : 0;
          const bClosed = getClosureInfo(b).isClosed ? 1 : 0;
          comparison = aClosed - bClosed;
          break;
        }
        case "official_email":
          comparison = (a.official_email || "").localeCompare(b.official_email || "");
          break;
        case "official_phone":
          comparison = (a.official_phone || "").localeCompare(b.official_phone || "");
          break;
        case "website":
          comparison = (a.website || "").localeCompare(b.website || "");
          break;
        default:
          comparison = 0;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return list;
  }, [liveInstitutions, liveSearchQuery, liveStateFilter, liveCityFilter, liveProgramFilter, liveStatusFilter, sortField, sortDirection]);

  // Paginated View
  const paginatedInstitutions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedLiveInstitutions.slice(start, start + pageSize);
  }, [processedLiveInstitutions, currentPage, pageSize]);

  const totalPages = Math.ceil(processedLiveInstitutions.length / pageSize) || 1;

  const handleExportCSV = () => {
    if (processedLiveInstitutions.length === 0) {
      showToast("error", "No institutions to export.");
      return;
    }

    const headers = [
      "COA Code",
      "Institution Name",
      "City",
      "State",
      "Type",
      "Latest NIRF Rank",
      "Affiliated University",
      "Establishment Year",
      "Head / Principal",
      "Email",
      "Phone",
      "Website",
    ];

    const rows = processedLiveInstitutions.map((inst) => {
      const nirfRanks = (inst.institution_rankings || []).sort((a: any, b: any) => b.ranking_year - a.ranking_year);
      const latestNirf = nirfRanks.length > 0 ? `#${nirfRanks[0].rank_number} (${nirfRanks[0].ranking_year})` : "";

      return [
        `"${inst.coa_code || ""}"`,
        `"${(inst.institution_name || "").replace(/"/g, '""')}"`,
        `"${inst.city || inst.district || ""}"`,
        `"${inst.state || ""}"`,
        `"${inst.institution_type || "Degree College"}"`,
        `"${latestNirf}"`,
        `"${(inst.affiliated_university || "").replace(/"/g, '""')}"`,
        inst.establishment_year || "",
        `"${(inst.head_of_institution || "").replace(/"/g, '""')}"`,
        `"${inst.official_email || ""}"`,
        `"${inst.official_phone || ""}"`,
        `"${inst.website || ""}"`,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `coa_institutions_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", `Exported ${processedLiveInstitutions.length} institutions to CSV.`);
  };

  // --- MODAL: OPEN EDIT & INTAKES ---
  const handleOpenEditModal = (inst: any) => {
    setSelectedInstForEdit(inst);
    const closure = getClosureInfo(inst);

    setModalFormData({
      institution_name: inst.institution_name || "",
      establishment_year: inst.establishment_year ? String(inst.establishment_year) : "",
      is_closed: closure.isClosed,
      closure_year: closure.year ? String(closure.year) : "",
      official_email: inst.official_email || "",
      official_phone: inst.official_phone || "",
      website: inst.website || "",
      affiliated_university: inst.affiliated_university || "",
      city: inst.city || inst.district || "",
      state: inst.state || "",
    });

    const recs = [...(inst.institution_annual_records || [])].sort((a, b) =>
      b.academic_year.localeCompare(a.academic_year)
    );
    setModalIntakeList(recs);
    setNewYearInput("");
    setNewSeatsInput("");
  };

  const handleUpdateModalIntakeSeat = (index: number, seats: number) => {
    setModalIntakeList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, approved_intake: seats } : item))
    );
  };

  const handleAddNewYearToIntakeModal = () => {
    if (!newYearInput.trim()) {
      showToast("error", "Please enter an academic year (e.g., 2025-2026)");
      return;
    }
    const seats = typeof newSeatsInput === "number" ? newSeatsInput : 0;
    const exists = modalIntakeList.some(
      (r) =>
        (r.course_name || "B.Arch").toLowerCase() === newCourseInput.toLowerCase() &&
        r.academic_year.toLowerCase() === newYearInput.trim().toLowerCase()
    );
    if (exists) {
      showToast("error", `${newCourseInput} for academic year ${newYearInput} is already mapped.`);
      return;
    }

    setModalIntakeList((prev) => [
      {
        academic_year: newYearInput.trim(),
        course_name: newCourseInput,
        approved_intake: seats,
        approval_status: seats > 0 ? "Approved" : "Zero Intake / Discontinued",
      },
      ...prev,
    ]);
    setNewYearInput("");
    setNewSeatsInput("");
  };

  const handleSaveModalChanges = async () => {
    if (!selectedInstForEdit) return;
    try {
      setIsSavingModal(true);

      // 1. Prepare institution updates
      const instUpdates: any = {
        institution_name: modalFormData.institution_name.trim(),
        establishment_year: modalFormData.establishment_year
          ? parseInt(modalFormData.establishment_year, 10) || null
          : null,
        official_email: modalFormData.official_email.trim() || null,
        official_phone: modalFormData.official_phone.trim() || null,
        website: modalFormData.website.trim() || null,
        affiliated_university: modalFormData.affiliated_university.trim() || null,
        city: modalFormData.city.trim() || null,
        state: modalFormData.state.trim() || null,
        institution_type: modalFormData.is_closed
          ? `Closed: ${modalFormData.closure_year || new Date().getFullYear()}`
          : "Active",
        updated_at: new Date().toISOString(),
      };

      const { error: instErr } = await supabase
        .from("institutions")
        .update(instUpdates)
        .eq("id", selectedInstForEdit.id);

      if (instErr) throw instErr;

      // 2. Save annual records
      for (const rec of modalIntakeList) {
        const seats = typeof rec.approved_intake === "number" ? rec.approved_intake : 0;
        const status = seats > 0 ? "Approved" : "Zero Intake / Discontinued";

        await supabase.from("institution_annual_records").upsert(
          {
            institution_id: selectedInstForEdit.id,
            academic_year: rec.academic_year,
            course_name: rec.course_name || "B.Arch",
            approved_intake: seats,
            approval_status: status,
            reviewed_at: new Date().toISOString(),
          },
          { onConflict: "institution_id,academic_year,course_name" }
        );
      }

      showToast("success", `Updated details and intakes for ${modalFormData.institution_name}`);
      setSelectedInstForEdit(null);
      await loadInitialData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to save changes");
    } finally {
      setIsSavingModal(false);
    }
  };

  // --- TAB 1: BULK EXTRACTION ---
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
                  All-India architecture colleges, individual annual intake columns, contact directories & closure tracking
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
          {/* TAB 1: LIVE INSTITUTIONS DIRECTORY                             */}
          {/* ============================================================== */}
          {activeTab === "manage" && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5">
              {/* FILTER & CONTROLS TOOLBAR */}
              <div className="flex flex-col gap-4 border-b border-gray-100 pb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      Live Directory ({processedLiveInstitutions.length} of {liveInstitutions.length})
                    </h2>
                    <p className="text-xs text-gray-500">
                      All columns sortable & filterable. Intakes displayed in separate individual yearly columns.
                    </p>
                  </div>

                  {/* Controls: Search & Export */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-80">
                      <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={liveSearchQuery}
                        onChange={(e) => {
                          setLiveSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Search name, code, city, email, phone..."
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

                    <button
                      onClick={handleExportCSV}
                      title="Export filtered directory to CSV"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-black text-white hover:bg-gray-800 rounded-xl text-xs font-bold transition shrink-0 shadow-2xs cursor-pointer"
                    >
                      <Download size={14} />
                      <span className="hidden sm:inline">Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* FILTERS BAR: Program, State, City, Status */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <Filter size={14} /> Filter By:
                  </div>

                  {/* Program Level Filter */}
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                    <span className="text-[11px] font-semibold text-gray-400">Program:</span>
                    <select
                      value={liveProgramFilter}
                      onChange={(e) => {
                        setLiveProgramFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="text-xs font-bold bg-transparent text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Programs</option>
                      <option value="UG">B.Arch Only</option>
                      <option value="PG">M.Arch Only</option>
                      <option value="DIPLOMA">Diploma Streams</option>
                      <option value="POLYTECHNIC">Polytechnics Only</option>
                    </select>
                  </div>

                  {/* State Filter */}
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                    <span className="text-[11px] font-semibold text-gray-400">State:</span>
                    <select
                      value={liveStateFilter}
                      onChange={(e) => {
                        setLiveStateFilter(e.target.value);
                        setLiveCityFilter("ALL");
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
                    <span className="text-[11px] font-semibold text-gray-400">City:</span>
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

                  {/* Status Filter */}
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                    <span className="text-[11px] font-semibold text-gray-400">Status:</span>
                    <select
                      value={liveStatusFilter}
                      onChange={(e) => {
                        setLiveStatusFilter(e.target.value as any);
                        setCurrentPage(1);
                      }}
                      className="text-xs font-bold bg-transparent text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="ACTIVE">Active Only</option>
                      <option value="PROGRESSIVE">Progressive Closure Only</option>
                      <option value="CLOSED">Closed / Zero Intake Only</option>
                    </select>
                  </div>

                  {/* Reset Filters */}
                  {(liveStateFilter !== "ALL" ||
                    liveCityFilter !== "ALL" ||
                    liveStatusFilter !== "ALL" ||
                    liveSearchQuery) && (
                    <button
                      onClick={() => {
                        setLiveStateFilter("ALL");
                        setLiveCityFilter("ALL");
                        setLiveStatusFilter("ALL");
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

              {/* HORIZONTAL CONTROLS & COURSE COLUMN FILTER TOOLBAR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/90 p-2.5 px-3 rounded-2xl border border-gray-200 text-xs">
                {/* Course Intake Visibility Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mr-1">
                    Intake Columns:
                  </span>
                  {(["ALL", "B.Arch", "M.Arch", "Diploma"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setCourseColumnFilter(mode)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        courseColumnFilter === mode
                          ? "bg-black text-white shadow-xs"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {mode === "ALL"
                        ? `All Courses (${activeIntakeColumns.length})`
                        : mode === "B.Arch"
                        ? "B.Arch (UG)"
                        : mode === "M.Arch"
                        ? "M.Arch (Masters)"
                        : "Diploma"}
                    </button>
                  ))}
                </div>

                {/* Horizontal Scroll Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 font-medium hidden md:inline">
                    Horizontal Scroll:
                  </span>
                  <button
                    type="button"
                    onClick={() => scrollTableBy(-400)}
                    className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                    title="Scroll columns left"
                  >
                    <ChevronLeft size={14} />
                    <span>Left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollTableBy(400)}
                    className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                    title="Scroll columns right"
                  >
                    <span>Right</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* SYNCHRONIZED TOP HORIZONTAL SCROLLBAR */}
              <div
                ref={topScrollRef}
                onScroll={handleTopScroll}
                className="overflow-x-auto overflow-y-hidden border border-gray-200 rounded-t-xl bg-gray-100/70 custom-table-scrollbar"
                style={{
                  scrollbarWidth: "auto",
                  scrollbarColor: "#64748b #f1f5f9",
                }}
              >
                <div style={{ width: `${tableScrollWidth}px`, height: "8px" }} />
              </div>

              {/* TABLE CONTAINER */}
              <div
                ref={tableScrollRef}
                onScroll={handleTableScroll}
                className="overflow-x-auto border border-t-0 border-gray-200 rounded-b-2xl shadow-2xs custom-table-scrollbar"
                style={{
                  scrollbarWidth: "auto",
                  scrollbarColor: "#64748b #f1f5f9",
                }}
              >
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 font-bold uppercase tracking-wider text-gray-500">
                    <tr>
                      {/* S.No */}
                      <th
                        onClick={() => handleSort("sno")}
                        className="p-3 w-12 cursor-pointer select-none hover:bg-gray-100 group transition"
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

                      {/* College Name */}
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
                          <span>City</span>
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
                          <span>Affiliation</span>
                          {renderSortIndicator("affiliated_university")}
                        </div>
                      </th>

                      {/* Opened Year */}
                      <th
                        onClick={() => handleSort("establishment_year")}
                        className="p-3 text-center whitespace-nowrap cursor-pointer select-none hover:bg-gray-100 group transition"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Opened</span>
                          {renderSortIndicator("establishment_year")}
                        </div>
                      </th>

                      {/* Status / Closed Year */}
                      <th
                        onClick={() => handleSort("status")}
                        className="p-3 text-center whitespace-nowrap cursor-pointer select-none hover:bg-gray-100 group transition"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Status / Closed</span>
                          {renderSortIndicator("status")}
                        </div>
                      </th>

                      {/* SEPARATE INDIVIDUAL INTAKE COLUMNS (B.Arch, M.Arch, Diploma) */}
                      {activeIntakeColumns.map((col) => (
                        <th
                          key={col.key}
                          onClick={() => handleSort(`intake_${col.key}`)}
                          className="p-3 text-center whitespace-nowrap cursor-pointer select-none hover:bg-gray-100 group transition bg-gray-50/80"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${col.badge}`}>
                              {col.course}
                            </span>
                            <span>{col.shortYear}</span>
                            {renderSortIndicator(`intake_${col.key}`)}
                          </div>
                        </th>
                      ))}

                      {/* Email Column */}
                      <th
                        onClick={() => handleSort("official_email")}
                        className="p-3 min-w-[180px] cursor-pointer select-none hover:bg-gray-100 group transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>Official Email</span>
                          {renderSortIndicator("official_email")}
                        </div>
                      </th>

                      {/* Phone Column */}
                      <th
                        onClick={() => handleSort("official_phone")}
                        className="p-3 min-w-[150px] cursor-pointer select-none hover:bg-gray-100 group transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>Phone / Mobile</span>
                          {renderSortIndicator("official_phone")}
                        </div>
                      </th>

                      {/* Website Column */}
                      <th
                        onClick={() => handleSort("website")}
                        className="p-3 min-w-[150px] cursor-pointer select-none hover:bg-gray-100 group transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>Website</span>
                          {renderSortIndicator("website")}
                        </div>
                      </th>

                      {/* Actions */}
                      <th className="p-3 text-right sticky right-0 bg-gray-50">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedInstitutions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={12 + activeIntakeColumns.length}
                          className="p-8 text-center text-gray-400"
                        >
                          No institutions match your search and filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedInstitutions.map((inst) => {
                        const closure = getClosureInfo(inst);

                        // Check advance multi-year statutory approval
                        const futureYears = (inst.institution_annual_records || [])
                          .filter((r: any) => r.academic_year && r.academic_year >= "2027-2028" && r.approved_intake > 0)
                          .map((r: any) => r.academic_year);
                        const multiYearMaxYear = futureYears.length > 0 ? Array.from(new Set(futureYears)).sort().pop() : null;

                        // Build Map of `${category}__${academic_year}` -> array of records
                        const courseYearRecordsMap = new Map<string, any[]>();
                        (inst.institution_annual_records || []).forEach((r: any) => {
                          if (r.academic_year) {
                            const cat = getCourseCategory(r.course_name);
                            const k = `${cat}__${r.academic_year.trim()}`;
                            const list = courseYearRecordsMap.get(k) || [];
                            list.push(r);
                            courseYearRecordsMap.set(k, list);
                          }
                        });

                        const formattedEmails = formatSeparatedValues(inst.official_email);
                        const formattedPhones = formatSeparatedValues(inst.official_phone);
                        const firstWebUrl = getFirstUrl(inst.website);

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
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-100 whitespace-nowrap">
                                {inst.state || "All India"}
                              </span>
                            </td>

                            {/* Affiliation */}
                            <td className="p-3 text-gray-600 text-[11px] max-w-[200px] truncate" title={inst.affiliated_university}>
                              {inst.affiliated_university || "—"}
                            </td>

                            {/* Course Opened Year */}
                            <td className="p-3 text-center font-mono font-bold text-gray-800">
                              {inst.establishment_year || "—"}
                            </td>

                            {/* Status / Closed Year */}
                            <td className="p-3 text-center whitespace-nowrap">
                              {closure.isClosed ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                  {closure.label}
                                </span>
                              ) : closure.isProgressive ? (
                                <span
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                                  title="Progressive Closure: No fresh admissions from this academic year; existing batches continue to complete degree."
                                >
                                  {closure.label}
                                </span>
                              ) : multiYearMaxYear ? (
                                <span
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300"
                                  title={`Council of Architecture advance multi-year statutory approval sanctioned through ${multiYearMaxYear}`}
                                >
                                  Sanctioned: {String(multiYearMaxYear || "").replace(/^20/, "").replace(/[-–_]20/, "-")}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                                  Active
                                </span>
                              )}
                            </td>

                            {/* SEPARATE INDIVIDUAL INTAKE COLUMNS (B.Arch, M.Arch, Diploma) */}
                            {activeIntakeColumns.map((col) => {
                              const matchingRecs = courseYearRecordsMap.get(col.key) || [];
                              if (matchingRecs.length === 0) {
                                return (
                                  <td key={col.key} className="p-3 text-center text-gray-300 font-mono text-[11px]">
                                    —
                                  </td>
                                );
                              }

                              // Single record (typical case for B.Arch, Diploma, or single M.Arch specialization)
                              if (matchingRecs.length === 1) {
                                const rec = matchingRecs[0];
                                const seats = rec.approved_intake;
                                const isZero =
                                  seats === 0 ||
                                  /zero|discontinued|withdrawn|progressive/i.test(rec.approval_status || "");

                                const isSpec = rec.course_name && rec.course_name !== "M.Arch" && rec.course_name !== "B.Arch";
                                const specLabel = isSpec
                                  ? rec.course_name.replace(/^(M\.Arch|Bachelor of Architecture)\s*\(/i, "").replace(/\)$/, "")
                                  : null;

                                return (
                                  <td key={col.key} className="p-3 text-center whitespace-nowrap">
                                    {isZero ? (
                                      <span
                                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200"
                                        title={`${rec.course_name} ${col.year}: Zero Intake / Discontinued`}
                                      >
                                        0
                                      </span>
                                    ) : (
                                      <div className="flex flex-col items-center gap-0.5">
                                        <span
                                          className="font-extrabold text-gray-900 font-mono text-xs"
                                          title={`${rec.course_name} (${col.year}): ${seats} approved seats`}
                                        >
                                          {seats}
                                        </span>
                                        {specLabel && (
                                          <span
                                            className="text-[9px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1 py-0.2 rounded max-w-[95px] truncate"
                                            title={rec.course_name}
                                          >
                                            {specLabel}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                );
                              }

                              // Multiple records (e.g. 2+ PG courses in the same year)
                              const totalSeats = matchingRecs.reduce(
                                (sum: number, r: any) => sum + (r.approved_intake || 0),
                                0
                              );
                              const fullTooltip = matchingRecs
                                .map((r: any) => `${r.course_name}: ${r.approved_intake} seats (${r.approval_status || 'Approved'})`)
                                .join("\n");

                              return (
                                <td key={col.key} className="p-3 text-center whitespace-nowrap">
                                  <div className="flex flex-col items-center gap-1" title={fullTooltip}>
                                    <div className="flex items-center gap-1">
                                      <span className="font-extrabold text-purple-900 font-mono text-xs">
                                        {totalSeats}
                                      </span>
                                      <span className="text-[9px] font-bold text-purple-600 bg-purple-100 border border-purple-200 px-1 rounded-full">
                                        {matchingRecs.length}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 justify-center max-w-[130px]">
                                      {matchingRecs.map((r: any, rIdx: number) => {
                                        const specName = r.course_name
                                          .replace(/^M\.Arch\s*\(/i, "")
                                          .replace(/\)$/, "");
                                        return (
                                          <span
                                            key={r.id || rIdx}
                                            className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 whitespace-nowrap"
                                            title={`${r.course_name}: ${r.approved_intake} seats`}
                                          >
                                            {specName}: {r.approved_intake}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </td>
                              );
                            })}

                            {/* Email Column */}
                            <td className="p-3 text-[11px] max-w-[180px]">
                              {formattedEmails ? (
                                <div className="flex items-center gap-1 truncate text-gray-700" title={formattedEmails}>
                                  <Mail size={12} className="text-gray-400 shrink-0" />
                                  <a
                                    href={`mailto:${inst.official_email.split(/[,;\s]+/)[0]}`}
                                    className="hover:underline truncate"
                                  >
                                    {formattedEmails}
                                  </a>
                                </div>
                              ) : (
                                <span className="text-gray-300 font-mono">—</span>
                              )}
                            </td>

                            {/* Phone Column */}
                            <td className="p-3 text-[11px] max-w-[150px]">
                              {formattedPhones ? (
                                <div className="flex items-center gap-1 truncate text-gray-700" title={formattedPhones}>
                                  <Phone size={12} className="text-gray-400 shrink-0" />
                                  <span className="truncate">{formattedPhones}</span>
                                </div>
                              ) : (
                                <span className="text-gray-300 font-mono">—</span>
                              )}
                            </td>

                            {/* Website Column */}
                            <td className="p-3 text-[11px] max-w-[150px]">
                              {inst.website ? (
                                <div className="flex items-center gap-1 truncate" title={inst.website}>
                                  <Globe size={12} className="text-gray-400 shrink-0" />
                                  <a
                                    href={firstWebUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline truncate"
                                  >
                                    {inst.website
                                      .replace(/^https?:\/\/(www\.)?/, "")
                                      .replace(/\/$/, "")}
                                  </a>
                                </div>
                              ) : (
                                <span className="text-gray-300 font-mono">—</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right space-x-1 whitespace-nowrap sticky right-0 bg-white shadow-xs">
                              <button
                                onClick={() => handleOpenEditModal(inst)}
                                className="px-2.5 py-1 text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-black hover:text-white rounded-lg transition"
                                title="Edit Profile & Yearly Intakes"
                              >
                                Edit / Intakes
                              </button>
                              <a
                                href={`/institutions/${inst.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center p-1 text-gray-500 hover:text-black transition"
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
          {/* TAB 2: EDIT INSTITUTION & MULTI-YEAR INTAKE MODAL              */}
          {/* ============================================================== */}
          {selectedInstForEdit && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-800 border">
                        {selectedInstForEdit.coa_code}
                      </span>
                      <h3 className="font-bold text-base text-gray-900">
                        {selectedInstForEdit.institution_name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Manage course opened year, closed status, contact columns, and multi-year intakes
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedInstForEdit(null)}
                    className="p-1 text-gray-400 hover:text-black"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* FORM FIELDS */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Course Opened Year */}
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Course Opened Year
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 1989"
                        value={modalFormData.establishment_year}
                        onChange={(e) =>
                          setModalFormData({ ...modalFormData, establishment_year: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
                      />
                    </div>

                    {/* Status / Closure Toggle */}
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Operational Status
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={modalFormData.is_closed ? "CLOSED" : "ACTIVE"}
                          onChange={(e) =>
                            setModalFormData({
                              ...modalFormData,
                              is_closed: e.target.value === "CLOSED",
                            })
                          }
                          className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold"
                        >
                          <option value="ACTIVE">Active / Operational</option>
                          <option value="CLOSED">Closed / Discontinued</option>
                        </select>
                        {modalFormData.is_closed && (
                          <input
                            type="text"
                            placeholder="Year (e.g. 2021)"
                            value={modalFormData.closure_year}
                            onChange={(e) =>
                              setModalFormData({ ...modalFormData, closure_year: e.target.value })
                            }
                            className="w-24 px-2 py-1.5 text-xs bg-red-50 border border-red-200 rounded-xl font-bold text-red-800"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contacts */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Official Email
                      </label>
                      <input
                        type="text"
                        placeholder="email@college.edu"
                        value={modalFormData.official_email}
                        onChange={(e) =>
                          setModalFormData({ ...modalFormData, official_email: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Phone / Mobile
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 044-..., 984..."
                        value={modalFormData.official_phone}
                        onChange={(e) =>
                          setModalFormData({ ...modalFormData, official_phone: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Website
                      </label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={modalFormData.website}
                        onChange={(e) =>
                          setModalFormData({ ...modalFormData, website: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* ADD NEW YEAR INTAKE ROW */}
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2">
                  <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                    <Plus size={12} /> Map Additional Course & Intake Year
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <select
                      value={newCourseInput}
                      onChange={(e) => setNewCourseInput(e.target.value as any)}
                      className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl font-bold cursor-pointer"
                    >
                      <option value="B.Arch">B.Arch (UG)</option>
                      <option value="M.Arch">M.Arch (Masters)</option>
                      <option value="Diploma">Diploma (D.Arch)</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Academic Year (e.g. 2025-2026)"
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
                      className="px-3.5 py-1.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition cursor-pointer"
                    >
                      Add Intake
                    </button>
                  </div>
                </div>

                {/* EXISTING ANNUAL RECORDS LIST */}
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Mapped Annual Seat Intakes
                  </div>
                  {modalIntakeList.length === 0 ? (
                    <div className="text-xs text-gray-400 italic py-2">No intakes mapped yet.</div>
                  ) : (
                    modalIntakeList.map((rec, i) => {
                      const course = rec.course_name || "B.Arch";
                      const badgeClass =
                        course === "M.Arch"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : course === "Diploma"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200";

                      return (
                        <div
                          key={`${course}_${rec.academic_year}`}
                          className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>
                              {course}
                            </span>
                            <span className="font-mono font-bold text-gray-900">{rec.academic_year}</span>
                          </div>
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
                      );
                    })
                  )}
                </div>

                {/* MODAL ACTIONS */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedInstForEdit(null)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveModalChanges}
                    disabled={isSavingModal}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 disabled:opacity-40 transition"
                  >
                    {isSavingModal ? (
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

      {/* Global CSS for always-visible high-contrast table horizontal scrollbars */}
      <style jsx global>{`
        .custom-table-scrollbar::-webkit-scrollbar {
          height: 12px;
        }
        .custom-table-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 6px;
        }
        .custom-table-scrollbar::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 6px;
          border: 2px solid #f1f5f9;
        }
        .custom-table-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>

      <Footer />
    </div>
  );
}
