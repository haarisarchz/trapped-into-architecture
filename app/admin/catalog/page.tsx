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
  LayoutList, LayoutGrid, ZoomIn, Eye, ExternalLink, GripVertical, ArrowLeft, ArrowRight
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

export const ARCHITECT_PORTRAIT_MAP: Record<string, string> = {
  "frank lloyd wright": "/architect-photos/frank-lloyd-wright.jpg",
  "le corbusier": "/architect-photos/le-corbusier.jpg",
  "ludwig mies van der rohe": "/architect-photos/ludwig-mies-van-der-rohe.jpg",
  "mies van der rohe": "/architect-photos/ludwig-mies-van-der-rohe.jpg",
  "antoni gaudi": "/architect-photos/antoni-gaudi.jpg",
  "antoni gaudí": "/architect-photos/antoni-gaudi.jpg",
  "zaha hadid": "/architect-photos/zaha-hadid.jpg",
  "zaha hadid architects": "/architect-photos/zaha-hadid.jpg",
  "frank gehry": "/architect-photos/frank-gehry.jpg",
  "gehry partners": "/architect-photos/frank-gehry.jpg",
  "i. m. pei": "/architect-photos/i-m-pei.jpg",
  "i.m. pei": "/architect-photos/i-m-pei.jpg",
  "im pei": "/architect-photos/i-m-pei.jpg",
  "norman foster": "/architect-photos/norman-foster.jpg",
  "foster + partners": "/architect-photos/norman-foster.jpg",
  "foster and partners": "/architect-photos/norman-foster.jpg",
  "santiago calatrava": "/architect-photos/santiago-calatrava.jpg",
  "jorn utzon": "/architect-photos/jorn-utzon.jpg",
  "jørn utzon": "/architect-photos/jorn-utzon.jpg",
  "tadao ando": "/architect-photos/tadao-ando.jpg",
  "louis kahn": "/architect-photos/louis-kahn.jpg",
  "renzo piano": "/architect-photos/renzo-piano.jpg",
  "renzo piano building workshop": "/architect-photos/renzo-piano.jpg",
  "eero saarinen": "/architect-photos/eero-saarinen.jpg",
  "oscar niemeyer": "/architect-photos/oscar-niemeyer.jpg",
  "alvar aalto": "/architect-photos/alvar-aalto.jpg",
  "philip johnson": "/architect-photos/philip-johnson.jpg",
  "jean nouvel": "/architect-photos/jean-nouvel.jpg",
  "ateliers jean nouvel": "/architect-photos/jean-nouvel.jpg",
  "richard rogers": "/architect-photos/richard-rogers.jpg",
  "rogers stirk harbour": "/architect-photos/richard-rogers.jpg",
  "herzog & de meuron": "/architect-photos/herzog-de-meuron.jpg",
  "herzog and de meuron": "/architect-photos/herzog-de-meuron.jpg",
  "jacques herzog & pierre de meuron": "/architect-photos/herzog-de-meuron.jpg",
  "b. v. doshi": "/architect-photos/b-v-doshi.jpg",
  "b.v. doshi": "/architect-photos/b-v-doshi.jpg",
  "balkrishna doshi": "/architect-photos/b-v-doshi.jpg",
  "balkrishna v. doshi": "/architect-photos/b-v-doshi.jpg",
  "charles correa": "/architect-photos/charles-correa.jpg",
  "laurie baker": "/architect-photos/laurie-baker.jpg",
  "peter zumthor": "/architect-photos/peter-zumthor.jpg",
  "kenzo tange": "/architect-photos/kenzo-tange.jpg",
  "kenzō tange": "/architect-photos/kenzo-tange.jpg",
  "frei otto": "/architect-photos/frei-otto.jpg",
  "toyo ito": "/architect-photos/toyo-ito.jpg",
  "toyo ito & associates": "/architect-photos/toyo-ito.jpg",
  "sanaa": "/architect-photos/sanaa-sejima-nishizawa.jpg",
  "kazuyo sejima": "/architect-photos/sanaa-sejima-nishizawa.jpg",
  "kazuyo sejima & ryue nishizawa": "/architect-photos/sanaa-sejima-nishizawa.jpg",
  "sanaa (kazuyo sejima & ryue nishizawa)": "/architect-photos/sanaa-sejima-nishizawa.jpg",
  "raj rewal": "/architect-photos/raj-rewal.jpg",
  "fariborz sahba": "/architect-photos/fariborz-sahba.jpg",
  "roger anger": "/architect-photos/roger-anger.jpg",
  "rem koolhaas": "/architect-photos/rem-koolhaas.jpg",
  "oma": "/architect-photos/rem-koolhaas.jpg",
  "rem koolhaas (oma)": "/architect-photos/rem-koolhaas.jpg",
  "oma / rem koolhaas": "/architect-photos/rem-koolhaas.jpg",
  "luis barragán": "/architect-photos/luis-barragan.jpg",
  "luis barragan": "/architect-photos/luis-barragan.jpg",
  "richard meier": "/architect-photos/richard-meier.jpg",
  "achyut kanvinde": "/architect-photos/achyut-kanvinde.jpg",
  "anant raje": "/architect-photos/anant-raje.jpg"
};

export const getArchitectPhotoByName = (name?: string): string => {
  if (!name) return "";
  const clean = name.toLowerCase().trim();
  for (const [key, photo] of Object.entries(ARCHITECT_PORTRAIT_MAP)) {
    if (clean.includes(key) || key.includes(clean)) return photo;
  }
  return "";
};

export const CATALOG_LOCATION_MAP: Record<string, { city: string; state_region: string; country?: string }> = {
  "the getty center, united states": { city: "Los Angeles", state_region: "California", country: "United States" },
  "paimio sanatorium, finland": { city: "Paimio", state_region: "Southwest Finland", country: "Finland" },
  "villa mairea, finland": { city: "Noormarkku", state_region: "Satakunta", country: "Finland" },
  "maxxi museum, italy": { city: "Rome", state_region: "Lazio", country: "Italy" },
  "iit kanpur campus, india": { city: "Kanpur", state_region: "Uttar Pradesh", country: "India" },
  "casa luis barragán, mexico": { city: "Mexico City", state_region: "Mexico City", country: "Mexico" },
  "munich olympic stadium roof, germany": { city: "Munich", state_region: "Bavaria", country: "Germany" },
  "national assembly building of bangladesh, bangladesh": { city: "Dhaka", state_region: "Dhaka Division", country: "Bangladesh" },
  "sendai mediatheque, japan": { city: "Sendai", state_region: "Miyagi Prefecture", country: "Japan" },
  "rolex learning center, switzerland": { city: "Lausanne", state_region: "Vaud", country: "Switzerland" },
  "therme vals, switzerland": { city: "Vals", state_region: "Graubünden", country: "Switzerland" },
  "champalimaud centre for the unknown, portugal": { city: "Lisbon", state_region: "Lisbon District", country: "Portugal" },
  "iifm bhopal, india": { city: "Bhopal", state_region: "Madhya Pradesh", country: "India" },
  "gandhi smarak sangrahalaya, india": { city: "Ahmedabad", state_region: "Gujarat", country: "India" },
  "amdavad ni gufa, india": { city: "Ahmedabad", state_region: "Gujarat", country: "India" },
  "robie house, united states": { city: "Chicago", state_region: "Illinois", country: "United States" },
  "row house in sumiyoshi, japan": { city: "Osaka", state_region: "Osaka Prefecture", country: "Japan" },
  "chichu art museum, japan": { city: "Naoshima", state_region: "Kagawa Prefecture", country: "Japan" },
  "hearst tower, united states": { city: "New York City", state_region: "New York", country: "United States" },
  "hsbc main building, hong kong": { city: "Hong Kong", state_region: "Hong Kong SAR", country: "Hong Kong" },
  "bharat bhavan, india": { city: "Bhopal", state_region: "Madhya Pradesh", country: "India" },
  "centre for development studies, india": { city: "Thiruvananthapuram", state_region: "Kerala", country: "India" },
  "hall of nations, india": { city: "New Delhi", state_region: "Delhi (NCT)", country: "India" },
  "matrimandir, india": { city: "Auroville", state_region: "Tamil Nadu", country: "India" },
  "yoyogi national gymnasium, japan": { city: "Tokyo", state_region: "Tokyo Metropolis", country: "Japan" },
  "the glass house, united states": { city: "New Canaan", state_region: "Connecticut", country: "United States" },
  "seagram building, united states": { city: "New York City", state_region: "New York", country: "United States" },
  "solomon r. guggenheim museum, united states": { city: "New York City", state_region: "New York", country: "United States" },
  "church of the light, japan": { city: "Ibaraki", state_region: "Osaka Prefecture", country: "Japan" },
  "dancing house, czech republic": { city: "Prague", state_region: "Prague", country: "Czech Republic" },
  "casa batlló, spain": { city: "Barcelona", state_region: "Catalonia", country: "Spain" },
  "casa milà, spain": { city: "Barcelona", state_region: "Catalonia", country: "Spain" },
  "salk institute for biological studies, united states": { city: "La Jolla", state_region: "California", country: "United States" },
  "kanchanjunga apartments, india": { city: "Mumbai", state_region: "Maharashtra", country: "India" },
  "jawahar kala kendra, india": { city: "Jaipur", state_region: "Rajasthan", country: "India" },
  "iim ahmedabad, india": { city: "Ahmedabad", state_region: "Gujarat", country: "India" },
  "iim bangalore, india": { city: "Bengaluru", state_region: "Karnataka", country: "India" },
  "sangath, india": { city: "Ahmedabad", state_region: "Gujarat", country: "India" },
  "cathedral of brasília, brazil": { city: "Brasília", state_region: "Federal District", country: "Brazil" },
  "twa flight center, united states": { city: "New York City", state_region: "New York", country: "United States" },
  "elbphilharmonie, germany": { city: "Hamburg", state_region: "Hamburg", country: "Germany" },
  "lloyd's building, united kingdom": { city: "London", state_region: "England", country: "United Kingdom" },
  "louvre abu dhabi, united arab emirates": { city: "Abu Dhabi", state_region: "Emirate of Abu Dhabi", country: "United Arab Emirates" },
  "city of arts and sciences, spain": { city: "Valencia", state_region: "Valencian Community", country: "Spain" },
  "palace of assembly, india": { city: "Chandigarh", state_region: "Chandigarh (UT)", country: "India" },
  "fallingwater, united states": { city: "Mill Run", state_region: "Pennsylvania", country: "United States" },
  "farnsworth house, united states": { city: "Plano", state_region: "Illinois", country: "United States" },
  "barcelona pavilion, spain": { city: "Barcelona", state_region: "Catalonia", country: "Spain" },
  "unité d'habitation, france": { city: "Marseille", state_region: "Provence-Alpes-Côte d'Azur", country: "France" },
  "chapelle notre dame du haut, france": { city: "Ronchamp", state_region: "Bourgogne-Franche-Comté", country: "France" },
  "villa savoye, france": { city: "Poissy", state_region: "Île-de-France", country: "France" },
  "heydar aliyev center, azerbaijan": { city: "Baku", state_region: "Absheron", country: "Azerbaijan" },
  "reichstag new german parliament, germany": { city: "Berlin", state_region: "Berlin", country: "Germany" },
  "the oculus, united states": { city: "New York City", state_region: "New York", country: "United States" },
  "cctv headquarters, china": { city: "Beijing", state_region: "Beijing Municipality", country: "China" },
  "gateway arch, united states": { city: "St. Louis", state_region: "Missouri", country: "United States" },
  "lotus temple, india": { city: "New Delhi", state_region: "Delhi (NCT)", country: "India" },
  "the shard, united kingdom": { city: "London", state_region: "England", country: "United Kingdom" },
  "centre pompidou, france": { city: "Paris", state_region: "Île-de-France", country: "France" },
  "walt disney concert hall, united states": { city: "Los Angeles", state_region: "California", country: "United States" },
  "guggenheim museum bilbao, spain": { city: "Bilbao", state_region: "Basque Country", country: "Spain" },
  "sagrada família, spain": { city: "Barcelona", state_region: "Catalonia", country: "Spain" },
  "the gherkin, united kingdom": { city: "London", state_region: "England", country: "United Kingdom" },
  "grand louvre pyramid, france": { city: "Paris", state_region: "Île-de-France", country: "France" },
  "sydney opera house, australia": { city: "Sydney", state_region: "New South Wales", country: "Australia" }
};

export const getCleanCityAndState = (buildingName?: string, rawCity?: string, rawState?: string) => {
  if (buildingName) {
    const cleanName = buildingName.toLowerCase().trim();
    for (const [key, val] of Object.entries(CATALOG_LOCATION_MAP)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        return { city: val.city, state_region: val.state_region };
      }
    }
  }
  let cleanCity = (rawCity || "").trim();
  let cleanState = (rawState || "").trim();
  if (cleanCity.includes(",")) {
    const parts = cleanCity.split(",");
    cleanCity = parts[0].trim();
    if (!cleanState && parts[1]) cleanState = parts[1].trim();
  }
  return { city: cleanCity, state_region: cleanState };
};

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

  // Row Density: Compact vs Expanded (large photos directly in cell)
  const [rowDensity, setRowDensity] = useState<"compact" | "expanded">("expanded");
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Column Drag and Drop Reordering State
  const [draggedColId, setDraggedColId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Excel UX States
  const [activeColMenu, setActiveColMenu] = useState<string | null>(null);
  const [insertPos, setInsertPos] = useState<{ colId: string, direction: 'left' | 'right' } | null>(null);
  const [uploadingCells, setUploadingCells] = useState<Record<string, boolean>>({});
  
  // Ref for table scroll control
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const moveColumn = (draggedId: string, targetId: string) => {
    if (!draggedId || !targetId || draggedId === targetId) return;
    setColumns(prev => {
      const newCols = [...prev];
      const fromIdx = newCols.findIndex(c => c.id === draggedId);
      const toIdx = newCols.findIndex(c => c.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;

      const [moved] = newCols.splice(fromIdx, 1);
      newCols.splice(toIdx, 0, moved);

      const updated = newCols.map((c, idx) => ({ ...c, order_index: idx + 1 }));

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("ti2a_catalog_col_order", JSON.stringify(updated.map(c => c.id)));
        } catch (e) {}
      }

      // Persist order_index to database
      updated.forEach(async (c) => {
        try {
          await supabase.from("catalog_columns").update({ order_index: c.order_index }).eq("id", c.id);
        } catch (e) {}
      });

      return updated;
    });
  };

  const moveColumnStep = (colId: string, direction: 'left' | 'right') => {
    setColumns(prev => {
      const newCols = [...prev];
      const idx = newCols.findIndex(c => c.id === colId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= newCols.length) return prev;

      const [moved] = newCols.splice(idx, 1);
      newCols.splice(targetIdx, 0, moved);

      const updated = newCols.map((c, i) => ({ ...c, order_index: i + 1 }));

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("ti2a_catalog_col_order", JSON.stringify(updated.map(c => c.id)));
        } catch (e) {}
      }

      updated.forEach(async (c) => {
        try {
          await supabase.from("catalog_columns").update({ order_index: c.order_index }).eq("id", c.id);
        } catch (e) {}
      });

      return updated;
    });
  };

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
    
    if (colData) {
      let orderedCols = [...colData];
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("ti2a_catalog_col_order");
          if (cached) {
            const idOrder: string[] = JSON.parse(cached);
            orderedCols.sort((a, b) => {
              const idxA = idOrder.indexOf(a.id);
              const idxB = idOrder.indexOf(b.id);
              if (idxA !== -1 && idxB !== -1) return idxA - idxB;
              if (idxA !== -1) return -1;
              if (idxB !== -1) return 1;
              return (a.order_index || 0) - (b.order_index || 0);
            });
          }
        } catch (e) {}
      }
      setColumns(orderedCols);
    }

    if (rowData) {
      const enrichedRows = rowData.map((r: any) => {
        const d = r.data || {};
        const bName = d.building_name || d.display_name || "";
        const cleanLoc = getCleanCityAndState(bName, d.city, d.state_region);
        
        let updatedData = { 
          ...d, 
          city: cleanLoc.city, 
          state_region: cleanLoc.state_region 
        };

        if (!d.architect_photo && d.architect) {
          const autoPhoto = getArchitectPhotoByName(d.architect);
          if (autoPhoto) {
            updatedData.architect_photo = autoPhoto;
          }
        }
        return {
          ...r,
          data: updatedData
        };
      });
      setRows(enrichedRows);
    }
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
    let val = row.data?.[col.id] || "";
    if (col.id === "architect_photo" && !val && row.data?.architect) {
      val = getArchitectPhotoByName(row.data.architect);
    }
    
    if (row.is_locked) {
      if (col.type === "image") {
        if (rowDensity === "expanded") {
          return val ? (
            <div className="flex flex-col items-center gap-2 p-1.5 min-w-[220px]">
              <div className="relative group/cellimg rounded-xl overflow-hidden border border-gray-200 shadow-xs bg-gray-100 w-52 h-44 shrink-0">
                <img 
                  src={val} 
                  alt="preview" 
                  className="w-full h-full object-cover group-hover/cellimg:scale-105 transition cursor-pointer"
                  onClick={() => setLightboxImage({ url: val, title: row.data?.building_name || "Photo" })}
                />
                <button
                  type="button"
                  onClick={() => setLightboxImage({ url: val, title: row.data?.building_name || "Photo" })}
                  className="absolute bottom-2 right-2 p-1.5 bg-black/75 hover:bg-black text-white rounded-lg opacity-0 group-hover/cellimg:opacity-100 transition shadow-xs"
                  title="Zoom full image"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button 
                  type="button"
                  onClick={() => setLightboxImage({ url: val, title: row.data?.building_name || "Photo" })}
                  className="text-blue-600 hover:underline font-mono text-[11px] flex items-center gap-1 font-bold"
                >
                  <Eye size={12} /> View Full
                </button>
                <label 
                  className="text-gray-600 hover:text-black font-mono text-[11px] cursor-pointer flex items-center gap-1 font-bold"
                  title="Replace photo"
                >
                  <UploadCloud size={12} /> Replace
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleCatalogImageUpload(row.id, col.id, e.target.files?.[0])}
                  />
                </label>
                <button 
                  type="button"
                  onClick={() => handleRemoveBuildingPhoto(row)}
                  className="text-red-500 hover:text-red-700 text-[11px] font-bold"
                  title="Clear photo"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="w-52 h-44 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-3 text-center bg-gray-50/50 min-w-[220px]">
              <span className="text-2xl mb-1 text-gray-300">🖼️</span>
              <span className="text-[11px] text-gray-400 font-semibold mb-2">No photo attached</span>
              <label className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1">
                <UploadCloud size={13} /> Upload Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleCatalogImageUpload(row.id, col.id, e.target.files?.[0])}
                />
              </label>
            </div>
          );
        }

        // Compact Mode Image Cell
        return val ? (
          <div className="flex items-center gap-2 group min-w-[120px]">
            <img 
              src={val} 
              alt="preview" 
              className="h-8 w-8 object-cover rounded border border-gray-200 group-hover:opacity-80 transition shrink-0 shadow-xs cursor-pointer"
              onClick={() => setLightboxImage({ url: val, title: row.data?.building_name || "Photo" })} 
            />
            <button 
              type="button"
              onClick={() => setLightboxImage({ url: val, title: row.data?.building_name || "Photo" })}
              className="text-[11px] text-blue-600 underline truncate max-w-[100px] font-mono hover:text-blue-800"
            >
              View Photo
            </button>
          </div>
        ) : <span className="text-gray-300 text-xs italic">No image</span>;
      }
      if (col.type === "link") {
        return val ? <a href={val} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-xs"><LinkIcon size={12}/> Link</a> : <span className="text-gray-400 text-xs">-</span>;
      }
      return (
        <div 
          className={`truncate px-2 py-1 text-xs font-medium text-gray-800 ${rowDensity === "expanded" ? "py-4 max-h-[200px] whitespace-normal line-clamp-6" : ""}`} 
          title={typeof val === "string" ? val : JSON.stringify(val)}
        >
          {val || <span className="text-gray-300">-</span>}
        </div>
      );
    }
    
    // Editable cell
    if (col.type === "image") {
      const isUploading = uploadingCells[`${row.id}-${col.id}`];
      if (rowDensity === "expanded") {
        return (
          <div className="flex flex-col items-center gap-2 p-1.5 min-w-[220px]">
            {val ? (
              <div className="relative group/cellimg rounded-xl overflow-hidden border border-gray-200 shadow-xs bg-gray-100 w-52 h-40 shrink-0">
                <img src={val} alt="preview" className="w-full h-full object-cover" />
              </div>
            ) : null}
            <div className="flex items-center gap-1 w-full">
              <input 
                type="text" 
                placeholder="Image URL..."
                value={val}
                onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-hidden focus:border-black font-mono text-[11px]"
              />
              <label 
                className={`cursor-pointer p-1.5 rounded transition shrink-0 flex items-center justify-center ${
                  isUploading ? "bg-gray-200 text-gray-400" : "bg-black text-white hover:bg-gray-800"
                }`} 
                title="Upload photo to ImageKit"
              >
                {isUploading ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  disabled={isUploading}
                  onChange={(e) => handleCatalogImageUpload(row.id, col.id, e.target.files?.[0])}
                />
              </label>
            </div>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-1.5 w-full min-w-[140px]">
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
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-hidden focus:border-black min-w-[80px]"
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
      <div className="min-h-screen bg-gray-50 flex flex-col pt-[80px]" onClick={() => setActiveColMenu(null)}>
        
        {/* HEADER TOOLBAR (Sticky at top) */}
        <div className="sticky top-[80px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
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

        {/* SEARCH & QUICK CATEGORY FILTER BAR (Sticky below header) */}
        {!setupRequired && !loading && (
          <div className="sticky top-[141px] z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
            {/* Search Input */}
            <div className="relative min-w-[260px] max-w-sm flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Global search across all columns..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-black bg-gray-50/50"
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

            {/* Row Density Switcher: Compact vs Expanded (Large Photos in cell) */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setRowDensity("compact")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  rowDensity === "compact" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"
                }`}
                title="Compact rows for high data density"
              >
                <LayoutList size={14} />
                <span>Compact</span>
              </button>
              <button
                type="button"
                onClick={() => setRowDensity("expanded")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  rowDensity === "expanded" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"
                }`}
                title="Expanded rows with large photos (~2 projects visible per screen)"
              >
                <ImageIcon size={14} />
                <span>Large Photos</span>
              </button>
            </div>

            {/* Quick Horizontal Scroll Buttons */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-2xs">
              <button
                type="button"
                onClick={() => tableContainerRef.current?.scrollBy({ left: -400, behavior: "smooth" })}
                className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded-lg transition"
                title="Scroll table left"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1.5 select-none">Scroll Cols</span>
              <button
                type="button"
                onClick={() => tableContainerRef.current?.scrollBy({ left: 400, behavior: "smooth" })}
                className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded-lg transition"
                title="Scroll table right"
              >
                <ChevronRight size={14} />
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

        {/* MAIN CONTENT AREA: NATURAL VERTICAL SCROLL WITH HORIZONTALLY SCROLLABLE TABLE */}
        <div className="p-4 md:p-6 pb-20 flex-1">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-gray-500 font-bold gap-2">
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
          ) : (
            <div 
              ref={tableContainerRef}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto excel-scrollbar relative select-text [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-gray-400 hover:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100"
            >
              <table className="w-max min-w-full text-left border-collapse table-fixed select-text">
                <thead className="bg-gray-50 sticky top-0 z-30 shadow-xs">
                  {/* MAIN HEADER ROW */}
                  <tr>
                    {/* Index Col # */}
                    <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase w-12 min-w-[48px] text-center border-r border-b border-gray-200 bg-gray-100 sticky left-0 top-0 z-40">
                      #
                    </th>
                    
                    {visibleColumns.map((col) => {
                      const isBuildingName = col.id === "building_name";
                      const isSorted = sortCol === col.id;
                      const isFirstCol = visibleColumns[0]?.id === col.id;
                      return (
                        <th 
                          key={col.id} 
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", col.id);
                            e.dataTransfer.effectAllowed = "move";
                            setDraggedColId(col.id);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                            if (dragOverColId !== col.id) {
                              setDragOverColId(col.id);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverColId === col.id) {
                              setDragOverColId(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const sourceId = e.dataTransfer.getData("text/plain") || draggedColId;
                            if (sourceId && sourceId !== col.id) {
                              moveColumn(sourceId, col.id);
                            }
                            setDraggedColId(null);
                            setDragOverColId(null);
                          }}
                          onDragEnd={() => {
                            setDraggedColId(null);
                            setDragOverColId(null);
                          }}
                          className={`px-3 py-2.5 text-xs font-bold text-gray-700 border-r border-b border-gray-200 relative group transition-colors select-none cursor-grab active:cursor-grabbing ${
                            isBuildingName && isFirstCol
                              ? "sticky left-12 top-0 z-40 bg-gray-100 min-w-[240px] w-[240px] border-r-2 border-r-gray-300 shadow-[4px_0_8px_rgba(0,0,0,0.04)]" 
                              : isSorted
                              ? "min-w-[190px] w-[190px] bg-blue-50/70 border-b-2 border-b-blue-500"
                              : "min-w-[190px] w-[190px] bg-gray-50 hover:bg-gray-100"
                          } ${
                            draggedColId === col.id ? "opacity-30 bg-blue-100" : ""
                          } ${
                            dragOverColId === col.id ? "border-l-4 border-l-blue-600 bg-blue-100/70" : ""
                          }`}
                        >
                          {/* Column Header Content with Drag handle & Click to Sort */}
                          <div className="flex items-center justify-between gap-1 relative z-10">
                            <div 
                              className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing py-1 group/sort flex-1 truncate"
                              title={`Drag to reorder • Click to sort by ${col.title}`}
                            >
                              <GripVertical size={13} className="text-gray-400 group-hover:text-gray-700 shrink-0 opacity-40 group-hover:opacity-100 transition" />
                              <span 
                                onClick={() => handleSort(col.id)}
                                className={`uppercase tracking-wider font-bold truncate text-[11px] cursor-pointer hover:underline ${isSorted ? "text-blue-900" : "text-gray-700 group-hover:text-black"}`}
                              >
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
                              <button onClick={(e) => { e.stopPropagation(); moveColumnStep(col.id, 'left'); setActiveColMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-xs">
                                <ArrowLeft size={13} /> Move Column Left
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); moveColumnStep(col.id, 'right'); setActiveColMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-xs">
                                <ArrowRight size={13} /> Move Column Right
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
                    <th className="px-3 py-3 text-xs font-bold text-gray-600 uppercase sticky right-0 top-0 bg-gray-100 border-l border-b border-gray-200 shadow-[-4px_0_10px_rgba(0,0,0,0.04)] z-40 w-24 min-w-[96px] text-center">
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
                        const isFirstPinned = visibleColumns[0]?.id === col.id;
                        return (
                          <th 
                            key={`filter-${col.id}`}
                            className={`p-1.5 border-r border-gray-200 ${
                              isFirstPinned 
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
                          const isFirstPinned = visibleColumns[0]?.id === col.id;
                          return (
                            <td 
                              key={col.id} 
                              className={`px-2 py-1.5 border-r border-gray-100 align-middle ${
                                isFirstPinned 
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