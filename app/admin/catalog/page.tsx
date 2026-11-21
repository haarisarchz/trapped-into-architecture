"use client";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../../../components/Navbar";
import { 
  Save, Lock, Unlock, Plus, Image as ImageIcon, Trash2, Edit2, Link as LinkIcon, 
  EyeOff, ChevronDown, ArrowLeftToLine, ArrowRightToLine, UploadCloud, Loader2,
  ArrowUpDown, ArrowUp, ArrowDown, Search, ChevronLeft, ChevronRight, X, Sparkles, Filter, CheckCircle2,
  LayoutList, LayoutGrid, ZoomIn, Eye, ExternalLink
} from "lucide-react";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sqlSnippet = `-- Table for row data
CREATE TABLE IF NOT EXISTS architecture_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_locked BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}'::jsonb
);

-- Table for column definitions (the Excel headers)
CREATE TABLE IF NOT EXISTS catalog_columns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL, 
  order_index INTEGER DEFAULT 0,
  is_core BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true
);

-- Insert 16 Core Columns
INSERT INTO catalog_columns (id, title, type, order_index, is_core) VALUES
('building_name', 'Building Name', 'text', 1, true),
('architect', 'Architect / Firm', 'text', 2, false),
('city', 'City', 'text', 3, false),
('state_region', 'State / Region', 'text', 4, false),
('country', 'Country', 'text', 5, false),
('opened_year', 'Opened Year', 'number', 6, false),
('architect_native', 'Architect''s Nationality', 'text', 7, false),
('pritzker_prize_year', 'Pritzker Prize Year', 'number', 8, false),
('major_awards', 'Major Awards & Honors', 'text', 9, false),
('architectural_style', 'Architectural Style', 'text', 10, false),
('building_height', 'Building Height', 'text', 11, false),
('building_area', 'Built-up Area', 'text', 12, false),
('architect_other_projects', 'Architect''s Other Projects', 'text', 13, false),
('building_photo', 'Building Photo', 'image', 14, false),
('architect_photo', 'Architect''s Photo', 'image', 15, false),
('puzzle_clues', 'Puzzle Clues & Trivia', 'text', 16, false)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, type = EXCLUDED.type, order_index = EXCLUDED.order_index;`;

export default function CatalogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  
  const [columns, setColumns] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  
  const [showColModal, setShowColModal] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const [newColType, setNewColType] = useState("text");

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [showFiltersRow, setShowFiltersRow] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "india" | "pritzker">("all");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [savingAll, setSavingAll] = useState(false);
  const [statusNotification, setStatusNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // View Mode: Table (list) vs. Grid (cards with large images)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Excel UX States
  const [activeColMenu, setActiveColMenu] = useState<string | null>(null);
  const [insertPos, setInsertPos] = useState<{ colId: string, direction: 'left' | 'right' } | null>(null);
  const [uploadingCells, setUploadingCells] = useState<Record<string, boolean>>({});
  
  // Ref for table scroll control
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const checkDatabase = async () => {
    setLoading(true);
    const stored = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!stored) {
      router.push("/admin");
      return;
    }
    const lookupField = stored.username ? "username" : "email";
    const lookupValue = stored.username || stored.email;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq(lookupField, lookupValue)
      .maybeSingle();

    const normalizedRole = (profile?.role || stored.role || "").toLowerCase().replace(/[\s_]+/g, "");
    if (normalizedRole !== "ceo") {
      router.push("/admin");
      return;
    }

    const { error } = await supabase.from("architecture_catalog").select("id").limit(1);
    if (error && error.code === "42P01") {
      setSetupRequired(true);
      setLoading(false);
      return;
    }
    setSetupRequired(false);
    fetchData();
  };

  const fetchData = async () => {
    const { data: colData } = await supabase.from("catalog_columns").select("*").order("order_index", { ascending: true });
    const { data: rowData } = await supabase.from("architecture_catalog").select("*").order("created_at", { ascending: false });
    
    if (colData) setColumns(colData);
    if (rowData) setRows(rowData);
    setLoading(false);
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  const addRow = () => {
    const newRow = {
      id: "temp-" + Date.now(),
      is_locked: false,
      data: {},
      isNew: true
    };
    setRows([newRow, ...rows]);
  };

  const addColumn = async () => {
    if (!newColTitle.trim()) return;
    const slug = newColTitle.toLowerCase().replace(/[^a-z0-9]/g, "_");
    
    const newCol = {
      id: slug,
      title: newColTitle,
      type: newColType,
      order_index: 999,
      is_core: false,
      is_visible: true
    };
    
    let updatedColumns = [...columns];
    
    if (insertPos) {
      const targetIdx = columns.findIndex(c => c.id === insertPos.colId);
      const idx = insertPos.direction === 'left' ? targetIdx : targetIdx + 1;
      updatedColumns.splice(idx, 0, newCol);
    } else {
      updatedColumns.push(newCol);
    }
    
    updatedColumns = updatedColumns.map((c, i) => ({ ...c, order_index: i + 1 }));
    
    setColumns(updatedColumns);
    setShowColModal(false);
    setNewColTitle("");
    setInsertPos(null);
    
    await supabase.from("catalog_columns").upsert(updatedColumns);
  };

  const deleteColumn = async (colId: string) => {
    if (!confirm("Are you sure you want to delete this column?")) return;
    setColumns(columns.filter(c => c.id !== colId));
    setActiveColMenu(null);
    await supabase.from("catalog_columns").delete().eq("id", colId);
  };

  const handleCellChange = (rowId: string, colId: string, value: string) => {
    setRows(rows.map(r => {
      if (r.id === rowId) {
        return { ...r, data: { ...r.data, [colId]: value } };
      }
      return r;
    }));
  };

  const saveRow = async (row: any, lock: boolean) => {
    const { isNew, ...dbRow } = row;
    dbRow.is_locked = lock;
    
    setRows(rows.map(r => r.id === row.id ? { ...dbRow, id: isNew ? dbRow.id : r.id } : r));
    
    if (isNew) {
      const insertData = { data: row.data, is_locked: lock };
      const { data } = await supabase.from("architecture_catalog").insert([insertData]).select();
      if (data && data.length > 0) {
        setRows(current => current.map(r => r.id === row.id ? data[0] : r));
      }
    } else {
      await supabase.from("architecture_catalog").update({ data: row.data, is_locked: lock }).eq("id", row.id);
    }
  };

  // Master Save All functionality
  const saveAllRows = async () => {
    setSavingAll(true);
    setStatusNotification(null);
    try {
      const newRows = rows.filter(r => r.isNew || String(r.id).startsWith("temp-"));
      const existingRows = rows.filter(r => !r.isNew && !String(r.id).startsWith("temp-"));

      let updatedRows = [...rows];

      // 1. Insert newly added rows
      if (newRows.length > 0) {
        const rowsToInsert = newRows.map(r => ({
          data: r.data || {},
          is_locked: true
        }));
        const { data: insertedData, error: insertError } = await supabase
          .from("architecture_catalog")
          .insert(rowsToInsert)
          .select();

        if (insertError) throw new Error("Insert failed: " + insertError.message);

        if (insertedData) {
          let insertIdx = 0;
          updatedRows = updatedRows.map(r => {
            if (r.isNew || String(r.id).startsWith("temp-")) {
              const matched = insertedData[insertIdx++];
              return matched ? { ...matched, is_locked: true, isNew: false } : { ...r, is_locked: true, isNew: false };
            }
            return r;
          });
        }
      }

      // 2. Update all existing rows
      for (const row of existingRows) {
        const { error: updateError } = await supabase
          .from("architecture_catalog")
          .update({ data: row.data || {}, is_locked: true })
          .eq("id", row.id);
        if (updateError) console.warn("Row update error:", updateError);
      }

      // 3. Mark all rows as saved & locked in state
      updatedRows = updatedRows.map(r => ({ ...r, is_locked: true, isNew: false }));
      setRows(updatedRows);
      setStatusNotification({ msg: `Successfully saved all ${rows.length} projects to Supabase!`, type: "success" });
      setTimeout(() => setStatusNotification(null), 4000);
    } catch (err: any) {
      console.error("Save all error:", err);
      setStatusNotification({ msg: "Error saving catalog: " + (err.message || String(err)), type: "error" });
    } finally {
      setSavingAll(false);
    }
  };

  const toggleAllLock = async (lockState: boolean) => {
    setSavingAll(true);
    try {
      await supabase
        .from("architecture_catalog")
        .update({ is_locked: lockState })
        .neq("id", "00000000-0000-0000-0000-000000000000");
      setRows(rows.map(r => ({ ...r, is_locked: lockState })));
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSavingAll(false);
    }
  };

  const deleteRow = async (rowId: string) => {
    if (!confirm("Delete this building from catalog?")) return;
    setRows(rows.filter(r => r.id !== rowId));
    if (!rowId.startsWith("temp-")) {
      await supabase.from("architecture_catalog").delete().eq("id", rowId);
    }
  };

  const toggleColumnVisibility = async (colId: string, currentVisible: boolean) => {
    setColumns(columns.map(c => c.id === colId ? { ...c, is_visible: !currentVisible } : c));
    await supabase.from("catalog_columns").update({ is_visible: !currentVisible }).eq("id", colId);
  };

  const handleCatalogImageUpload = async (rowId: string, colId: string, file?: File) => {
    if (!file) return;
    const cellKey = `${rowId}-${colId}`;
    setUploadingCells(prev => ({ ...prev, [cellKey]: true }));
    try {
      const folder = colId.includes("architect") ? "/architect-photos" : "/building-photos";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Upload failed");
      }

      const data = await res.json();
      if (data.url) {
        handleCellChange(rowId, colId, data.url);
      }
    } catch (err: any) {
      alert("Error uploading to ImageKit: " + err.message);
    } finally {
      setUploadingCells(prev => ({ ...prev, [cellKey]: false }));
    }
  };

  const handleGalleryImageUpload = async (rowId: string, file?: File) => {
    if (!file) return;
    const cellKey = `${rowId}-building_photo`;
    setUploadingCells(prev => ({ ...prev, [cellKey]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "/building-photos");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data.url) {
        const targetRow = rows.find(r => r.id === rowId);
        if (targetRow) {
          const updatedRow = {
            ...targetRow,
            data: { ...targetRow.data, building_photo: data.url }
          };
          await saveRow(updatedRow, targetRow.is_locked ?? true);
          setStatusNotification({ msg: "Building photo updated and saved!", type: "success" });
          setTimeout(() => setStatusNotification(null), 3000);
        }
      }
    } catch (err: any) {
      alert("Error uploading photo: " + err.message);
    } finally {
      setUploadingCells(prev => ({ ...prev, [cellKey]: false }));
    }
  };

  const handleRemoveBuildingPhoto = async (row: any) => {
    if (!confirm(`Remove building photo for "${row.data?.building_name || 'this building'}"?`)) return;
    const updatedRow = {
      ...row,
      data: { ...row.data, building_photo: "" }
    };
    await saveRow(updatedRow, row.is_locked ?? true);
    setStatusNotification({ msg: "Photo removed!", type: "success" });
    setTimeout(() => setStatusNotification(null), 3000);
  };

  // Horizontal Scroll Action
  const scrollHorizontal = (dir: 'left' | 'right') => {
    if (!tableContainerRef.current) return;
    const offset = dir === 'left' ? -400 : 400;
    tableContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleTableScroll = () => {
    if (!tableContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.round((scrollLeft / maxScroll) * 100));
    } else {
      setScrollProgress(0);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = Number(e.target.value);
    setScrollProgress(pct);
    if (!tableContainerRef.current) return;
    const { scrollWidth, clientWidth } = tableContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    tableContainerRef.current.scrollLeft = (pct / 100) * maxScroll;
  };

  // Sorting Handler
  const handleSort = (colId: string) => {
    if (sortCol === colId) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortCol(null);
        setSortDir("asc");
      }
    } else {
      setSortCol(colId);
      setSortDir("asc");
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setColumnFilters({});
    setCategoryFilter("all");
  };

  const hasActiveFilters = searchQuery.trim() !== "" || Object.keys(columnFilters).length > 0 || categoryFilter !== "all";

  // Filtered & Sorted Rows
  const processedRows = useMemo(() => {
    let result = [...rows];

    // Category Filter
    if (categoryFilter === "india") {
      result = result.filter(r => (r.data?.country || "").toLowerCase().includes("india"));
    } else if (categoryFilter === "pritzker") {
      result = result.filter(r => r.data?.pritzker_prize_year != null && String(r.data.pritzker_prize_year).trim() !== "");
    }

    // Global Search Query across all fields
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(r => {
        const d = r.data || {};
        return Object.values(d).some(v => String(v || "").toLowerCase().includes(q));
      });
    }

    // Column-specific individual filters
    Object.entries(columnFilters).forEach(([colId, filterVal]) => {
      if (filterVal && filterVal.trim()) {
        const f = filterVal.toLowerCase().trim();
        result = result.filter(r => {
          const val = r.data?.[colId];
          return val != null && String(val).toLowerCase().includes(f);
        });
      }
    });

    // Sort
    if (sortCol) {
      result.sort((a, b) => {
        let valA = a.data?.[sortCol];
        let valB = b.data?.[sortCol];

        if (valA == null) valA = "";
        if (valB == null) valB = "";

        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB) && valA !== "" && valB !== "") {
          return sortDir === "asc" ? numA - numB : numB - numA;
        }

        const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [rows, categoryFilter, searchQuery, columnFilters, sortCol, sortDir]);

  const renderCellInput = (row: any, col: any) => {
    const val = row.data[col.id] || "";
    
    if (row.is_locked) {
      if (col.type === "image") {
        return val ? (
          <a href={val} target="_blank" rel="noreferrer" className="flex items-center gap-2 group">
            <img src={val} alt="preview" className="h-8 w-8 object-cover rounded border border-gray-200 group-hover:opacity-80 transition shrink-0 shadow-xs" />
            <span className="text-[11px] text-blue-600 underline truncate max-w-[100px] font-mono">View Photo</span>
          </a>
        ) : <span className="text-gray-300 text-xs italic">No image</span>;
      }
      if (col.type === "link") {
        return val ? <a href={val} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-xs"><LinkIcon size={12}/> Link</a> : <span className="text-gray-400 text-xs">-</span>;
      }
      return (
        <div 
          className="truncate px-2 py-1 text-xs font-medium text-gray-800" 
          title={typeof val === "string" ? val : JSON.stringify(val)}
        >
          {val || <span className="text-gray-300">-</span>}
        </div>
      );
    }
    
    // Editable cell
    if (col.type === "image") {
      const isUploading = uploadingCells[`${row.id}-${col.id}`];
      return (
        <div className="flex items-center gap-1.5 w-full">
          {val ? (
            <div className="relative shrink-0">
              <img src={val} alt="preview" className="h-7 w-7 object-cover rounded border border-gray-200" />
            </div>
          ) : null}
          <input 
            type="text" 
            placeholder="URL or Upload..."
            value={val}
            onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-black min-w-[80px]"
          />
          <label 
            className={`cursor-pointer p-1.5 rounded transition shrink-0 flex items-center justify-center ${
              isUploading ? "bg-gray-200 text-gray-400" : "bg-black text-white hover:bg-gray-800"
            }`} 
            title="Upload photo to ImageKit"
          >
            {isUploading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <UploadCloud size={13} />
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              disabled={isUploading}
              onChange={(e) => handleCatalogImageUpload(row.id, col.id, e.target.files?.[0])}
            />
          </label>
        </div>
      );
    }
    
    return (
      <input
        type={col.type === "number" ? "number" : "text"}
        value={val}
        onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-black bg-white"
        placeholder={`${col.title}...`}
      />
    );
  };

  const visibleColumns = columns.filter(c => c.is_visible);
  const indiaCount = useMemo(() => rows.filter(r => (r.data?.country || "").toLowerCase().includes("india")).length, [rows]);
  const pritzkerCount = useMemo(() => rows.filter(r => r.data?.pritzker_prize_year != null && String(r.data.pritzker_prize_year).trim() !== "").length, [rows]);

  return (
    <>
      <Navbar />
      <div className="h-screen max-h-screen bg-gray-50 flex flex-col pt-[80px] overflow-hidden" onClick={() => setActiveColMenu(null)}>
        
        {/* HEADER TOOLBAR */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 z-10 shrink-0 shadow-xs">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              🏛️ Architecture Catalog 
              <span className="bg-blue-100 text-blue-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {rows.length} Projects
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {columns.length} Columns
              </span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Excel-style architecture database. Sort by clicking any header, filter individual columns, and slide horizontally.</p>
          </div>

          {!setupRequired && !loading && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* MASTER SAVE ALL BUTTON */}
              <button 
                onClick={saveAllRows} 
                disabled={savingAll}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition text-xs shadow-sm disabled:opacity-50"
                title="Save all rows and modifications at once to Supabase"
              >
                {savingAll ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {savingAll ? "Saving All..." : `Save All (${rows.length})`}
              </button>

              {/* TOGGLE COLUMN FILTERS */}
              <button 
                onClick={() => setShowFiltersRow(!showFiltersRow)} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-xs font-semibold border ${
                  showFiltersRow ? "bg-black text-white border-black" : "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300"
                }`}
                title="Toggle column-by-column filter inputs"
              >
                <Filter size={13} /> {showFiltersRow ? "Hide Filters" : "Filter Columns"}
              </button>

              {/* Lock / Unlock All */}
              <button 
                onClick={() => toggleAllLock(true)} 
                disabled={savingAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition text-xs border border-gray-300"
                title="Lock all rows (clean read mode)"
              >
                <Lock size={13} className="text-green-600" /> Lock All
              </button>

              <button 
                onClick={() => toggleAllLock(false)} 
                disabled={savingAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition text-xs border border-gray-300"
                title="Unlock all rows for editing"
              >
                <Unlock size={13} className="text-amber-600" /> Unlock All
              </button>

              <button 
                onClick={() => { setInsertPos(null); setShowColModal(true); }} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-lg transition text-xs border border-gray-300"
              >
                <Plus size={13} /> Add Column
              </button>

              <button 
                onClick={addRow} 
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition text-xs shadow-xs"
              >
                <Plus size={13} /> Add Building
              </button>

              <AdminQuickMenu />
            </div>
          )}
        </div>

        {/* SEARCH & QUICK CATEGORY FILTER BAR */}
        {!setupRequired && !loading && (
          <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative min-w-[280px] max-w-md flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Global search across all columns..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-gray-50/50"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Quick Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">Category:</span>
              <button 
                onClick={() => setCategoryFilter("all")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  categoryFilter === "all" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({rows.length})
              </button>
              <button 
                onClick={() => setCategoryFilter("india")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
                  categoryFilter === "india" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🇮🇳 Indian Masterpieces ({indiaCount})
              </button>
              <button 
                onClick={() => setCategoryFilter("pritzker")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
                  categoryFilter === "pritzker" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🏆 Pritzker Laureates ({pritzkerCount})
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  viewMode === "table" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"
                }`}
                title="Spreadsheet Table View"
              >
                <LayoutList size={14} />
                <span>Table View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  viewMode === "grid" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"
                }`}
                title="Visual Cards & Large Photos View"
              >
                <LayoutGrid size={14} />
                <span>Large Cards</span>
              </button>
            </div>

            {/* Active status & clear filters */}
            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
              <div>
                Showing <span className="font-bold text-gray-900">{processedRows.length}</span> of {rows.length} Projects
                {sortCol && (
                  <span className="ml-2 text-blue-600 font-mono text-[11px]">
                    (Sorted by {columns.find(c => c.id === sortCol)?.title || sortCol} {sortDir === "asc" ? "▲" : "▼"})
                  </span>
                )}
              </div>
              {hasActiveFilters && (
                <button 
                  onClick={clearAllFilters}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-bold underline"
                  title="Clear all search and column filters"
                >
                  <X size={12} /> Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* CONTENT AREA: TABLE VIEW OR CARDS GALLERY */}
        <div className={`flex-1 p-4 md:p-6 flex flex-col bg-gray-100/60 ${viewMode === 'grid' ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 font-bold gap-2">
              <Loader2 size={24} className="animate-spin text-black" />
              <span>Loading Architecture Catalog...</span>
            </div>
          ) : setupRequired ? (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 max-w-3xl mx-auto mt-10">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Database Setup Required</h2>
              <p className="text-gray-600 mb-6">
                The Architecture Catalog tables do not exist yet. Please run the script in your Supabase SQL editor:
              </p>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-6 rounded-xl overflow-x-auto text-sm font-mono mb-6">
                  {sqlSnippet}
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(sqlSnippet)}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                >
                  Copy SQL
                </button>
              </div>
              <button onClick={checkDatabase} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition">
                I have run the script. Reload Page.
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* ================= LARGE CARDS / GALLERY VIEW ================= */
            <div className="flex-1 pb-16">
              {processedRows.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
                  <span className="text-4xl mb-3 block">🏛️</span>
                  <h3 className="text-base font-bold text-gray-900">No Projects Found</h3>
                  <p className="text-xs text-gray-500 mt-1">Try clearing your search query or filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {processedRows.map((row, idx) => {
                    const data = row.data || {};
                    const isUploading = uploadingCells[`${row.id}-building_photo`];
                    const isEditing = editingCardId === row.id;
                    const photoUrl = data.building_photo || "";

                    return (
                      <div 
                        key={row.id}
                        className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col group relative"
                      >
                        {/* Image Header */}
                        <div className="h-52 bg-gray-100 relative overflow-hidden group/img shrink-0 border-b border-gray-100">
                          {photoUrl ? (
                            <>
                              <img 
                                src={photoUrl} 
                                alt={data.building_name || "Building"} 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300 cursor-pointer"
                                onClick={() => setLightboxImage({ url: photoUrl, title: data.building_name || "Building Photo" })}
                              />
                              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setLightboxImage({ url: photoUrl, title: data.building_name || "Building Photo" })}
                                  className="p-2.5 bg-white/95 hover:bg-white text-gray-900 rounded-xl shadow-xs transition"
                                  title="Zoom in full view"
                                >
                                  <ZoomIn size={16} />
                                </button>
                                <label 
                                  className="p-2.5 bg-white/95 hover:bg-white text-gray-900 rounded-xl shadow-xs transition cursor-pointer"
                                  title="Replace with new photo"
                                >
                                  <UploadCloud size={16} />
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    disabled={isUploading}
                                    onChange={(e) => handleGalleryImageUpload(row.id, e.target.files?.[0])}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBuildingPhoto(row)}
                                  className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition"
                                  title="Remove this photo from building"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gray-50 border-b border-dashed border-gray-200">
                              <span className="text-3xl mb-1 text-gray-300">🖼️</span>
                              <span className="text-xs font-bold text-gray-400 mb-2">No Photo Attached</span>
                              <label className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition">
                                {isUploading ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                                <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  disabled={isUploading}
                                  onChange={(e) => handleGalleryImageUpload(row.id, e.target.files?.[0])}
                                />
                              </label>
                            </div>
                          )}

                          {/* Index & Year Badges */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
                            <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                              #{idx + 1}
                            </span>
                            {data.opened_year && (
                              <span className="bg-white/90 backdrop-blur-xs text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                {data.opened_year}
                              </span>
                            )}
                          </div>

                          {/* Country Badge */}
                          <div className="absolute top-2.5 right-2.5 pointer-events-none">
                            {data.country && (
                              <span className="bg-white/90 backdrop-blur-xs text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                {data.country}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          {isEditing ? (
                            <div className="space-y-2 mb-3">
                              <div>
                                <label className="text-[10px] font-bold uppercase text-gray-500">Building Name</label>
                                <input 
                                  type="text" 
                                  value={data.building_name || ""} 
                                  onChange={(e) => handleCellChange(row.id, "building_name", e.target.value)}
                                  className="w-full text-xs font-bold border border-gray-300 rounded p-1.5 focus:outline-hidden focus:border-black"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold uppercase text-gray-500">Architect</label>
                                <input 
                                  type="text" 
                                  value={data.architect || ""} 
                                  onChange={(e) => handleCellChange(row.id, "architect", e.target.value)}
                                  className="w-full text-xs border border-gray-300 rounded p-1.5 focus:outline-hidden focus:border-black"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-bold uppercase text-gray-500">City</label>
                                  <input 
                                    type="text" 
                                    value={data.city || ""} 
                                    onChange={(e) => handleCellChange(row.id, "city", e.target.value)}
                                    className="w-full text-xs border border-gray-300 rounded p-1.5 focus:outline-hidden focus:border-black"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold uppercase text-gray-500">Year</label>
                                  <input 
                                    type="number" 
                                    value={data.opened_year || ""} 
                                    onChange={(e) => handleCellChange(row.id, "opened_year", e.target.value)}
                                    className="w-full text-xs border border-gray-300 rounded p-1.5 focus:outline-hidden focus:border-black"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold uppercase text-gray-500">Photo URL</label>
                                <input 
                                  type="text" 
                                  value={data.building_photo || ""} 
                                  onChange={(e) => handleCellChange(row.id, "building_photo", e.target.value)}
                                  className="w-full text-xs border border-gray-300 rounded p-1.5 focus:outline-hidden focus:border-black font-mono text-[11px]"
                                  placeholder="https://... or /quizzes/..."
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <h3 className="font-extrabold text-sm text-gray-900 line-clamp-1 mb-1" title={data.building_name}>
                                {data.building_name || "Unnamed Building"}
                              </h3>
                              <p className="text-xs text-gray-600 line-clamp-1 font-medium mb-1">
                                {data.architect ? `By ${data.architect}` : "Architect not specified"}
                              </p>
                              <p className="text-[11px] text-gray-400 line-clamp-1 mb-3">
                                📍 {[data.city, data.country].filter(Boolean).join(", ") || "Location unlisted"}
                              </p>

                              {data.architectural_style && (
                                <div className="mb-3">
                                  <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-md inline-block line-clamp-1">
                                    {data.architectural_style}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Card Footer Actions */}
                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setEditingCardId(null)}
                                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-black font-semibold rounded-lg"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await saveRow(row, true);
                                    setEditingCardId(null);
                                    setStatusNotification({ msg: "Building saved!", type: "success" });
                                    setTimeout(() => setStatusNotification(null), 3000);
                                  }}
                                  className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs"
                                >
                                  <Save size={13} /> Save
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setEditingCardId(row.id)}
                                  className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 border border-gray-200"
                                >
                                  <Edit2 size={13} /> Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => deleteRow(row.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition border border-red-200"
                                  title="Delete this building completely"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ================= EXISTING EXCEL TABLE VIEW ================= */
            <div 
              ref={tableContainerRef}
              onScroll={handleTableScroll}
              className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-200 flex-1 overflow-x-scroll overflow-y-auto relative excel-scrollbar"
              style={{ maxHeight: 'calc(100vh - 280px)' }}
            >
              <table className="w-max min-w-full text-left border-collapse table-fixed select-text">
                <thead className="bg-gray-50 sticky top-0 z-30 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                  {/* MAIN HEADER ROW */}
                  <tr>
                    {/* Index Col # */}
                    <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase w-12 min-w-[48px] text-center border-r border-b border-gray-200 bg-gray-100 sticky left-0 z-40">
                      #
                    </th>
                    
                    {visibleColumns.map((col) => {
                      const isBuildingName = col.id === "building_name";
                      const isSorted = sortCol === col.id;
                      return (
                        <th 
                          key={col.id} 
                          className={`px-3 py-2.5 text-xs font-bold text-gray-700 border-r border-b border-gray-200 relative group transition-colors ${
                            isBuildingName 
                              ? "sticky left-12 z-40 bg-gray-100 min-w-[240px] w-[240px] border-r-2 border-r-gray-300 shadow-[4px_0_8px_rgba(0,0,0,0.04)]" 
                              : isSorted
                              ? "min-w-[190px] w-[190px] bg-blue-50/70 border-b-2 border-b-blue-500"
                              : "min-w-[190px] w-[190px] bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          {/* Column Header Content with Click to Sort */}
                          <div className="flex items-center justify-between gap-1 relative z-10">
                            <div 
                              onClick={() => handleSort(col.id)}
                              className="flex items-center gap-1.5 cursor-pointer select-none py-1 group/sort flex-1 truncate"
                              title={`Click to sort by ${col.title} (${isSorted ? (sortDir === 'asc' ? 'Ascending' : 'Descending') : 'Click to Sort'})`}
                            >
                              <span className={`uppercase tracking-wider font-bold truncate text-[11px] ${isSorted ? "text-blue-900" : "text-gray-700 group-hover/sort:text-black"}`}>
                                {col.title}
                              </span>
                              {isSorted ? (
                                sortDir === "asc" ? (
                                  <ArrowUp size={13} className="text-blue-600 shrink-0 font-bold" />
                                ) : (
                                  <ArrowDown size={13} className="text-blue-600 shrink-0 font-bold" />
                                )
                              ) : (
                                <ArrowUpDown size={11} className="text-gray-400 opacity-40 group-hover/sort:opacity-100 shrink-0 transition" />
                              )}
                            </div>

                            {/* Dropdown Options Trigger */}
                            <button 
                              onClick={(e) => { e.stopPropagation(); setActiveColMenu(activeColMenu === col.id ? null : col.id); }} 
                              className="text-gray-400 hover:text-black hover:bg-gray-200 rounded p-1 opacity-0 group-hover:opacity-100 transition focus:opacity-100 shrink-0"
                              title="Column Options"
                            >
                              <ChevronDown size={13} />
                            </button>
                          </div>
                          
                          {/* Dropdown Menu */}
                          {activeColMenu === col.id && (
                            <div className="absolute top-full right-0 mt-1 bg-white shadow-2xl border border-gray-200 rounded-xl py-1.5 w-48 z-[100] text-sm font-medium text-gray-700 font-sans normal-case">
                              <button onClick={() => { handleSort(col.id); setActiveColMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-xs">
                                <ArrowUpDown size={13} /> Sort {col.title}
                              </button>
                              <div className="h-px bg-gray-100 my-1"></div>
                              <button onClick={(e) => { e.stopPropagation(); setInsertPos({colId: col.id, direction: 'left'}); setShowColModal(true); setActiveColMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-xs">
                                <ArrowLeftToLine size={13} /> Insert Column Left
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setInsertPos({colId: col.id, direction: 'right'}); setShowColModal(true); setActiveColMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-xs">
                                <ArrowRightToLine size={13} /> Insert Column Right
                              </button>
                              <div className="h-px bg-gray-100 my-1"></div>
                              <button onClick={(e) => { e.stopPropagation(); toggleColumnVisibility(col.id, true); setActiveColMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-xs">
                                <EyeOff size={13} /> Hide Column
                              </button>
                              {!col.is_core && (
                                <button onClick={(e) => { e.stopPropagation(); deleteColumn(col.id); }} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 text-xs">
                                  <Trash2 size={13} /> Delete Column
                                </button>
                              )}
                            </div>
                          )}

                          {/* Excel-style Plus Line on Hover between columns */}
                          <div 
                            className="absolute top-0 right-[-6px] w-3 h-full cursor-col-resize group/edge flex items-center justify-center z-20"
                            onClick={(e) => { e.stopPropagation(); setInsertPos({colId: col.id, direction: 'right'}); setShowColModal(true); }}
                          >
                            <div className="h-full w-[2px] bg-blue-500 opacity-0 group-hover/edge:opacity-100 transition-opacity"></div>
                            <div className="hidden group-hover/edge:flex absolute bg-blue-500 text-white rounded-full w-4 h-4 items-center justify-center text-[10px] z-30 shadow-md border border-white">
                              <Plus size={10} strokeWidth={3} />
                            </div>
                          </div>
                        </th>
                      );
                    })}
                    
                    {/* Action Column */}
                    <th className="px-3 py-3 text-xs font-bold text-gray-600 uppercase sticky right-0 bg-gray-100 border-l border-b border-gray-200 shadow-[-4px_0_10px_rgba(0,0,0,0.04)] z-40 w-24 min-w-[96px] text-center">
                      Action
                    </th>
                  </tr>

                  {/* COLUMN-SPECIFIC FILTER INPUT ROW */}
                  {showFiltersRow && (
                    <tr className="bg-gray-100/95 border-b border-gray-200 shadow-xs">
                      {/* Under # column */}
                      <th className="p-1.5 text-center border-r border-gray-200 bg-gray-200 sticky left-0 z-40">
                        <Filter size={11} className="mx-auto text-gray-500" />
                      </th>
                      {visibleColumns.map((col) => {
                        const isBuildingName = col.id === "building_name";
                        return (
                          <th 
                            key={`filter-${col.id}`}
                            className={`p-1.5 border-r border-gray-200 ${
                              isBuildingName 
                                ? "sticky left-12 z-40 bg-gray-200 border-r-2 border-r-gray-300" 
                                : "bg-gray-100"
                            }`}
                          >
                            <div className="relative">
                              <input 
                                type="text"
                                placeholder={`Filter ${col.title}...`}
                                value={columnFilters[col.id] || ""}
                                onChange={(e) => setColumnFilters(prev => ({ ...prev, [col.id]: e.target.value }))}
                                className="w-full pl-2 pr-5 py-1 text-[11px] font-normal border border-gray-300 rounded bg-white focus:outline-none focus:border-black shadow-inner"
                              />
                              {columnFilters[col.id] && (
                                <button 
                                  onClick={() => setColumnFilters(prev => {
                                    const copy = { ...prev };
                                    delete copy[col.id];
                                    return copy;
                                  })}
                                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                                  title="Clear filter"
                                >
                                  <X size={10} />
                                </button>
                              )}
                            </div>
                          </th>
                        );
                      })}
                      {/* Action column reset button */}
                      <th className="p-1.5 sticky right-0 bg-gray-200 border-l border-gray-200 z-40 text-center">
                        {Object.keys(columnFilters).length > 0 && (
                          <button 
                            onClick={() => setColumnFilters({})}
                            className="text-[10px] text-red-600 font-bold hover:underline"
                            title="Clear all column filters"
                          >
                            Reset
                          </button>
                        )}
                      </th>
                    </tr>
                  )}
                </thead>
                <tbody className="text-sm">
                  {processedRows.length === 0 && (
                    <tr>
                      <td colSpan={visibleColumns.length + 2} className="px-6 py-12 text-center text-gray-400 italic">
                        {searchQuery || Object.keys(columnFilters).length > 0 
                          ? "No architecture projects match your filter criteria." 
                          : "No rows found in catalog."}
                      </td>
                    </tr>
                  )}
                  {processedRows.map((row, index) => {
                    const isRowLocked = row.is_locked !== false;
                    return (
                      <tr 
                        key={row.id} 
                        className={`border-b border-gray-100 transition ${
                          isRowLocked ? "bg-white hover:bg-blue-50/20" : "bg-amber-50/30 hover:bg-amber-50/50"
                        }`}
                      >
                        {/* Row Index */}
                        <td className={`px-3 py-2 text-gray-400 text-center border-r border-gray-200 font-mono text-xs sticky left-0 z-20 ${
                          isRowLocked ? "bg-gray-50" : "bg-amber-100/50 text-amber-800 font-bold"
                        }`}>
                          {index + 1}
                        </td>
                        
                        {/* Data Cells */}
                        {visibleColumns.map((col) => {
                          const isBuildingName = col.id === "building_name";
                          return (
                            <td 
                              key={col.id} 
                              className={`px-2 py-1.5 border-r border-gray-100 align-middle ${
                                isBuildingName 
                                  ? `sticky left-12 z-20 font-bold border-r-2 border-r-gray-300 shadow-[4px_0_8px_rgba(0,0,0,0.04)] ${
                                      isRowLocked ? "bg-white text-gray-900" : "bg-amber-50/70"
                                    }` 
                                  : ""
                              }`}
                            >
                              {renderCellInput(row, col)}
                            </td>
                          );
                        })}
                        
                        {/* Row Action (Edit / Save / Delete) */}
                        <td className={`px-3 py-1.5 sticky right-0 border-l border-gray-200 shadow-[-4px_0_10px_rgba(0,0,0,0.03)] flex items-center justify-center gap-1.5 z-20 ${
                          isRowLocked ? "bg-white" : "bg-amber-50/70"
                        }`}>
                          {isRowLocked ? (
                            <button 
                              onClick={() => saveRow(row, false)} 
                              className="p-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded transition" 
                              title="Edit this project"
                            >
                              <Edit2 size={14} />
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={() => saveRow(row, true)} 
                                className="px-2 py-1 bg-black text-white rounded text-[11px] font-bold hover:bg-gray-800 transition shadow-xs flex items-center gap-1"
                              >
                                <Save size={12} /> Save
                              </button>
                              <button 
                                onClick={() => deleteRow(row.id)} 
                                className="p-1 text-red-400 hover:bg-red-50 hover:text-red-600 rounded transition" 
                                title="Delete Project"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Floating Status Notification Toast */}
      {statusNotification && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold text-white transition-all transform animate-in fade-in slide-in-from-bottom-3 ${
          statusNotification.type === "success" ? "bg-emerald-600" : "bg-red-600"
        }`}>
          {statusNotification.type === "success" && <CheckCircle2 size={16} />}
          <span>{statusNotification.msg}</span>
          <button onClick={() => setStatusNotification(null)} className="ml-2 hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[120] flex flex-col items-center justify-center p-4 select-none animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition"
            >
              <X size={18} /> Close
            </button>
            <img 
              src={lightboxImage.url} 
              alt={lightboxImage.title}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/10" 
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white text-xs font-bold mt-3 text-center px-4 py-1.5 bg-black/60 rounded-full border border-white/10 backdrop-blur-xs">
              {lightboxImage.title}
            </p>
          </div>
        </div>
      )}

      {/* Add Column Modal */}
      {showColModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus size={20} /> Insert Column {insertPos?.direction === 'left' ? 'Left' : insertPos?.direction === 'right' ? 'Right' : ''}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Column Header Name</label>
                <input 
                  type="text"
                  value={newColTitle}
                  onChange={e => setNewColTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  placeholder="e.g. Structural Material"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Data Type</label>
                <select 
                  value={newColType}
                  onChange={e => setNewColType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
                >
                  <option value="text">Text (Short String)</option>
                  <option value="number">Number (Years, Costs)</option>
                  <option value="link">URL / Link</option>
                  <option value="image">Image URL</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button onClick={() => { setShowColModal(false); setInsertPos(null); }} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">
                Cancel
              </button>
              <button onClick={addColumn} className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition">
                Add Column
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}