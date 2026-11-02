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
  Send,
  Plus,
  AlertCircle,
  Eye,
  Building2,
  ShieldCheck,
  ChevronRight,
  Flame,
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
  const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "campaign" | "settings">("inbox");
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Inquiries & Sent State
  const [allRecords, setAllRecords] = useState<ContactInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");

  // Detailed Reading Modal
  const [selectedItem, setSelectedItem] = useState<ContactInquiry | null>(null);

  // Compose Modal State
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeName, setComposeName] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Campaign State (10-15/day outreach)
  const [campaignStats, setCampaignStats] = useState<any>(null);
  const [nextBatch, setNextBatch] = useState<any[]>([]);
  const [loadingCampaign, setLoadingCampaign] = useState(false);
  const [dispatchingBatch, setDispatchingBatch] = useState(false);
  
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
    const allowedRoles = ["ceo", "superadmin", "admin"];
    if (error || !profile || !allowedRoles.includes(roleNormalized)) {
      router.push("/");
      return;
    }

    fetchSettings();
    fetchInquiries();
    fetchCampaignStatus();
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
      if (data.inquiries) {
        setAllRecords(data.inquiries);
      }
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const fetchCampaignStatus = async () => {
    setLoadingCampaign(true);
    try {
      const res = await fetch("/api/admin/company-outreach");
      const data = await res.json();
      if (data.success) {
        setCampaignStats(data.stats);
        setNextBatch(data.nextBatch || []);
      }
    } catch (e) {
      console.error("Failed to fetch campaign status:", e);
    } finally {
      setLoadingCampaign(false);
    }
  };

  const handleDispatchBatch = async () => {
    if (!confirm("Confirm Dispatch:\n\nSend studio notifications to the next 15 companies?\n\nEach studio will receive an invite to claim their studio profile and edit jobs.")) {
      return;
    }

    setDispatchingBatch(true);
    try {
      const res = await fetch("/api/admin/company-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 15 }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`🎉 ${data.message}`);
        fetchCampaignStatus();
        fetchInquiries();
        setActiveTab("sent");
      } else {
        alert(data.error || "Failed to dispatch batch.");
      }
    } catch (e: any) {
      alert(e.message || "Network error dispatching batch.");
    } finally {
      setDispatchingBatch(false);
    }
  };

  const toggleReadStatus = async (id: string, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_read: !currentStatus })
      });
      if (res.ok) {
        setAllRecords(prev => prev.map(inq => inq.id === id ? { ...inq, is_read: !currentStatus } : inq));
        if (selectedItem?.id === id) {
          setSelectedItem({ ...selectedItem, is_read: !currentStatus });
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteInquiry = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAllRecords(prev => prev.filter(inq => inq.id !== id));
        if (selectedItem?.id === id) setSelectedItem(null);
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
        alert(data.error || "Failed to send email.");
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
    setComposeBody(`\n\n--- Original Message ---\nFrom: ${inq.name} <${inq.email}>\nDate: ${new Date(inq.created_at).toLocaleString("en-IN")}\nMessage: ${inq.message}`);
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

  // Split records into Inbox (incoming) vs Sent (outgoing/audit)
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

  const inboxRecords = allRecords.filter(r => !isSentRecord(r));
  const sentRecords = allRecords.filter(isSentRecord);
  const unreadInboxCount = inboxRecords.filter(i => !i.is_read).length;

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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.subject || "").toLowerCase().includes(q) ||
        (item.message || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) return <div className="p-10 text-center font-bold">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <Navbar />

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <AdminQuickMenu />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Mail & Contact Center
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Visitor inquiries, company outreach emails, and site contact channels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCompose(true)}
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={15} />
              <span>Compose Email</span>
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="bg-white text-gray-700 px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition font-medium text-xs cursor-pointer"
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {/* TABS HEADER */}
        <div className="flex items-center gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
          
          <button
            onClick={() => setActiveTab("inbox")}
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "inbox" 
                ? "border-black text-black" 
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <Inbox size={16} />
            <span>Inbox</span>
            {unreadInboxCount > 0 && (
              <span className="bg-black text-white text-[11px] px-2 py-0.2 rounded-full font-black animate-pulse">
                {unreadInboxCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("sent")}
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "sent" 
                ? "border-black text-black" 
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <Send size={16} />
            <span>Sent Mails</span>
            <span className="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.2 rounded-full font-bold">
              {sentRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("campaign")}
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "campaign" 
                ? "border-black text-black" 
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <Building2 size={16} />
            <span>Company Outreach (10-15/day)</span>
            {campaignStats && (
              <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2 py-0.2 rounded-full font-bold">
                {campaignStats.alreadyNotifiedCount} / {campaignStats.totalWithValidEmail}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "settings" 
                ? "border-black text-black" 
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <Settings size={16} />
            <span>Contact Settings</span>
          </button>
        </div>

        {/* SEARCH & FILTERS TOOLBAR */}
        {activeTab !== "settings" && activeTab !== "campaign" && (
          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab === "inbox" ? "inbox" : "sent mails"} by name, email, or message...`}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeTab === "inbox" && (
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-bold">
                  <button
                    onClick={() => setFilterStatus("all")}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      filterStatus === "all" ? "bg-white text-black shadow-xs" : "text-gray-500"
                    }`}
                  >
                    All ({inboxRecords.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus("unread")}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      filterStatus === "unread" ? "bg-white text-black shadow-xs" : "text-gray-500"
                    }`}
                  >
                    Unread ({unreadInboxCount})
                  </button>
                  <button
                    onClick={() => setFilterStatus("read")}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      filterStatus === "read" ? "bg-white text-black shadow-xs" : "text-gray-500"
                    }`}
                  >
                    Read
                  </button>
                </div>
              )}

              <button
                onClick={fetchInquiries}
                disabled={loadingInquiries}
                className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition cursor-pointer"
                title="Refresh"
              >
                <RefreshCw size={14} className={loadingInquiries ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: INBOX (SIMPLE COMPACT ROWS - CLICK TO VIEW FULL) */}
        {activeTab === "inbox" && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            {filteredInbox.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Inbox size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="font-bold text-gray-700 text-sm">Inbox is Empty</p>
                <p className="text-xs text-gray-400 mt-1">Visitor submissions via the /contact page appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredInbox.map(inq => {
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
                      className={`flex items-center justify-between p-3.5 sm:px-5 hover:bg-gray-50 transition cursor-pointer gap-3 ${
                        inq.is_read ? "bg-white text-gray-600" : "bg-blue-50/40 text-gray-900 font-semibold"
                      }`}
                    >
                      {/* LEFT: SENDER & STATUS */}
                      <div className="flex items-center gap-3 min-w-0 sm:w-1/3">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          inq.is_read ? "bg-gray-300" : "bg-blue-600 animate-pulse"
                        }`}></span>
                        <div className="truncate">
                          <span className="font-extrabold text-sm text-gray-900 block truncate">{inq.name}</span>
                          <span className="text-xs text-gray-400 font-normal truncate block">{inq.email}</span>
                        </div>
                      </div>

                      {/* MIDDLE: SUBJECT & SNIPPET */}
                      <div className="flex-1 min-w-0 hidden sm:block">
                        <span className="text-xs font-bold text-gray-800 mr-2 shrink-0">
                          {inq.subject || "General Inquiry"}
                        </span>
                        <span className="text-xs text-gray-500 font-normal truncate">
                          — {inq.message?.replace(/[\r\n]+/g, " ").slice(0, 80)}...
                        </span>
                      </div>

                      {/* RIGHT: DATE & CHEVRON */}
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <span className="text-xs text-gray-400 whitespace-nowrap">{dateStr}</span>
                        <ChevronRight size={14} className="text-gray-300" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SENT MAILS (SIMPLE COMPACT ROWS - CLICK TO VIEW FULL) */}
        {activeTab === "sent" && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            {filteredSent.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Send size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="font-bold text-gray-700 text-sm">No Sent Mails Found</p>
                <p className="text-xs text-gray-400 mt-1">Outgoing studio outreach emails and verifications will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredSent.map(item => {
                  const dateStr = new Date(item.created_at).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const isCompany = item.subject === "NOTIFIED_COMPANY_JOB_POSTING" || item.subject === "COMPANY_JOB_EMAIL_SENT" || item.message.toLowerCase().includes("studio");
                  const isVerification = item.message.toLowerCase().includes("verification") || item.message.toLowerCase().includes("verified");
                  const isDirect = item.subject.startsWith("ADMIN_DIRECT_MAIL");

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="flex items-center justify-between p-3.5 sm:px-5 hover:bg-gray-50 transition cursor-pointer gap-3"
                    >
                      {/* LEFT: RECIPIENT */}
                      <div className="flex items-center gap-3 min-w-0 sm:w-1/3">
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-sm text-gray-900 block truncate">{item.name || "Recipient"}</span>
                          <span className="text-xs text-gray-400 font-mono truncate block">{item.email}</span>
                        </div>
                      </div>

                      {/* MIDDLE: BADGE & SNIPPET */}
                      <div className="flex-1 min-w-0 hidden sm:flex items-center gap-2">
                        {isCompany && (
                          <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full shrink-0">
                            Studio Outreach
                          </span>
                        )}
                        {isVerification && (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                            Verification
                          </span>
                        )}
                        {isDirect && (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                            Direct Email
                          </span>
                        )}

                        <span className="text-xs text-gray-500 truncate font-normal">
                          {item.message?.replace(/[\r\n]+/g, " ").slice(0, 75)}...
                        </span>
                      </div>

                      {/* RIGHT: TIMESTAMP */}
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <span className="text-xs text-gray-400 whitespace-nowrap">{dateStr}</span>
                        <ChevronRight size={14} className="text-gray-300" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMPANY OUTREACH CAMPAIGN (10-15/DAY PLANNED SCHEDULE) */}
        {activeTab === "campaign" && (
          <div className="space-y-6">
            
            {/* STATS BANNER */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5 mb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-1">
                    <Flame size={13} className="text-emerald-600" />
                    <span>Outreach Campaign Plan (10-15 / day)</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Notifying Hiring Studios with Published Jobs
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Invites studios to claim their profile, edit job openings, and add studio details.
                  </p>
                </div>

                <button
                  onClick={handleDispatchBatch}
                  disabled={dispatchingBatch || (campaignStats?.pendingCount || 0) === 0}
                  className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
                >
                  {dispatchingBatch ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Dispatching 15 Studios...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>🚀 Dispatch Today's Batch (Next 15 Studios)</span>
                    </>
                  )}
                </button>
              </div>

              {/* PROGRESS COUNTERS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-2xl font-black text-gray-900">{campaignStats?.totalWithValidEmail || 86}</div>
                  <div className="text-xs text-gray-500 font-medium mt-1">Total Studios with Jobs</div>
                </div>

                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100">
                  <div className="text-2xl font-black text-emerald-800">{campaignStats?.alreadyNotifiedCount || 0}</div>
                  <div className="text-xs text-emerald-700 font-medium mt-1">Notified So Far</div>
                </div>

                <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-100">
                  <div className="text-2xl font-black text-amber-800">{campaignStats?.pendingCount || 86}</div>
                  <div className="text-xs text-amber-700 font-medium mt-1">Pending In Queue</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-2xl font-black text-gray-900">{campaignStats?.estimatedDaysRemaining || 6} Days</div>
                  <div className="text-xs text-gray-500 font-medium mt-1">Pacing (15 / day)</div>
                </div>
              </div>
            </div>

            {/* NEXT 15 STUDIOS IN QUEUE */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-base font-extrabold text-gray-900 mb-1">
                Next Batch Preview (15 Studios Ready for Outreach)
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                These studios have active jobs and will receive their multi-job card + claim invitation in today's run.
              </p>

              {nextBatch.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  {loadingCampaign ? "Loading queue..." : "🎉 All studios have been notified!"}
                </div>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {nextBatch.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-gray-50 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-gray-400 w-5">{idx + 1}.</span>
                        <div>
                          <span className="font-extrabold text-gray-900">{item.firmName}</span>
                          <span className="text-gray-400 font-mono ml-2">&lt;{item.email}&gt;</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full font-bold">
                          {item.jobCount} Active Job{item.jobCount > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: SITE SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* DIRECT CONTACT */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-gray-900 border-b pb-2">Direct Contact Details</h3>
                <LockedField label="Contact Email" type="email" fieldKey="email" value={settings.email} onChange={(val: string) => setSettings({...settings, email: val})} />
                <LockedField label="Contact Phone" type="text" fieldKey="phone" value={settings.phone} onChange={(val: string) => setSettings({...settings, phone: val})} />
                <LockedField label="Direct WhatsApp Number" type="text" fieldKey="whatsapp" value={settings.whatsapp} onChange={(val: string) => setSettings({...settings, whatsapp: val})} />
                <LockedField label="Contact Address" isTextarea={true} fieldKey="contact_address" value={settings.contact_address} onChange={(val: string) => setSettings({...settings, contact_address: val})} />
              </div>

              {/* SOCIAL / PUBLIC CHANNELS */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-extrabold text-base text-gray-900">Social Channels</h3>
                  <Link href="/admin/social-config" className="text-xs text-blue-600 hover:underline font-bold">
                    Configure
                  </Link>
                </div>
                <LockedField label="WhatsApp Channel URL" type="url" fieldKey="whatsapp_channel_url" value={settings.whatsapp_channel_url} onChange={(val: string) => setSettings({...settings, whatsapp_channel_url: val})} />
                <LockedField label="Facebook URL" type="url" fieldKey="facebook" value={settings.facebook} onChange={(val: string) => setSettings({...settings, facebook: val})} />
                <LockedField label="Twitter / X URL" type="url" fieldKey="twitter" value={settings.twitter} onChange={(val: string) => setSettings({...settings, twitter: val})} />
                <LockedField label="Instagram URL" type="url" fieldKey="instagram" value={settings.instagram} onChange={(val: string) => setSettings({...settings, instagram: val})} />
                <LockedField label="LinkedIn URL" type="url" fieldKey="linkedin" value={settings.linkedin} onChange={(val: string) => setSettings({...settings, linkedin: val})} />
              </div>
            </div>

            {/* LOGO */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
              <h3 className="font-extrabold text-base text-gray-900 border-b pb-2 mb-4">Site Logo</h3>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 overflow-hidden relative group">
                  {settings.logo_url ? (
                    <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-gray-400">No Logo</span>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition shadow-xs">
                    <UploadCloud size={16} />
                    <span>{uploadingLogo ? "Uploading..." : "Upload Logo"}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
                  </label>
                  <p className="text-xs text-gray-400">Max size 2MB. Recommended: PNG or SVG.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* DETAILED MESSAGE READING MODAL (CLICKED FROM INBOX OR SENT) */}
      {selectedItem && (
        <div 
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150"
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
                <button
                  onClick={() => {
                    handleOpenReply(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Mail size={14} />
                  <span>Reply via Email</span>
                </button>

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

      {/* GMAIL-STYLE COMPOSE MODAL */}
      {showCompose && (
        <div className="fixed inset-0 z-[130] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={16} />
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
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Recipient Name / Studio</label>
                  <input
                    type="text"
                    value={composeName}
                    onChange={e => setComposeName(e.target.value)}
                    placeholder="e.g. Sanjay Puri Architects"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black"
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
                  placeholder="e.g. Your jobs on Trapped Into Architecture"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Message Body *</label>
                <textarea
                  required
                  rows={6}
                  value={composeBody}
                  onChange={e => setComposeBody(e.target.value)}
                  placeholder="Write message here..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-[11px] text-gray-400">
                  Dispatched via Resend & logged in Sent Mails
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

      <Footer />
    </main>
  );
}
