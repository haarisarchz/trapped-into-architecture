"use client";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../../../components/Navbar";

// Initialize Supabase (Fallback to dummy keys to prevent crash if env missing during build)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CatalogPage() {
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [customFieldsDef, setCustomFieldsDef] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [buildingName, setBuildingName] = useState("");
  const [architectName, setArchitectName] = useState("");
  const [location, setLocation] = useState("");
  const [customFields, setCustomFields] = useState<any>({});
  
  // Field Modal State
  const [newFieldName, setNewFieldName] = useState("");

  const checkDatabase = async () => {
    setLoading(true);
    // Check if table exists
    const { error } = await supabase.from("architecture_catalog").select("id").limit(1);
    
    if (error && error.code === "42P01") { // Undefined table
      setSetupRequired(true);
      setLoading(false);
      return;
    }
    
    setSetupRequired(false);
    fetchData();
  };

  const fetchData = async () => {
    const { data: bData } = await supabase.from("architecture_catalog").select("*").order("created_at", { ascending: false });
    const { data: fData } = await supabase.from("architecture_fields").select("*");
    
    if (bData) setBuildings(bData);
    if (fData) setCustomFieldsDef(fData);
    setLoading(false);
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setBuildingName("");
    setArchitectName("");
    setLocation("");
    setCustomFields({});
    setShowModal(true);
  };

  const openEditModal = (b: any) => {
    setEditingId(b.id);
    setBuildingName(b.building_name);
    setArchitectName(b.architect_name || "");
    setLocation(b.location || "");
    setCustomFields(b.custom_fields || {});
    setShowModal(true);
  };

  const handleSaveBuilding = async () => {
    if (!buildingName) return alert("Building name is required");
    
    const payload = {
      building_name: buildingName,
      architect_name: architectName,
      location,
      custom_fields: customFields
    };

    if (editingId) {
      await supabase.from("architecture_catalog").update(payload).eq("id", editingId);
    } else {
      await supabase.from("architecture_catalog").insert([payload]);
    }
    
    setShowModal(false);
    fetchData();
  };

  const handleAddField = async () => {
    if (!newFieldName) return;
    await supabase.from("architecture_fields").insert([{ field_name: newFieldName }]);
    setNewFieldName("");
    setShowFieldModal(false);
    fetchData();
  };

  const sqlSnippet = `
CREATE TABLE architecture_catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  building_name TEXT NOT NULL,
  architect_name TEXT,
  location TEXT,
  main_images JSONB DEFAULT '[]'::jsonb,
  plan_image TEXT,
  section_image TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE architecture_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name TEXT NOT NULL UNIQUE,
  field_type TEXT DEFAULT 'text'
);
`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-4">
<AdminQuickMenu />
<h1 className="text-3xl font-black">Architecture Catalog</h1>
</div>
            <p className="text-gray-500 mt-1">Manage buildings, architects, and quiz data.</p>
          </div>
          {!setupRequired && (
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowFieldModal(true)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-lg transition">
                + Add Custom Field
              </button>
              <button type="button" onClick={openAddModal} className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-bold rounded-lg transition">
                + Add Building
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500 font-bold animate-pulse">Loading database...</div>
        ) : setupRequired ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Database Setup Required</h2>
            <p className="text-gray-600 mb-6">
              The Architecture Catalog tables do not exist yet. Please go to your Supabase SQL Editor and run the following script to create them:
            </p>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-6 rounded-xl overflow-x-auto text-sm font-mono mb-6">
                {sqlSnippet}
              </pre>
              <button type="button"
                onClick={() => navigator.clipboard.writeText(sqlSnippet.trim())}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
              >
                Copy SQL
              </button>
            </div>
            <button type="button" onClick={checkDatabase} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition">
              I have run the script. Reload Page.
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-widest">
                  <th className="p-4 font-bold">Building</th>
                  <th className="p-4 font-bold">Architect</th>
                  <th className="p-4 font-bold">Location</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {buildings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-gray-400 font-medium">
                      No buildings uploaded yet.
                    </td>
                  </tr>
                ) : (
                  buildings.map((b) => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="p-4 font-bold">{b.building_name}</td>
                      <td className="p-4 text-gray-600">{b.architect_name || "---"}</td>
                      <td className="p-4 text-gray-600">{b.location || "---"}</td>
                      <td className="p-4 text-right">
                        <button type="button" onClick={() => openEditModal(b)} className="text-blue-600 font-bold text-sm hover:underline">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD/EDIT BUILDING MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[9999999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-black">{editingId ? "Edit Building" : "Add Building"}</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black">?</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Building Name</label>
                  <input type="text" value={buildingName} onChange={e => setBuildingName(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 mt-1 focus:border-black outline-none" placeholder="e.g. Fallingwater" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Architect Name</label>
                  <input type="text" value={architectName} onChange={e => setArchitectName(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 mt-1 focus:border-black outline-none" placeholder="e.g. Frank Lloyd Wright" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Location</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 mt-1 focus:border-black outline-none" placeholder="e.g. Mill Run, Pennsylvania" />
                </div>
              </div>

              {/* DYNAMIC CUSTOM FIELDS */}
              {customFieldsDef.length > 0 && (
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-gray-700">Dynamic Fields</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customFieldsDef.map(f => (
                      <div key={f.id}>
                        <label className="text-xs font-bold text-gray-500">{f.field_name}</label>
                        <input 
                          type="text" 
                          value={customFields[f.field_name] || ""} 
                          onChange={e => setCustomFields({...customFields, [f.field_name]: e.target.value})} 
                          className="w-full p-2.5 rounded-lg border border-gray-200 mt-1 focus:border-black outline-none text-sm" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CLOUDFLARE IMAGE UPLOAD PLACEHOLDERS */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50 cursor-not-allowed">
                <span className="text-3xl mb-2 block">??</span>
                <p className="font-bold text-gray-700">Cloudflare R2 Image Upload</p>
                <p className="text-xs text-gray-500 mt-1">Pending Cloudflare Account Setup & API Keys</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100">
              <button type="button" onClick={handleSaveBuilding} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition">
                Save to Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM FIELD MODAL */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black/60 z-[9999999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <h2 className="text-xl font-black mb-4">Add Custom Field</h2>
            <p className="text-sm text-gray-500 mb-4">This field will be permanently added to the database for all buildings.</p>
            <input 
              type="text" 
              value={newFieldName} 
              onChange={e => setNewFieldName(e.target.value)} 
              placeholder="e.g. Year Built" 
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-black outline-none mb-4" 
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowFieldModal(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">Cancel</button>
              <button type="button" onClick={handleAddField} className="flex-1 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition">Add Field</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
