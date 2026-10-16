"use client";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import React, { Suspense, useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/utils/formatDate";
import { Edit2, EyeOff, Eye, Trash2, Search, X, AlertCircle } from "lucide-react";

function AdminCompaniesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlFilter = searchParams.get("filter");

  const [companies, setCompanies] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [filterMode, setFilterMode] = useState<"all" | "missing-logo">(
    urlFilter === "missing-logo" ? "missing-logo" : "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [sortField, setSortField] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (urlFilter === "missing-logo") {
      setFilterMode("missing-logo");
      setCurrentPage(1);
    }
  }, [urlFilter]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!user) {
      router.push("/");
      return;
    }
    setCurrentUser(user);
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      // ── Step 1: Fetch the companies table ──────────────────
      const { data: companiesData, error: compErr } = await supabase
        .from("companies")
        .select("*");

      if (compErr) {
        console.warn("companies table error:", compErr.message);
      }

      // ── Step 2: Fetch jobs ──────────────────────────────────
      const { data: jobsData, error: jobsErr } = await supabase
        .from("jobs")
        .select("id, firm_name, company_id, city, state, organization_type, status, posted_date, author_id");

      if (jobsErr) {
        console.warn("jobs table error:", jobsErr.message);
      }

      // ── Step 3: Fetch profiles ──────────────────────────────
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name, full_name, username, role");

      const profilesMap: Record<string, any> = {};
      if (profilesData) {
        profilesData.forEach((p) => {
          profilesMap[p.id] = p;
        });
      }

      // ── Step 4: Build grouped company map ───────────────────
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

          if (!grouped[name]) {
            grouped[name] = {
              id: null,
              firm_name: name,
              city: job.city || "",
              state: job.state || "",
              organization_type: job.organization_type || "Architecture Firm",
              is_active: false,
              created_by: job.author_id,
              created_at: job.posted_date,
              logo_url: null,
              creatorProfile: job.author_id ? profilesMap[job.author_id] : null,
              totalJobs: 0,
              activeJobs: 0,
              isFromCompaniesTable: false,
            };
          }

          grouped[name].totalJobs += 1;
          if (job.status === "published") {
            grouped[name].activeJobs += 1;
          }
        });
      }

      const result = Object.values(grouped);
      setCompanies(result);
    } catch (err: any) {
      console.error("fetchCompanies error:", err);
      setError("Failed to load companies: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Helper: decide what to show in "Modified By" column
  function resolveModifiedBy(company: any): string {
    const profile = company.modifierProfile;
    if (!profile) return "--";
    return profile.display_name || profile.full_name || profile.username || "--";
  }

  // Helper: decide what to show in "Created By" column
  function resolveCreatedBy(company: any): string {
    const profile = company.creatorProfile;
    if (!profile) return "—";

    const myRoleNorm = (currentUser?.role || "").toLowerCase().replace(/[\s_]+/g, "");

    if (myRoleNorm === "ceo") {
      return profile.display_name || profile.full_name || profile.username || "Admin";
    }

    if (currentUser?.username && profile.username === currentUser.username) {
      return profile.display_name || profile.full_name || profile.username || "Admin";
    }

    const pRoleNorm = (profile.role || "").toLowerCase().replace(/[\s_]+/g, "");
    if (pRoleNorm === "ceo") return "CEO";
    if (pRoleNorm === "superadmin") return "Super Admin";
    if (pRoleNorm === "jobadmin") return "Job Admin";
    return "Admin";
  }

  const handleDeleteCompany = async (company: any) => {
    if (company.totalJobs > 0 || company.activeJobs > 0) {
      alert("Warning: this company has a job published. Delete the job before, or hide the company from public.");
      return;
    }
    if (!company.id || !company.isFromCompaniesTable) {
      alert("This company is auto-detected from a job and doesn't have a database record. Delete the jobs to remove it.");
      return;
    }
    if (confirm("Are you sure you want to delete this company?")) {
      const { error } = await supabase.from("companies").delete().eq("id", company.id);
      if (!error) {
        fetchCompanies();
      } else {
        alert("Error deleting company: " + error.message);
      }
    }
  };

  const handleHideToggle = async (company: any) => {
    if (!company.isFromCompaniesTable || !company.id) {
      alert(
        "This company was auto-detected from a job post and doesn't have a separate companies record. Visibility can be managed through the job itself."
      );
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
        fetchCompanies();
      } else {
        alert("Error updating visibility: " + error.message);
      }
    }
  };

  // Count of missing logos for logged-in user
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

  // Filtered companies based on search and missing logo filter
  const filteredCompanies = useMemo(() => {
    let list = [...companies];

    // Option A: Direct filter to only logged-in user's companies that are missing logo
    if (filterMode === "missing-logo") {
      list = list.filter((c) => {
        const isMissing = !c.logo_url || c.logo_url.trim() === "";
        if (!isMissing) return false;

        const isMine =
          (currentUser?.id && c.created_by === currentUser.id) ||
          (currentUser?.username && c.creatorProfile?.username === currentUser.username);

        return isMine;
      });
    }

    // Search query
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
      if (sortField === "created_at" && a.id && b.id) {
        return a.id > b.id ? (sortOrder === "asc" ? 1 : -1) : -1;
      }
      return 0;
    });
  };

  const sortedCompanies = getSortedCompanies(filteredCompanies);
  const totalPages = Math.ceil(sortedCompanies.length / itemsPerPage);
  const currentCompanies = sortedCompanies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col">
      <Navbar />
      <section className="flex-1 w-full px-6 lg:px-12 py-10 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Companies</h1>
            <p className="text-gray-600 mt-2">Manage registered companies, uploaded logos, and visibility.</p>
          </div>
          <AdminQuickMenu />
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Filter Controls: All Companies vs My Companies Missing Logo + Search */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* All Companies Button */}
            <button
              onClick={() => {
                setFilterMode("all");
                setCurrentPage(1);
                router.push("/admin/companies");
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                filterMode === "all"
                  ? "bg-black text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Companies ({companies.length})
            </button>

            {/* My Companies Missing Logo Button */}
            <button
              onClick={() => {
                setFilterMode("missing-logo");
                setCurrentPage(1);
                router.push("/admin/companies?filter=missing-logo");
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Active missing logo banner */}
        {filterMode === "missing-logo" && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-900 px-5 py-3.5 rounded-2xl text-sm flex flex-wrap items-center justify-between gap-3 shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
              <span>
                <strong>Filter Active:</strong> Showing {filteredCompanies.length} {filteredCompanies.length === 1 ? "company" : "companies"} created by you that are missing logos. Click <strong>Edit (✎)</strong> to upload a logo.
              </span>
            </div>
            <button
              onClick={() => {
                setFilterMode("all");
                router.push("/admin/companies");
              }}
              className="text-xs font-bold text-amber-900 px-3 py-1.5 bg-white hover:bg-amber-100/50 rounded-xl border border-amber-300 transition"
            >
              Show All Companies
            </button>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort("firm_name")}>
                    Company {sortField === "firm_name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort("location")}>
                    Location {sortField === "location" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort("created_by")}>
                    Created By {sortField === "created_by" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort("created_at")}>
                    Created On {sortField === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort("updated_by")}>
                    Modified By {sortField === "updated_by" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort("updated_at")}>
                    Modified On {sortField === "updated_at" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort("jobs")}>
                    Jobs (Total / Active) {sortField === "jobs" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-4 font-semibold">Visibility</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-700 md:text-gray-400">
                      Loading companies...
                    </td>
                  </tr>
                ) : filteredCompanies.length > 0 ? (
                  currentCompanies.map((c, i) => (
                    <tr key={c.id || c.firm_name || i} className="hover:bg-gray-50 transition">
                      {/* Company */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {c.logo_url ? (
                            <img
                              src={c.logo_url}
                              alt="Logo"
                              className="w-10 h-10 object-contain rounded-md border bg-white"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-amber-50 rounded-md border border-amber-200 flex flex-col items-center justify-center text-amber-700 text-xs font-bold" title="Missing Logo">
                              <span>{(c.firm_name || "?")[0].toUpperCase()}</span>
                              <span className="text-[9px] text-amber-600 font-semibold">No logo</span>
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                              <span>{c.firm_name}</span>
                              {!c.logo_url && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                                  Missing Logo
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-700 md:text-gray-400">
                              {c.organization_type || "Architecture Firm"}
                              {!c.isFromCompaniesTable && (
                                <span className="ml-2 text-xs bg-amber-50 text-amber-600 border border-amber-200 px-1.5 rounded">
                                  auto
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 text-gray-700">
                        {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                      </td>

                      {/* Created By */}
                      <td className="px-6 py-4 text-gray-700">{resolveCreatedBy(c)}</td>

                      {/* Created On */}
                      <td className="px-6 py-4 text-gray-700">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Modified By */}
                      <td className="px-6 py-4 text-gray-700">{resolveModifiedBy(c)}</td>

                      {/* Modified On */}
                      <td className="px-6 py-4 text-gray-700">
                        {c.updated_at
                          ? new Date(c.updated_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "--"}
                      </td>

                      {/* Job counts */}
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{c.totalJobs}</span>
                        {" / "}
                        <span className="text-green-600 font-medium">{c.activeJobs} active</span>
                      </td>

                      {/* Visibility */}
                      <td className="px-6 py-4">
                        {!c.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Hidden
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Visible
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {(() => {
                            const myRoleNorm = (currentUser?.role || "").toLowerCase().replace(/[\s_]+/g, "");
                            const canDelete =
                              myRoleNorm === "ceo" ||
                              ((myRoleNorm === "superadmin" || myRoleNorm === "jobadmin") &&
                                c.created_by === currentUser?.id);
                            return canDelete ? (
                              <button
                                onClick={() => handleDeleteCompany(c)}
                                className="p-2 text-gray-800 md:text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Company"
                              >
                                <Trash2 size={18} />
                              </button>
                            ) : null;
                          })()}
                          <button
                            onClick={() =>
                              router.push(
                                `/admin/companies/edit/${c.id || "new"}?name=${encodeURIComponent(
                                  c.firm_name || ""
                                )}&city=${encodeURIComponent(c.city || "")}&state=${encodeURIComponent(
                                  c.state || ""
                                )}&cb=${c.created_by || ""}&ca=${c.created_at || ""}`
                              )
                            }
                            className={`p-2 rounded-lg transition ${
                              !c.logo_url
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                : "text-gray-800 md:text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                            }`}
                            title={!c.logo_url ? "Upload Missing Logo" : "Edit Company"}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleHideToggle(c)}
                            className={`p-2 rounded-lg transition ${
                              !c.is_active
                                ? "text-gray-800 md:text-gray-500 hover:text-green-600 hover:bg-green-50"
                                : "text-gray-800 md:text-gray-500 hover:text-red-600 hover:bg-red-50"
                            }`}
                            title={!c.is_active ? "Unhide Company" : "Hide Company"}
                          >
                            {!c.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-700 md:text-gray-400">
                      {filterMode === "missing-logo" ? (
                        <div>
                          <div className="text-2xl mb-1">🎉</div>
                          <div className="font-semibold text-gray-800">No missing logos!</div>
                          <div className="text-xs text-gray-500 mt-1">All companies created by you currently have a logo uploaded.</div>
                        </div>
                      ) : (
                        "No companies found."
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {filteredCompanies.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 bg-white p-4 rounded-3xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>Companies per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-200 rounded-lg px-2 py-1 outline-none"
              >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>

              <span className="text-sm font-medium px-4">
                Page {currentPage} of {totalPages || 1}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
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
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading companies...</div>}>
      <AdminCompaniesContent />
    </Suspense>
  );
}
