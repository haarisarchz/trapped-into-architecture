"use client";

import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import React, { Suspense, useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaginationControls from "@/components/PaginationControls";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { calculateCompanyLevel } from "@/utils/companyLevel";
import { formatDate } from "@/utils/formatDate";
import {
  Edit2,
  EyeOff,
  Eye,
  Trash2,
  Search,
  X,
  AlertCircle,
  Building2,
  Award,
  ShieldCheck,
  MailCheck,
  PhoneCall,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit,
  Filter,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

function AdminCompaniesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlFilter = searchParams.get("filter");
  const urlTab = searchParams.get("tab");

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Main Tabs: "all" | "badges" | "claims" | "submissions"
  const [activeMainTab, setActiveMainTab] = useState<"all" | "badges" | "claims" | "submissions" | "trash">(
    urlTab === "badges" ? "badges" : urlTab === "claims" ? "claims" : urlTab === "submissions" ? "submissions" : urlTab === "trash" ? "trash" : "all"
  );

  useEffect(() => {
    if (urlTab === "badges") setActiveMainTab("badges");
    else if (urlTab === "claims") setActiveMainTab("claims");
    else if (urlTab === "submissions") setActiveMainTab("submissions");
    else if (urlTab === "trash") setActiveMainTab("trash");
    else if (urlTab === "all") setActiveMainTab("all");
  }, [urlTab]);

  const handleTabSwitch = (tab: "all" | "badges" | "claims" | "submissions" | "trash") => {
    setActiveMainTab(tab);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("tab", tab);
    window.history.replaceState({}, "", newUrl.toString());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Companies Data
  const [companies, setCompanies] = useState<any[]>([]);

  // Claims Data
  const [claims, setClaims] = useState<any[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);

  // Tab 1 (All Companies) Filters & Sorting
  const [filterMode, setFilterMode] = useState<"all" | "missing-logo">(
    urlFilter === "missing-logo" ? "missing-logo" : "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Tab 2 (Badges) Filters & Pagination
  const [badgesSearch, setBadgesSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [badgesPage, setBadgesPage] = useState(1);
  const [badgesPerPage, setBadgesPerPage] = useState(20);

  // Tab 3 (Claims) Pagination
  const [claimsPage, setClaimsPage] = useState(1);
  const [claimsPerPage, setClaimsPerPage] = useState(20);

  // Tab 4 (Submissions) Pagination
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [submissionsPerPage, setSubmissionsPerPage] = useState(20);

  // Tab 5 (Trash) Pagination
  const [trashPage, setTrashPage] = useState(1);
  const [trashPerPage, setTrashPerPage] = useState(20);

  // Merge modal state
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [mergeSourceId, setMergeSourceId] = useState("");
  const [mergeTargetId, setMergeTargetId] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!user) {
      router.push("/");
      return;
    }
    setCurrentUser(user);
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchCompaniesData(), fetchClaimsData()]);
    setLoading(false);
  };

  const fetchCompaniesData = async () => {
    setError(null);
    try {
      // 1. Fetch companies
      const { data: companiesData, error: compErr } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (compErr) console.warn("companies table error:", compErr.message);

      // 2. Fetch jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("id, firm_name, company_id, city, state, organization_type, status, posted_date, author_id");

      // 3. Fetch profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name, full_name, username, role");

      const profilesMap: Record<string, any> = {};
      if (profilesData) {
        profilesData.forEach((p) => {
          profilesMap[p.id] = p;
        });
      }

      // 4. Build grouped map
      const grouped: Record<string, any> = {};

      if (companiesData && companiesData.length > 0) {
        companiesData.forEach((comp) => {
          if (!comp.firm_name) return;
          grouped[comp.firm_name] = {
            ...comp,
            totalJobs: 0,
            activeJobs: 0,
            creatorProfile: comp.created_by ? profilesMap[comp.created_by] : null,
            modifierProfile: comp.updated_by ? profilesMap[comp.updated_by] : null,
            isFromCompaniesTable: true,
          };
        });
      }

      if (jobsData) {
        jobsData.forEach((job: any) => {
          const name = job.firm_name;
          if (!name) return;

          // Match by company_id first or by firm_name
          let targetComp = null;
          if (job.company_id) {
            targetComp = Object.values(grouped).find((c: any) => c.id === job.company_id);
          }
          if (!targetComp && grouped[name]) {
            targetComp = grouped[name];
          }

          if (targetComp) {
            targetComp.totalJobs += 1;
            if (job.status === "published") {
              targetComp.activeJobs += 1;
            }
          }
          // Do NOT create ghost companies if not in companies table!
        });
      }

      setCompanies(Object.values(grouped));
    } catch (err: any) {
      console.error("fetchCompaniesData error:", err);
      setError("Failed to load companies: " + (err.message || "Unknown error"));
    }
  };

  const fetchClaimsData = async () => {
    setClaimsLoading(true);
    try {
      const { data, error } = await supabase
        .from("company_claim_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setClaims([]);
      } else {
        setClaims(data || []);
      }
    } catch (e) {
      setClaims([]);
    } finally {
      setClaimsLoading(false);
    }
  };

  // Helper resolvers
  function resolveModifiedBy(company: any): string {
    const profile = company.modifierProfile;
    if (!profile) return "--";
    return profile.display_name || profile.full_name || profile.username || "--";
  }

  function resolveCreatedBy(company: any): string {
    const profile = company.creatorProfile;
    if (!profile) return "—";

    const myRoleNorm = (currentUser?.role || "").toLowerCase().replace(/[\s_]+/g, "");
    if (myRoleNorm === "ceo") return profile.display_name || profile.full_name || profile.username || "Admin";
    if (currentUser?.username && profile.username === currentUser.username) return profile.display_name || profile.full_name || profile.username || "Admin";

    const pRoleNorm = (profile.role || "").toLowerCase().replace(/[\s_]+/g, "");
    if (pRoleNorm === "ceo") return "CEO";
    if (pRoleNorm === "superadmin") return "Super Admin";
    if (pRoleNorm === "jobadmin") return "Job Admin";
    return "Admin";
  }

  // Hide / Unhide
  const handleToggleHide = async (company: any) => {
    if (!company.id) {
      alert("This company was auto-detected from a job post. Visibility can be managed through the job itself.");
      return;
    }

    const msg = !company.is_active
      ? "Unhide this company? It will become visible in public listings again."
      : "Hide this company? Existing job records will not be deleted.";

    if (confirm(msg)) {
      const { error } = await supabase
        .from("companies")
        .update({ is_active: !company.is_active })
        .eq("id", company.id);

      if (!error) {
        fetchCompaniesData();
      } else {
        alert("Error updating visibility: " + error.message);
      }
    }
  };

  // Soft-Delete (Move to 7-Day Trash)
  const handleDeleteCompany = async (company: any) => {
    if (!company.id) {
      alert("Cannot delete this company record.");
      return;
    }

    if (!confirm(`Move "${company.firm_name}" to Trash? It will be safely held in the Recycle Bin for 7 days before permanent deletion.`)) return;

    const { error } = await supabase
      .from("companies")
      .update({
        status: "trash",
        is_active: false,
        deleted_at: new Date().toISOString(),
        deleted_by: currentUser?.id || null,
      })
      .eq("id", company.id);

    if (!error) {
      showToast(`Studio "${company.firm_name}" moved to Trash.`);
      fetchCompaniesData();
    } else {
      alert("Error moving company to Trash: " + error.message);
    }
  };

  const handleRestoreCompany = async (company: any) => {
    const { error } = await supabase
      .from("companies")
      .update({
        status: "published",
        is_active: true,
        deleted_at: null,
        deleted_by: null,
      })
      .eq("id", company.id);

    if (!error) {
      showToast(`Studio "${company.firm_name}" restored to active directory.`);
      fetchCompaniesData();
    } else {
      alert("Error restoring company: " + error.message);
    }
  };

  const handlePermanentDeleteCompany = async (company: any) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete "${company.firm_name}"? This action cannot be undone.`)) return;
    const { error } = await supabase.from("companies").delete().eq("id", company.id);
    if (!error) {
      showToast(`Studio "${company.firm_name}" permanently deleted.`);
      fetchCompaniesData();
    } else {
      alert("Error permanently deleting: " + error.message);
    }
  };

  const handleMergeStudios = async () => {
    if (!mergeSourceId || !mergeTargetId || mergeSourceId === mergeTargetId) {
      alert("Please select two distinct studios to merge.");
      return;
    }
    const source = companies.find((c) => c.id === mergeSourceId);
    const target = companies.find((c) => c.id === mergeTargetId);
    if (!source || !target) return;

    if (!confirm(`Merge "${source.firm_name}" into "${target.firm_name}"?\n\nAll associated jobs will be reassigned to "${target.firm_name}" and the duplicate "${source.firm_name}" will be deleted.`)) return;

    try {
      // 1. Move all jobs
      const { error: jobErr } = await supabase
        .from("jobs")
        .update({
          company_id: target.id,
          firm_name: target.firm_name,
        })
        .or(`company_id.eq.${source.id},firm_name.eq.${source.firm_name}`);

      if (jobErr) console.warn("Job merge update warning:", jobErr.message);

      // 2. Delete source duplicate
      const { error: compErr } = await supabase.from("companies").delete().eq("id", source.id);
      if (compErr) throw compErr;

      showToast(`Successfully merged "${source.firm_name}" into "${target.firm_name}"!`);
      setIsMergeModalOpen(false);
      setMergeSourceId("");
      setMergeTargetId("");
      fetchCompaniesData();
    } catch (err: any) {
      alert("Failed to merge studios: " + (err.message || "Unknown error"));
    }
  };

  // Badges & VIP Controls
  const handleToggleBadge = async (companyId: string, field: "is_claimed" | "email_verified" | "phone_verified", currentVal: boolean) => {
    const newVal = !currentVal;
    try {
      let payload: any = { [field]: newVal, updated_at: new Date().toISOString() };
      if (field === "email_verified") {
        payload.is_verified = newVal;
      }

      let { error } = await supabase
        .from("companies")
        .update(payload)
        .eq("id", companyId);

      // Graceful fallback if custom column is not yet migrated in Supabase
      if (error && error.message.includes("schema cache")) {
        if (field === "email_verified") {
          const fb = await supabase.from("companies").update({ is_verified: newVal }).eq("id", companyId);
          error = fb.error;
        } else {
          alert("Notice: Please run the SQL migration in your Supabase SQL Editor to enable " + field);
          return;
        }
      }

      if (error) throw error;

      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, [field]: newVal, ...(field === "email_verified" ? { is_verified: newVal } : {}) } : c))
      );
      showToast("Studio badge updated successfully.");
    } catch (err: any) {
      alert("Failed to update badge: " + err.message);
    }
  };

  // VIP Badge toggle for Diamond level studios
  const handleToggleVip = async (companyId: string, currentVal: boolean) => {
    const newVal = !currentVal;
    try {
      const { error } = await supabase
        .from("companies")
        .update({ is_vip: newVal, updated_at: new Date().toISOString() })
        .eq("id", companyId);

      if (error) {
        if (error.message.includes("is_vip") || error.message.includes("schema cache")) {
          alert("Notice: The 'is_vip' column is not yet in your Supabase schema. Please run the SQL migration snippet in your Supabase SQL Editor to enable VIP storage.");
          return;
        }
        throw error;
      }

      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, is_vip: newVal } : c))
      );
      showToast(newVal ? "⭐ VIP Badge granted to studio!" : "VIP Badge removed.");
    } catch (err: any) {
      alert("Failed to toggle VIP badge: " + err.message);
    }
  };

  // Claims Approval
  const handleApproveClaim = async (claim: any) => {
    try {
      const { error: claimErr } = await supabase
        .from("company_claim_requests")
        .update({
          status: "approved",
          reviewed_by: currentUser?.id || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", claim.id);

      if (claimErr) throw claimErr;

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
      await fetchCompaniesData();
      showToast("Claim approved! Studio is now marked Claimed & Gold Level.");
    } catch (err: any) {
      alert("Error approving claim: " + err.message);
    }
  };

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

  // New Studio Submission Verification (Approve / Reject)
  const handleApproveSubmission = async (comp: any) => {
    try {
      const { error } = await supabase
        .from("companies")
        .update({
          status: "published",
          is_active: true,
          is_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", comp.id);

      if (error) throw error;

      showToast(`Studio "${comp.firm_name}" approved and published live!`);
      await fetchCompaniesData();
    } catch (err: any) {
      alert("Failed to approve studio: " + err.message);
    }
  };

  const handleRejectSubmission = async (comp: any) => {
    if (!confirm(`Reject studio submission for "${comp.firm_name}"?`)) return;
    try {
      const { error } = await supabase
        .from("companies")
        .update({
          status: "rejected",
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", comp.id);

      if (error) throw error;

      showToast(`Studio "${comp.firm_name}" marked rejected.`);
      await fetchCompaniesData();
    } catch (err: any) {
      alert("Failed to reject submission: " + err.message);
    }
  };

  // Counters
  const pendingClaimsCount = useMemo(() => {
    return claims.filter((c) => c.status === "pending").length;
  }, [claims]);

  const pendingSubmissions = useMemo(() => {
    return companies.filter((c) => c.status === "pending_verification");
  }, [companies]);

  const myMissingLogosCount = useMemo(() => {
    if (!currentUser) return 0;
    const myUid = currentUser.id;
    const myUsername = currentUser.username;
    return companies.filter((c) => {
      const isMissing = !c.logo_url || c.logo_url.trim() === "";
      if (!isMissing) return false;
      return (
        (myUid && c.created_by === myUid) ||
        (myUsername && c.creatorProfile?.username === myUsername)
      );
    }).length;
  }, [companies, currentUser]);

  // Filtered for Tab 1 (All Companies)
  const filteredCompaniesTab1 = useMemo(() => {
    let list = [...companies].filter((c) => c.status !== "pending_verification" && c.status !== "trash");

    if (filterMode === "missing-logo") {
      list = list.filter((c) => {
        const isMissing = !c.logo_url || c.logo_url.trim() === "";
        if (!isMissing) return false;
        return (
          (currentUser?.id && c.created_by === currentUser.id) ||
          (currentUser?.username && c.creatorProfile?.username === currentUser.username)
        );
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          (c.firm_name && c.firm_name.toLowerCase().includes(q)) ||
          (c.city && c.city.toLowerCase().includes(q)) ||
          (c.state && c.state.toLowerCase().includes(q))
      );
    }

    return list;
  }, [companies, filterMode, searchQuery, currentUser]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getSortedCompanies = (list: any[]) => {
    return [...list].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "created_by") {
        valA = resolveCreatedBy(a);
        valB = resolveCreatedBy(b);
      } else if (sortField === "created_at") {
        valA = a.created_at ? new Date(a.created_at).getTime() : 0;
        valB = b.created_at ? new Date(b.created_at).getTime() : 0;
      } else if (sortField === "updated_by") {
        valA = resolveModifiedBy(a);
        valB = resolveModifiedBy(b);
      } else if (sortField === "updated_at") {
        valA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        valB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      } else if (sortField === "location") {
        valA = [a.city, a.state].filter(Boolean).join(", ") || "";
        valB = [b.city, b.state].filter(Boolean).join(", ") || "";
      } else if (sortField === "jobs") {
        valA = a.totalJobs || 0;
        valB = b.totalJobs || 0;
      }

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortedCompanies = getSortedCompanies(filteredCompaniesTab1);
  const totalPages = Math.ceil(sortedCompanies.length / itemsPerPage);
  const currentCompanies = sortedCompanies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Filtered for Tab 2 (Badges)
  const filteredBadgesCompanies = useMemo(() => {
    return companies
      .filter((c) => c.status !== "pending_verification" && c.status !== "trash")
      .filter((c) => {
        const matchesSearch =
          !badgesSearch ||
          c.firm_name?.toLowerCase().includes(badgesSearch.toLowerCase()) ||
          c.city?.toLowerCase().includes(badgesSearch.toLowerCase());

        const level = calculateCompanyLevel(c);
        const matchesTier = tierFilter === "all" || level.tier === tierFilter;

        let matchesStatus = true;
        if (statusFilter === "claimed") matchesStatus = Boolean(c.is_claimed);
        else if (statusFilter === "unclaimed") matchesStatus = !c.is_claimed;
        else if (statusFilter === "email_verified") matchesStatus = Boolean(c.email_verified || c.is_verified);
        else if (statusFilter === "phone_verified") matchesStatus = Boolean(c.phone_verified);

        return matchesSearch && matchesTier && matchesStatus;
      });
  }, [companies, badgesSearch, tierFilter, statusFilter]);

  // Tab 2, 3, 4 Slicing & Pagination
  const totalBadgesPages = Math.ceil(filteredBadgesCompanies.length / badgesPerPage);
  const paginatedBadgesCompanies = useMemo(() => {
    return filteredBadgesCompanies.slice(
      (badgesPage - 1) * badgesPerPage,
      badgesPage * badgesPerPage
    );
  }, [filteredBadgesCompanies, badgesPage, badgesPerPage]);

  const totalClaimsPages = Math.ceil(claims.length / claimsPerPage);
  const paginatedClaims = useMemo(() => {
    return claims.slice(
      (claimsPage - 1) * claimsPerPage,
      claimsPage * claimsPerPage
    );
  }, [claims, claimsPage, claimsPerPage]);

  const totalSubmissionsPages = Math.ceil(pendingSubmissions.length / submissionsPerPage);
  const paginatedSubmissions = useMemo(() => {
    return pendingSubmissions.slice(
      (submissionsPage - 1) * submissionsPerPage,
      submissionsPage * submissionsPerPage
    );
  }, [pendingSubmissions, submissionsPage, submissionsPerPage]);

  const trashCompanies = useMemo(() => {
    return companies.filter((c) => c.status === "trash");
  }, [companies]);

  const totalTrashPages = Math.ceil(trashCompanies.length / trashPerPage);
  const paginatedTrashCompanies = useMemo(() => {
    return trashCompanies.slice(
      (trashPage - 1) * trashPerPage,
      trashPage * trashPerPage
    );
  }, [trashCompanies, trashPage, trashPerPage]);

  const tierColors: Record<string, { bg: string; text: string; icon: string }> = {
    bronze: { bg: "bg-amber-100", text: "text-amber-800", icon: "🥉" },
    silver: { bg: "bg-slate-200", text: "text-slate-800", icon: "🥈" },
    gold: { bg: "bg-yellow-200", text: "text-yellow-800", icon: "🥇" },
    platinum: { bg: "bg-cyan-100", text: "text-cyan-800", icon: "💎" },
    diamond: { bg: "bg-purple-200", text: "text-purple-900", icon: "👑" },
  };

  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col">
      <Navbar />

      <section className="flex-1 w-full px-6 lg:px-12 py-10 max-w-[1400px] mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Manage Companies
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Oversee the architecture practice directory, assign studio levels, approve claim requests, and review new submissions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMergeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              title="Merge duplicate studios into a single master profile"
            >
              <span>🔀 Merge Studios</span>
            </button>
            <Link
              href="/companies/new"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Building2 size={14} />
              <span>+ Add / Register Studio</span>
            </Link>
            <AdminQuickMenu />
          </div>
        </div>

        {/* TOAST MESSAGE */}
        {toastMessage && (
          <div className="mb-6 bg-gray-900 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg animate-in fade-in duration-150">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-2xl text-sm">
            {error}
          </div>
        )}

        {/* 4 MAIN TABS */}
        <div className="flex items-center gap-2 border-b border-gray-200 mb-8 overflow-x-auto pb-px">
          <button
            onClick={() => handleTabSwitch("all")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeMainTab === "all"
                ? "border-black text-black font-extrabold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Building2 size={16} />
            <span>All Companies ({companies.length - pendingSubmissions.length})</span>
          </button>

          <button
            onClick={() => handleTabSwitch("badges")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeMainTab === "badges"
                ? "border-black text-black font-extrabold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Award size={16} />
            <span>Studio Levels & Badges</span>
          </button>

          <button
            onClick={() => handleTabSwitch("claims")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeMainTab === "claims"
                ? "border-black text-black font-extrabold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Clock size={16} />
            <span>Claim Requests Queue</span>
            {pendingClaimsCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-2 py-0.5 rounded-full">
                {pendingClaimsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabSwitch("submissions")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeMainTab === "submissions"
                ? "border-black text-black font-extrabold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Sparkles size={16} />
            <span>New Studio Submissions</span>
            {pendingSubmissions.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-extrabold px-2 py-0.5 rounded-full">
                {pendingSubmissions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabSwitch("trash")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeMainTab === "trash"
                ? "border-red-600 text-red-600 font-extrabold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Trash2 size={16} />
            <span>Recycle Bin ({trashCompanies.length})</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ALL COMPANIES (DIRECTORY TABLE)                    */}
        {/* ======================================================== */}
        {activeMainTab === "all" && (
          <div>
            {/* Filter Controls: All Companies vs My Companies Missing Logo + Search */}
            <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setFilterMode("all");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    filterMode === "all"
                      ? "bg-black text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Active Companies ({companies.length - pendingSubmissions.length})
                </button>

                <button
                  onClick={() => {
                    setFilterMode("missing-logo");
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    filterMode === "missing-logo"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  <span>⚠️ My Missing Logos</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    filterMode === "missing-logo" ? "bg-white text-amber-800" : "bg-amber-200 text-amber-900"
                  }`}>
                    {myMissingLogosCount}
                  </span>
                </button>
              </div>

              {/* Search box */}
              <div className="relative min-w-[240px] max-w-sm flex-1 sm:flex-initial">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search companies by name or city..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Active missing logo banner */}
            {filterMode === "missing-logo" && (
              <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-900 px-5 py-3.5 rounded-2xl text-sm flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <AlertCircle size={18} className="text-amber-600 shrink-0" />
                  <span>
                    <strong>Filter Active:</strong> Showing {filteredCompaniesTab1.length} {filteredCompaniesTab1.length === 1 ? "company" : "companies"} created by you that are missing logos. Click <strong>Edit (✎)</strong> to upload a logo.
                  </span>
                </div>
                <button
                  onClick={() => setFilterMode("all")}
                  className="text-xs font-bold text-amber-900 px-3 py-1.5 bg-white hover:bg-amber-100/50 rounded-xl border border-amber-300 transition cursor-pointer"
                >
                  Show All Companies
                </button>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[1000px]">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("firm_name")}>
                        Company {sortField === "firm_name" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("location")}>
                        Location {sortField === "location" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("created_by")}>
                        Created By {sortField === "created_by" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("created_at")}>
                        Created On {sortField === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("updated_by")}>
                        Modified By {sortField === "updated_by" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("updated_at")}>
                        Modified On {sortField === "updated_at" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("jobs")}>
                        Jobs (Total / Active) {sortField === "jobs" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-6 py-4">Visibility</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                          Loading companies...
                        </td>
                      </tr>
                    ) : currentCompanies.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                          No companies found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      currentCompanies.map((c: any) => (
                        <tr key={c.firm_name} className="hover:bg-gray-50/70 transition">
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                                {c.logo_url ? (
                                  <img src={c.logo_url} alt={c.firm_name} className="w-full h-full object-cover" />
                                ) : (
                                  <Building2 size={16} className="text-gray-400" />
                                )}
                              </div>
                              <div>
                                <span>{c.firm_name}</span>
                                <span className="block text-[11px] font-normal text-gray-500">
                                  {c.organization_type || "Architecture Firm"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {[c.city, c.state].filter(Boolean).join(", ") || "--"}
                          </td>
                          <td className="px-6 py-4 text-gray-600">{resolveCreatedBy(c)}</td>
                          <td className="px-6 py-4 text-gray-600">{formatDate(c.created_at)}</td>
                          <td className="px-6 py-4 text-gray-600">{resolveModifiedBy(c)}</td>
                          <td className="px-6 py-4 text-gray-600">{formatDate(c.updated_at)}</td>
                          <td className="px-6 py-4 text-gray-700 font-medium">
                            {c.totalJobs} / <span className="text-emerald-600 font-bold">{c.activeJobs}</span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleHide(c)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                                c.is_active !== false
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-gray-100 text-gray-500 border border-gray-200"
                              }`}
                            >
                              {c.is_active !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                              <span>{c.is_active !== false ? "Visible" : "Hidden"}</span>
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {c.slug && (
                                <Link
                                  href={`/companies/${c.slug}`}
                                  target="_blank"
                                  className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition"
                                  title="View Live Page"
                                >
                                  <ExternalLink size={15} />
                                </Link>
                              )}
                              <Link
                                href={`/admin/companies/edit/${c.id || "new"}?name=${encodeURIComponent(c.firm_name)}`}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                                title="Edit Company"
                              >
                                <Edit2 size={15} />
                              </Link>
                              <button
                                onClick={() => handleDeleteCompany(c)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Delete Company"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={sortedCompanies.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              pageSizeOptions={[20, 50, 100]}
              itemLabel="companies"
              className="mt-6"
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: STUDIO LEVELS & BADGES                             */}
        {/* ======================================================== */}
        {activeMainTab === "badges" && (
          <div>
            {/* Filter controls */}
            <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px] max-w-sm">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search studios..."
                    value={badgesSearch}
                    onChange={(e) => {
                      setBadgesSearch(e.target.value);
                      setBadgesPage(1);
                    }}
                    className="w-full pl-10 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition"
                  />
                </div>

                <select
                  value={tierFilter}
                  onChange={(e) => {
                    setTierFilter(e.target.value);
                    setBadgesPage(1);
                  }}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">All Tiers (Bronze–Diamond)</option>
                  <option value="bronze">Bronze Level</option>
                  <option value="silver">Silver Level</option>
                  <option value="gold">Gold Level</option>
                  <option value="platinum">Platinum Level</option>
                  <option value="diamond">Diamond Level</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setBadgesPage(1);
                  }}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">All Badges</option>
                  <option value="claimed">Claimed Studios Only</option>
                  <option value="unclaimed">Unclaimed Studios</option>
                  <option value="email_verified">Email Verified Only</option>
                  <option value="phone_verified">Phone Verified Only</option>
                </select>
              </div>

              <div className="text-xs text-gray-500 font-semibold">
                Showing {filteredBadgesCompanies.length} of {companies.length} studios
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Studio / Practice</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Studio Level</th>
                      <th className="px-6 py-4 text-center">Claimed</th>
                      <th className="px-6 py-4 text-center">Email Verified</th>
                      <th className="px-6 py-4 text-center">Phone Verified</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                    {paginatedBadgesCompanies.map((c: any) => {
                      const tier = (c.badge_tier || "bronze").toLowerCase();
                      const tierStyle = tierColors[tier] || tierColors.bronze;

                      return (
                        <tr key={c.id || c.firm_name} className="hover:bg-gray-50/70 transition">
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                                {c.logo_url ? (
                                  <img src={c.logo_url} alt={c.firm_name} className="w-full h-full object-cover" />
                                ) : (
                                  <Building2 size={16} className="text-gray-400" />
                                )}
                              </div>
                              <div>
                                <span>{c.firm_name}</span>
                                {c.slug && (
                                  <span className="block text-[11px] text-gray-400 font-normal">
                                    /companies/{c.slug}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {[c.city, c.state].filter(Boolean).join(", ") || "--"}
                          </td>

                          {/* AUTOMATIC STUDIO LEVEL & VIP TOGGLE */}
                          <td className="px-6 py-4">
                            {(() => {
                              const level = calculateCompanyLevel(c);
                              return (
                                <div className="flex flex-col gap-1 items-start">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${level.bg} ${level.text} ${level.border}`}
                                    title={`Profile Completion: ${level.score}% (${level.missingFields.length ? "Missing: " + level.missingFields.slice(0, 3).join(", ") : "Complete profile"})`}
                                  >
                                    <span>{level.icon}</span>
                                    <span>{level.label}</span>
                                    <span className="text-[10px] opacity-75 font-semibold">({level.score}%)</span>
                                  </span>

                                  {/* VIP Badge Option: Only available when Diamond Level */}
                                  {level.tier === "diamond" && (
                                    <button
                                      onClick={() => handleToggleVip(c.id, Boolean(c.is_vip))}
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer border ${
                                        c.is_vip
                                          ? "bg-amber-100 text-amber-900 border-amber-300 shadow-xs"
                                          : "bg-white hover:bg-amber-50 text-amber-700 border-amber-300"
                                      }`}
                                      title={c.is_vip ? "VIP Active (Click to toggle)" : "Click to grant VIP Badge to this Diamond Studio"}
                                    >
                                      <span>⭐</span>
                                      <span>{c.is_vip ? "VIP Active" : "Grant VIP"}</span>
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                          </td>

                          {/* BADGE TOGGLES */}
                          <td className="px-6 py-4 text-center">
                            {c.id ? (
                              <button
                                onClick={() => handleToggleBadge(c.id, "is_claimed", Boolean(c.is_claimed))}
                                className={`px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                                  c.is_claimed
                                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                                    : "bg-gray-100 text-gray-400 border border-gray-200"
                                }`}
                              >
                                {c.is_claimed ? "✓ Claimed" : "Unclaimed"}
                              </button>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-center">
                            {c.id ? (
                              <button
                                onClick={() => handleToggleBadge(c.id, "email_verified", Boolean(c.email_verified || c.is_verified))}
                                className={`px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                                  c.email_verified || c.is_verified
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                    : "bg-gray-100 text-gray-400 border border-gray-200"
                                }`}
                              >
                                {c.email_verified || c.is_verified ? "✓ Verified" : "Unverified"}
                              </button>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-center">
                            {c.id ? (
                              <button
                                onClick={() => handleToggleBadge(c.id, "phone_verified", Boolean(c.phone_verified))}
                                className={`px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                                  c.phone_verified
                                    ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                                    : "bg-gray-100 text-gray-400 border border-gray-200"
                                }`}
                              >
                                {c.phone_verified ? "✓ Verified" : "Unverified"}
                              </button>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/admin/companies/edit/${c.id || "new"}?name=${encodeURIComponent(c.firm_name)}`}
                              className="text-xs font-bold text-gray-600 hover:text-black flex items-center justify-end gap-1 hover:underline"
                            >
                              <Edit size={13} />
                              <span>Edit Studio</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            <PaginationControls
              currentPage={badgesPage}
              totalPages={totalBadgesPages}
              itemsPerPage={badgesPerPage}
              totalItems={filteredBadgesCompanies.length}
              onPageChange={setBadgesPage}
              onItemsPerPageChange={setBadgesPerPage}
              pageSizeOptions={[20, 50, 100]}
              itemLabel="studios"
              className="mt-6"
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: CLAIM REQUESTS QUEUE                              */}
        {/* ======================================================== */}
        {activeMainTab === "claims" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  Studio Claim Requests Queue
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Review claims submitted by architects and practice representatives claiming existing directory listings.
                </p>
              </div>
              <button
                onClick={fetchClaimsData}
                className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <RefreshCw size={13} className={claimsLoading ? "animate-spin" : ""} />
                <span>Refresh Claims</span>
              </button>
            </div>

            {claims.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
                <Clock size={40} className="text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">No Claim Requests in Queue</h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                  When representatives click &quot;Claim this Studio&quot; on public pages, their verification details will appear here for 1-click review.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedClaims.map((claim: any) => {
                    const isPending = claim.status === "pending";

                  return (
                    <div
                      key={claim.id}
                      className={`bg-white rounded-3xl p-6 border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs ${
                        isPending ? "border-amber-200 bg-amber-50/20" : "border-gray-200"
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-extrabold text-gray-900">
                            {claim.company_name}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                              claim.status === "approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : claim.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {claim.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1.5 text-xs text-gray-600">
                          <div>
                            <span className="font-semibold text-gray-400 block">Requester:</span>
                            <span className="font-bold text-gray-900">{claim.requester_name || "—"}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-400 block">Work Email:</span>
                            <a href={`mailto:${claim.work_email}`} className="text-blue-600 hover:underline">
                              {claim.work_email}
                            </a>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-400 block">Phone:</span>
                            <span>{claim.phone_number || "—"}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-400 block">Designation:</span>
                            <span className="font-bold text-gray-800">{claim.designation || "Representative"}</span>
                          </div>
                        </div>

                        {claim.verification_notes && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200/70 text-xs text-gray-700">
                            <span className="font-bold text-gray-500 block text-[10px] uppercase tracking-wider mb-0.5">
                              Verification Notes:
                            </span>
                            <p>{claim.verification_notes}</p>
                          </div>
                        )}
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleApproveClaim(claim)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <CheckCircle2 size={14} />
                              <span>Approve & Verify</span>
                            </button>
                            <button
                              onClick={() => handleRejectClaim(claim.id)}
                              className="px-3 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Reviewed on {formatDate(claim.reviewed_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              <PaginationControls
                currentPage={claimsPage}
                totalPages={totalClaimsPages}
                itemsPerPage={claimsPerPage}
                totalItems={claims.length}
                onPageChange={setClaimsPage}
                onItemsPerPageChange={setClaimsPerPage}
                pageSizeOptions={[20, 50, 100]}
                itemLabel="claim requests"
                className="mt-6"
              />
            </>
          )}
        </div>
      )}

        {/* ======================================================== */}
        {/* TAB 4: NEW STUDIO SUBMISSIONS (VERIFICATION QUEUE)       */}
        {/* ======================================================== */}
        {activeMainTab === "submissions" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  New Studio Submissions Queue
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Practices submitted from &quot;Register your Practice&quot; awaiting administrative review before being published.
                </p>
              </div>
              <button
                onClick={fetchCompaniesData}
                className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span>Refresh Queue</span>
              </button>
            </div>

            {pendingSubmissions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
                <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">All Studio Submissions Reviewed!</h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                  There are no pending new studio profiles waiting for verification. When an architect submits via &quot;Register your Practice&quot;, it will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedSubmissions.map((comp: any) => (
                  <div
                    key={comp.id}
                    className="bg-white rounded-3xl p-6 border border-blue-200 bg-blue-50/15 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                        {comp.logo_url ? (
                          <img src={comp.logo_url} alt={comp.firm_name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 size={24} className="text-gray-400" />
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-extrabold text-gray-900 leading-tight">
                            {comp.firm_name}
                          </h3>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Pending Verification
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                          <span className="font-semibold text-gray-800">{comp.organization_type}</span>
                          <span>•</span>
                          <span>{[comp.city, comp.state].filter(Boolean).join(", ") || "Location not set"}</span>
                          {comp.website && (
                            <>
                              <span>•</span>
                              <a
                                href={comp.website.startsWith("http") ? comp.website : `https://${comp.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <span>Website</span>
                                <ExternalLink size={10} />
                              </a>
                            </>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 pt-1 flex flex-wrap gap-4">
                          <span>Submitter Email: <strong className="text-gray-800">{comp.email || comp.contact_email || "—"}</strong></span>
                          {comp.phone && <span>Phone: <strong className="text-gray-800">{comp.phone}</strong></span>}
                          {comp.principal_architect && <span>Principal: <strong className="text-gray-800">{comp.principal_architect}</strong></span>}
                        </div>

                        {comp.company_description && (
                          <p className="text-xs text-gray-600 line-clamp-2 mt-2 bg-white/70 p-2.5 rounded-xl border border-gray-200/60 leading-relaxed">
                            {comp.company_description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* APPROVAL / REJECTION BUTTONS */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveSubmission(comp)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                        <span>Approve & Publish</span>
                      </button>

                      <Link
                        href={`/admin/companies/edit/${comp.id}?ai=true`}
                        className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-2xs"
                      >
                        <Edit2 size={13} />
                        <span>Edit & Enrich</span>
                      </Link>

                      <button
                        onClick={() => handleRejectSubmission(comp)}
                        className="px-3 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <PaginationControls
                currentPage={submissionsPage}
                totalPages={totalSubmissionsPages}
                itemsPerPage={submissionsPerPage}
                totalItems={pendingSubmissions.length}
                onPageChange={setSubmissionsPage}
                onItemsPerPageChange={setSubmissionsPerPage}
                pageSizeOptions={[20, 50, 100]}
                itemLabel="submissions"
                className="mt-6"
              />
            </>
          )}
        </div>
      )}
        {/* ======================================================== */}
        {/* TAB 5: RECYCLE BIN (7-DAY TRASH)                         */}
        {/* ======================================================== */}
        {activeMainTab === "trash" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  Studios Recycle Bin (7-Day Trash)
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Deleted studios are kept here for 7 days before permanent deletion. You can restore them anytime.
                </p>
              </div>
            </div>

            {trashCompanies.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
                <Trash2 size={40} className="text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">Recycle Bin is Empty</h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                  No studios currently in trash. When you delete a studio, it will appear here safely for 7 days.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedTrashCompanies.map((comp: any) => {
                    const deletedDate = comp.deleted_at ? new Date(comp.deleted_at) : new Date();
                    const daysRemaining = Math.max(
                      0,
                      7 - Math.floor((Date.now() - deletedDate.getTime()) / (1000 * 60 * 60 * 24))
                    );

                    return (
                      <div
                        key={comp.id}
                        className="bg-white rounded-3xl p-6 border border-red-200 bg-red-50/15 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                            {comp.logo_url ? (
                              <img src={comp.logo_url} alt={comp.firm_name} className="w-full h-full object-cover" />
                            ) : (
                              <Building2 size={20} className="text-gray-400" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-extrabold text-gray-900">
                                {comp.firm_name}
                              </h3>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                                {daysRemaining} days left before auto-purge
                              </span>
                            </div>

                            <p className="text-xs text-gray-500">
                              {[comp.city, comp.state].filter(Boolean).join(", ") || "Location not set"} • Deleted on {formatDate(comp.deleted_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleRestoreCompany(comp)}
                            className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <RefreshCw size={13} />
                            <span>Restore Studio</span>
                          </button>
                          <button
                            onClick={() => handlePermanentDeleteCompany(comp)}
                            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 size={13} />
                            <span>Delete Permanently</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <PaginationControls
                  currentPage={trashPage}
                  totalPages={totalTrashPages}
                  itemsPerPage={trashPerPage}
                  totalItems={trashCompanies.length}
                  onPageChange={setTrashPage}
                  onItemsPerPageChange={setTrashPerPage}
                  pageSizeOptions={[20, 50, 100]}
                  itemLabel="studios in trash"
                  className="mt-6"
                />
              </>
            )}
          </div>
        )}

        {/* MERGE STUDIOS MODAL */}
        {isMergeModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-extrabold text-gray-900">🔀 Merge Duplicate Studios</h3>
                <button
                  onClick={() => setIsMergeModalOpen(false)}
                  className="text-gray-400 hover:text-black p-1 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
                Combine two duplicate studio profiles into one. All job posts attached to the duplicate studio will be safely reassigned to the master profile.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1.5">
                    1. Duplicate Studio to Remove (Jobs will be moved)
                  </label>
                  <select
                    value={mergeSourceId}
                    onChange={(e) => setMergeSourceId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">-- Select Duplicate Studio --</option>
                    {companies
                      .filter((c) => c.status !== "trash")
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.firm_name} ({[c.city, c.state].filter(Boolean).join(", ") || "No location"}) [ID: {c.id}]
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1.5">
                    2. Master Studio to Keep (Receives all jobs)
                  </label>
                  <select
                    value={mergeTargetId}
                    onChange={(e) => setMergeTargetId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">-- Select Master Studio to Keep --</option>
                    {companies
                      .filter((c) => c.status !== "trash" && c.id !== mergeSourceId)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.firm_name} ({[c.city, c.state].filter(Boolean).join(", ") || "No location"}) [ID: {c.id}]
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleMergeStudios}
                  disabled={!mergeSourceId || !mergeTargetId}
                  className="flex-1 py-3 px-4 bg-black hover:bg-gray-800 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  Confirm & Merge Studios
                </button>
                <button
                  onClick={() => setIsMergeModalOpen(false)}
                  className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

export default function AdminCompaniesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 font-bold">Loading Manage Companies...</div>}>
      <AdminCompaniesContent />
    </Suspense>
  );
}
