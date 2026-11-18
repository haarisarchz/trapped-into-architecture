"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import {
  Mail,
  Send,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Building2,
  ShieldCheck,
  X,
  Sparkles,
  AlertCircle,
  MessageSquare,
  MessageCircle,
  Check,
  Phone,
} from "lucide-react";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trappedintoarchitecture.com";

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface WhatsAppStudio {
  id: string;
  firmName: string;
  rawPhone: string;
  fullPhone: string;
  slug: string;
  claimUrl: string;
  city?: string | null;
  state?: string | null;
  logoUrl?: string | null;
  inviteText: string;
  waUrl: string;
}

interface DispatchedRecord {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

function parseOutreachDetails(item: ContactInquiry) {
  const msg = item.message || "";
  let jobs: string[] = [];

  const jobsMatch = msg.match(/jobs?:\s*([^\.\n]+)/i);
  if (jobsMatch && jobsMatch[1]) {
    jobs = jobsMatch[1].split(",").map((s: string) => s.trim()).filter(Boolean);
  }

  if (jobs.length === 0) {
    const jobMatch2 = msg.match(/job\s*"([^"]+)"/i);
    if (jobMatch2 && jobMatch2[1]) {
      jobs = [jobMatch2[1].trim()];
    }
  }

  if (jobs.length === 0) {
    jobs = ["Architecture Role"];
  }

  const claimUrlMatch = msg.match(/Claim link:\s*(https?:\/\/[^\s]+)/i);
  let claimUrl = claimUrlMatch ? claimUrlMatch[1] : "";
  if (!claimUrl) {
    const slug = (item.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    claimUrl = slug ? `/companies/${slug}?claim=true` : `/companies?claim=true`;
  }

  return {
    jobs,
    claimUrl,
  };
}

function AdminMailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Channel switcher: "email" | "whatsapp"
  const channelParam = searchParams.get("channel");
  const [channelMode, setChannelMode] = useState<"email" | "whatsapp">(
    channelParam === "whatsapp" ? "whatsapp" : "email"
  );

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sync if URL query param changes
  useEffect(() => {
    if (channelParam === "whatsapp" && channelMode !== "whatsapp") {
      setChannelMode("whatsapp");
    } else if (!channelParam && channelMode !== "email") {
      // keep local state
    }
  }, [channelParam]);

  const switchChannel = (mode: "email" | "whatsapp") => {
    setChannelMode(mode);
    if (mode === "whatsapp") {
      router.replace("/admin/mails?channel=whatsapp", { scroll: false });
    } else {
      router.replace("/admin/mails", { scroll: false });
    }
  };

  // ===================== EMAIL CENTER STATE =====================
  const [emailTab, setEmailTab] = useState<"sent" | "campaign" | "inbox">("sent");
  const [sentFilter, setSentFilter] = useState<"all" | "outreach" | "verification" | "direct">("all");
  const [emailSearchQuery, setEmailSearchQuery] = useState("");
  const [allRecords, setAllRecords] = useState<ContactInquiry[]>([]);
  const [selectedEmailItem, setSelectedEmailItem] = useState<ContactInquiry | null>(null);
  const [modalViewMode, setModalViewMode] = useState<"recipient" | "log">("recipient");

  // Email Compose Modal State
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeName, setComposeName] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Email Campaign State
  const [campaignStats, setCampaignStats] = useState<any>(null);
  const [campaignNextBatch, setCampaignNextBatch] = useState<any[]>([]);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [dispatchingBatch, setDispatchingBatch] = useState(false);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);

  // ===================== WHATSAPP CENTER STATE =====================
  const [waTab, setWaTab] = useState<"queue" | "dispatched" | "verifications">("queue");
  const [waStats, setWaStats] = useState<any>(null);
  const [waNextBatch, setWaNextBatch] = useState<WhatsAppStudio[]>([]);
  const [waDispatchedHistory, setWaDispatchedHistory] = useState<DispatchedRecord[]>([]);
  const [phoneVerifications, setPhoneVerifications] = useState<any[]>([]);
  const [waSearchQuery, setWaSearchQuery] = useState("");

  // Stepper Modal State for WhatsApp Rapid Batch
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waCurrentIndex, setWaCurrentIndex] = useState(0);
  const [waDispatchedIds, setWaDispatchedIds] = useState<string[]>([]);
  const [selectedWaDispatchedIds, setSelectedWaDispatchedIds] = useState<string[]>([]);

  // Initial Auth & Load
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
    setCurrentUser(user);

    loadEmailData();
    loadCampaignData();
    loadWhatsAppQueue();
    loadWhatsAppDispatchedLogs();
    loadPhoneVerifications();
  }, [router]);

  // Loaders
  const loadEmailData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllRecords(data || []);
    } catch (err: any) {
      console.error("Error loading mail records:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCampaignData = async () => {
    setCampaignLoading(true);
    try {
      const res = await fetch("/api/admin/company-outreach");
      const data = await res.json();
      if (data.success) {
        setCampaignStats(data.stats);
        setCampaignNextBatch(data.nextBatch || []);
      }
    } catch (err: any) {
      console.error("Error loading email campaign:", err);
    } finally {
      setCampaignLoading(false);
    }
  };

  const loadWhatsAppQueue = async () => {
    try {
      const res = await fetch("/api/admin/whatsapp-outreach");
      const data = await res.json();
      if (data.success) {
        setWaStats(data.stats);
        setWaNextBatch(data.nextBatch || []);
      }
    } catch (err) {
      console.error("Error loading WhatsApp queue:", err);
    }
  };

  const loadWhatsAppDispatchedLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_inquiries")
        .select("*")
        .eq("subject", "WHATSAPP_STUDIO_INVITE_SENT")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWaDispatchedHistory(data || []);
    } catch (err) {
      console.error("Error loading WhatsApp dispatched logs:", err);
    }
  };

  const loadPhoneVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, email, phone, phone_verified, is_phone_verified, updated_at")
        .or("phone_verified.eq.true,is_phone_verified.eq.true")
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setPhoneVerifications(data || []);
    } catch (err) {
      console.error("Error loading phone verifications:", err);
    }
  };

  const refreshCurrentView = () => {
    if (channelMode === "email") {
      loadEmailData();
      loadCampaignData();
    } else {
      loadWhatsAppQueue();
      loadWhatsAppDispatchedLogs();
      loadPhoneVerifications();
    }
  };

  // ===================== EMAIL HANDLERS =====================
  const handleDispatchEmailBatch = async (dryRun: boolean = false) => {
    setDispatchingBatch(true);
    setBatchSuccessMessage(null);
    try {
      const res = await fetch("/api/admin/company-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 15, dryRun }),
      });
      const result = await res.json();
      if (result.success) {
        setBatchSuccessMessage(
          dryRun
            ? `Simulation complete: ${result.sent} emails would be sent.`
            : `Success! Dispatched outreach emails to ${result.sent} companies (${result.totalPendingRemaining} remaining in queue).`
        );
        loadCampaignData();
        loadEmailData();
      } else {
        alert("Batch dispatch error: " + (result.error || "Unknown"));
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    } finally {
      setDispatchingBatch(false);
    }
  };

  const handleSendComposeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject || !composeBody) {
      alert("Please fill in recipient, subject and message body.");
      return;
    }
    setSendingEmail(true);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeTo,
          name: composeName || composeTo.split("@")[0],
          subject: composeSubject,
          message: composeBody,
          recipientType: "direct",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Email sent successfully!");
        setShowCompose(false);
        setComposeTo("");
        setComposeName("");
        setComposeSubject("");
        setComposeBody("");
        loadEmailData();
      } else {
        alert("Failed to send: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    } finally {
      setSendingEmail(false);
    }
  };

  const deleteEmailRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this mail log?")) return;
    try {
      const { error } = await supabase.from("contact_inquiries").delete().eq("id", id);
      if (error) throw error;
      setAllRecords((prev) => prev.filter((r) => r.id !== id));
      if (selectedEmailItem?.id === id) setSelectedEmailItem(null);
    } catch (err: any) {
      alert("Error deleting record: " + err.message);
    }
  };

  // Email filtering
  const sentMails = allRecords.filter((item) => {
    const s = (item.subject || "").toUpperCase();
    return (
      s === "NOTIFIED_COMPANY_JOB_POSTING" ||
      s === "COMPANY_JOB_EMAIL_SENT" ||
      s === "USER_VERIFICATION_SENT" ||
      s === "ADMIN_DIRECT" ||
      s.startsWith("[LIVE ON TI2A]") ||
      s.startsWith("[TI2A ALERT]") ||
      (item.message || "").toLowerCase().includes("dispatched email")
    );
  });

  const inboundAlerts = allRecords.filter((item) => {
    const s = (item.subject || "").toUpperCase();
    return s === "COMPANY_JOB_EMAIL_PENDING" || s === "NEW_USER_REGISTERED";
  });

  const filteredSentMails = sentMails.filter((item) => {
    const s = (item.subject || "").toUpperCase();
    const isOutreach =
      s === "NOTIFIED_COMPANY_JOB_POSTING" ||
      s === "COMPANY_JOB_EMAIL_SENT" ||
      s.startsWith("[LIVE ON TI2A]");
    const isVerification = s === "USER_VERIFICATION_SENT";
    const isDirect = s === "ADMIN_DIRECT";

    if (sentFilter === "outreach" && !isOutreach) return false;
    if (sentFilter === "verification" && !isVerification) return false;
    if (sentFilter === "direct" && !isDirect) return false;

    if (emailSearchQuery.trim()) {
      const q = emailSearchQuery.toLowerCase();
      const matchName = (item.name || "").toLowerCase().includes(q);
      const matchEmail = (item.email || "").toLowerCase().includes(q);
      const matchMsg = (item.message || "").toLowerCase().includes(q);
      const matchSubj = (item.subject || "").toLowerCase().includes(q);
      return matchName || matchEmail || matchMsg || matchSubj;
    }
    return true;
  });

  // ===================== WHATSAPP HANDLERS =====================
  const handleSendSingleWhatsApp = async (studio: WhatsAppStudio) => {
    window.open(studio.waUrl, "_blank");
    try {
      await fetch("/api/admin/whatsapp-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: studio.id,
          firmName: studio.firmName,
          phone: studio.fullPhone,
          slug: studio.slug,
        }),
      });
      setWaDispatchedIds((prev) => [...prev, studio.id]);
      loadWhatsAppQueue();
      loadWhatsAppDispatchedLogs();
    } catch (e) {
      console.warn("Could not log WhatsApp dispatch:", e);
    }
  };

  // Helper to construct WhatsApp Web invitation URL for a studio record
  const getWaUrlFromDispatchedItem = (item: DispatchedRecord) => {
    const raw = (item.email || "").replace("@whatsapp", "").replace(/\D/g, "");
    const cleanPhone = raw.length === 10 ? `91${raw}` : raw;
    const firmSlug = (item.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const claimUrl = `${siteUrl}/companies/${firmSlug}`;
    const inviteText = `Hello ${item.name} Team! 👋\n\nYour studio directory listing is live on Trapped Into Architecture (Ti2A):\n👉 ${claimUrl}\n\nYou can claim your studio profile for free to publish vacancies, showcase your latest architectural projects, and hire verified architects directly.\n\nClaim your studio profile here:\n👉 ${claimUrl}\n\nWarm regards,\nTrapped Into Architecture Team`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(inviteText)}`;
  };

  const handleManualDispatchWhatsApp = (item: DispatchedRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const waUrl = getWaUrlFromDispatchedItem(item);
    window.open(waUrl, "_blank");
  };

  const handleMoveBackToQueue = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const { error } = await supabase.from("contact_inquiries").delete().eq("id", id);
      if (error) throw error;
      setWaDispatchedHistory((prev) => prev.filter((r) => r.id !== id));
      setSelectedWaDispatchedIds((prev) => prev.filter((item) => item !== id));
      loadWhatsAppQueue();
      loadWhatsAppDispatchedLogs();
    } catch (err: any) {
      alert("Error moving record back to queue: " + err.message);
    }
  };

  const handleBatchManualDispatch = () => {
    if (selectedWaDispatchedIds.length === 0) return;
    const selectedItems = waDispatchedHistory.filter((i) => selectedWaDispatchedIds.includes(i.id));
    selectedItems.forEach((item, idx) => {
      setTimeout(() => {
        const url = getWaUrlFromDispatchedItem(item);
        window.open(url, "_blank");
      }, idx * 300);
    });
  };

  const handleBatchMoveBackToQueue = async () => {
    if (selectedWaDispatchedIds.length === 0) return;
    if (!confirm(`Move ${selectedWaDispatchedIds.length} studio(s) back to the pending WhatsApp queue?`)) return;
    try {
      const { error } = await supabase
        .from("contact_inquiries")
        .delete()
        .in("id", selectedWaDispatchedIds);
      if (error) throw error;
      setWaDispatchedHistory((prev) => prev.filter((r) => !selectedWaDispatchedIds.includes(r.id)));
      setSelectedWaDispatchedIds([]);
      loadWhatsAppQueue();
      loadWhatsAppDispatchedLogs();
    } catch (err: any) {
      alert("Error moving back to queue: " + err.message);
    }
  };

  const handleBatchDeleteWaLogs = async () => {
    if (selectedWaDispatchedIds.length === 0) return;
    if (!confirm(`Permanently delete ${selectedWaDispatchedIds.length} dispatch logs?`)) return;
    try {
      const { error } = await supabase
        .from("contact_inquiries")
        .delete()
        .in("id", selectedWaDispatchedIds);
      if (error) throw error;
      setWaDispatchedHistory((prev) => prev.filter((r) => !selectedWaDispatchedIds.includes(r.id)));
      setSelectedWaDispatchedIds([]);
      loadWhatsAppQueue();
      loadWhatsAppDispatchedLogs();
    } catch (err: any) {
      alert("Error deleting logs: " + err.message);
    }
  };

  const deleteWaDispatchedLog = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this dispatch log?")) return;
    try {
      await supabase.from("contact_inquiries").delete().eq("id", id);
      setWaDispatchedHistory((prev) => prev.filter((r) => r.id !== id));
      setSelectedWaDispatchedIds((prev) => prev.filter((item) => item !== id));
      loadWhatsAppQueue();
      loadWhatsAppDispatchedLogs();
    } catch (err) {
      alert("Error deleting record");
    }
  };

  const filteredWaDispatched = waDispatchedHistory.filter((item) => {
    if (!waSearchQuery.trim()) return true;
    const q = waSearchQuery.toLowerCase();
    return (
      (item.name || "").toLowerCase().includes(q) ||
      (item.email || "").toLowerCase().includes(q) ||
      (item.message || "").toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col text-black">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 md:py-10">
        {/* TOP LEVEL CHANNEL SWITCHER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <AdminQuickMenu />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center bg-gray-200/90 p-1 rounded-2xl border border-gray-300/80 shadow-2xs">
                  <button
                    onClick={() => switchChannel("email")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      channelMode === "email"
                        ? "bg-black text-white shadow-xs"
                        : "text-gray-700 hover:text-black hover:bg-gray-100"
                    }`}
                  >
                    <Mail size={14} />
                    <span>Email Center</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        channelMode === "email"
                          ? "bg-white/20 text-white"
                          : "bg-gray-300 text-gray-800"
                      }`}
                    >
                      {sentMails.length}
                    </span>
                  </button>

                  <button
                    onClick={() => switchChannel("whatsapp")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      channelMode === "whatsapp"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-gray-700 hover:text-black hover:bg-gray-100"
                    }`}
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp Center</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        channelMode === "whatsapp"
                          ? "bg-white/20 text-white"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {waStats?.pendingCount ?? 0} ready
                    </span>
                  </button>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <span>{channelMode === "email" ? "Mail Outreach Center" : "WhatsApp Outreach Center"}</span>
                {channelMode === "email" ? (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Verified Domain
                  </span>
                ) : (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>100% Free Mode</span>
                  </span>
                )}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {channelMode === "email"
                  ? "Multi-channel studio outreach & candidate alerts routed via Resend verified domain."
                  : "Rapid 1-click WhatsApp studio claim outreach, batch dispatcher & candidate phone verifications."}
              </p>
            </div>
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2.5">
            {channelMode === "email" && (
              <button
                onClick={() => setShowCompose(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Send size={13} />
                <span>+ Compose Email</span>
              </button>
            )}

            {channelMode === "whatsapp" && (
              <button
                disabled={loading || (waStats?.pendingCount || 0) === 0 || waNextBatch.length === 0}
                onClick={() => {
                  setWaCurrentIndex(0);
                  setWaModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <MessageCircle size={14} />
                <span>Start Rapid Batch Dispatch ({waNextBatch.length})</span>
              </button>
            )}

            <Link
              href="/admin/contact"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition shadow-2xs"
            >
              <MessageSquare size={13} />
              <span>Contact &amp; Suggestions →</span>
            </Link>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ===================== VIEW 1: EMAIL CENTER =================== */}
        {/* ============================================================== */}
        {channelMode === "email" && (
          <>
            {/* EMAIL TABS */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3 mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEmailTab("sent")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    emailTab === "sent"
                      ? "bg-black text-white shadow-xs"
                      : "bg-white text-gray-600 hover:text-black border border-gray-200"
                  }`}
                >
                  <Send size={13} />
                  <span>Sent Mails</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      emailTab === "sent" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {sentMails.length}
                  </span>
                </button>

                <button
                  onClick={() => setEmailTab("campaign")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    emailTab === "campaign"
                      ? "bg-black text-white shadow-xs"
                      : "bg-white text-gray-600 hover:text-black border border-gray-200"
                  }`}
                >
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Outreach Campaign (10-15/day)</span>
                  {campaignStats && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        emailTab === "campaign"
                          ? "bg-white/20 text-white"
                          : "bg-amber-100 text-amber-800 font-bold"
                      }`}
                    >
                      {campaignStats.pendingCount} queued
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setEmailTab("inbox")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    emailTab === "inbox"
                      ? "bg-black text-white shadow-xs"
                      : "bg-white text-gray-600 hover:text-black border border-gray-200"
                  }`}
                >
                  <Mail size={13} />
                  <span>System &amp; Inbound Alerts</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      emailTab === "inbox" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {inboundAlerts.length}
                  </span>
                </button>
              </div>

              <button
                onClick={refreshCurrentView}
                className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-500 hover:text-black transition cursor-pointer"
                title="Refresh"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            {/* TAB: SENT MAILS */}
            {emailTab === "sent" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={emailSearchQuery}
                      onChange={(e) => setEmailSearchQuery(e.target.value)}
                      placeholder="Search sent emails..."
                      className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition shadow-2xs"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {(["all", "outreach", "verification", "direct"] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSentFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer whitespace-nowrap ${
                          sentFilter === cat
                            ? "bg-black text-white shadow-2xs"
                            : "bg-white text-gray-600 hover:text-black border border-gray-200"
                        }`}
                      >
                        {cat === "all"
                          ? `All Sent (${sentMails.length})`
                          : cat === "outreach"
                          ? "Studio Outreach"
                          : cat === "verification"
                          ? "User Verification"
                          : "Admin Direct"}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredSentMails.length === 0 ? (
                  <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl text-xs text-gray-400">
                    No sent emails found matching your filters.
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs divide-y divide-gray-100">
                    {filteredSentMails.map((item) => {
                      const isOutreach =
                        item.subject === "NOTIFIED_COMPANY_JOB_POSTING" ||
                        item.subject === "COMPANY_JOB_EMAIL_SENT" ||
                        (item.subject || "").startsWith("[Live on Ti2A]");
                      const isVerif = item.subject === "USER_VERIFICATION_SENT";
                      const isDirect = item.subject === "ADMIN_DIRECT";

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedEmailItem(item)}
                          className="px-4 py-3 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-[200px] max-w-[240px] shrink-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                            <div className="truncate">
                              <span className="font-extrabold text-gray-900 block truncate">{item.name}</span>
                              <span className="text-[11px] text-gray-400 block truncate font-mono">
                                {item.email}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <span
                              className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isOutreach
                                  ? "bg-purple-100 text-purple-800"
                                  : isVerif
                                  ? "bg-blue-100 text-blue-800"
                                  : isDirect
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {isOutreach
                                ? "Studio Outreach"
                                : isVerif
                                ? "User Verification"
                                : isDirect
                                ? "Admin Direct"
                                : item.subject}
                            </span>
                            <span className="truncate text-gray-600 text-[11px] font-medium">
                              {item.message}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[11px] text-gray-400 whitespace-nowrap">
                              {new Date(item.created_at).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <button
                              onClick={(e) => deleteEmailRecord(item.id, e)}
                              className="p-1 text-gray-400 hover:text-red-600 transition cursor-pointer"
                              title="Delete log"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: OUTREACH CAMPAIGN */}
            {emailTab === "campaign" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Total Practices in Ti2A
                    </span>
                    <span className="text-2xl font-black text-gray-900 mt-1 block">
                      {campaignStats?.totalCompanies ?? "..."}
                    </span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">
                      Already Contacted
                    </span>
                    <span className="text-2xl font-black text-purple-700 mt-1 block">
                      {campaignStats?.alreadyNotifiedCount ?? "..."}
                    </span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
                      Pending in Queue
                    </span>
                    <span className="text-2xl font-black text-amber-700 mt-1 block">
                      {campaignStats?.pendingCount ?? "..."}
                    </span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                      Next Batch Ready
                    </span>
                    <span className="text-2xl font-black text-emerald-700 mt-1 block">
                      {campaignStats?.batchSize ?? "..."}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-black rounded-3xl p-6 sm:p-7 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-md">
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 block">
                      Automated Campaign Throttle (10–15 Practice Invites/Day)
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      Next Daily Batch Ready: {campaignNextBatch.length} Practices
                    </h3>
                    <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
                      Sends personalized claim invitations containing live job vacancy cards to practice founders &amp; HR leads. Protects domain reputation with safe daily volume.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      disabled={dispatchingBatch || campaignLoading || campaignNextBatch.length === 0}
                      onClick={() => handleDispatchEmailBatch(true)}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition border border-white/20 cursor-pointer disabled:opacity-50"
                    >
                      Simulate (Dry Run)
                    </button>
                    <button
                      disabled={dispatchingBatch || campaignLoading || campaignNextBatch.length === 0}
                      onClick={() => handleDispatchEmailBatch(false)}
                      className="px-5 py-2.5 bg-white hover:bg-gray-100 text-black font-extrabold rounded-xl text-xs transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {dispatchingBatch ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          <span>Dispatch Next 15 Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {batchSuccessMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{batchSuccessMessage}</span>
                  </div>
                )}

                {/* BATCH TABLE */}
                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-2xs">
                  <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900">
                        Next {campaignNextBatch.length} Architecture Practices in Queue
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        These studios have active jobs and will receive their custom invitation link.
                      </p>
                    </div>
                    <button
                      onClick={loadCampaignData}
                      className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition cursor-pointer"
                      title="Refresh Batch"
                    >
                      <RefreshCw size={13} className={campaignLoading ? "animate-spin" : ""} />
                    </button>
                  </div>

                  {campaignLoading ? (
                    <div className="p-12 text-center text-xs text-gray-400">Loading batch details...</div>
                  ) : campaignNextBatch.length === 0 ? (
                    <div className="p-12 text-center text-xs text-gray-500">
                      🎉 All eligible practices have already received outreach notifications! No pending studios in queue.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {campaignNextBatch.map((item, idx) => (
                        <div
                          key={item.id || item.slug || `${item.firmName}-${idx}`}
                          className="px-4 py-3.5 hover:bg-slate-50 transition flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-[220px] max-w-[260px] shrink-0">
                            <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-[11px] shrink-0">
                              {idx + 1}
                            </span>
                            <div className="truncate">
                              <span className="font-extrabold text-gray-900 block truncate">{item.firmName}</span>
                              <span className="text-[11px] text-gray-400 font-mono block truncate">
                                {item.targetEmail || item.email || "No email"}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                              {item.jobCount} Active Job{item.jobCount !== 1 ? "s" : ""}
                            </span>
                            <span className="truncate text-gray-500 text-[11px]">
                              {Array.isArray(item.jobs)
                                ? item.jobs.map((j: any) => j.position || j).join(", ")
                                : Array.isArray(item.positions)
                                ? item.positions.join(", ")
                                : "Active vacancies"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={item.claimUrl || `/companies/${item.slug || ""}?claim=true`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 hover:text-black hover:underline"
                            >
                              <span>Preview Claim</span>
                              <ExternalLink size={11} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: SYSTEM & INBOUND ALERTS */}
            {emailTab === "inbox" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-gray-900">System &amp; Inbound Notifications</h4>
                  <span className="text-xs text-gray-500 font-semibold">{inboundAlerts.length} Total Alerts</span>
                </div>

                {inboundAlerts.length === 0 ? (
                  <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl text-xs text-gray-400">
                    No system alerts found.
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs divide-y divide-gray-100">
                    {inboundAlerts.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedEmailItem(item)}
                        className="px-4 py-3.5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-[220px] max-w-[260px] shrink-0">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                          <div className="truncate">
                            <span className="font-extrabold text-gray-900 block truncate">{item.name}</span>
                            <span className="text-[11px] text-gray-400 block truncate font-mono">
                              {item.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            {item.subject}
                          </span>
                          <span className="truncate text-gray-600 text-[11px]">{item.message}</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] text-gray-400 whitespace-nowrap">
                            {new Date(item.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <button
                            onClick={(e) => deleteEmailRecord(item.id, e)}
                            className="p-1 text-gray-400 hover:text-red-600 transition cursor-pointer"
                            title="Delete log"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* ==================== VIEW 2: WHATSAPP CENTER ================== */}
        {/* ============================================================== */}
        {channelMode === "whatsapp" && (
          <>
            {/* WHATSAPP TABS */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3 mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWaTab("queue")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    waTab === "queue"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white text-gray-600 hover:text-black border border-gray-200"
                  }`}
                >
                  <MessageCircle size={13} />
                  <span>Studio Batch Queue (10-15/batch)</span>
                  {waStats && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        waTab === "queue"
                          ? "bg-white/20 text-white"
                          : "bg-emerald-100 text-emerald-800 font-bold"
                      }`}
                    >
                      {waStats.pendingCount} queued
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setWaTab("dispatched")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    waTab === "dispatched"
                      ? "bg-black text-white shadow-xs"
                      : "bg-white text-gray-600 hover:text-black border border-gray-200"
                  }`}
                >
                  <Check size={13} />
                  <span>Dispatched WhatsApp History</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      waTab === "dispatched" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {waDispatchedHistory.length}
                  </span>
                </button>

                <button
                  onClick={() => setWaTab("verifications")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    waTab === "verifications"
                      ? "bg-black text-white shadow-xs"
                      : "bg-white text-gray-600 hover:text-black border border-gray-200"
                  }`}
                >
                  <ShieldCheck size={13} />
                  <span>Phone Verifications</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      waTab === "verifications" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {phoneVerifications.length}
                  </span>
                </button>
              </div>

              <button
                onClick={refreshCurrentView}
                className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-500 hover:text-black transition cursor-pointer"
                title="Refresh All"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            {/* TAB: WHATSAPP BATCH QUEUE */}
            {waTab === "queue" && (
              <div className="space-y-6">
                {/* STATS OVERVIEW */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Studios With WhatsApp / Phone
                    </span>
                    <span className="text-2xl font-black text-gray-900 mt-1 block">
                      {waStats?.totalWithWhatsApp ?? "..."}
                    </span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                      Already Invited
                    </span>
                    <span className="text-2xl font-black text-emerald-700 mt-1 block">
                      {waStats?.alreadyNotifiedCount ?? "..."}
                    </span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                    <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">
                      Pending in Queue
                    </span>
                    <span className="text-2xl font-black text-teal-700 mt-1 block">
                      {waStats?.pendingCount ?? "..."}
                    </span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                      Current Batch Ready
                    </span>
                    <span className="text-2xl font-black text-blue-700 mt-1 block">
                      {waStats?.batchSize ?? "..."}
                    </span>
                  </div>
                </div>

                {/* ACTION BANNER */}
                <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-md">
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 block">
                      100% Free WhatsApp Campaign (10–15 Practices / Batch)
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      Next WhatsApp Invite Batch Ready: {waNextBatch.length} Practices
                    </h3>
                    <p className="text-xs text-emerald-100/80 max-w-xl leading-relaxed">
                      Sends 1-click personalized studio invitations with direct claim links to practice owners on WhatsApp. Stays within safe, natural messaging volume at zero cost.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      disabled={loading || (waStats?.pendingCount || 0) === 0 || waNextBatch.length === 0}
                      onClick={() => {
                        setWaCurrentIndex(0);
                        setWaModalOpen(true);
                      }}
                      className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <MessageCircle size={15} />
                      <span>Start Rapid Batch Dispatch ({waNextBatch.length})</span>
                    </button>
                  </div>
                </div>

                {/* BATCH TABLE (10-15 STUDIOS) */}
                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-2xs">
                  <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900">
                        Next {waNextBatch.length} Architecture Practices in Queue
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Click &quot;Send on WhatsApp&quot; individually or launch the rapid batch stepper above.
                      </p>
                    </div>
                    <button
                      onClick={loadWhatsAppQueue}
                      className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition cursor-pointer"
                      title="Refresh Queue"
                    >
                      <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                    </button>
                  </div>

                  {loading ? (
                    <div className="p-12 text-center text-xs text-gray-400">Loading studios in queue...</div>
                  ) : waNextBatch.length === 0 ? (
                    <div className="p-12 text-center text-xs text-gray-500">
                      🎉 All studios with WhatsApp numbers have been invited! No pending studios in queue.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {waNextBatch.map((studio, idx) => {
                        const isDispatched = waDispatchedIds.includes(studio.id);
                        return (
                          <div
                            key={studio.id}
                            className="px-4 py-3.5 hover:bg-slate-50 transition flex items-center justify-between gap-3 text-xs"
                          >
                            {/* NUMBER + FIRM */}
                            <div className="flex items-center gap-3 min-w-[240px] max-w-[280px] shrink-0">
                              <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-[11px] shrink-0">
                                {idx + 1}
                              </span>
                              <div className="truncate">
                                <span className="font-extrabold text-gray-900 block truncate">{studio.firmName}</span>
                                <span className="text-[11px] text-gray-500 font-mono block truncate">
                                  +{studio.fullPhone}
                                </span>
                              </div>
                            </div>

                            {/* LOCATION & LINK */}
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                                {[studio.city, studio.state].filter(Boolean).join(", ") || "India"}
                              </span>
                              <span className="truncate text-gray-400 text-[11px]">
                                {studio.claimUrl}
                              </span>
                            </div>

                            {/* ACTION */}
                            <div className="flex items-center gap-2 shrink-0">
                              {isDispatched ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                                  <Check size={12} />
                                  <span>Dispatched</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSendSingleWhatsApp(studio)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer whitespace-nowrap"
                                >
                                  <MessageCircle size={13} />
                                  <span>Send on WhatsApp</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: WHATSAPP DISPATCHED HISTORY */}
            {waTab === "dispatched" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* SELECT ALL CHECKBOX */}
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-2xs shrink-0">
                      <input
                        type="checkbox"
                        id="select-all-wa"
                        checked={
                          filteredWaDispatched.length > 0 &&
                          filteredWaDispatched.every((i) => selectedWaDispatchedIds.includes(i.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedWaDispatchedIds(filteredWaDispatched.map((i) => i.id));
                          } else {
                            setSelectedWaDispatchedIds([]);
                          }
                        }}
                        className="w-4 h-4 rounded text-black border-gray-300 focus:ring-black cursor-pointer"
                      />
                      <label htmlFor="select-all-wa" className="text-xs text-gray-700 font-semibold cursor-pointer select-none">
                        Select All ({filteredWaDispatched.length})
                      </label>
                    </div>

                    <div className="relative flex-1 sm:w-80">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={waSearchQuery}
                        onChange={(e) => setWaSearchQuery(e.target.value)}
                        placeholder="Search dispatched studios..."
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition shadow-2xs"
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-semibold">
                    Total WhatsApp Dispatches: {waDispatchedHistory.length}
                  </span>
                </div>

                {/* BATCH ACTION BAR WHEN ITEMS SELECTED */}
                {selectedWaDispatchedIds.length > 0 && (
                  <div className="p-3.5 bg-gray-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                        {selectedWaDispatchedIds.length}
                      </span>
                      <span>Studio(s) Selected</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleBatchManualDispatch}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <MessageCircle size={13} />
                        <span>Dispatch Selected on WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleBatchMoveBackToQueue}
                        className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/20"
                      >
                        <RefreshCw size={12} />
                        <span>Move to Queue ({selectedWaDispatchedIds.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleBatchDeleteWaLogs}
                        className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedWaDispatchedIds([])}
                        className="px-2.5 py-1.5 text-gray-400 hover:text-white text-xs font-semibold cursor-pointer"
                      >
                        Deselect
                      </button>
                    </div>
                  </div>
                )}

                {filteredWaDispatched.length === 0 ? (
                  <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl text-xs text-gray-400">
                    No WhatsApp dispatches match your search.
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs divide-y divide-gray-100">
                    {filteredWaDispatched.map((item) => {
                      const isSelected = selectedWaDispatchedIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`px-4 py-3.5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                            isSelected ? "bg-emerald-50/50" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-[220px] max-w-[280px] shrink-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (e.target.checked) {
                                  setSelectedWaDispatchedIds((prev) => [...prev, item.id]);
                                } else {
                                  setSelectedWaDispatchedIds((prev) => prev.filter((id) => id !== item.id));
                                }
                              }}
                              className="w-4 h-4 rounded text-black border-gray-300 focus:ring-black cursor-pointer shrink-0"
                            />
                            <div className="truncate">
                              <span className="font-extrabold text-gray-900 block truncate">{item.name}</span>
                              <span className="text-[11px] text-gray-500 block truncate font-mono">
                                {item.email}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                              WhatsApp Sent
                            </span>
                            <span className="truncate text-gray-600 text-[11px]" title={item.message}>
                              {item.message}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            <span className="text-[11px] text-gray-400 whitespace-nowrap hidden sm:inline">
                              {new Date(item.created_at).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>

                            {/* MANUAL DISPATCH ON WHATSAPP */}
                            <button
                              type="button"
                              onClick={(e) => handleManualDispatchWhatsApp(item, e)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer"
                              title="Open in WhatsApp Web with pre-filled invitation text"
                            >
                              <MessageCircle size={13} />
                              <span>Dispatch on WhatsApp</span>
                            </button>

                            {/* MOVE BACK TO QUEUE */}
                            <button
                              type="button"
                              onClick={(e) => handleMoveBackToQueue(item.id, e)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-amber-100 hover:text-amber-800 text-gray-700 font-semibold text-xs rounded-xl transition border border-gray-200 cursor-pointer"
                              title="Unmark from sent and move back to the WhatsApp Queue"
                            >
                              <RefreshCw size={12} />
                              <span>Move to Queue</span>
                            </button>

                            {/* DELETE LOG */}
                            <button
                              type="button"
                              onClick={(e) => deleteWaDispatchedLog(item.id, e)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Delete log permanently"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: PHONE VERIFICATIONS */}
            {waTab === "verifications" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900">Verified Mobile &amp; WhatsApp Users</h4>
                    <p className="text-xs text-gray-500">
                      Candidates and architects who completed phone verification (+5% profile score).
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 font-semibold">
                    Total Verified: {phoneVerifications.length}
                  </span>
                </div>

                {phoneVerifications.length === 0 ? (
                  <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl text-xs text-gray-400">
                    No phone verified users found.
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs divide-y divide-gray-100">
                    {phoneVerifications.map((u) => (
                      <div
                        key={u.id}
                        className="px-4 py-3 hover:bg-slate-50 transition flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-[220px] max-w-[260px] shrink-0">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <ShieldCheck size={16} />
                          </div>
                          <div className="truncate">
                            <span className="font-extrabold text-gray-900 block truncate">
                              {u.full_name || u.username || "Candidate"}
                            </span>
                            <span className="text-[11px] text-gray-400 block truncate">{u.email}</span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                            {u.phone || "Not on file"}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            ✓ Phone Verified (+5%)
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={`https://wa.me/${(u.phone || "").replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200"
                          >
                            <MessageCircle size={12} />
                            <span>Chat</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ============================================================== */}
      {/* ================= RAPID BATCH STEPPER MODAL ================== */}
      {/* ============================================================== */}
      {waModalOpen && waNextBatch.length > 0 && (() => {
        const currentStudio = waNextBatch[waCurrentIndex] || waNextBatch[0];
        const isLast = waCurrentIndex >= waNextBatch.length - 1;

        const handleStepForward = async () => {
          window.open(currentStudio.waUrl, "_blank");

          try {
            await fetch("/api/admin/whatsapp-outreach", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                companyId: currentStudio.id,
                firmName: currentStudio.firmName,
                phone: currentStudio.fullPhone,
                slug: currentStudio.slug,
              }),
            });
            setWaDispatchedIds((prev) => [...prev, currentStudio.id]);
          } catch (e) {
            console.warn("Could not log WhatsApp dispatch:", e);
          }

          if (isLast) {
            setWaModalOpen(false);
            setWaCurrentIndex(0);
            loadWhatsAppQueue();
            loadWhatsAppDispatchedLogs();
          } else {
            setWaCurrentIndex((prev) => prev + 1);
          }
        };

        const handleSkip = () => {
          if (isLast) {
            setWaModalOpen(false);
            setWaCurrentIndex(0);
          } else {
            setWaCurrentIndex((prev) => prev + 1);
          }
        };

        return (
          <div className="fixed inset-0 z-[130] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 relative">
              <button
                type="button"
                onClick={() => setWaModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black p-1 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center justify-between pr-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">
                      Rapid WhatsApp Dispatcher
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Batch of {waNextBatch.length} Studios • 100% Free
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                  {waCurrentIndex + 1} / {waNextBatch.length}
                </span>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${((waCurrentIndex + 1) / waNextBatch.length) * 100}%` }}
                />
              </div>

              {/* CURRENT STUDIO CARD */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Target Studio
                    </div>
                    <h4 className="text-lg font-black text-gray-900 leading-snug">
                      {currentStudio.firmName}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {[currentStudio.city, currentStudio.state].filter(Boolean).join(", ") || "India"}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    +{currentStudio.fullPhone}
                  </span>
                </div>
              </div>

              {/* MESSAGE CARD PREVIEW */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Prefilled Invitation Message:
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-700 leading-relaxed font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {currentStudio.inviteText}
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleStepForward}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <MessageCircle size={15} />
                  <span>{isLast ? "Open in WhatsApp & Finish Batch ✓" : "Open in WhatsApp & Next ➡️"}</span>
                </button>

                {!isLast && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="py-3 px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Skip ⏩
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* ================= EMAIL DETAIL MODAL ========================== */}
      {/* ============================================================== */}
      {selectedEmailItem && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setSelectedEmailItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black p-1 rounded-full cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center justify-between border-b border-gray-100 pb-3 pr-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {selectedEmailItem.subject}
                </span>
                <h3 className="text-base font-extrabold text-gray-900 mt-1">
                  Recipient: {selectedEmailItem.name}
                </h3>
                <p className="text-xs text-gray-400 font-mono">{selectedEmailItem.email}</p>
              </div>

              <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setModalViewMode("recipient")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    modalViewMode === "recipient" ? "bg-white text-black shadow-2xs" : "text-gray-500"
                  }`}
                >
                  Recipient Preview
                </button>
                <button
                  type="button"
                  onClick={() => setModalViewMode("log")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    modalViewMode === "log" ? "bg-white text-black shadow-2xs" : "text-gray-500"
                  }`}
                >
                  System Log
                </button>
              </div>
            </div>

            {modalViewMode === "recipient" ? (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {(() => {
                  const details = parseOutreachDetails(selectedEmailItem);
                  return (
                    <div className="space-y-3">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Active Job Roles Notified
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {details.jobs.map((j, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-white border border-slate-200 text-gray-900 rounded-lg text-xs font-bold"
                            >
                              {j}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1">
                        <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                          Personalized Claim Link Sent
                        </div>
                        <a
                          href={details.claimUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-emerald-800 hover:underline break-all flex items-center gap-1"
                        >
                          <span>{details.claimUrl}</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Raw Delivery Message Log
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-gray-700 font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {selectedEmailItem.message}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-400">
              <span>
                Timestamp:{" "}
                {new Date(selectedEmailItem.created_at).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <button
                onClick={(e) => deleteEmailRecord(selectedEmailItem.id, e)}
                className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
              >
                Delete Log Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ================= COMPOSE EMAIL MODAL ======================== */}
      {/* ============================================================== */}
      {showCompose && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setShowCompose(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black p-1 rounded-full cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-base font-extrabold text-gray-900">Compose Outbound Email</h3>
              <p className="text-xs text-gray-500">
                Directly email candidates, firms, or recruiters from notifications@trappedintoarchitecture.com
              </p>
            </div>

            <form onSubmit={handleSendComposeEmail} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    placeholder="architect@studio.com"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Recipient / Firm Name
                  </label>
                  <input
                    type="text"
                    value={composeName}
                    onChange={(e) => setComposeName(e.target.value)}
                    placeholder="Studio Name / Ar. Name"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="e.g. Your Architecture Vacancies on Trapped Into Architecture"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Message Body *
                </label>
                <textarea
                  required
                  rows={6}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-[11px] text-gray-400">
                  Sends from: <strong className="text-gray-700">notifications@trappedintoarchitecture.com</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCompose(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 hover:text-black rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingEmail}
                    className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {sendingEmail ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
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

export default function AdminMailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs text-gray-400">
          Loading Mail &amp; WhatsApp Outreach Center...
        </div>
      }
    >
      <AdminMailsContent />
    </Suspense>
  );
}
