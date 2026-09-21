"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { UploadCloud, X } from "lucide-react";

export default function ContactSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [settings, setSettings] = useState({
    // Left side
    email: "",
    phone: "",
    whatsapp: "",
    contact_address: "",
    
    // Right side
    whatsapp_channel_url: "",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    website_url: "",
    
    // Logo
    logo_url: "",
    
    // Organization
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
    const allowedRoles = ["superadmin", "ceo"];
    if (error || !profile || !allowedRoles.includes(roleNormalized)) {
      router.push("/");
      return;
    }

    fetchSettings();
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", "global").maybeSingle();
      if (data) {
        setSettings({
          email: data.email || "",
          phone: data.phone || "",
          whatsapp: data.whatsapp || "",
          contact_address: data.contact_address || "",
          
          whatsapp_channel_url: data.whatsapp_channel_url || "",
          facebook: data.facebook || "",
          twitter: data.twitter || "",
          instagram: data.instagram || "",
          linkedin: data.linkedin || "",
          website_url: data.website_url || "",
          
          logo_url: data.logo_url || "",
          
          about_us: data.about_us || "",
          about_history: data.about_history || "",
          about_mission: data.about_mission || "",
        });
      }
    } catch (error) {
      console.error("Failed to load settings (some columns may not exist yet):", error);
    } finally {
      setLoading(false);
    }
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
      alert("Failed to update settings: " + error.message);
    } else {
      alert("Update successful!");
      fetchSettings(); // Refresh
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("File size should be less than 2MB");
      return;
    }

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const filePath = `site_assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("company_logos") // use existing bucket
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("company_logos").getPublicUrl(filePath);
      
      setSettings(prev => ({ ...prev, logo_url: data.publicUrl }));
    } catch (error: any) {
      alert("Error uploading logo: " + error.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto py-12 px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Contact & Site Information</h1>
          <button onClick={() => router.push('/admin')} className="bg-white text-gray-800 px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition flex items-center gap-2 shrink-0">
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: DIRECT CONTACT */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-gray-900 border-b pb-2">Direct Contact Details</h2>
              <p className="text-sm text-gray-500 mb-6">These details are used when a user directly messages or contacts the organization.</p>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contact Email</label>
                  <input type="email" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition" placeholder="admin.ti2a@gmail.com" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contact Phone</label>
                  <input type="text" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition" placeholder="+91 8608609661" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Direct WhatsApp Number</label>
                  <p className="text-xs text-gray-400 mb-2">Number used for direct WhatsApp chats (e.g. 918608609661)</p>
                  <input type="text" value={settings.whatsapp} onChange={e => setSettings({...settings, whatsapp: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition" placeholder="918608609661" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contact Address</label>
                  <textarea value={settings.contact_address} onChange={e => setSettings({...settings, contact_address: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition min-h-[100px]" placeholder="123 Architecture Lane, City..." />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: SOCIAL / PAGE */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-gray-900 border-b pb-2">Social & Public Channels</h2>
              <p className="text-sm text-gray-500 mb-6">Links to official pages, channels, and social media profiles.</p>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp Channel URL</label>
                  <p className="text-xs text-gray-400 mb-2">Public channel link (NOT your direct WhatsApp number)</p>
                  <input type="url" value={settings.whatsapp_channel_url} onChange={e => setSettings({...settings, whatsapp_channel_url: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition" placeholder="https://whatsapp.com/channel/..." />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Official Website URL</label>
                  <input type="url" value={settings.website_url} onChange={e => setSettings({...settings, website_url: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition" placeholder="https://www.trappedintoarchitecture.com" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Facebook Page URL</label>
                  <input type="url" value={settings.facebook} onChange={e => setSettings({...settings, facebook: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition" placeholder="https://facebook.com/..." />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">X / Twitter URL</label>
                  <input type="url" value={settings.twitter} onChange={e => setSettings({...settings, twitter: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition" placeholder="https://twitter.com/..." />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Instagram URL</label>
                  <input type="url" value={settings.instagram} onChange={e => setSettings({...settings, instagram: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition" placeholder="https://instagram.com/..." />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">LinkedIn URL</label>
                  <input type="url" value={settings.linkedin} onChange={e => setSettings({...settings, linkedin: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition" placeholder="https://linkedin.com/company/..." />
                </div>
              </div>
            </div>

          </div>

          {/* LOGO UPLOAD */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-gray-900 border-b pb-2">Website Logo</h2>
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 shrink-0 relative group">
                {settings.logo_url ? (
                  <>
                    <img src={settings.logo_url} alt="Site Logo" className="w-full h-full object-contain" />
                    <button type="button" onClick={() => setSettings({...settings, logo_url: ""})} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400 text-sm font-medium">No Logo</span>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-50 transition">
                  <UploadCloud size={18} />
                  {uploadingLogo ? "Uploading..." : "Upload New Logo"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
                </label>
                <p className="text-xs text-gray-500">Max size 2MB. Recommended format: PNG or SVG with transparent background.</p>
                <div className="w-full">
                  <label className="block text-xs font-bold text-gray-600 mb-1">Or enter Logo URL directly:</label>
                  <input type="url" value={settings.logo_url} onChange={e => setSettings({...settings, logo_url: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black" />
                </div>
              </div>
            </div>
          </div>

          {/* ORGANIZATION CONTENT */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
            <h2 className="text-xl font-bold mb-2 text-gray-900 border-b pb-2">Organization Information</h2>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">About Us</label>
              <textarea 
                value={settings.about_us} 
                onChange={e => setSettings({...settings, about_us: e.target.value})} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl min-h-[160px] focus:outline-none focus:ring-2 focus:ring-black transition" 
                placeholder="Enter the public About Us text..." 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">History</label>
              <textarea 
                value={settings.about_history} 
                onChange={e => setSettings({...settings, about_history: e.target.value})} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl min-h-[160px] focus:outline-none focus:ring-2 focus:ring-black transition" 
                placeholder="Enter organization history..." 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mission</label>
              <textarea 
                value={settings.about_mission} 
                onChange={e => setSettings({...settings, about_mission: e.target.value})} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl min-h-[160px] focus:outline-none focus:ring-2 focus:ring-black transition" 
                placeholder="Enter organization mission..." 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button disabled={saving} type="submit" className="bg-black text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50 transition shadow-md">
              {saving ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </main>
  );
}
