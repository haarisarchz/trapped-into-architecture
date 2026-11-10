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
} from "lucide-react";

export default function AdminInstitutionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Tabs: "import" | "manage" | "history"
  const [activeTab, setActiveTab] = useState<"import" | "manage" | "history">("import");

  // --- TAB 1 (IMPORT) STATE ---
  const [importMode, setImportMode] = useState<"excel" | "pdf" | "paste">("excel");
  const [targetState, setTargetState] = useState("Tamil Nadu");
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
  const [editingInstId, setEditingInstId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

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
    // Load live institutions
    const { data: insts } = await supabase
      .from("institutions")
      .select("*, institution_annual_records(academic_year, approved_intake, approval_status)")
      .order("created_at", { ascending: false });

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

  // --- HANDLE EXTRACTION ---
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

  // --- HANDLE CELL EDIT IN REVIEW TABLE ---
  const handleCellChange = (id: string, field: string, value: any) => {
    setExtractedRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // --- REMOVE ROW FROM EXTRACTION ---
  const handleRemoveRow = (id: string) => {
    setExtractedRows((prev) => prev.filter((row) => row.id !== id));
  };

  // --- HANDLE FINAL IMPORT APPROVAL ---
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

  // Filtered Extracted Rows for Review Table
  const filteredReviewRows = useMemo(() => {
    if (filterCategory === "ALL") return extractedRows;
    return extractedRows.filter((r) => r.category === filterCategory);
  }, [extractedRows, filterCategory]);

  // Filtered Live Institutions in Tab 2
  const filteredLiveInstitutions = useMemo(() => {
    const q = liveSearchQuery.toLowerCase().trim();
    return liveInstitutions.filter((inst) => {
      if (liveStateFilter !== "ALL" && inst.state?.toLowerCase() !== liveStateFilter.toLowerCase()) {
        return false;
      }
      if (q) {
        const matchName = inst.institution_name?.toLowerCase().includes(q);
        const matchCode = inst.coa_code?.toLowerCase().includes(q);
        const matchCity = inst.city?.toLowerCase().includes(q);
        const matchDistrict = inst.district?.toLowerCase().includes(q);
        return matchName || matchCode || matchCity || matchDistrict;
      }
      return true;
    });
  }, [liveInstitutions, liveSearchQuery, liveStateFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-sm font-semibold text-gray-500">Checking authorization...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* HEADER / QUICK NAV */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-black text-white rounded-xl">
                <GraduationCap size={22} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Institution Data Management
                </h1>
                <p className="text-xs text-gray-500">
                  Council of Architecture (COA) PDF & Excel ingestion, reconciliation, and live directory control
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
              onClick={() => setActiveTab("import")}
              className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
                activeTab === "import"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              <UploadCloud size={16} /> Bulk Upload & AI Extractor
              {extractedRows.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800">
                  {extractedRows.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("manage")}
              className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
                activeTab === "manage"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              <Layers size={16} /> Live Institutions ({liveInstitutions.length})
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
                activeTab === "history"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              <FileText size={16} /> Import Audit History ({auditDocs.length})
            </button>
          </div>
        </div>

        {/* NOTIFICATION TOAST */}
        {notification && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
            <div
              className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between border ${
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
          {/* TAB 1: BULK UPLOAD & AI EXTRACTION                             */}
          {/* ============================================================== */}
          {activeTab === "import" && (
            <div className="space-y-6">
              {/* UPLOAD FORM CARD */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Source Document & Extraction Mode</h2>
                    <p className="text-xs text-gray-500">
                      Import historical Excel records (e.g. Tamil Nadu, Karnataka) or upload COA PDFs to parse via Gemini AI
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
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="All India">All India / National</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Reporting Academic Year</label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      placeholder="e.g. 2024-2025"
                      className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Document Reference / Title</label>
                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="e.g. COA Approved Institutions List 2024"
                      className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Input Area (Dropzone or Textarea) */}
                {importMode === "paste" ? (
                  <div className="space-y-2 mb-6">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Paste Table Text directly from COA PDF
                    </label>
                    <textarea
                      rows={6}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste text or table copied directly from the official Council of Architecture document here..."
                      className="w-full p-4 text-xs font-mono bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-black text-gray-800"
                    />
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="border-2 border-dashed border-gray-200 hover:border-black rounded-2xl p-8 text-center transition bg-gray-50/50 cursor-pointer relative">
                      <input
                        type="file"
                        accept={importMode === "excel" ? ".xlsx, .xls, .csv" : ".pdf"}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <UploadCloud size={36} className="mx-auto text-gray-400 mb-2" />
                      <div className="text-sm font-bold text-gray-900">
                        {selectedFile ? selectedFile.name : `Click to select or drag & drop ${importMode.toUpperCase()} file`}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {importMode === "excel"
                          ? "Supports .xlsx, .xls, and .csv files with multi-year intake columns"
                          : "Supports official Council of Architecture PDF documents"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Extracted records will appear in a staged review grid below for inspection.
                  </div>

                  <button
                    onClick={handleExtract}
                    disabled={isExtracting || (importMode !== "paste" && !selectedFile) || (importMode === "paste" && !pastedText.trim())}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isExtracting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Analyzing with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Extract & Compare Records</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ============================================================== */}
              {/* STAGED REVIEW TABLE                                           */}
              {/* ============================================================== */}
              {extractedRows.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        Extracted Records Staging & Diff Grid ({extractedRows.length})
                      </h2>
                      <p className="text-xs text-gray-500">
                        Review diffs, edit any cell inline, and approve records before committing to the database
                      </p>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold">
                      <button
                        onClick={() => setFilterCategory("ALL")}
                        className={`px-3 py-1.5 rounded-lg transition ${
                          filterCategory === "ALL" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        All ({extractedRows.length})
                      </button>
                      <button
                        onClick={() => setFilterCategory("A")}
                        className={`px-3 py-1.5 rounded-lg transition ${
                          filterCategory === "A" ? "bg-green-700 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        Category A: New ({categoryCounts.A})
                      </button>
                      <button
                        onClick={() => setFilterCategory("B")}
                        className={`px-3 py-1.5 rounded-lg transition ${
                          filterCategory === "B" ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        }`}
                      >
                        Category B: Changed ({categoryCounts.B})
                      </button>
                      <button
                        onClick={() => setFilterCategory("C")}
                        className={`px-3 py-1.5 rounded-lg transition ${
                          filterCategory === "C" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Category C: Unchanged ({categoryCounts.C})
                      </button>
                      {categoryCounts.D > 0 && (
                        <button
                          onClick={() => setFilterCategory("D")}
                          className={`px-3 py-1.5 rounded-lg transition ${
                            filterCategory === "D" ? "bg-amber-700 text-white" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                          }`}
                        >
                          Category D: Warnings ({categoryCounts.D})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Review Table */}
                  <div className="overflow-x-auto border border-gray-200 rounded-2xl max-h-[500px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200 font-bold uppercase tracking-wider text-gray-500">
                        <tr>
                          <th className="p-3 w-16">Cat</th>
                          <th className="p-3 w-28">COA Code</th>
                          <th className="p-3 min-w-[200px]">College Name</th>
                          <th className="p-3 w-32">Locality</th>
                          <th className="p-3 w-32">District</th>
                          <th className="p-3 w-36">Affiliation</th>
                          <th className="p-3 w-24">Intake</th>
                          <th className="p-3 min-w-[160px]">Status & Diffs</th>
                          <th className="p-3 w-16 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredReviewRows.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50/70 transition font-medium">
                            {/* Category Badge */}
                            <td className="p-2.5">
                              <span
                                className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                                  row.category === "A"
                                    ? "bg-green-100 text-green-800"
                                    : row.category === "B"
                                    ? "bg-blue-100 text-blue-800"
                                    : row.category === "C"
                                    ? "bg-gray-100 text-gray-600"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                Cat {row.category}
                              </span>
                            </td>

                            {/* COA Code (Editable) */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.coa_code || ""}
                                onChange={(e) => handleCellChange(row.id, "coa_code", e.target.value)}
                                className="w-full p-1.5 font-mono font-bold bg-transparent border border-transparent hover:border-gray-300 focus:border-black rounded focus:bg-white"
                                placeholder="TNxx"
                              />
                            </td>

                            {/* Institution Name (Editable) */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.institution_name || ""}
                                onChange={(e) => handleCellChange(row.id, "institution_name", e.target.value)}
                                className="w-full p-1.5 font-semibold bg-transparent border border-transparent hover:border-gray-300 focus:border-black rounded focus:bg-white"
                              />
                            </td>

                            {/* Locality (Editable) */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.locality || ""}
                                onChange={(e) => handleCellChange(row.id, "locality", e.target.value)}
                                className="w-full p-1.5 bg-transparent border border-transparent hover:border-gray-300 focus:border-black rounded focus:bg-white"
                                placeholder="Area"
                              />
                            </td>

                            {/* District (Editable) */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.district || ""}
                                onChange={(e) => handleCellChange(row.id, "district", e.target.value)}
                                className="w-full p-1.5 bg-transparent border border-transparent hover:border-gray-300 focus:border-black rounded focus:bg-white"
                                placeholder="District"
                              />
                            </td>

                            {/* Affiliation (Editable) */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.affiliated_university || ""}
                                onChange={(e) => handleCellChange(row.id, "affiliated_university", e.target.value)}
                                className="w-full p-1.5 bg-transparent border border-transparent hover:border-gray-300 focus:border-black rounded focus:bg-white"
                                placeholder="University"
                              />
                            </td>

                            {/* Intake (Editable) */}
                            <td className="p-2">
                              <input
                                type="number"
                                value={row.approved_intake ?? 0}
                                onChange={(e) => handleCellChange(row.id, "approved_intake", parseInt(e.target.value, 10) || 0)}
                                className="w-full p-1.5 font-bold text-gray-900 bg-transparent border border-transparent hover:border-gray-300 focus:border-black rounded focus:bg-white"
                              />
                            </td>

                            {/* Status & Diff Details */}
                            <td className="p-2.5 text-[11px] leading-tight">
                              {row.diffDetails ? (
                                <div className="text-blue-700 font-semibold">{row.diffDetails.message}</div>
                              ) : row.category === "A" ? (
                                <div className="text-green-700 font-semibold">New Institution to be created</div>
                              ) : row.category === "C" ? (
                                <div className="text-gray-500">Matches current DB record</div>
                              ) : (
                                <div className="text-amber-700 font-semibold">
                                  {row.warnings?.join(", ") || "Review required"}
                                </div>
                              )}
                            </td>

                            {/* Delete Button */}
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
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition disabled:opacity-40 shadow-sm"
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
          {/* TAB 2: MANAGE LIVE INSTITUTIONS                                */}
          {/* ============================================================== */}
          {activeTab === "manage" && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Published Institutions ({liveInstitutions.length})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Search, view annual intake records, or edit institution profiles
                  </p>
                </div>

                {/* Search & State Filter */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={liveSearchQuery}
                      onChange={(e) => setLiveSearchQuery(e.target.value)}
                      placeholder="Search institutions..."
                      className="pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-black w-48 sm:w-64"
                    />
                  </div>

                  <select
                    value={liveStateFilter}
                    onChange={(e) => setLiveStateFilter(e.target.value)}
                    className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none"
                  >
                    <option value="ALL">All States</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Maharashtra">Maharashtra</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 font-bold uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="p-3 w-28">COA Code</th>
                      <th className="p-3">College Name</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Affiliation</th>
                      <th className="p-3">Latest Intake</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLiveInstitutions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400">
                          No institutions found in database.
                        </td>
                      </tr>
                    ) : (
                      filteredLiveInstitutions.map((inst) => {
                        const records = inst.institution_annual_records || [];
                        const latestRec = records[0] || null;

                        return (
                          <tr key={inst.id} className="hover:bg-gray-50/70 transition font-medium">
                            <td className="p-3 font-mono font-bold text-gray-900">
                              {inst.coa_code || "—"}
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-gray-900">{inst.institution_name}</div>
                              <div className="text-[11px] text-gray-400">/{inst.slug}</div>
                            </td>
                            <td className="p-3 text-gray-600">
                              {[inst.locality, inst.city || inst.district, inst.state].filter(Boolean).join(", ")}
                            </td>
                            <td className="p-3 text-gray-600">{inst.affiliated_university || "—"}</td>
                            <td className="p-3">
                              {latestRec ? (
                                <span className="font-extrabold text-gray-900">
                                  {latestRec.approved_intake} seats{" "}
                                  <span className="text-[10px] text-gray-400 font-normal">
                                    ({latestRec.academic_year})
                                  </span>
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  inst.is_active
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {inst.is_active ? "Published" : "Hidden"}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <a
                                href={`/institutions/${inst.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 p-1.5 text-gray-500 hover:text-black transition"
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

              <div className="overflow-x-auto border border-gray-200 rounded-2xl">
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
