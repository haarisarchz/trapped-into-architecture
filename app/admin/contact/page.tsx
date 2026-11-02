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
  Check,
  Send,
  Plus,
  AlertCircle,
  Eye,
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight
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
        <div className="flex flex-col sm:flex-row gap-2">
          {isTextarea ? (
             <textarea value={localValue} onChange={e => setLocalValue(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]" />
          ) : (
             <input type={type} value={localValue} onChange={e => setLocalValue(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
          )}
          <button type="button" onClick={handleSave} disabled={saving} className="bg-black text-white px-6 py-2 sm:py-0 rounded-xl disabled:opacity-50 font-medium shrink-0 h-[46px] sm:self-start cursor-pointer">
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
  const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "outbox" | "settings">("inbox");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Inquiries & Sent State
  const [allRecords, setAllRecords] = useState<ContactInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");
  const [sentFilter, setSentFilter] = useState<"all" | "company" | "verification" | "digest" | "direct">("all");
  const [setupRequired, setSetupRequired] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Detailed View Modal
  const [viewingRecord, setViewingRecord] = useState<ContactInquiry | null>(null);

  // Compose Modal State (Gmail-style)
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeName, setComposeName] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  
  const [settings, setSettings] = useState({
    email: "",
    phone: "",
    whatsapp: "",
    contact_address: "",
    whatsapp_channel_url: "",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    website_url: "",
    logo_url: "",
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
        setAllRecords([]);
      } else if (data.inquiries) {
        setSetupRequired(false);
        setAllRecords(data.inquiries);
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
        setAllRecords(prev => prev.map(inq => inq.id === id ? { ...inq, is_read: !currentStatus } : inq));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setAllRecords(prev => prev.filter(inq => inq.id !== id));
        if (viewingRecord?.id === id) setViewingRecord(null);
      }
    } catch (err) {
      console.error("Failed to delete record:", err);
    }
  };

  const handleSendDirectEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject || !composeBody) {
      alert("Please provide Recipient Email, Subject, and Message body.");
      return;
    }

    setSendingEmail(true);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeTo,
          recipientName: composeName,
          subject: composeSubject,
          message: composeBody,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("✉️ Email dispatched successfully!");
        setShowCompose(false);
        setComposeTo("");
        setComposeName("");
        setComposeSubject("");
        setComposeBody("");
        fetchInquiries();
        setActiveTab("sent");
      } else {
        alert(data.error || "Failed to send email. Check recipient address.");
      }
    } catch (err: any) {
      alert(err.message || "Network error sending email.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleOpenReply = (inq: ContactInquiry) => {
    setComposeTo(inq.email);
    setComposeName(inq.name);
    setComposeSubject(`Re: ${inq.subject || "Inquiry on Trapped Into Architecture"}`);
    setComposeBody(`\n\n--- Original Inquiry ---\nFrom: ${inq.name} <${inq.email}>\nDate: ${new Date(inq.created_at).toLocaleString("en-IN")}\nMessage: ${inq.message}`);
    setShowCompose(true);
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

  // Categorize records into Inbox, Sent, and Outbox/Pending
  const isSentRecord = (item: ContactInquiry) => {
    const subj = item.subject || "";
    return (
      subj === "COMPANY_JOB_EMAIL_SENT" ||
      subj === "NOTIFIED_COMPANY_JOB_POSTING" ||
      subj.startsWith("ADMIN_DIRECT_MAIL") ||
      subj.startsWith("WEEKLY_DIGEST") ||
      subj.startsWith("SENT_")
    );
  };

  const isPendingRecord = (item: ContactInquiry) => {
    const subj = item.subject || "";
    return (
      subj === "COMPANY_JOB_EMAIL_PENDING" ||
      subj.startsWith("PENDING_") ||
      item.email === "unspecified@company"
    );
  };

  const inboxRecords = allRecords.filter(r => !isSentRecord(r) && !isPendingRecord(r));
  const sentRecords = allRecords.filter(isSentRecord);
  const pendingRecords = allRecords.filter(isPendingRecord);

  const unreadInboxCount = inboxRecords.filter(i => !i.is_read).length;

  // Filtered views
  const filteredInbox = inboxRecords.filter(i => {
    if (filterStatus === "unread" && i.is_read) return false;
    if (filterStatus === "read" && !i.is_read) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        (i.subject || "").toLowerCase().includes(q) ||
        (i.message || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredSent = sentRecords.filter(item => {
    const subj = item.subject || "";
    const msg = item.message || "";
    if (sentFilter === "company" && !(subj === "COMPANY_JOB_EMAIL_SENT" || subj === "NOTIFIED_COMPANY_JOB_POSTING" || msg.toLowerCase().includes("job"))) return false;
    if (sentFilter === "verification" && !msg.toLowerCase().includes("verification") && !msg.toLowerCase().includes("verified")) return false;
    if (sentFilter === "digest" && !subj.includes("DIGEST") && !msg.toLowerCase().includes("digest")) return false;
    if (sentFilter === "direct" && !subj.startsWith("ADMIN_DIRECT_MAIL")) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        subj.toLowerCase().includes(q) ||
        msg.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredPending = pendingRecords.filter(item => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.message || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) return <div className="p-10 text-center font-bold">Loading Mail Center...</div>;

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <AdminQuickMenu />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Mail & Communication Center
                </h1>
                <span className="text-xs font-bold bg-black text-white px-2.5 py-0.5 rounded-full">
                  Gmail View
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                Track incoming messages, company outreach history, sent emails, and platform channels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCompose(true)}
              className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus size={16} />
              <span>Compose Email</span>
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="bg-white text-gray-800 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition flex items-center gap-1.5 font-medium text-xs shadow-sm cursor-pointer"
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {/* MAIN TWO-COLUMN GMAIL LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR: FOLDER NAVIGATION */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm space-y-1">
              
              <button
                onClick={() => { setActiveTab("inbox"); setSearchQuery(""); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition cursor-pointer ${
                  activeTab === "inbox"
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Inbox size={18} />
                  <span>Inbox</span>
                </div>
                {unreadInboxCount > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                    activeTab === "inbox" ? "bg-white text-black" : "bg-black text-white"
                  }`}>
                    {unreadInboxCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setActiveTab("sent"); setSearchQuery(""); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition cursor-pointer ${
                  activeTab === "sent"
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Send size={18} />
                  <span>Sent Mails</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "sent" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {sentRecords.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab("outbox"); setSearchQuery(""); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition cursor-pointer ${
                  activeTab === "outbox"
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock size={18} />
                  <span>Outbox / Pending</span>
                </div>
                {pendingRecords.length > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    activeTab === "outbox" ? "bg-amber-400 text-black" : "bg-amber-100 text-amber-800"
                  }`}>
                    {pendingRecords.length}
                  </span>
                )}
              </button>

              <div className="pt-2 border-t border-gray-100 my-1"></div>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings size={18} />
                  <span>Contact Settings</span>
                </div>
              </button>
            </div>

            {/* QUICK STATS CARD */}
            <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Email Dispatch Overview
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white/10 p-3 rounded-xl">
                  <div className="text-2xl font-black">{sentRecords.length}</div>
                  <div className="text-[11px] text-gray-300 font-medium mt-0.5">Dispatched Mails</div>
                </div>
                <div className="bg-white/10 p-3 rounded-xl">
                  <div className="text-2xl font-black">{inboxRecords.length}</div>
                  <div className="text-[11px] text-gray-300 font-medium mt-0.5">Visitor Inquiries</div>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed pt-1">
                Connected to Resend. Outgoing company notifications, digests, and verification links are recorded in real-time.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: MAIN CONTENT VIEW */}
          <div className="lg:col-span-9 space-y-5">
            
            {/* SEARCH & REFRESH TOOLBAR */}
            {activeTab !== "settings" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={`Search in ${activeTab === "inbox" ? "inbox inquiries" : activeTab === "sent" ? "sent emails by recipient or firm" : "pending emails"}...`}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  {activeTab === "inbox" && (
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                      <button
                        onClick={() => setFilterStatus("all")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          filterStatus === "all" ? "bg-white text-black shadow-xs" : "text-gray-600 hover:text-black"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterStatus("unread")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          filterStatus === "unread" ? "bg-white text-black shadow-xs" : "text-gray-600 hover:text-black"
                        }`}
                      >
                        Unread ({unreadInboxCount})
                      </button>
                      <button
                        onClick={() => setFilterStatus("read")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          filterStatus === "read" ? "bg-white text-black shadow-xs" : "text-gray-600 hover:text-black"
                        }`}
                      >
                        Read
                      </button>
                    </div>
                  )}

                  {activeTab === "sent" && (
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto max-w-full">
                      <button
                        onClick={() => setSentFilter("all")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                          sentFilter === "all" ? "bg-white text-black shadow-xs" : "text-gray-600 hover:text-black"
                        }`}
                      >
                        All Sent
                      </button>
                      <button
                        onClick={() => setSentFilter("company")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                          sentFilter === "company" ? "bg-white text-black shadow-xs" : "text-gray-600 hover:text-black"
                        }`}
                      >
                        🏢 Studios
                      </button>
                      <button
                        onClick={() => setSentFilter("verification")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                          sentFilter === "verification" ? "bg-white text-black shadow-xs" : "text-gray-600 hover:text-black"
                        }`}
                      >
                        🔒 Users
                      </button>
                      <button
                        onClick={() => setSentFilter("direct")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                          sentFilter === "direct" ? "bg-white text-black shadow-xs" : "text-gray-600 hover:text-black"
                        }`}
                      >
                        ✉️ Direct
                      </button>
                    </div>
                  )}

                  <button
                    onClick={fetchInquiries}
                    disabled={loadingInquiries}
                    title="Refresh"
                    className="p-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-gray-600 transition disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    <RefreshCw size={15} className={loadingInquiries ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 1: INBOX */}
            {activeTab === "inbox" && (
              <div className="space-y-3">
                {loadingInquiries && inboxRecords.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-black" />
                    <p className="font-medium text-sm">Loading inquiries...</p>
                  </div>
                ) : filteredInbox.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                    <Inbox size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="font-bold text-gray-800 text-lg mb-1">No Inquiries in Inbox</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                      {searchQuery ? "No messages match your search." : "When visitors submit contact forms, they appear here."}
                    </p>
                  </div>
                ) : (
                  filteredInbox.map((inq) => {
                    const phoneClean = inq.phone ? inq.phone.replace(/\D/g, '') : null;
                    const formattedDate = new Date(inq.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Kolkata"
                    });

                    return (
                      <div
                        key={inq.id}
                        className={`bg-white border rounded-2xl p-5 transition shadow-xs hover:shadow-md ${
                          inq.is_read ? "border-gray-200" : "border-blue-400 ring-1 ring-blue-100"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3 mb-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${inq.is_read ? "bg-gray-300" : "bg-blue-600 animate-pulse"}`}></span>
                            <span className="font-extrabold text-base text-gray-900">{inq.name}</span>
                            <span className="text-xs text-gray-400">&lt;{inq.email}&gt;</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              inq.is_read ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-800"
                            }`}>
                              {inq.is_read ? "Read" : "New"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1.5">
                            <Clock size={13} />
                            <span>{formattedDate} IST</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="text-xs font-bold text-gray-800 mb-1">
                            {inq.subject || "General Inquiry"}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                            {inq.message}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenReply(inq)}
                              className="inline-flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                            >
                              <Mail size={13} />
                              <span>Reply</span>
                            </button>

                            {phoneClean && (
                              <a
                                href={`https://wa.me/${phoneClean}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition"
                              >
                                <MessageCircle size={13} />
                                <span>WhatsApp</span>
                              </a>
                            )}

                            <button
                              onClick={() => setViewingRecord(inq)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>View Full</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleReadStatus(inq.id, inq.is_read)}
                              className="text-xs text-gray-500 hover:text-black underline cursor-pointer"
                            >
                              {inq.is_read ? "Mark unread" : "Mark read"}
                            </button>
                            <button
                              onClick={() => deleteInquiry(inq.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: SENT MAILS (THE GMAIL SENT FOLDER) */}
            {activeTab === "sent" && (
              <div className="space-y-3">
                {loadingInquiries && sentRecords.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-black" />
                    <p className="font-medium text-sm">Loading sent records...</p>
                  </div>
                ) : filteredSent.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                    <Send size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="font-bold text-gray-800 text-lg mb-1">No Sent Emails Found</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                      {searchQuery ? "No sent emails match your filter or search query." : "Dispatched company notices, user verification emails, and digest updates will appear here."}
                    </p>
                  </div>
                ) : (
                  filteredSent.map((item) => {
                    const formattedDate = new Date(item.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Kolkata"
                    });

                    const isCompany = item.subject === "COMPANY_JOB_EMAIL_SENT" || item.subject === "NOTIFIED_COMPANY_JOB_POSTING" || item.message.toLowerCase().includes("studio") || item.message.toLowerCase().includes("job");
                    const isVerification = item.message.toLowerCase().includes("verification") || item.message.toLowerCase().includes("verified");
                    const isDirect = item.subject.startsWith("ADMIN_DIRECT_MAIL");

                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 transition shadow-xs hover:shadow-md hover:border-gray-300"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3 mb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            
                            {/* CATEGORY TAG */}
                            {isCompany && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full">
                                <Building2 size={12} />
                                <span>Studio Job Outreach</span>
                              </span>
                            )}
                            {isVerification && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                                <ShieldCheck size={12} />
                                <span>User Verification</span>
                              </span>
                            )}
                            {isDirect && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                                <Mail size={12} />
                                <span>Admin Direct</span>
                              </span>
                            )}

                            <span className="font-extrabold text-sm sm:text-base text-gray-900">
                              To: {item.name || "Recipient"}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                              &lt;{item.email}&gt;
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              <CheckCircle2 size={12} />
                              <span>Delivered via Resend</span>
                            </span>
                            <span>•</span>
                            <span>{formattedDate} IST</span>
                          </div>
                        </div>

                        <div className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed bg-gray-50/60 p-3 rounded-xl border border-gray-100 mb-3">
                          {item.message}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => setViewingRecord(item)}
                            className="text-xs font-bold text-black hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Inspect Dispatch Payload</span>
                          </button>

                          <button
                            onClick={() => deleteInquiry(item.id)}
                            className="p-1 text-gray-300 hover:text-red-500 transition cursor-pointer"
                            title="Delete log"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 3: OUTBOX / PENDING */}
            {activeTab === "outbox" && (
              <div className="space-y-3">
                {filteredPending.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                    <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
                    <h3 className="font-bold text-gray-800 text-lg mb-1">Outbox is Clean!</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                      All jobs and outreach items currently have valid company email addresses on file. Zero emails are stuck or pending.
                    </p>
                  </div>
                ) : (
                  filteredPending.map(item => (
                    <div key={item.id} className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                          <span className="font-bold text-sm text-gray-900">{item.name}</span>
                          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                            Missing Company Email
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(item.created_at).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{item.message}</p>
                      <button
                        onClick={() => {
                          setComposeName(item.name);
                          setComposeSubject(`Job Posting Notification for ${item.name}`);
                          setComposeBody(`Hello ${item.name} Team,\n\nYour architectural hiring opening has been posted on Trapped Into Architecture.\n\nTo manage your listing or claim your studio page, please visit our website.`);
                          setShowCompose(true);
                        }}
                        className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-gray-800 transition cursor-pointer"
                      >
                        Enter Email & Send Now →
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: SITE SETTINGS (PRESERVED IN FULL) */}
            {activeTab === "settings" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* LEFT: DIRECT CONTACT */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 text-gray-900 border-b pb-2">Direct Contact Details</h2>
                    <p className="text-sm text-gray-500 mb-6">These details are shown on the website and used for administrative notifications.</p>
                    
                    <div className="space-y-5">
                      <LockedField label="Contact Email" type="email" fieldKey="email" value={settings.email} onChange={(val: string) => setSettings({...settings, email: val})} />
                      <LockedField label="Contact Phone" type="text" fieldKey="phone" value={settings.phone} onChange={(val: string) => setSettings({...settings, phone: val})} />
                      <LockedField label="Direct WhatsApp Number" subLabel="Number used for direct WhatsApp chats (e.g. 918608609661)" type="text" fieldKey="whatsapp" value={settings.whatsapp} onChange={(val: string) => setSettings({...settings, whatsapp: val})} />
                      <LockedField label="Contact Address" isTextarea={true} fieldKey="contact_address" value={settings.contact_address} onChange={(val: string) => setSettings({...settings, contact_address: val})} />
                    </div>
                  </div>

                  {/* RIGHT: SOCIAL LINKS */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between border-b pb-2 mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Social & Public Channels</h2>
                      <Link href="/admin/social-config" className="text-xs font-semibold text-blue-500 hover:underline">
                        Social Configuration
                      </Link>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">Links to official pages, channels, and social media profiles.</p>
                    
                    <div className="space-y-5">
                      <LockedField label="WhatsApp Channel URL" subLabel="Public channel link" type="url" fieldKey="whatsapp_channel_url" value={settings.whatsapp_channel_url} onChange={(val: string) => setSettings({...settings, whatsapp_channel_url: val})} />
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
                          <button type="button" onClick={() => setSettings({...settings, logo_url: ""})} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition cursor-pointer">
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
              </div>
            )}

          </div>

        </div>
      </div>

      {/* GMAIL-STYLE FLOATING COMPOSE MODAL */}
      {showCompose && (
        <div className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* MODAL HEADER */}
            <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={18} />
                <span className="font-bold text-sm">New Message (Admin Dispatch)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="text-gray-300 hover:text-white transition p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* COMPOSE FORM */}
            <form onSubmit={handleSendDirectEmail} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">To (Email Address) *</label>
                  <input
                    type="email"
                    required
                    value={composeTo}
                    onChange={e => setComposeTo(e.target.value)}
                    placeholder="recipient@studio.com"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Recipient Name / Studio</label>
                  <input
                    type="text"
                    value={composeName}
                    onChange={e => setComposeName(e.target.value)}
                    placeholder="e.g. Sanjay Puri Architects"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={e => setComposeSubject(e.target.value)}
                  placeholder="e.g. Invitation to Claim Your Studio Profile on Ti2A"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Body *</label>
                <textarea
                  required
                  rows={6}
                  value={composeBody}
                  onChange={e => setComposeBody(e.target.value)}
                  placeholder="Write your email message here..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Delivered via Resend and logged in Sent folder
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCompose(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingEmail}
                    className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    {sendingEmail ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Send Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL RECORD PREVIEW MODAL */}
      {viewingRecord && (
        <div className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900">{viewingRecord.name}</h3>
                <p className="text-xs text-gray-500 font-mono">{viewingRecord.email}</p>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="text-gray-400 hover:text-black p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Subject / Type
                </span>
                <div className="text-sm font-bold text-gray-900 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  {viewingRecord.subject || "General Inquiry"}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Message Content / Log
                </span>
                <div className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100 max-h-60 overflow-y-auto">
                  {viewingRecord.message}
                </div>
              </div>

              <div className="text-xs text-gray-400 pt-1">
                Timestamp: {new Date(viewingRecord.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
              <button
                onClick={() => setViewingRecord(null)}
                className="bg-black text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
