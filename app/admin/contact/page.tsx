"use client";
import Link from "next/link";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  UploadCloud, 
  X, 
  Mail, 
  Phone, 
  MessageCircle, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Inbox, 
  Settings, 
  ExternalLink,
  Copy,
  Check
} from "lucide-react";

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const LockedField = ({ label, value, onChange, fieldKey, type = "text", subLabel, isTextarea = false }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSave = async (e: any) => {
     e.preventDefault();
     if (!fieldKey) {
        setIsEditing(false);
        if (onChange) onChange(localValue);
        return;
     }
     setSaving(true);
     const { error } = await supabase.from('site_settings').update({ [fieldKey]: localValue }).eq('id', 'global');
     setSaving(false);
     if (error) {
       alert("Failed to save: " + error.message);
       return;
     }
     if (onChange) onChange(localValue);
     setIsEditing(false);
  };
  
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center justify-between">
        <span>{label}</span>
        {!isEditing && (
          <button type="button" onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700 text-xs font-semibold">
             ✎ Edit
          </button>
        )}
      </label>
      {subLabel && <p className="text-xs text-gray-400 mb-2">{subLabel}</p>}
      
      {isEditing ? (
        <div className="flex flex-col sm:flex-row gap-2">
          {isTextarea ? (
             <textarea value={localValue} onChange={e => setLocalValue(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]" />
          ) : (
             <input type={type} value={localValue} onChange={e => setLocalValue(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
          )}
          <button type="button" onClick={handleSave} disabled={saving} className="bg-black text-white px-6 py-2 sm:py-0 rounded-xl disabled:opacity-50 font-medium shrink-0 h-[46px] sm:self-start">
            {saving ? '...' : 'Done'}
          </button>
        </div>
      ) : (
        <div className={`w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed select-none ${isTextarea ? 'whitespace-pre-wrap min-h-[100px]' : 'truncate'}`}>
          {localValue || "Not Set"}
        </div>
      )}
    </div>
  );
};

export default function ContactSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"inbox" | "settings">("inbox");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Inquiries State
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");
  const [setupRequired, setSetupRequired] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  
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
    const allowedRoles = ["ceo"];
    if (error || !profile || !allowedRoles.includes(roleNormalized)) {
      router.push("/");
      return;
    }

    fetchSettings();
    fetchInquiries();
  };

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from("site_settings").select("*").eq("id", "global").maybeSingle();
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
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      if (data.setupRequired) {
        setSetupRequired(true);
        setInquiries([]);
      } else if (data.inquiries) {
        setSetupRequired(false);
        setInquiries(data.inquiries);
      }
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_read: !currentStatus })
      });
      if (res.ok) {
        setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, is_read: !currentStatus } : inq));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setInquiries(prev => prev.filter(inq => inq.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete inquiry:", err);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, SVG, etc.)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("File size should be less than 2MB");
      return;
    }

    setUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const { error } = await supabase.from('site_settings').update({ logo_url: base64String }).eq('id', 'global');
        if (error) {
          alert("Failed to save logo automatically: " + error.message);
        }
        setSettings(prev => ({ ...prev, logo_url: base64String }));
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      alert("Error uploading logo: " + error.message);
      setUploadingLogo(false);
    }
  };

  const sqlMigrationCode = `-- Run this in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON public.contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_is_read ON public.contact_inquiries(is_read);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on contact_inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow public insert on contact_inquiries" ON public.contact_inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on contact_inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow public select on contact_inquiries" ON public.contact_inquiries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update on contact_inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow public update on contact_inquiries" ON public.contact_inquiries FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on contact_inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow public delete on contact_inquiries" ON public.contact_inquiries FOR DELETE USING (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlMigrationCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const unreadCount = inquiries.filter(i => !i.is_read).length;

  const filteredInquiries = inquiries.filter(i => {
    if (filterStatus === "unread" && i.is_read) return false;
    if (filterStatus === "read" && !i.is_read) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = i.name.toLowerCase().includes(q);
      const matchEmail = i.email.toLowerCase().includes(q);
      const matchSubject = (i.subject || "").toLowerCase().includes(q);
      const matchMessage = (i.message || "").toLowerCase().includes(q);
      return matchName || matchEmail || matchSubject || matchMessage;
    }
    return true;
  });

  if (loading) return <div className="p-10 text-center font-bold">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <Navbar />
      <div className="max-w-6xl mx-auto py-12 px-6">
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <AdminQuickMenu />
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Contact & Inquiries</h1>
              <p className="text-sm text-gray-500">Manage user messages, contact inquiries, and public channels</p>
            </div>
          </div>
          <button onClick={() => router.push('/admin')} className="bg-white text-gray-800 px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition flex items-center gap-2 shrink-0 font-medium text-sm shadow-sm">
            ← Back to Dashboard
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`pb-3.5 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
              activeTab === "inbox" 
                ? "border-black text-black" 
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <Inbox size={18} />
            <span>Inquiries Inbox</span>
            {unreadCount > 0 && (
              <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3.5 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
              activeTab === "settings" 
                ? "border-black text-black" 
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <Settings size={18} />
            <span>Site Info & Direct Contact Details</span>
          </button>
        </div>

        {/* TAB 1: INQUIRIES INBOX */}
        {activeTab === "inbox" && (
          <div className="space-y-6">
            
            {/* SETUP BANNER (IF TABLE NOT YET CREATED IN SUPABASE) */}
            {setupRequired && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-amber-900 text-lg flex items-center gap-2">
                      ⚠️ Database Table Setup Needed
                    </h3>
                    <p className="text-amber-800 text-sm mt-1">
                      The <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs font-bold">contact_inquiries</code> table hasn&apos;t been created in Supabase yet. 
                      Visitor emails are being delivered to your email (<span className="font-bold">admin.ti2a@gmail.com</span>), but storing them inside this dashboard requires running this one-time SQL script.
                    </p>
                  </div>
                  <button
                    onClick={copySql}
                    className="shrink-0 bg-amber-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                    {copiedSql ? "Copied SQL!" : "Copy SQL Script"}
                  </button>
                </div>
                <div className="mt-4 bg-white/80 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <strong>Quick Instructions:</strong> Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline font-bold">Supabase Dashboard</a> → Click <strong>SQL Editor</strong> on left menu → Click <strong>+ New Query</strong> → Paste the SQL script → Click <strong>Run</strong> → Then refresh this page.
                </div>
              </div>
            )}

            {/* CONTROLS HEADER */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or message..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <button
                  onClick={fetchInquiries}
                  disabled={loadingInquiries}
                  title="Refresh Inquiries"
                  className="p-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-gray-600 transition disabled:opacity-50 shrink-0"
                >
                  <RefreshCw size={16} className={loadingInquiries ? "animate-spin" : ""} />
                </button>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    filterStatus === "all" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All ({inquiries.length})
                </button>
                <button
                  onClick={() => setFilterStatus("unread")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    filterStatus === "unread" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setFilterStatus("read")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    filterStatus === "read" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Read ({inquiries.length - unreadCount})
                </button>
              </div>
            </div>

            {/* INQUIRIES LIST */}
            {loadingInquiries && inquiries.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-black" />
                <p className="font-medium text-sm">Loading inquiries...</p>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <Inbox size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="font-bold text-gray-800 text-lg mb-1">No Inquiries Found</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  {searchQuery || filterStatus !== "all" 
                    ? "No inquiries match your current search or filter."
                    : "When visitors submit messages via the /contact page, they will appear here and trigger an instant email alert to admin.ti2a@gmail.com."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((inq) => {
                  const phoneClean = inq.phone ? inq.phone.replace(/\D/g, '') : null;
                  const formattedDate = new Date(inq.created_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Kolkata"
                  });

                  return (
                    <div 
                      key={inq.id}
                      className={`bg-white border rounded-2xl p-6 transition shadow-sm ${
                        inq.is_read ? "border-gray-200" : "border-blue-400 ring-1 ring-blue-100"
                      }`}
                    >
                      {/* CARD HEADER */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${inq.is_read ? "bg-gray-300" : "bg-blue-600 animate-pulse"}`}></span>
                          <h3 className="font-bold text-lg text-gray-900">{inq.name}</h3>
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            inq.is_read ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-800"
                          }`}>
                            {inq.is_read ? "Read" : "New"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock size={14} />
                          <span>{formattedDate} IST</span>
                        </div>
                      </div>

                      {/* CONTACT BADGES */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <a 
                          href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject || "Inquiry via Ti2A")}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition"
                        >
                          <Mail size={13} className="text-gray-500" />
                          <span>{inq.email}</span>
                        </a>

                        {inq.phone && (
                          <a 
                            href={`tel:${inq.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition"
                          >
                            <Phone size={13} className="text-gray-500" />
                            <span>{inq.phone}</span>
                          </a>
                        )}

                        {phoneClean && (
                          <a 
                            href={`https://wa.me/${phoneClean}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-semibold text-green-700 transition"
                          >
                            <MessageCircle size={13} />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>

                      {/* SUBJECT & MESSAGE */}
                      <div className="mb-5">
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                          Subject: <span className="text-gray-800 normal-case font-semibold">{inq.subject || "General Inquiry"}</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl text-gray-800 text-sm whitespace-pre-wrap leading-relaxed border border-gray-100">
                          {inq.message}
                        </div>
                      </div>

                      {/* ACTIONS ROW */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject || "Inquiry via Ti2A")}`}
                            className="inline-flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
                          >
                            <Mail size={14} />
                            <span>Reply via Email</span>
                          </a>

                          {phoneClean && (
                            <a
                              href={`https://wa.me/${phoneClean}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
                            >
                              <MessageCircle size={14} />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleReadStatus(inq.id, inq.is_read)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-black border border-gray-200 hover:border-gray-300 rounded-lg transition"
                          >
                            {inq.is_read ? "Mark as Unread" : "Mark as Read"}
                          </button>
                          <button
                            onClick={() => deleteInquiry(inq.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition"
                            title="Delete inquiry"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SITE INFO & DIRECT CONTACT SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN: DIRECT CONTACT */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-6 text-gray-900 border-b pb-2">Direct Contact Details</h2>
                <p className="text-sm text-gray-500 mb-6">These details are used when a user directly messages or contacts the organization.</p>
                
                <div className="space-y-5">
                  <LockedField label="Contact Email" type="email" fieldKey="email" value={settings.email} onChange={(val: string) => setSettings({...settings, email: val})} />
                  
                  <LockedField label="Contact Phone" type="text" fieldKey="phone" value={settings.phone} onChange={(val: string) => setSettings({...settings, phone: val})} />

                  <LockedField label="Direct WhatsApp Number" subLabel="Number used for direct WhatsApp chats (e.g. 918608609661)" type="text" fieldKey="whatsapp" value={settings.whatsapp} onChange={(val: string) => setSettings({...settings, whatsapp: val})} />

                  <LockedField label="Contact Address" isTextarea={true} fieldKey="contact_address" value={settings.contact_address} onChange={(val: string) => setSettings({...settings, contact_address: val})} />
                </div>
              </div>

              {/* RIGHT COLUMN: SOCIAL / PAGE */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between border-b pb-2 mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Social & Public Channels</h2>
                  <Link href="/admin/social-config" className="text-xs font-semibold text-blue-500 hover:underline">
                    Social Configuration
                  </Link>
                </div>
                <p className="text-sm text-gray-500 mb-6">Links to official pages, channels, and social media profiles.</p>
                
                <div className="space-y-5">
                  <LockedField label="WhatsApp Channel URL" subLabel="Public channel link (NOT your direct WhatsApp number)" type="url" fieldKey="whatsapp_channel_url" value={settings.whatsapp_channel_url} onChange={(val: string) => setSettings({...settings, whatsapp_channel_url: val})} />

                  <LockedField label="Facebook Page URL" type="url" fieldKey="facebook" value={settings.facebook} onChange={(val: string) => setSettings({...settings, facebook: val})} />

                  <LockedField label="X / Twitter URL" type="url" fieldKey="twitter" value={settings.twitter} onChange={(val: string) => setSettings({...settings, twitter: val})} />

                  <LockedField label="Telegram Channel URL" type="url" fieldKey="website_url" value={settings.website_url} onChange={(val: string) => setSettings({...settings, website_url: val})} />
                  <LockedField label="Instagram URL" type="url" fieldKey="instagram" value={settings.instagram} onChange={(val: string) => setSettings({...settings, instagram: val})} />

                  <LockedField label="LinkedIn URL" type="url" fieldKey="linkedin" value={settings.linkedin} onChange={(val: string) => setSettings({...settings, linkedin: val})} />
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
                  <p className="text-xs text-gray-500">Max size 2MB. Recommended formats: PNG, JPG, JPEG, or SVG.</p>
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
              
              <LockedField label="About Us" isTextarea={true} fieldKey="about_us" value={settings.about_us} onChange={(val: string) => setSettings({...settings, about_us: val})} />

              <LockedField label="History" isTextarea={true} fieldKey="about_history" value={settings.about_history} onChange={(val: string) => setSettings({...settings, about_history: val})} />

              <LockedField label="Mission" isTextarea={true} fieldKey="about_mission" value={settings.about_mission} onChange={(val: string) => setSettings({...settings, about_mission: val})} />
            </div>

            <div className="pt-4 flex justify-end">
              <button disabled={saving} type="submit" className="bg-black text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50 transition shadow-md">
                {saving ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </main>
  );
}
