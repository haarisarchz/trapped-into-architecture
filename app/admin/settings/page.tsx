"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminSettings() {
  const router = useRouter();
  const [geminiKey, setGeminiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem("admin_gemini_key");
    if (key) {
      setGeminiKey(key);
    }
  }, []);

  const handleSave = () => {
    if (geminiKey.trim()) {
      localStorage.setItem("admin_gemini_key", geminiKey.trim());
    } else {
      localStorage.removeItem("admin_gemini_key");
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="flex w-full md:w-72 bg-black text-white md:sticky md:top-0 md:h-screen p-6 flex-col justify-between gap-6 overflow-y-auto">
        <div>
          <div className="mb-12">
            <h1 className="text-3xl font-bold">Crafted Architecture</h1>
            <p className="text-gray-400 mt-1">Admin Panel</p>
          </div>
          <div className="space-y-1">
            <button onClick={() => router.push("/admin/activity")} className="w-full text-left px-4 py-2.5 rounded-2xl hover:bg-gray-800 transition">Admin Activity</button>
            <button onClick={() => router.push("/admin")} className="w-full text-left px-4 py-2.5 rounded-2xl hover:bg-gray-800 transition">Dashboard</button>
            <button onClick={() => router.push("/admin/jobs")} className="w-full text-left px-4 py-2.5 rounded-2xl hover:bg-gray-800 transition">Manage Jobs</button>
            <button onClick={() => router.push("/admin/add-job")} className="w-full text-left px-4 py-2.5 rounded-2xl hover:bg-gray-800 transition">Add New Job</button>
            <button onClick={() => router.push("/admin/analytics")} className="w-full text-left px-4 py-2.5 rounded-2xl hover:bg-gray-800 transition">Analytics</button>
            <button onClick={() => router.push("/admin/companies")} className="w-full text-left px-4 py-2.5 rounded-2xl hover:bg-gray-800 transition">Companies</button>
            <button onClick={() => router.push("/admin/settings")} className="w-full text-left px-4 py-2.5 rounded-2xl bg-gray-900 text-blue-400 font-medium transition">Settings</button>
          </div>
        </div>
      </aside>

      {/* CONTENT */}
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-bold mb-8">Admin Settings</h2>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 max-w-2xl">
          <h3 className="text-xl font-semibold mb-4 border-b pb-4">Personal API Configuration</h3>
          
          <div className="mb-6">
            <label className="block mb-2 font-medium">Your Gemini API Key (Local)</label>
            <p className="text-sm text-gray-500 mb-3">
              To bypass shared API limits, you can enter your own personal Google Gemini API key. 
              This key is stored securely in your browser's local storage and is only sent directly to Google during AI extraction.
            </p>
            <input 
              type="password" 
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleSave}
              className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition"
            >
              Save Settings
            </button>
            {saved && <span className="text-green-600 font-medium">Settings saved successfully!</span>}
          </div>
        </div>
      </div>
    </main>
  );
}
