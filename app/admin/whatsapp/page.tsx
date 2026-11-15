"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import {
  MessageCircle,
  Check,
  RefreshCw,
  Search,
  Trash2,
  ExternalLink,
  Building2,
  X,
  Sparkles,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

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

export default function AdminWhatsAppPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tabs: "queue" | "dispatched" | "verifications"
  const [activeTab, setActiveTab] = useState<"queue" | "dispatched" | "verifications">("queue");

  // Queue state
  const [waStats, setWaStats] = useState<any>(null);
  const [nextBatch, setNextBatch] = useState<WhatsAppStudio[]>([]);
  const [dispatchedHistory, setDispatchedHistory] = useState<DispatchedRecord[]>([]);
  const [phoneVerifications, setPhoneVerifications] = useState<any[]>([]);

  // Stepper Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dispatchedIds, setDispatchedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
    loadAllData();
  }, [router]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([loadQueue(), loadDispatchedLogs(), loadVerifications()]);
    setLoading(false);
  };

  const loadQueue = async () => {
    try {
      const res = await fetch("/api/admin/whatsapp-outreach");
      const data = await res.json();
      if (data.success) {
        setWaStats(data.stats);
        setNextBatch(data.nextBatch || []);
      }
    } catch (err) {
      console.error("Error loading WhatsApp queue:", err);
    }
  };

  const loadDispatchedLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_inquiries")
        .select("*")
        .eq("subject", "WHATSAPP_STUDIO_INVITE_SENT")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDispatchedHistory(data || []);
    } catch (err) {
      console.error("Error loading dispatched logs:", err);
    }
  };

  const loadVerifications = async () => {
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

  const handleSendSingle = async (studio: WhatsAppStudio) => {
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
      setDispatchedIds((prev) => [...prev, studio.id]);
      loadQueue();
      loadDispatchedLogs();
    } catch (e) {
      console.warn("Could not log dispatch:", e);
    }
  };

  const deleteDispatchedLog = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this dispatch log?")) return;
    try {
      await supabase.from("contact_inquiries").delete().eq("id", id);
      setDispatchedHistory((prev) => prev.filter((r) => r.id !== id));
      loadQueue();
    } catch (err) {
      alert("Error deleting record");
    }
  };

  const filteredDispatched = dispatchedHistory.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
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
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <AdminQuickMenu />
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <span>WhatsApp Outreach Center</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>100% Free Mode</span>
                </span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Batch dispatches, studio invitations, and candidate verification via WhatsApp Helpline (+91 8608609661)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/mails"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition shadow-2xs"
            >
              <Mail size={14} />
              <span>Mail Center →</span>
            </Link>

            <Link
              href="/admin/contact"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition shadow-2xs"
            >
              <span>Contact &amp; Suggestions →</span>
            </Link>
          </div>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("queue")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "queue"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-gray-600 hover:text-black border border-gray-200"
              }`}
            >
              <MessageCircle size={13} />
              <span>Studio Batch Queue (10-15/batch)</span>
              {waStats && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === "queue"
                      ? "bg-white/20 text-white"
                      : "bg-emerald-100 text-emerald-800 font-bold"
                  }`}
                >
                  {waStats.pendingCount} queued
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("dispatched")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "dispatched"
                  ? "bg-black text-white shadow-xs"
                  : "bg-white text-gray-600 hover:text-black border border-gray-200"
              }`}
            >
              <Check size={13} />
              <span>Dispatched History</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === "dispatched" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {dispatchedHistory.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("verifications")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "verifications"
                  ? "bg-black text-white shadow-xs"
                  : "bg-white text-gray-600 hover:text-black border border-gray-200"
              }`}
            >
              <ShieldCheck size={13} />
              <span>Phone Verifications</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === "verifications" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {phoneVerifications.length}
              </span>
            </button>
          </div>

          <button
            onClick={loadAllData}
            className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-500 hover:text-black transition cursor-pointer"
            title="Refresh All"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* TAB 1: STUDIO BATCH QUEUE */}
        {activeTab === "queue" && (
          <div className="space-y-6">
            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Studios With WhatsApp
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
                  Next WhatsApp Invite Batch Ready
                </h3>
                <p className="text-xs text-emerald-100/80 max-w-xl leading-relaxed">
                  Sends 1-click personalized studio invitations with direct claim links to practice owners on WhatsApp. Stays within safe, natural messaging volume at zero cost.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  disabled={loading || (waStats?.pendingCount || 0) === 0 || nextBatch.length === 0}
                  onClick={() => {
                    setCurrentIndex(0);
                    setModalOpen(true);
                  }}
                  className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <MessageCircle size={15} />
                  <span>Start Rapid Batch Dispatch ({nextBatch.length})</span>
                </button>
              </div>
            </div>

            {/* BATCH TABLE (10-15 STUDIOS) */}
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-2xs">
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900">
                    Next {nextBatch.length} Architecture Practices in Queue
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Click &quot;Send on WhatsApp&quot; individually or launch the rapid batch stepper above.
                  </p>
                </div>
                <button
                  onClick={loadQueue}
                  className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition cursor-pointer"
                  title="Refresh Queue"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center text-xs text-gray-400">Loading studios in queue...</div>
              ) : nextBatch.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-500">
                  🎉 All studios with WhatsApp numbers have been invited! No pending studios in queue.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {nextBatch.map((studio, idx) => {
                    const isDispatched = dispatchedIds.includes(studio.id);
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
                              onClick={() => handleSendSingle(studio)}
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

        {/* TAB 2: DISPATCHED HISTORY */}
        {activeTab === "dispatched" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dispatched studios..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition shadow-2xs"
                />
              </div>
              <span className="text-xs text-gray-500 font-semibold">
                Total WhatsApp Dispatches: {dispatchedHistory.length}
              </span>
            </div>

            {filteredDispatched.length === 0 ? (
              <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl text-xs text-gray-400">
                No WhatsApp dispatches match your search.
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs divide-y divide-gray-100">
                {filteredDispatched.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 hover:bg-slate-50 transition flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-[220px] max-w-[260px] shrink-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <MessageCircle size={15} />
                      </div>
                      <div className="truncate">
                        <span className="font-extrabold text-gray-900 block truncate">{item.name}</span>
                        <span className="text-[11px] text-gray-400 font-mono block truncate">
                          {item.email.replace("@whatsapp", "")}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="truncate text-gray-600 font-normal">{item.message}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-gray-400 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <button
                        onClick={(e) => deleteDispatchedLog(item.id, e)}
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

        {/* TAB 3: PHONE VERIFICATIONS */}
        {activeTab === "verifications" && (
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
      </div>

      {/* RAPID BATCH STEPPER MODAL */}
      {modalOpen && nextBatch.length > 0 && (() => {
        const currentStudio = nextBatch[currentIndex] || nextBatch[0];
        const isLast = currentIndex >= nextBatch.length - 1;

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
            setDispatchedIds((prev) => [...prev, currentStudio.id]);
          } catch (e) {
            console.warn("Could not log dispatch:", e);
          }

          if (isLast) {
            setModalOpen(false);
            setCurrentIndex(0);
            loadQueue();
            loadDispatchedLogs();
          } else {
            setCurrentIndex((prev) => prev + 1);
          }
        };

        const handleSkip = () => {
          if (isLast) {
            setModalOpen(false);
            setCurrentIndex(0);
          } else {
            setCurrentIndex((prev) => prev + 1);
          }
        };

        return (
          <div className="fixed inset-0 z-[130] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 relative">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
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
                      Batch of {nextBatch.length} Studios • 100% Free
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                  {currentIndex + 1} / {nextBatch.length}
                </span>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / nextBatch.length) * 100}%` }}
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

      <Footer />
    </main>
  );
}
