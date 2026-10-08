import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ApiServerManager({ isOpen, onClose, onKeysUpdated }: any) {
  const [dbKeys, setDbKeys] = useState<any[]>([]);
  const [isCEO, setIsCEO] = useState(false);
  const [allAdmins, setAllAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lockedKeys, setLockedKeys] = useState<Record<string, boolean>>({});

  const fetchKeys = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      const ceoCheck = (profile?.role || "").toLowerCase().replace(/[\s_]+/g, "") === "ceo";
      setIsCEO(ceoCheck);
      
      if (ceoCheck) {
         const { data: allUsers } = await supabase.from("profiles").select("id, username, email, full_name, role");
         const adminsOnly = (allUsers || []).filter(u => {
            const r = (u.role || "").toLowerCase().replace(/[\s_]+/g, "");
            return r === "admin" || r === "superadmin" || r === "ceo";
         });
         setAllAdmins(adminsOnly);
      }
      
      const { data: keys } = await supabase.from("api_keys").select("*").order("created_at", { ascending: true });
      setDbKeys(keys || []);
      onKeysUpdated(keys || []);
      
      const initialLocks: Record<string, boolean> = {};
      (keys || []).forEach(k => {
         if (k.key_value) initialLocks[k.id] = true;
      });
      setLockedKeys(initialLocks);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchKeys();
    }
  }, [isOpen]);

  const addKey = async (type: string) => {
    const { data, error } = await supabase.from("api_keys").insert([{
      key_value: "",
      type: type,
      owner_id: currentUser.id,
      assigned_to: type === "shared" ? currentUser.id : null 
    }]).select();
    if (!error && data && data.length > 0) {
       // Append the newly generated row to local state WITHOUT wiping unsaved changes
       setDbKeys(prev => [...prev, data[0]]);
    }
  };

  const deleteKey = async (id: string) => {
    // Optimistic UI removal to preserve other unsaved inputs
    setDbKeys(prev => prev.filter(k => k.id !== id));
    await supabase.from("api_keys").delete().eq("id", id);
  };
  
  const handleRowButtonClick = async (k: any) => {
      if (lockedKeys[k.id]) {
          if (window.confirm("Do you want to edit this server configuration?")) {
              setLockedKeys(prev => ({ ...prev, [k.id]: false }));
          }
          return;
      }
      
      const { error } = await supabase.from("api_keys").update({ 
        key_value: k.key_value, 
        assigned_to: k.assigned_to || null 
      }).eq("id", k.id);
      
      if (error) {
         console.error("Save error:", error);
         alert("Failed to save: " + error.message);
      } else {
         setLockedKeys(prev => ({ ...prev, [k.id]: true }));
      }
  };

  const handleSaveAndClose = async () => {
    setIsSaving(true);
    let hasError = false;
    for (const k of dbKeys) {
      const { error } = await supabase.from("api_keys").update({ 
        key_value: k.key_value, 
        assigned_to: k.assigned_to || null 
      }).eq("id", k.id);
      if (error) {
         console.error("Batch save error:", error);
         hasError = true;
         alert("Failed to save one or more servers: " + error.message);
         break;
      }
    }
    setIsSaving(false);
    if (!hasError) {
       onKeysUpdated(dbKeys);
       onClose();
    }
  };

  const toggleShow = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateLocalKey = (id: string, field: string, value: string) => {
    setDbKeys(prev => prev.map(k => k.id === id ? { ...k, [field]: value } : k));
  };

  if (!isOpen) return null;

  const personalKeys = dbKeys.filter(k => k.type === "personal");
  const sharedKeys = dbKeys.filter(k => k.type === "shared");

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button type="button" onClick={onClose} className="absolute top-6 right-6 text-black hover:text-black transition">
          ?
        </button>
        <h2 className="text-2xl font-black mb-2">API Servers</h2>
        <p className="text-black text-sm mb-6">
          {isCEO ? "CEO Dashboard: Assign Shared Servers to Admins." : "Manage your API keys. Personal Servers are completely private."}
        </p>
        
        {loading ? (
          <div className="py-10 text-center text-black font-medium">Loading servers...</div>
        ) : (
          <div className="space-y-8 mb-6">
            
            {/* PERSONAL SERVERS */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-3 flex justify-between items-center pb-2 border-b">
                Personal Servers (Private)
                <button onClick={() => addKey("personal")} className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                  + Add Extra
                </button>
              </h3>
              {personalKeys.length === 0 && <p className="text-sm text-black italic">No personal servers added yet.</p>}
              <div className="space-y-4">
                {personalKeys.map((k, index) => (
                  <div key={k.id} className="flex items-center gap-2 w-full">
                    <span className="text-[10px] font-bold uppercase text-black w-20">Server {index + 1}</span>
                    <input
                      type={showPassword[k.id] ? "text" : "password"}
                      placeholder="AIzaSy..."
                      value={k.key_value || ""}
                      onChange={(e) => updateLocalKey(k.id, "key_value", e.target.value)}
                      disabled={lockedKeys[k.id]}
                      className={`flex-1 border rounded-xl px-4 py-3 font-mono text-sm focus:border-black outline-none transition-colors ${lockedKeys[k.id] ? "bg-gray-200 text-black cursor-not-allowed" : "bg-gray-50"}`}
                    />
                    <button onClick={() => toggleShow(k.id)} className="text-black hover:text-black p-3 bg-gray-50 rounded-xl border transition-colors shrink-0">
                      {showPassword[k.id] ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => handleRowButtonClick(k)} className={`p-3 rounded-xl border transition-colors shrink-0 font-bold text-xs uppercase tracking-widest ${lockedKeys[k.id] ? "text-black bg-gray-100 border-gray-200" : "text-green-600 hover:text-green-800 bg-green-50 border-green-100"}`}>
                      {lockedKeys[k.id] ? "Saved" : "Save"}
                    </button>
                    <button onClick={() => deleteKey(k.id)} className="text-red-400 hover:text-red-600 p-3 bg-red-50 rounded-xl border border-red-100 transition-colors shrink-0">
                      ?
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SHARED SERVERS */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-3 flex justify-between items-center pb-2 border-b">
                {isCEO ? "Public / Shared Servers (CEO Control)" : "Assigned Shared Server"}
                {isCEO && (
                  <button onClick={() => addKey("shared")} className="text-green-600 hover:text-green-800 bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
                    + Add Shared
                  </button>
                )}
              </h3>
              
              {sharedKeys.length === 0 && <p className="text-sm text-black italic">No shared servers available.</p>}
              
              <div className="space-y-4">
                {sharedKeys.map((k, index) => (
                  <div key={k.id} className="flex flex-col gap-2 p-4 bg-gray-50 rounded-2xl border">
                    {isCEO ? (
                      // CEO VIEW
                      <>
                        <div className="flex gap-2 items-center">
                          <span className="text-[10px] font-bold uppercase text-black w-20">Key String</span>
                          <input
                            type={showPassword[k.id] ? "text" : "password"}
                            placeholder="AIzaSy..."
                            value={k.key_value || ""}
                            onChange={(e) => updateLocalKey(k.id, "key_value", e.target.value)}
                            disabled={lockedKeys[k.id]}
                            className={`flex-1 border rounded-lg px-3 py-2 font-mono text-sm outline-none ${lockedKeys[k.id] ? "bg-gray-100 text-black cursor-not-allowed" : "bg-white"}`}
                          />
                          <button onClick={() => toggleShow(k.id)} className="text-black hover:text-black p-2 bg-gray-50 rounded-lg border transition-colors shrink-0 text-xs">
                            {showPassword[k.id] ? "Hide" : "Show"}
                          </button>
                          <button onClick={() => handleRowButtonClick(k)} className={`text-xs font-bold hover:underline shrink-0 ml-2 px-2 border-l border-gray-300 ${lockedKeys[k.id] ? "text-black" : "text-green-600"}`}>{lockedKeys[k.id] ? "Saved" : "Save"}</button>
                          <button onClick={() => deleteKey(k.id)} className="text-red-500 text-xs font-bold hover:underline shrink-0 ml-2 px-2 border-l border-gray-300">Delete</button>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="text-[10px] font-bold uppercase text-black w-20">Assigned To</span>
                          <select 
                            value={k.assigned_to || ""}
                            onChange={(e) => updateLocalKey(k.id, "assigned_to", e.target.value)}
                            disabled={lockedKeys[k.id]}
                            className={`flex-1 border rounded-lg px-3 py-2 text-sm font-semibold outline-none ${lockedKeys[k.id] ? "bg-gray-100 text-black cursor-not-allowed" : "bg-white"}`}
                          >
                            <option value="">-- Select Admin --</option>
                            {allAdmins.map(admin => (
                              <option key={admin.id} value={admin.id}>{admin.full_name || admin.username || admin.email}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    ) : (
                      // ADMIN VIEW (Locked)
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-[10px] font-bold uppercase text-black w-20">Public {index + 1}</span>
                        <input
                          type="password"
                          readOnly
                          value="***************************************"
                          className="flex-1 border rounded-xl px-4 py-3 bg-gray-200 text-black font-mono text-sm outline-none cursor-not-allowed opacity-70"
                        />
                        <span className="bg-gray-200 text-black border rounded-xl px-4 py-3 text-sm font-semibold shrink-0 cursor-not-allowed">
                          Locked
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
        <button type="button" onClick={handleSaveAndClose} disabled={isSaving} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition disabled:opacity-50">
          {isSaving ? "Saving..." : "Save & Close"}
        </button>
      </div>
    </div>
  );
}
