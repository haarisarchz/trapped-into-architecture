"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Loader2,
  RefreshCw,
  Info,
} from "lucide-react";

export default function AdminClaimsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"all" | "pending" | "scrutiny_needed" | "approved" | "rejected">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [tableMissing, setTableMissing] = useState(false);
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; claim: any | null; reason: string }>({
    isOpen: false,
    claim: null,
    reason: "",
  });
  const [scrutinyModal, setScrutinyModal] = useState<{ isOpen: boolean; claim: any | null; note: string }>({
    isOpen: false,
    claim: null,
    note: "",
  });

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const stored = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!stored) {
      router.push("/");
      return;
    }

    const lookupField = stored.username ? "username" : "email";
    const lookupValue = stored.username || stored.email;
    if (!lookupValue) {
      router.push("/");
      return;
    }

    const { data: realProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq(lookupField, lookupValue)
      .maybeSingle();

    if (!realProfile) {
      router.push("/");
      return;
    }

    const roleStr = (realProfile.role || "").toLowerCase().replace(/[\s_]+/g, "");
    if (!["superadmin", "admin", "ceo", "jobadmin"].includes(roleStr)) {
      router.push("/");
      return;
    }

    setCurrentUser(realProfile);
    setUserRole(roleStr);
    fetchClaims();
  };

  const fetchClaims = async () => {
    setLoading(true);
    setTableMissing(false);
    try {
      const { data, error } = await supabase
        .from("company_claims")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "PGRST205" || error.message?.includes("company_claims")) {
          setTableMissing(true);
          setClaims([]);
          return;
        }
        throw error;
      }

      setClaims(data || []);
    } catch (err: any) {
      console.error("Error loading claims:", err);
    } finally {
      setLoading(false);
    }
  };

  // Action: Approve as Gold Verified
  const handleApprove = async (claim: any) => {
    if (!confirm(`Approve claim for "${claim.company_name}" as Gold Verified?`)) return;

    setProcessingId(claim.id);
    try {
      const now = new Date().toISOString();

      // 1. Update claim status
      const { error: claimErr } = await supabase
        .from("company_claims")
        .update({
          status: "approved",
          reviewed_by: currentUser.id,
          reviewed_at: now,
          updated_at: now,
        })
        .eq("id", claim.id);

      if (claimErr) throw claimErr;

      // 2. Update company record if company_id is present
      if (claim.company_id) {
        await supabase
          .from("companies")
          .update({
            is_claimed: true,
            verification_badge: "gold_verified",
            claimed_by: claim.user_id,
            claimed_at: now,
          })
          .eq("id", claim.company_id);
      }

      // 3. Upgrade claimant's role to employer if currently regular user
      if (claim.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", claim.user_id)
          .maybeSingle();

        if (profile && (!profile.role || profile.role === "user")) {
          await supabase
            .from("profiles")
            .update({ role: "employer" })
            .eq("id", claim.user_id);
        }
      }

      alert(`Claim approved! "${claim.company_name}" is now Gold Verified.`);
      fetchClaims();
    } catch (err: any) {
      console.error("Error approving claim:", err);
      alert("Failed to approve claim: " + (err.message || JSON.stringify(err)));
    } finally {
      setProcessingId(null);
    }
  };

  // Action: Mark as Scrutiny Needed
  const handleMarkScrutiny = async () => {
    const claim = scrutinyModal.claim;
    if (!claim) return;

    setProcessingId(claim.id);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("company_claims")
        .update({
          status: "scrutiny_needed",
          admin_notes: scrutinyModal.note || "Additional scrutiny required.",
          reviewed_by: currentUser.id,
          reviewed_at: now,
          updated_at: now,
        })
        .eq("id", claim.id);

      if (error) throw error;

      if (claim.company_id) {
        await supabase
          .from("companies")
          .update({
            verification_badge: "scrutiny_needed",
          })
          .eq("id", claim.company_id);
      }

      setScrutinyModal({ isOpen: false, claim: null, note: "" });
      fetchClaims();
    } catch (err: any) {
      console.error("Error marking scrutiny:", err);
      alert("Failed to update status: " + (err.message || JSON.stringify(err)));
    } finally {
      setProcessingId(null);
    }
  };

  // Action: Reject Claim
  const handleReject = async () => {
    const claim = rejectionModal.claim;
    if (!claim) return;

    setProcessingId(claim.id);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("company_claims")
        .update({
          status: "rejected",
          admin_notes: rejectionModal.reason || "Verification details could not be validated.",
          reviewed_by: currentUser.id,
          reviewed_at: now,
          updated_at: now,
        })
        .eq("id", claim.id);

      if (error) throw error;

      if (claim.company_id) {
        await supabase
          .from("companies")
          .update({
            is_claimed: false,
            verification_badge: "none",
            claimed_by: null,
          })
          .eq("id", claim.company_id);
      }

      setRejectionModal({ isOpen: false, claim: null, reason: "" });
      fetchClaims();
    } catch (err: any) {
      console.error("Error rejecting claim:", err);
      alert("Failed to reject claim: " + (err.message || JSON.stringify(err)));
    } finally {
      setProcessingId(null);
    }
  };

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesSearch =
        (claim.company_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (claim.claimant_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (claim.official_email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (claim.phone || "").includes(searchQuery);

      if (!matchesSearch) return false;

      if (selectedTab === "all") return true;
      return claim.status === selectedTab;
    });
  }, [claims, searchQuery, selectedTab]);

  const pendingCount = claims.filter((c) => c.status === "pending").length;
  const scrutinyCount = claims.filter((c) => c.status === "scrutiny_needed").length;

  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Admin Operations</span>
              <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold rounded-full">New</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <ShieldCheck size={30} className="text-black" />
              Company Claims &amp; Verification
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Review studio ownership requests and grant <strong>Gold Verified</strong> status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchClaims}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 transition shadow-xs"
              title="Refresh claims"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <AdminQuickMenu />
          </div>
        </div>

        {/* MISSING TABLE WARNING BANNER */}
        {tableMissing && (
          <div className="mb-8 p-5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-4">
            <Info size={24} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 text-sm">Database Migration Notice</h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                The <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">company_claims</code> table has not been created in your Supabase project yet.
                Please execute the migration script located at:
              </p>
              <code className="inline-block mt-2 text-xs bg-white text-gray-900 p-2 rounded-lg border border-amber-200 font-mono">
                supabase/migrations/20261017_create_company_claims.sql
              </code>
            </div>
          </div>
        )}

        {/* CONTROLS: TABS & SEARCH */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* TABS */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <button
              onClick={() => setSelectedTab("pending")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                selectedTab === "pending"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending
              {pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-[11px] font-extrabold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setSelectedTab("scrutiny_needed")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                selectedTab === "scrutiny_needed"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Scrutiny Needed
              {scrutinyCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-yellow-400 text-black text-[11px] font-extrabold flex items-center justify-center">
                  {scrutinyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setSelectedTab("approved")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedTab === "approved"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Gold Verified
            </button>

            <button
              onClick={() => setSelectedTab("rejected")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedTab === "rejected"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Rejected
            </button>

            <button
              onClick={() => setSelectedTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedTab === "all"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({claims.length})
            </button>
          </div>

          {/* SEARCH */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search firm, name, email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-black bg-gray-50 focus:bg-white"
            />
          </div>
        </div>

        {/* CLAIMS LIST */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
            <Loader2 size={32} className="animate-spin text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading claims...</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
              <ShieldCheck size={32} />
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">No claims in this category</h3>
            <p className="text-xs text-gray-500">
              {searchQuery ? "Try searching with different keywords." : "When studios submit ownership claims, they will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:border-gray-300 transition flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between"
              >
                {/* COMPANY & CLAIMANT INFO */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                    <Building2 size={24} className="text-gray-400" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-gray-900">{claim.company_name}</h3>
                      {claim.company_slug && (
                        <a
                          href={`/companies/${claim.company_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-black transition"
                          title="View public profile"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          claim.status === "approved"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : claim.status === "scrutiny_needed"
                            ? "bg-yellow-100 text-yellow-900 border border-yellow-300"
                            : claim.status === "rejected"
                            ? "bg-red-100 text-red-900 border border-red-300"
                            : "bg-blue-100 text-blue-900 border border-blue-300"
                        }`}
                      >
                        {claim.status === "approved"
                          ? "Gold Verified ✓"
                          : claim.status === "scrutiny_needed"
                          ? "Scrutiny Needed"
                          : claim.status === "rejected"
                          ? "Rejected"
                          : "Pending Review"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                      <div>
                        <strong>Claimant:</strong> {claim.claimant_name} ({claim.designation})
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail size={12} className="text-gray-400" />
                        <a href={`mailto:${claim.official_email}`} className="text-blue-600 hover:underline">
                          {claim.official_email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone size={12} className="text-gray-400" />
                        <a href={`tel:${claim.phone}`} className="text-gray-700 hover:underline">
                          {claim.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar size={12} />
                        <span>{new Date(claim.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {claim.proof_notes && (
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-700 mt-2">
                        <span className="font-semibold text-gray-900">Verification Proof / Notes: </span>
                        {claim.proof_notes}
                      </div>
                    )}

                    {claim.admin_notes && (
                      <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5 text-xs text-amber-950 mt-1">
                        <span className="font-semibold text-amber-900">Admin Remark: </span>
                        {claim.admin_notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 justify-end">
                  {claim.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(claim)}
                      disabled={processingId === claim.id}
                      className="px-3.5 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                      title="Approve claim and grant Gold Verified badge"
                    >
                      <CheckCircle2 size={14} className="text-amber-400" />
                      Approve (Gold Standard)
                    </button>
                  )}

                  {claim.status !== "scrutiny_needed" && (
                    <button
                      onClick={() => setScrutinyModal({ isOpen: true, claim, note: "" })}
                      disabled={processingId === claim.id}
                      className="px-3.5 py-2 rounded-xl bg-yellow-50 text-yellow-800 border border-yellow-300 hover:bg-yellow-100 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Mark as needing additional verification"
                    >
                      <AlertTriangle size={14} className="text-yellow-600" />
                      Scrutiny Needed
                    </button>
                  )}

                  {claim.status !== "rejected" && (
                    <button
                      onClick={() => setRejectionModal({ isOpen: true, claim, reason: "" })}
                      disabled={processingId === claim.id}
                      className="px-3 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Reject unauthorized or duplicate claim"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SCRUTINY MODAL */}
      {scrutinyModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <AlertTriangle size={20} className="text-yellow-600" />
              Mark Scrutiny Needed
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Enter notes on what additional verification is required for <strong>{scrutinyModal.claim?.company_name}</strong>.
            </p>
            <textarea
              value={scrutinyModal.note}
              onChange={(e) => setScrutinyModal({ ...scrutinyModal, note: e.target.value })}
              placeholder="e.g. Official domain email does not match studio website. Awaiting CoA proof."
              rows={3}
              className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-black focus:outline-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setScrutinyModal({ isOpen: false, claim: null, note: "" })}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkScrutiny}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectionModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-red-600">
              <XCircle size={20} />
              Reject Company Claim
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Specify the reason for rejecting the claim for <strong>{rejectionModal.claim?.company_name}</strong>.
            </p>
            <textarea
              value={rejectionModal.reason}
              onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
              placeholder="e.g. Claimant could not establish official authorization to represent this studio."
              rows={3}
              className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-black focus:outline-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectionModal({ isOpen: false, claim: null, reason: "" })}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
