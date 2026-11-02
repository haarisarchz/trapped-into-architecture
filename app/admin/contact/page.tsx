"use client";
import Link from "next/link";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  X, 
  Mail, 
  Phone, 
  MessageCircle, 
  Search, 
  RefreshCw, 
  Trash2, 
  Inbox, 
  Settings, 
  Send,
  ChevronRight,
  Lightbulb
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
     let finalVal = localValue;
     if (type === "url" && finalVal && typeof finalVal === "string") {
       finalVal = finalVal.trim();
       if (finalVal && !/^https?:\/\//i.test(finalVal)) {
         finalVal = "https://" + finalVal;
       }
     }
     setSaving(true);
     const { error } = await supabase.from('site_settings').update({ [fieldKey]: finalVal }).eq('id', 'global');
     setSaving(false);
     if (error) {
       alert("Failed to save: " + error.message);
       return;
     }
     setLocalValue(finalVal);
     if (onChange) onChange(finalVal);
     setIsEditing(false);
  };
  
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center justify-between">
        <span>{label}</span>
        {!isEditing && (
          <button type="button" onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700 text-xs font-semibold cursor-pointer">
             ✎ Edit
          </button>
        )}
      </label>
      {subLabel && <p className="text-xs text-gray-400 mb-2">{subLabel}</p>}
      
      {isEditing ? (
        <div className="space-y-2 mt-1">
          {isTextarea ? (
             <textarea 
               rows={3} 
               value={localValue || ''} 
               onChange={(e) => setLocalValue(e.target.value)} 
               className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none bg-white text-black" 
             />
          ) : (
             <input 
               type={type} 
               value={localValue || ''} 
               onChange={(e) => setLocalValue(e.target.value)} 
               className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none bg-white text-black" 
             />
          )}
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={handleSave} 
              disabled={saving}
              className="px-4 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button 
              type="button" 
              onClick={() => { setLocalValue(value); setIsEditing(false); }} 
              className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 break-all select-all">
          {value || <span className="text-gray-400 italic font-normal">Not configured</span>}
        </div>
      )}
    </div>
  );
};

export default function ContactSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"inbox" | "settings">("inbox");
  const [loading, setLoading] = useState(true);

  // Inquiries State
  const [allInquiries, setAllInquiries] = useState<ContactInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "suggestions" | "general">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");

  // Detailed Modal
  const [selectedItem, setSelectedItem] = useState<ContactInquiry | null>(null);

  // Site Settings Form State
  const [settings, setSettings] = useState({
    contact_phone: "",
    contact_email: "",
    contact_whatsapp: "",
    contact_address: "",
    social_instagram: "",
    social_linkedin: "",
    social_twitter: "",
    social_facebook: "",
    social_telegram: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      router.push("/admin");
      return;
    }
    const user = JSON.parse(userStr);
    const role = (user.role || "").toLowerCase().replace(/[\s_]+/g, "");
    if (role !== "ceo" && role !== "superadmin" && role !== "admin") {
      router.push("/admin");
      return;
    }

    // Auto-redirect if accessed with ?tab=sent
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("tab") === "sent") {
        router.replace("/admin/mails");
        return;
      }
    }

    fetchSettings();
    fetchInquiries();
  }, [router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "global")
        .single();

      if (data) {
        setSettings({
          contact_phone: data.contact_phone || "",
          contact_email: data.contact_email || "",
          contact_whatsapp: data.contact_whatsapp || "",
          contact_address: data.contact_address || "",
          social_instagram: data.social_instagram || "",
          social_linkedin: data.social_linkedin || "",
          social_twitter: data.social_twitter || "",
          social_facebook: data.social_facebook || "",
          social_telegram: data.social_telegram || "",
        });
      }
    } catch (err: any) {
      console.error("Error fetching settings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    try {
      setLoadingInquiries(true);
      const { data, error } = await supabase
        .from("contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllInquiries(data || []);
    } catch (err: any) {
      console.error("Error fetching inquiries:", err.message);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const toggleReadStatus = async (id: string, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const { error } = await supabase
        .from("contact_inquiries")
        .update({ is_read: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      setAllInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, is_read: !currentStatus } : inq));
      if (selectedItem?.id === id) {
        setSelectedItem({ ...selectedItem, is_read: !currentStatus });
      }
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  };

  const deleteInquiry = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const { error } = await supabase
        .from("contact_inquiries")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setAllInquiries(prev => prev.filter(inq => inq.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (err: any) {
      alert("Error deleting message: " + err.message);
    }
  };

  // Filter out system emails (which belong to /admin/mails)
  const visitorInquiries = allInquiries.filter(item => {
    const subj = (item.subject || "").trim();
    const msg = (item.message || "").toLowerCase();
    const isSystemEmail =
      subj === "NOTIFIED_COMPANY_JOB_POSTING" ||
      subj === "COMPANY_JOB_EMAIL_SENT" ||
      subj === "USER_VERIFICATION_SENT" ||
      subj === "USER_VERIFIED" ||
      subj === "ADMIN_DIRECT" ||
      subj.startsWith("[Live on Ti2A]") ||
      msg.includes("verification code dispatched") ||
      msg.includes("outreach notification sent") ||
      msg.includes("claim your studio") ||
      msg.includes("dispatched email to");

    return !isSystemEmail;
  });

  const filteredInquiries = visitorInquiries.filter(item => {
    const isSuggestion =
      (item.subject || "").includes("[Suggestion]") ||
      (item.subject || "").toLowerCase().includes("suggestion");

    if (categoryFilter === "suggestions" && !isSuggestion) return false;
    if (categoryFilter === "general" && isSuggestion) return false;

    if (statusFilter === "unread" && item.is_read) return false;
    if (statusFilter === "read" && !item.is_read) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (item.name || "").toLowerCase().includes(q);
      const matchEmail = (item.email || "").toLowerCase().includes(q);
      const matchSubj = (item.subject || "").toLowerCase().includes(q);
      const matchMsg = (item.message || "").toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchSubj && !matchMsg) return false;
    }

    return true;
  });

  const unreadCount = visitorInquiries.filter(inq => !inq.is_read).length;
  const suggestionsCount = visitorInquiries.filter(inq => 
    (inq.subject || "").includes("[Suggestion]") || (inq.subject || "").toLowerCase().includes("suggestion")
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col text-black">
      <Navbar />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 md:py-10">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <AdminQuickMenu />
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Contact &amp; Suggestions
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage visitor messages, community suggestion box, and site contact channels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/mails"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Send size={13} />
              <span>Go to Mail Center →</span>
            </Link>

            <button
              onClick={() => router.push('/admin')}
              className="bg-white text-gray-700 px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition font-medium text-xs cursor-pointer"
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-gray-200 mb-6 pb-2">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer ${
              activeTab === "inbox" 
                ? "bg-black text-white shadow-xs" 
                : "bg-white text-gray-600 hover:text-black border border-gray-200"
            }`}
          >
            <Inbox size={14} />
            <span>Inquiries &amp; Suggestions</span>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer ${
              activeTab === "settings" 
                ? "bg-black text-white shadow-xs" 
                : "bg-white text-gray-600 hover:text-black border border-gray-200"
            }`}
          >
            <Settings size={14} />
            <span>Public Contact Settings</span>
          </button>
        </div>

        {/* TAB 1: INQUIRIES & SUGGESTIONS */}
        {activeTab === "inbox" && (
          <div className="space-y-4">
            {/* TOOLBAR */}
            <div className="bg-white border border-gray-200 rounded-2xl p-3.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full sm:max-w-xs">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, email, or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition"
                />
              </div>

              {/* CATEGORY & STATUS FILTERS */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      categoryFilter === "all" ? "bg-white text-black shadow-2xs" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    All ({visitorInquiries.length})
                  </button>
                  <button
                    onClick={() => setCategoryFilter("suggestions")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                      categoryFilter === "suggestions" ? "bg-amber-500 text-white shadow-2xs" : "text-amber-700 hover:bg-amber-50"
                    }`}
                  >
                    <Lightbulb size={12} />
                    <span>Suggestions ({suggestionsCount})</span>
                  </button>
                  <button
                    onClick={() => setCategoryFilter("general")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      categoryFilter === "general" ? "bg-white text-black shadow-2xs" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    General
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                      statusFilter === "all" ? "bg-white text-black shadow-2xs" : "text-gray-500"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter("unread")}
                    className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                      statusFilter === "unread" ? "bg-white text-black shadow-2xs" : "text-gray-500"
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter("read")}
                    className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                      statusFilter === "read" ? "bg-white text-black shadow-2xs" : "text-gray-500"
                    }`}
                  >
                    Read
                  </button>
                </div>

                <button
                  onClick={fetchInquiries}
                  disabled={loadingInquiries}
                  className="p-1.5 text-gray-500 hover:text-black border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw size={14} className={loadingInquiries ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* LIST */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
              {filteredInquiries.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Inbox size={36} className="mx-auto mb-2 text-gray-300" />
                  <p className="font-bold text-gray-700 text-sm">No Messages Found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {categoryFilter === "suggestions" 
                      ? "No community suggestions received yet."
                      : "Messages submitted via the public contact form appear here."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredInquiries.map((inq) => {
                    const isSuggestion = 
                      (inq.subject || "").includes("[Suggestion]") || 
                      (inq.subject || "").toLowerCase().includes("suggestion");

                    const dateStr = new Date(inq.created_at).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={inq.id}
                        onClick={() => setSelectedItem(inq)}
                        className={`flex items-center justify-between p-3.5 sm:px-5 hover:bg-gray-50 transition cursor-pointer gap-3 text-xs ${
                          inq.is_read ? "bg-white text-gray-600" : "bg-blue-50/40 text-gray-900 font-semibold"
                        }`}
                      >
                        {/* LEFT: SENDER & STATUS */}
                        <div className="flex items-center gap-3 min-w-0 sm:w-1/3 shrink-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            inq.is_read ? "bg-gray-300" : "bg-blue-600 animate-pulse"
                          }`}></span>
                          <div className="truncate">
                            <span className="font-extrabold text-sm text-gray-900 block truncate">{inq.name}</span>
                            <span className="text-xs text-gray-400 font-normal truncate block">{inq.email}</span>
                          </div>
                        </div>

                        {/* MIDDLE: BADGE + SUBJECT & SNIPPET */}
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          {isSuggestion ? (
                            <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <Lightbulb size={10} />
                              <span>Suggestion</span>
                            </span>
                          ) : (
                            <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                              Inquiry
                            </span>
                          )}

                          <span className="truncate text-gray-800 font-bold mr-1">
                            {inq.subject?.replace("[Suggestion]", "").trim() || "General"}
                          </span>
                          <span className="truncate text-gray-400 font-normal hidden md:inline">
                            — {inq.message?.replace(/[\r\n]+/g, " ").slice(0, 70)}...
                          </span>
                        </div>

                        {/* RIGHT: DATE & CHEVRON */}
                        <div className="flex items-center gap-3 shrink-0 text-right">
                          <span className="text-[11px] text-gray-400 whitespace-nowrap">{dateStr}</span>
                          <ChevronRight size={14} className="text-gray-300" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CONTACT SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Direct Contact Information</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  These details appear on your public contact page, footer, and inquiry responses.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LockedField
                  label="Official Support Email"
                  subLabel="Primary administrative inquiry address"
                  fieldKey="contact_email"
                  type="email"
                  value={settings.contact_email}
                  onChange={(v: string) => setSettings({ ...settings, contact_email: v })}
                />

                <LockedField
                  label="Telephone / Support Helpline"
                  subLabel="Displayed for direct voice queries"
                  fieldKey="contact_phone"
                  value={settings.contact_phone}
                  onChange={(v: string) => setSettings({ ...settings, contact_phone: v })}
                />

                <LockedField
                  label="WhatsApp Helpline Number"
                  subLabel="Enables 1-click WhatsApp messaging on public pages (include country code)"
                  fieldKey="contact_whatsapp"
                  value={settings.contact_whatsapp}
                  onChange={(v: string) => setSettings({ ...settings, contact_whatsapp: v })}
                />

                <LockedField
                  label="Headquarters / Studio Address"
                  subLabel="Office location shown on contact page"
                  fieldKey="contact_address"
                  isTextarea={true}
                  value={settings.contact_address}
                  onChange={(v: string) => setSettings({ ...settings, contact_address: v })}
                />
              </div>
            </div>

            {/* SOCIAL CHANNELS */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Official Social Channels</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Links displayed across the site footer and community hubs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LockedField
                  label="Instagram URL"
                  fieldKey="social_instagram"
                  type="url"
                  value={settings.social_instagram}
                  onChange={(v: string) => setSettings({ ...settings, social_instagram: v })}
                />

                <LockedField
                  label="LinkedIn URL"
                  fieldKey="social_linkedin"
                  type="url"
                  value={settings.social_linkedin}
                  onChange={(v: string) => setSettings({ ...settings, social_linkedin: v })}
                />

                <LockedField
                  label="X (Twitter) URL"
                  fieldKey="social_twitter"
                  type="url"
                  value={settings.social_twitter}
                  onChange={(v: string) => setSettings({ ...settings, social_twitter: v })}
                />

                <LockedField
                  label="Telegram Community URL"
                  fieldKey="social_telegram"
                  type="url"
                  value={settings.social_telegram}
                  onChange={(v: string) => setSettings({ ...settings, social_telegram: v })}
                />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* READING MODAL */}
      {selectedItem && (
        <div 
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto"
          >
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-extrabold text-gray-900">{selectedItem.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    selectedItem.is_read ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-800"
                  }`}>
                    {selectedItem.is_read ? "Read" : "Unread"}
                  </span>
                  {(selectedItem.subject?.includes("[Suggestion]") || selectedItem.subject?.toLowerCase().includes("suggestion")) && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-100 text-amber-800 flex items-center gap-1">
                      <Lightbulb size={10} />
                      <span>Suggestion</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-mono">&lt;{selectedItem.email}&gt;</p>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-black p-1 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* METADATA */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-500 uppercase tracking-wider">Subject:</span>
                <span className="font-extrabold text-gray-900">{selectedItem.subject || "General Inquiry"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-500 uppercase tracking-wider">Date Sent:</span>
                <span className="text-gray-700">
                  {new Date(selectedItem.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
                </span>
              </div>
              {selectedItem.phone && (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-500 uppercase tracking-wider">Phone:</span>
                  <a href={`tel:${selectedItem.phone}`} className="text-blue-600 font-bold hover:underline">
                    {selectedItem.phone}
                  </a>
                </div>
              )}
            </div>

            {/* FULL MESSAGE BODY */}
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message Content:</div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {selectedItem.message}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedItem.email}?subject=Re: ${encodeURIComponent(selectedItem.subject || "Ti2A Inquiry")}`}
                  className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Mail size={14} />
                  <span>Reply via Email</span>
                </a>

                {selectedItem.phone && (
                  <a
                    href={`https://wa.me/${selectedItem.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => toggleReadStatus(selectedItem.id, selectedItem.is_read, e)}
                  className="text-xs font-bold text-gray-600 hover:text-black border border-gray-200 px-3 py-2 rounded-xl transition cursor-pointer"
                >
                  {selectedItem.is_read ? "Mark Unread" : "Mark Read"}
                </button>

                <button
                  onClick={(e) => deleteInquiry(selectedItem.id, e)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-xl transition cursor-pointer"
                  title="Delete message"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
