"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ContactSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    whatsapp: "",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    phone: "",
    email: "",
    about_us: "",
    about_history: "",
    about_mission: "",
  });

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) {
      router.push("/");
      return;
    }
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("username", currentUser.username)
      .single();

    const roleNormalized = (profile?.role || "").toLowerCase().replace(/[\s_]+/g, "");
    setUserRole(roleNormalized);
    const allowedRoles = ["superadmin", "admin", "ceo"];
    if (error || !profile || !allowedRoles.includes(roleNormalized)) {
      router.push("/");
      return;
    }

    fetchSettings();
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from("site_settings").select("*").eq("id", "global").maybeSingle();
    if (data) {
      setSettings({
        whatsapp: data.whatsapp || "",
        facebook: data.facebook || "",
        instagram: data.instagram || "",
        twitter: data.twitter || "",
        linkedin: data.linkedin || "",
        phone: data.phone || "",
        email: data.email || "",
        about_us: data.about_us || "",
        about_history: data.about_history || "",
        about_mission: data.about_mission || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== "superadmin" && userRole !== "ceo") {
      alert("Only CEO or Super Admin can update contact settings.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert({
      id: "global",
      ...settings,
      updated_at: new Date().toISOString()
    });
    setSaving(false);
    if (error) {
      alert("Failed to save settings: " + error.message);
    } else {
      alert("Settings saved successfully!");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading...</div>;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Contact & Website Information</h1>
          <button onClick={() => router.push('/admin')} className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition flex items-center gap-2 shrink-0">
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="font-bold mb-4">Direct Contact</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Phone Number</label>
                  <input type="text" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="+1 234 567 890" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Email</label>
                  <input type="email" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="info@example.com" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="font-bold mb-4">Social Links</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">WhatsApp Link</label>
                  <input type="text" value={settings.whatsapp} onChange={e => setSettings({...settings, whatsapp: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">LinkedIn Link</label>
                  <input type="text" value={settings.linkedin} onChange={e => setSettings({...settings, linkedin: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Instagram Link</label>
                  <input type="text" value={settings.instagram} onChange={e => setSettings({...settings, instagram: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Facebook Link</label>
                  <input type="text" value={settings.facebook} onChange={e => setSettings({...settings, facebook: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">X / Twitter Link</label>
                  <input type="text" value={settings.twitter} onChange={e => setSettings({...settings, twitter: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-6">
            <h2 className="font-bold mb-4">Company Content</h2>
            
            <div>
              <label className="block text-sm font-semibold mb-1">About Us</label>
              <textarea 
                value={settings.about_us} 
                onChange={e => setSettings({...settings, about_us: e.target.value})} 
                className="w-full px-4 py-2 border rounded-xl min-h-[120px]" 
                placeholder="Enter the public About Us text..." 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">History</label>
              <textarea 
                value={settings.about_history} 
                onChange={e => setSettings({...settings, about_history: e.target.value})} 
                className="w-full px-4 py-2 border rounded-xl min-h-[120px]" 
                placeholder="Enter company history..." 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Mission</label>
              <textarea 
                value={settings.about_mission} 
                onChange={e => setSettings({...settings, about_mission: e.target.value})} 
                className="w-full px-4 py-2 border rounded-xl min-h-[120px]" 
                placeholder="Enter company mission..." 
              />
            </div>
          </div>

          <button disabled={saving} type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50">
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
      <Footer />
    </main>
  );
}
