"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import { 
  Mail, Send, Search, RefreshCw, Trash2, CheckCircle2, 
  ExternalLink, Building2, ShieldCheck, X, Sparkles, AlertCircle, MessageSquare
} from "lucide-react";
import Link from "next/link";

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

export default function AdminMailsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tabs: "sent" | "campaign" | "inbox"
  const [activeTab, setActiveTab] = useState<"sent" | "campaign" | "inbox">("sent");

  // Filter for Sent Mails: "all" | "outreach" | "verification" | "direct"
  const [sentFilter, setSentFilter] = useState<"all" | "outreach" | "verification" | "direct">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Records
  const [allRecords, setAllRecords] = useState<ContactInquiry[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContactInquiry | null>(null);
  const [modalViewMode, setModalViewMode] = useState<"recipient" | "log">("recipient");

  // Compose Modal State
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeName, setComposeName] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Campaign State
  const [campaignStats, setCampaignStats] = useState<any>(null);
  const [campaignNextBatch, setCampaignNextBatch] = useState<any[]>([]);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [dispatchingBatch, setDispatchingBatch] = useState(false);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);

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
    loadData();
    loadCampaignData();
  }, [router]);

  const loadData = async () => {
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
      console.error("Error loading campaign:", err);
    } finally {
      setCampaignLoading(false);
    }
  };

  const handleDispatchBatch = async (dryRun: boolean = false) => {
    setDispatchingBatch(true);
    setBatchSuccessMessage(null);
    try {
      const res = await fetch("/api/admin/company-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 15, dryRun }),
      });
      const data = await res.json();
      if (data.success) {
        setBatchSuccessMessage(
          dryRun
            ? `[Dry Run] Successfully previewed ${data.processed} companies.`
            : `✓ Batch dispatched! Successfully sent ${data.sent} emails (${data.errors} errors).`
        );
        loadCampaignData();
        loadData();
      } else {
        alert("Batch dispatch error: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Failed to dispatch batch: " + err.message);
    } finally {
      setDispatchingBatch(false);
    }
  };

  const handleSendCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) {
      alert("Please fill in recipient email, subject, and message.");
      return;
    }

    setSendingEmail(true);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeTo.trim(),
          recipientName: composeName.trim() || composeTo.trim(),
          subject: composeSubject.trim(),
          bodyText: composeBody.trim(),
          category: "ADMIN_DIRECT",
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
        loadData();
      } else {
        alert("Error sending email: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Failed to send email: " + err.message);
    } finally {
      setSendingEmail(false);
    }
  };

  const deleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this mail record?")) return;
    try {
      const { error } = await supabase.from("contact_inquiries").delete().eq("id", id);
      if (error) throw error;
      setAllRecords(prev => prev.filter(r => r.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (err: any) {
      alert("Error deleting record: " + err.message);
    }
  };

  // Classify records
  const sentRecords = allRecords.filter((item) => {
    const subj = (item.subject || "").trim();
    const msg = (item.message || "").toLowerCase();
    return (
      subj === "NOTIFIED_COMPANY_JOB_POSTING" ||
      subj === "COMPANY_JOB_EMAIL_SENT" ||
      subj === "USER_VERIFICATION_SENT" ||
      subj === "USER_VERIFIED" ||
      subj === "ADMIN_DIRECT" ||
      subj.startsWith("[Live on Ti2A]") ||
      msg.includes("verification code") ||
      msg.includes("outreach notification") ||
      msg.includes("claim your studio") ||
      msg.includes("dispatched email to")
    );
  });

  const inboxRecords = allRecords.filter((item) => {
    if (sentRecords.includes(item)) return false;
    const subj = (item.subject || "").trim();
    // Exclude public visitor contact queries & suggestions (they belong to /admin/contact)
    const isVisitorInquiry =
      subj === "General Inquiry" ||
      subj.startsWith("[Suggestion]") ||
      subj.toLowerCase().includes("suggestion") ||
      subj === "System Email Verification Test";
    return !isVisitorInquiry;
  });

  // Filter sent records
  const filteredSent = sentRecords.filter((item) => {
    const msg = (item.message || "").toLowerCase();
    const subj = (item.subject || "").toUpperCase();

    const isVerification =
      subj === "USER_VERIFICATION_SENT" ||
      subj === "USER_VERIFIED" ||
      msg.includes("verification code dispatched") ||
      msg.includes("verified email successfully");

    const isOutreach =
      !isVerification &&
      (subj === "NOTIFIED_COMPANY_JOB_POSTING" ||
        (subj === "COMPANY_JOB_EMAIL_SENT" && !msg.includes("verif")) ||
        msg.includes("outreach notification") ||
        msg.includes("claim your studio"));

    const isDirect = !isVerification && !isOutreach;

    if (sentFilter === "outreach" && !isOutreach) return false;
    if (sentFilter === "verification" && !isVerification) return false;
    if (sentFilter === "direct" && !isDirect) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (item.name || "").toLowerCase().includes(q);
      const matchEmail = (item.email || "").toLowerCase().includes(q);
      const matchMsg = msg.includes(q);
      const matchSubj = (item.subject || "").toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchMsg && !matchSubj) return false;
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col text-black">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 md:py-10">
        
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <AdminQuickMenu />
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <span>Mail &amp; Outreach Center</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Verified Domain
                </span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Dispatches routed from <span className="font-mono text-gray-700">notifications@trappedintoarchitecture.com</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/contact"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition shadow-2xs"
            >
              <MessageSquare size={14} />
              <span>Contact &amp; Suggestions →</span>
            </Link>

            <button
              onClick={() => setShowCompose(true)}
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Send size={14} />
              <span>+ Compose Email</span>
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("sent")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "sent"
                  ? "bg-black text-white shadow-xs"
                  : "bg-white text-gray-600 hover:text-black border border-gray-200"
              }`}
            >
              <Send size={13} />
              <span>Sent Mails</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "sent" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {sentRecords.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("campaign")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "campaign"
                  ? "bg-black text-white shadow-xs"
                  : "bg-white text-gray-600 hover:text-black border border-gray-200"
              }`}
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>Outreach Campaign (10-15/day)</span>
              {campaignStats && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "campaign" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800 font-bold"}`}>
                  {campaignStats.pendingCount} queued
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("inbox")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "inbox"
                  ? "bg-black text-white shadow-xs"
                  : "bg-white text-gray-600 hover:text-black border border-gray-200"
              }`}
            >
              <Mail size={13} />
              <span>System & Inbound Alerts</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "inbox" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {inboxRecords.length}
              </span>
            </button>
          </div>

          <button
            onClick={() => { loadData(); loadCampaignData(); }}
            className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-500 hover:text-black transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* TAB 1: SENT MAILS */}
        {activeTab === "sent" && (
          <div className="space-y-4">
            {/* SEARCH & SUB-FILTERS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sent emails..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
                <button
                  onClick={() => setSentFilter("all")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                    sentFilter === "all" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  All Sent ({sentRecords.length})
                </button>
                <button
                  onClick={() => setSentFilter("outreach")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                    sentFilter === "outreach" ? "bg-purple-600 text-white" : "bg-white text-purple-700 hover:bg-purple-50 border border-purple-200"
                  }`}
                >
                  Studio Outreach
                </button>
                <button
                  onClick={() => setSentFilter("verification")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                    sentFilter === "verification" ? "bg-blue-600 text-white" : "bg-white text-blue-700 hover:bg-blue-50 border border-blue-200"
                  }`}
                >
                  User Verification
                </button>
                <button
                  onClick={() => setSentFilter("direct")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                    sentFilter === "direct" ? "bg-gray-700 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  Admin Direct
                </button>
              </div>
            </div>

            {/* EMAILS LIST (GMAIL-STYLE) */}
            {loading ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading sent records...</div>
            ) : filteredSent.length === 0 ? (
              <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl text-xs text-gray-400">
                No dispatched emails match the selected filters.
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs divide-y divide-gray-100">
                {filteredSent.map((item) => {
                  const msg = (item.message || "").toLowerCase();
                  const subj = (item.subject || "").toUpperCase();

                  const isVerification =
                    subj === "USER_VERIFICATION_SENT" ||
                    subj === "USER_VERIFIED" ||
                    msg.includes("verification code dispatched") ||
                    msg.includes("verified email successfully");

                  const isCompany =
                    !isVerification &&
                    (subj === "NOTIFIED_COMPANY_JOB_POSTING" ||
                      (subj === "COMPANY_JOB_EMAIL_SENT" && !msg.includes("verif")) ||
                      msg.includes("outreach notification") ||
                      msg.includes("claim your studio"));

                  const cleanSnippet = (item.message || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

                  return (
                    <div
                      key={item.id}
                      onClick={() => { setSelectedItem(item); setModalViewMode("recipient"); }}
                      className="px-4 py-3 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-3 group text-xs"
                    >
                      {/* LEFT: STATUS ICON + SENDER & RECIPIENT */}
                      <div className="flex items-center gap-3 min-w-[220px] max-w-[260px] shrink-0">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <div className="truncate">
                          <span className="font-extrabold text-gray-900 block truncate">{item.name || "Architecture Studio"}</span>
                          <span className="text-[11px] text-gray-400 font-mono block truncate">{item.email}</span>
                        </div>
                      </div>

                      {/* MIDDLE: BADGES + PREVIEW SNIPPET */}
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        {isCompany && (
                          <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                            Studio Outreach
                          </span>
                        )}
                        {isVerification && (
                          <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            Verification
                          </span>
                        )}
                        {!isCompany && !isVerification && (
                          <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                            Admin Direct
                          </span>
                        )}
                        <span className="truncate text-gray-500 font-normal">
                          {cleanSnippet}
                        </span>
                      </div>

                      {/* RIGHT: DATE + ACTIONS */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">
                          {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <button
                          onClick={(e) => deleteRecord(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition"
                          title="Delete record"
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

        {/* TAB 2: AUTOMATED OUTREACH CAMPAIGN */}
        {activeTab === "campaign" && (
          <div className="space-y-6">
            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Hiring Firms</span>
                <span className="text-2xl font-black text-gray-900 mt-1 block">
                  {campaignStats?.totalFirmsWithJobs || "..."}
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Already Notified</span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">
                  {campaignStats?.alreadyNotifiedCount ?? "..."}
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">Pending Queue</span>
                <span className="text-2xl font-black text-purple-700 mt-1 block">
                  {campaignStats?.pendingCount ?? "..."}
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Est. Days Remaining</span>
                <span className="text-2xl font-black text-blue-700 mt-1 block">
                  {campaignStats ? `${campaignStats.estimatedDaysRemaining} days` : "..."}
                </span>
              </div>
            </div>

            {/* ACTION BANNER */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300 block mb-1">
                  Daily Quota Target: 15 Companies / Day
                </span>
                <h3 className="text-lg font-black text-white">
                  Next Outreach Batch Ready
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  Sends personalized job publication and studio claim invitations from <span className="font-mono text-purple-200">notifications@trappedintoarchitecture.com</span>.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  disabled={dispatchingBatch || (campaignStats?.pendingCount || 0) === 0}
                  onClick={() => handleDispatchBatch(true)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  Dry Run Preview
                </button>

                <button
                  disabled={dispatchingBatch || (campaignStats?.pendingCount || 0) === 0}
                  onClick={() => handleDispatchBatch(false)}
                  className="px-5 py-2.5 bg-white text-black hover:bg-gray-100 rounded-xl text-xs font-black transition disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  {dispatchingBatch ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Dispatch Next Batch (15)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {batchSuccessMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold animate-in fade-in">
                {batchSuccessMessage}
              </div>
            )}

            {/* NEXT BATCH PREVIEW TABLE */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900">Next 15 Queued Practices</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Firms scheduled for upcoming daily dispatches</p>
                </div>
                <span className="text-xs text-gray-400 font-mono">15 firms / run</span>
              </div>

              {campaignNextBatch.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  All active firms with published jobs have been notified!
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {campaignNextBatch.map((f, i) => (
                    <div key={i} className="px-5 py-3.5 flex items-center justify-between gap-4 text-xs hover:bg-gray-50 transition">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-400 font-mono text-[11px]">#{i + 1}</span>
                          <span className="font-extrabold text-gray-900">{f.firmName}</span>
                          <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                            {f.jobCount} {f.jobCount > 1 ? "Jobs" : "Job"}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">{f.email}</div>
                      </div>

                      <div className="text-[11px] text-gray-400 text-right shrink-0">
                        {f.positions?.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: INBOUND REPLIES */}
        {activeTab === "inbox" && (
          <div className="space-y-4">
            {/* INBOUND CHANNEL BANNER */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900">Direct Inbound Email Channel</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Direct replies to platform notices route to <span className="font-mono text-gray-700 font-semibold">admin.ti2a@gmail.com</span>. Website contact submissions and incoming registration alerts appear below.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <Link
                  href="/admin/contact"
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition whitespace-nowrap"
                >
                  Contact Form Center →
                </Link>
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-black text-white hover:bg-gray-800 rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap"
                >
                  <span>Open Admin Gmail</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* INBOUND RECORDS LIST */}
            {inboxRecords.length === 0 ? (
              <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl text-xs text-gray-400">
                No inbound replies or contact records in database.
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs divide-y divide-gray-100">
                {inboxRecords.map((item) => {
                  const cleanSnippet = (item.message || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
                  const isNewUser = item.subject === "NEW_USER_REGISTERED";
                  const isJobPending = item.subject === "COMPANY_JOB_EMAIL_PENDING";
                  const isSuggestion = (item.subject || "").toLowerCase().includes("suggestion");

                  return (
                    <div
                      key={item.id}
                      onClick={() => { setSelectedItem(item); setModalViewMode("recipient"); }}
                      className="px-4 py-3 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-3 group text-xs"
                    >
                      {/* SENDER */}
                      <div className="flex items-center gap-3 min-w-[220px] max-w-[260px] shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                        <div className="truncate">
                          <span className="font-extrabold text-gray-900 block truncate">{item.name || "Inbound Sender"}</span>
                          <span className="text-[11px] text-gray-400 font-mono block truncate">{item.email}</span>
                        </div>
                      </div>

                      {/* BADGES & SNIPPET */}
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        {isNewUser && (
                          <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            New Registration
                          </span>
                        )}
                        {isJobPending && (
                          <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                            Pending Dispatch
                          </span>
                        )}
                        {isSuggestion && (
                          <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Suggestion
                          </span>
                        )}
                        {!isNewUser && !isJobPending && !isSuggestion && (
                          <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                            {item.subject || "Inbound Message"}
                          </span>
                        )}
                        <span className="truncate text-gray-600 font-normal">
                          {cleanSnippet}
                        </span>
                      </div>

                      {/* DATE + DELETE */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">
                          {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <button
                          onClick={(e) => deleteRecord(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition"
                          title="Delete record"
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

      </div>

      {/* READING MODAL (RECIPIENT VIEW VS AUDIT LOG) */}
      {selectedItem && (() => {
        const isOutreach = selectedItem.subject === "NOTIFIED_COMPANY_JOB_POSTING" || 
          (selectedItem.subject === "COMPANY_JOB_EMAIL_SENT" && !selectedItem.message.toLowerCase().includes("verif")) ||
          selectedItem.message.toLowerCase().includes("outreach notification") ||
          selectedItem.message.toLowerCase().includes("claim your studio") ||
          selectedItem.message.toLowerCase().includes("for 2 jobs") ||
          selectedItem.message.toLowerCase().includes("for 1 job");

        const isVerification = selectedItem.subject === "USER_VERIFICATION_SENT" ||
          selectedItem.subject === "USER_VERIFIED" ||
          selectedItem.message.toLowerCase().includes("verification code") ||
          selectedItem.message.toLowerCase().includes("verified email");

        const outreachData = isOutreach ? parseOutreachDetails(selectedItem) : null;
        const verificationCode = isVerification ? (selectedItem.message.match(/\b\d{6}\b/)?.[0] || "••••••") : null;

        return (
          <div 
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          >
            <div 
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-2xl p-5 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-auto"
            >
              {/* MODAL HEADER */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-extrabold text-gray-900">{selectedItem.name}</h3>
                    {isOutreach && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                        Studio Outreach
                      </span>
                    )}
                    {isVerification && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                        Verification
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-mono">&lt;{selectedItem.email}&gt;</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-xl p-0.5 bg-gray-100 border border-gray-200">
                    <button
                      onClick={() => setModalViewMode("recipient")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        modalViewMode === "recipient"
                          ? "bg-white text-black shadow-2xs"
                          : "text-gray-500 hover:text-black"
                      }`}
                    >
                      ✉️ Recipient View
                    </button>
                    <button
                      onClick={() => setModalViewMode("log")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        modalViewMode === "log"
                          ? "bg-white text-black shadow-2xs"
                          : "text-gray-500 hover:text-black"
                      }`}
                    >
                      📋 Audit Log
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-black p-1 transition cursor-pointer ml-1"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* RECIPIENT VIEW */}
              {modalViewMode === "recipient" ? (
                <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-4 sm:p-5 max-h-[62vh] overflow-y-auto space-y-4">
                  {isOutreach && outreachData ? (
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4 text-left">
                      <div className="border-b border-gray-100 pb-3 text-xs text-gray-500 space-y-1">
                        <div><strong className="text-gray-900">From:</strong> Trapped Into Architecture &lt;notifications@trappedintoarchitecture.com&gt;</div>
                        <div><strong className="text-gray-900">To:</strong> {selectedItem.name} &lt;{selectedItem.email}&gt;</div>
                        <div><strong className="text-gray-900">Subject:</strong> [Live on Ti2A] {outreachData.jobs.length > 1 ? `${outreachData.jobs.length} Job Listings Published` : `Job Listing Published: ${outreachData.jobs[0]}`} for {selectedItem.name}</div>
                      </div>

                      <div className="text-lg font-black text-black">
                        Trapped Into Architecture
                      </div>

                      <div className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        ● {outreachData.jobs.length} {outreachData.jobs.length > 1 ? "Openings" : "Opening"} Live on Platform
                      </div>

                      <h4 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug">
                        {outreachData.jobs.length > 1 ? `${outreachData.jobs.length} job postings` : "Your job posting"} for {selectedItem.name} {outreachData.jobs.length > 1 ? "are" : "is"} now live!
                      </h4>

                      <p className="text-xs text-gray-600 leading-relaxed">
                        Greetings from <strong>Trapped Into Architecture</strong>. We have featured your firm's current architectural hiring opportunities across our platform and verified community channels:
                      </p>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                        {outreachData.jobs.map((job, idx) => (
                          <div key={idx} className={`pb-2 ${idx < outreachData.jobs.length - 1 ? "border-b border-slate-200" : ""}`}>
                            <div className="text-sm font-extrabold text-gray-900">
                              {outreachData.jobs.length > 1 ? `${idx + 1}. ` : ""}{job}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              📍 Location: India
                            </div>
                            <a href="/jobs" target="_blank" rel="noreferrer" className="text-xs font-bold text-black underline mt-1 inline-block">
                              View Listing →
                            </a>
                          </div>
                        ))}
                      </div>

                      {/* PROFILE COMPLETION & ELIGIBILITY */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-bold text-gray-600 uppercase tracking-wider text-[11px]">Studio Profile Completeness:</span>
                          <span className="font-extrabold text-blue-600">~40% Configured</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2.5">
                          <div className="bg-blue-600 h-2 rounded-full w-[40%]"></div>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          ✨ <strong>Unlock Direct Job Posting:</strong> Your initial practice details have been configured. Claiming your studio and completing your profile to <strong>66%+</strong> (adding portfolio projects, leadership info, and office contacts) unlocks direct job &amp; internship publishing privileges for your firm!
                        </p>
                      </div>

                      {/* DARK CLAIM BOX */}
                      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-5 text-white space-y-3">
                        <span className="inline-block bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Claim Practice &amp; Hiring Privileges
                        </span>
                        <h5 className="text-base font-extrabold leading-snug">
                          Want to edit your jobs or post new openings? Claim your studio.
                        </h5>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          We published this listing so qualified architects across India can discover it right away. Claiming your official studio profile is completely free and unlocks:
                        </p>
                        <ul className="text-xs text-zinc-200 space-y-1 pl-4 list-disc">
                          <li><strong>Direct Job Posting:</strong> Post future vacancies once at 66%+</li>
                          <li><strong>Edit Postings:</strong> Update descriptions, salary, and deadlines</li>
                          <li><strong>Studio Showcase:</strong> Add principals, awards, and portfolio</li>
                          <li><strong>Verified Practice Badge:</strong> Establish trust with top design talent</li>
                        </ul>
                        <a
                          href={outreachData.claimUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-center bg-white text-black font-extrabold text-xs py-2.5 px-4 rounded-xl hover:bg-gray-100 transition shadow-sm mt-3"
                        >
                          Claim {selectedItem.name} &amp; Unlock Job Posting →
                        </a>
                      </div>

                      <div className="text-[11px] text-gray-400 text-center pt-3 border-t border-gray-100">
                        &copy; {new Date().getFullYear()} Trapped Into Architecture • India's Dedicated Architecture Network
                      </div>
                    </div>
                  ) : isVerification ? (
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4 text-left">
                      <div className="border-b border-gray-100 pb-3 text-xs text-gray-500 space-y-1">
                        <div><strong className="text-gray-900">From:</strong> Trapped Into Architecture &lt;notifications@trappedintoarchitecture.com&gt;</div>
                        <div><strong className="text-gray-900">To:</strong> {selectedItem.name} &lt;{selectedItem.email}&gt;</div>
                        <div><strong className="text-gray-900">Subject:</strong> Verify Your Email Address - Trapped Into Architecture</div>
                      </div>

                      <div className="text-lg font-black text-black">
                        Trapped Into Architecture
                      </div>

                      <div className="inline-block bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        ✉️ Email Verification
                      </div>

                      <h4 className="text-lg font-extrabold text-gray-900 leading-snug">
                        Verify your email to activate your account
                      </h4>

                      <p className="text-xs text-gray-600 leading-relaxed">
                        Welcome to <strong>Trapped Into Architecture</strong>! Confirm your email address to unlock verified architectural features, portfolio showcase, and studio claims.
                      </p>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Your 6-Digit Code</div>
                        <div className="text-2xl font-black font-mono tracking-widest text-black">
                          {verificationCode}
                        </div>
                        <div className="text-[10px] text-gray-400">Expires in 15 minutes</div>
                      </div>

                      <div className="text-center">
                        <a
                          href={`/verify-email?email=${encodeURIComponent(selectedItem.email)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block bg-black text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-gray-800 transition"
                        >
                          Verify Email Address (1-Click) →
                        </a>
                      </div>

                      <div className="text-[11px] text-gray-400 text-center pt-3 border-t border-gray-100">
                        &copy; {new Date().getFullYear()} Trapped Into Architecture • India's Dedicated Architecture Network
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3 text-left">
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Message Content:</div>
                      <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {selectedItem.message}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* AUDIT LOG */
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-500 uppercase tracking-wider">Subject:</span>
                      <span className="font-extrabold text-gray-900">{selectedItem.subject || "General"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-500 uppercase tracking-wider">Date Sent:</span>
                      <span className="text-gray-700">
                        {new Date(selectedItem.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Technical Audit Log:</div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {selectedItem.message}
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <a
                  href={`mailto:${selectedItem.email}`}
                  className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Mail size={14} />
                  <span>Reply via Email</span>
                </a>

                <button
                  onClick={(e) => deleteRecord(selectedItem.id, e)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-xl transition cursor-pointer"
                  title="Delete message"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* COMPOSE MODAL */}
      {showCompose && (
        <div className="fixed inset-0 z-[130] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span className="font-bold text-sm">Compose Email (Admin Dispatch)</span>
              </div>
              <button onClick={() => setShowCompose(false)} className="text-gray-400 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendCompose} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">To Email</label>
                <input
                  type="email"
                  required
                  placeholder="recipient@studio.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Recipient Name / Practice (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Ar. Ananya or Studio Forma"
                  value={composeName}
                  onChange={(e) => setComposeName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Subject line..."
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Message Body</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Write your email message here..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-black transition resize-none"
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
                    className="px-4 py-2 border border-gray-200 text-gray-600 hover:text-black rounded-xl text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingEmail}
                    className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
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
