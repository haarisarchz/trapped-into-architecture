"use client";

import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Award,
  ShieldCheck,
  MailCheck,
  PhoneCall,
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit,
  Clock,
  Filter,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function AdminBadgesPage({ initialTab = "companies" }: { initialTab?: "companies" | "claims" }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"companies" | "claims">(initialTab);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "claims" || initialTab === "claims") {
        setActiveTab("claims");
      } else if (tabParam === "companies") {
        setActiveTab("companies");
      }
    }
  }, [initialTab]);

  const handleTabChange = (tab: "companies" | "claims") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Companies data
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Claims data
  const [claims, setClaims] = useState<any[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);

  // Action status message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      router.push("/");
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);

    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchCompanies(), fetchClaims()]);
    setLoading(false);
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (err: any) {
      console.warn("Error fetching companies:", err.message);
    }
  };

  const fetchClaims = async () => {
    setClaimsLoading(true);
    try {
      const { data, error } = await supabase
        .from("company_claim_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Table may not have any rows yet
        setClaims([]);
      } else {
        setClaims(data || []);
      }
    } catch (err) {
      setClaims([]);
    } finally {
      setClaimsLoading(false);
    }
  };

  // Toggle badge property on company
  const handleToggleBadge = async (companyId: string, field: "is_claimed" | "email_verified" | "phone_verified", currentVal: boolean) => {
    const newVal = !currentVal;
    try {
      const { error } = await supabase
        .from("companies")
        .update({ [field]: newVal, updated_at: new Date().toISOString() })
        .eq("id", companyId);

      if (error) throw error;

      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, [field]: newVal } : c))
      );
      showToast(`Updated badge for studio successfully.`);
    } catch (err: any) {
      alert("Failed to toggle badge: " + err.message);
    }
  };

  // Change tier on company
  const handleChangeTier = async (companyId: string, newTier: string) => {
    try {
      const { error } = await supabase
        .from("companies")
        .update({ badge_tier: newTier, updated_at: new Date().toISOString() })
        .eq("id", companyId);

      if (error) throw error;

      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, badge_tier: newTier } : c))
      );
      showToast(`Studio level updated to ${newTier.toUpperCase()}`);
    } catch (err: any) {
      alert("Failed to update tier: " + err.message);
    }
  };

  // Approve claim request
  const handleApproveClaim = async (claim: any) => {
    try {
      // 1. Update claim request
      const { error: claimErr } = await supabase
        .from("company_claim_requests")
        .update({
          status: "approved",
          reviewed_by: currentUser?.id || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", claim.id);

      if (claimErr) throw claimErr;

      // 2. Mark company as claimed & email verified
      if (claim.company_id || claim.company_slug) {
        let q = supabase
          .from("companies")
          .update({
            is_claimed: true,
            claimed_by: claim.user_id || null,
            claimed_at: new Date().toISOString(),
            email_verified: true,
            badge_tier: "gold",
          });

        if (claim.company_id) {
          await q.eq("id", claim.company_id);
        } else {
          await q.eq("slug", claim.company_slug);
        }
      }

      setClaims((prev) =>
        prev.map((c) => (c.id === claim.id ? { ...c, status: "approved" } : c))
      );
      await fetchCompanies();
      showToast(`Claim approved! Studio is now marked Claimed & Gold Level.`);
    } catch (err: any) {
      alert("Error approving claim: " + err.message);
    }
  };

  // Reject claim request
  const handleRejectClaim = async (claimId: string) => {
    try {
      const { error } = await supabase
        .from("company_claim_requests")
        .update({
          status: "rejected",
          reviewed_by: currentUser?.id || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", claimId);

      if (error) throw error;

      setClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, status: "rejected" } : c))
      );
      showToast("Claim request rejected.");
    } catch (err: any) {
      alert("Error rejecting claim: " + err.message);
    }
  };

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.firm_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city?.toLowerCase().includes(searchQuery.toLowerCase());

      const tier = (c.badge_tier || "bronze").toLowerCase();
      const matchesTier = tierFilter === "all" || tier === tierFilter;

      let matchesStatus = true;
      if (statusFilter === "claimed") matchesStatus = Boolean(c.is_claimed);
      if (statusFilter === "unclaimed") matchesStatus = !Boolean(c.is_claimed);
      if (statusFilter === "email_verified") matchesStatus = Boolean(c.email_verified);
      if (statusFilter === "phone_verified") matchesStatus = Boolean(c.phone_verified);

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [companies, searchQuery, tierFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = companies.length;
    const claimed = companies.filter((c) => c.is_claimed).length;
    const emailVerified = companies.filter((c) => c.email_verified).length;
    const pendingClaims = claims.filter((c) => c.status === "pending").length;
    return { total, claimed, emailVerified, pendingClaims };
  }, [companies, claims]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F3F3] text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 mt-20 md:mt-24">
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Award size={22} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                  Studio Badges & Claims Management
                </h1>
                <p className="text-xs text-gray-500">
                  Manage Studio Levels (Bronze → Diamond), trust badges, and ownership verification.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 p-2.5 rounded-xl transition cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <AdminQuickMenu />
          </div>
        </div>

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl mb-6 text-sm flex items-center gap-2 shadow-xs">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
              Total Studios
            </span>
            <p className="text-2xl font-extrabold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-xs text-blue-600 font-bold uppercase tracking-wider block mb-1">
              Claimed Studios
            </span>
            <p className="text-2xl font-extrabold text-blue-900">{stats.claimed}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider block mb-1">
              Email Verified
            </span>
            <p className="text-2xl font-extrabold text-emerald-900">{stats.emailVerified}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-xs text-amber-600 font-bold uppercase tracking-wider block mb-1">
              Pending Claims
            </span>
            <p className="text-2xl font-extrabold text-amber-900">{stats.pendingClaims}</p>
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex items-center gap-2 border-b border-gray-200 mb-6 pb-px">
          <button
            onClick={() => handleTabChange("companies")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "companies"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Building2 size={16} />
            <span>Studio Levels & Badges ({filteredCompanies.length})</span>
          </button>

          <button
            onClick={() => handleTabChange("claims")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "claims"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Clock size={16} />
            <span>Claim Requests Queue</span>
            {stats.pendingClaims > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
                {stats.pendingClaims}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: COMPANIES & BADGES */}
        {activeTab === "companies" && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            {/* SEARCH & FILTERS ROW */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search studio by name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white font-medium"
              >
                <option value="all">All Studio Levels</option>
                <option value="bronze">🥉 Bronze Level</option>
                <option value="silver">🥈 Silver Level</option>
                <option value="gold">🥇 Gold Level</option>
                <option value="platinum">💎 Platinum Level</option>
                <option value="diamond">👑 Diamond Level</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="claimed">Claimed Studios</option>
                <option value="unclaimed">Unclaimed Studios</option>
                <option value="email_verified">Email Verified</option>
                <option value="phone_verified">Phone Verified</option>
              </select>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Studio / Firm</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Level Tier</th>
                    <th className="py-3 px-3 text-center">Claimed</th>
                    <th className="py-3 px-3 text-center">Email Verified</th>
                    <th className="py-3 px-3 text-center">Phone Verified</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCompanies.map((c) => {
                    const currentTier = (c.badge_tier || "bronze").toLowerCase();
                    return (
                      <tr key={c.id || c.firm_name} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                              {c.logo_url ? (
                                <img src={c.logo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Building2 size={18} className="text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{c.firm_name}</p>
                              <span className="text-xs text-gray-400">{c.organization_type || "Firm"}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-gray-600">
                          {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                        </td>

                        {/* TIER DROPDOWN */}
                        <td className="py-3 px-3">
                          <select
                            value={currentTier}
                            onChange={(e) => handleChangeTier(c.id, e.target.value)}
                            className="text-xs font-bold py-1 px-2 rounded-lg border border-gray-200 bg-white"
                          >
                            <option value="bronze">🥉 Bronze Level</option>
                            <option value="silver">🥈 Silver Level</option>
                            <option value="gold">🥇 Gold Level</option>
                            <option value="platinum">💎 Platinum Level</option>
                            <option value="diamond">👑 Diamond Level</option>
                          </select>
                        </td>

                        {/* CLAIMED TOGGLE */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleBadge(c.id, "is_claimed", Boolean(c.is_claimed))}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                              c.is_claimed
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            <ShieldCheck size={13} />
                            <span>{c.is_claimed ? "Claimed" : "No"}</span>
                          </button>
                        </td>

                        {/* EMAIL VERIFIED TOGGLE */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleBadge(c.id, "email_verified", Boolean(c.email_verified))}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                              c.email_verified
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            <MailCheck size={13} />
                            <span>{c.email_verified ? "Verified" : "No"}</span>
                          </button>
                        </td>

                        {/* PHONE VERIFIED TOGGLE */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleBadge(c.id, "phone_verified", Boolean(c.phone_verified))}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                              c.phone_verified
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            <PhoneCall size={13} />
                            <span>{c.phone_verified ? "Verified" : "No"}</span>
                          </button>
                        </td>

                        {/* ACTIONS */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/companies/edit/${c.id}`}
                              className="p-1.5 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100 transition"
                              title="Edit Studio"
                            >
                              <Edit size={16} />
                            </Link>
                            <Link
                              href={`/companies/${c.slug}`}
                              target="_blank"
                              className="p-1.5 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100 transition"
                              title="View Public Page"
                            >
                              <ExternalLink size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredCompanies.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No studios found matching your search or filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CLAIM REQUESTS QUEUE */}
        {activeTab === "claims" && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            {claims.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Studio Claimed</th>
                      <th className="py-3 px-3">Requester</th>
                      <th className="py-3 px-3">Official Email</th>
                      <th className="py-3 px-3">Designation</th>
                      <th className="py-3 px-3">Notes / Proof</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {claims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50">
                        <td className="py-3 px-3 font-bold text-gray-900">
                          {claim.company_name}
                        </td>
                        <td className="py-3 px-3 text-gray-800">
                          {claim.requester_name || "—"}
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          <a href={`mailto:${claim.work_email}`} className="hover:underline">
                            {claim.work_email}
                          </a>
                        </td>
                        <td className="py-3 px-3 text-gray-700">
                          {claim.designation || "—"}
                        </td>
                        <td className="py-3 px-3 text-gray-500 max-w-xs truncate">
                          {claim.verification_notes || "—"}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              claim.status === "approved"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : claim.status === "rejected"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {claim.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {claim.status === "pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApproveClaim(claim)}
                                className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectClaim(claim.id)}
                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-gray-300 transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Clock size={36} className="text-gray-300 mx-auto mb-3" />
                <p className="font-bold text-gray-700 mb-1">No pending claim requests</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  When representatives or studio founders click &quot;Claim this Studio&quot; on public company pages, their verification requests will appear here for 1-click approval.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
