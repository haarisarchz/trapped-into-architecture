const fs = require('fs');

const sqlSnippet = `
-- Table for row data
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

-- Insert core requested columns
INSERT INTO catalog_columns (id, title, type, order_index, is_core) VALUES
('building_name', 'Building Name', 'text', 1, true),
('city', 'City', 'text', 2, false),
('country', 'Country', 'text', 3, false),
('architect', 'Architect', 'text', 4, false),
('architect_other_projects', 'Architect''s Other Projects', 'link', 5, false),
('opened_year', 'Opened Year', 'number', 6, false),
('architect_photo', 'Architect Photo', 'image', 7, false),
('building_photo', 'Building Photo', 'image', 8, false),
('prize_winning_year', 'Prize Winning Year', 'text', 9, false)
ON CONFLICT (id) DO NOTHING;
`;

const pageCode = `"use client";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../../../components/Navbar";
import { Save, Lock, Unlock, Plus, Image as ImageIcon, Trash2, Edit2, Link as LinkIcon, EyeOff } from "lucide-react";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sqlSnippet = \`${sqlSnippet.replace(/`/g, '\\`').trim()}\`;

export default function CatalogPage() {
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  
  const [columns, setColumns] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  
  const [showColModal, setShowColModal] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const [newColType, setNewColType] = useState("text");

  const checkDatabase = async () => {
    setLoading(true);
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
    const newOrder = columns.length + 1;
    
    const newCol = {
      id: slug,
      title: newColTitle,
      type: newColType,
      order_index: newOrder,
      is_core: false,
      is_visible: true
    };
    
    setColumns([...columns, newCol]);
    setShowColModal(false);
    setNewColTitle("");
    
    await supabase.from("catalog_columns").insert([newCol]);
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
    
    // Update local immediately for snappy UI
    setRows(rows.map(r => r.id === row.id ? { ...dbRow, id: isNew ? dbRow.id : r.id } : r));
    
    if (isNew) {
      // Remove temp id, let postgres generate one, but we need to fetch it back
      const insertData = { data: row.data, is_locked: lock };
      const { data, error } = await supabase.from("architecture_catalog").insert([insertData]).select();
      if (data && data.length > 0) {
        setRows(current => current.map(r => r.id === row.id ? data[0] : r));
      }
    } else {
      await supabase.from("architecture_catalog").update({ data: row.data, is_locked: lock }).eq("id", row.id);
    }
  };

  const deleteRow = async (rowId: string) => {
    if (!confirm("Delete this row?")) return;
    setRows(rows.filter(r => r.id !== rowId));
    if (!rowId.startsWith("temp-")) {
      await supabase.from("architecture_catalog").delete().eq("id", rowId);
    }
  };

  const toggleColumnVisibility = async (colId: string, currentVisible: boolean) => {
    setColumns(columns.map(c => c.id === colId ? { ...c, is_visible: !currentVisible } : c));
    await supabase.from("catalog_columns").update({ is_visible: !currentVisible }).eq("id", colId);
  };

  const renderCellInput = (row: any, col: any) => {
    const val = row.data[col.id] || "";
    
    if (row.is_locked) {
      if (col.type === "image") {
        return val ? <img src={val} alt="preview" className="h-10 w-10 object-cover rounded" /> : <span className="text-gray-400 text-xs">No image</span>;
      }
      if (col.type === "link") {
        return val ? <a href={val} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1"><LinkIcon size={12}/> Link</a> : <span className="text-gray-400 text-xs">-</span>;
      }
      return <div className="truncate px-2 py-1">{val || "-"}</div>;
    }

    // Unlocked Editing Mode
    if (col.type === "image") {
      return (
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Image URL..."
            value={val}
            onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-black"
          />
        </div>
      );
    }
    
    return (
      <input
        type={col.type === "number" ? "number" : "text"}
        value={val}
        onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-black bg-white"
        placeholder={\`Enter \${col.title}...\`}
      />
    );
  };

  const visibleColumns = columns.filter(c => c.is_visible);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex flex-col pt-[80px]">
        
        {/* HEADER */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shrink-0">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              Architecture Catalog <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold tracking-wide">Excel Mode</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage catalog entries in a spreadsheet view.</p>
          </div>
          {!setupRequired && !loading && (
            <div className="flex gap-3">
              <button onClick={() => setShowColModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-lg transition text-sm">
                <Plus size={16} /> Add Column
              </button>
              <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition text-sm shadow-sm">
                <Plus size={16} /> Add Row
              </button>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-hidden p-6 flex flex-col">
          {loading ? (
            <div className="text-center text-gray-500 font-bold animate-pulse mt-20">Loading Database...</div>
          ) : setupRequired ? (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-3xl mx-auto mt-10">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Database Setup Required</h2>
              <p className="text-gray-600 mb-6">
                The Architecture Catalog tables do not exist yet. Please go to your Supabase SQL Editor and run the following script to create them with the required columns:
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-gray-50 sticky top-0 z-20 shadow-[0_1px_0_rgba(0,0,0,0.1)]">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-10 text-center border-r border-gray-200">#</th>
                    {visibleColumns.map((col) => (
                      <th key={col.id} className="px-4 py-3 text-xs font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 relative group min-w-[150px]">
                        <div className="flex items-center justify-between">
                          <span className="uppercase">{col.title}</span>
                          {!col.is_core && (
                            <button onClick={() => toggleColumnVisibility(col.id, true)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition" title="Hide Column">
                              <EyeOff size={14} />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase sticky right-0 bg-gray-50 border-l border-gray-200 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={visibleColumns.length + 2} className="px-6 py-10 text-center text-gray-400 italic">
                        No rows added yet. Click "Add Row" to start.
                      </td>
                    </tr>
                  )}
                  {rows.map((row, index) => (
                    <tr key={row.id} className={\`border-b border-gray-100 transition \${row.is_locked ? "bg-gray-50/50 hover:bg-gray-100/50" : "bg-white"}\`}>
                      <td className="px-4 py-3 text-gray-400 text-center border-r border-gray-100">{index + 1}</td>
                      
                      {visibleColumns.map((col) => (
                        <td key={col.id} className="px-4 py-2 border-r border-gray-100 align-middle">
                          {renderCellInput(row, col)}
                        </td>
                      ))}
                      
                      <td className="px-4 py-2 sticky right-0 bg-inherit border-l border-gray-100 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] flex items-center justify-center gap-2">
                        {row.is_locked ? (
                          <>
                            <button onClick={() => saveRow(row, false)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition" title="Unlock Row">
                              <Edit2 size={16} />
                            </button>
                            <span className="p-1.5 text-green-600 bg-green-50 rounded flex items-center gap-1 text-xs font-bold" title="Locked">
                              <Lock size={12} />
                            </span>
                          </>
                        ) : (
                          <>
                            <button onClick={() => saveRow(row, true)} className="px-3 py-1.5 bg-black text-white rounded text-xs font-bold hover:bg-gray-800 transition shadow-sm flex items-center gap-1">
                              <Save size={14} /> Save
                            </button>
                            <button onClick={() => deleteRow(row.id)} className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded transition" title="Delete Row">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Column Modal */}
      {showColModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add Custom Column</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Column Name</label>
                <input 
                  type="text"
                  value={newColTitle}
                  onChange={e => setNewColTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  placeholder="e.g. Total Area"
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
                  <option value="number">Number</option>
                  <option value="link">URL / Link</option>
                  <option value="image">Image URL</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button onClick={() => setShowColModal(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">
                Cancel
              </button>
              <button onClick={addColumn} className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition">
                Add Column
              </button>
            </div>
          </div>
        </div>
      )}
      
      <AdminQuickMenu />
    </>
  );
}
`;

fs.writeFileSync('app/admin/catalog/page.tsx', pageCode);
console.log("Rewritten catalog page.");
