"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Edit2, EyeOff, Eye } from "lucide-react";

export default function AdminCompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      // ── Step 1: Fetch the companies table (may be empty) ──────────────────
      const { data: companiesData, error: compErr } = await supabase
        .from("companies")
        .select("*");

      if (compErr) {
        console.warn("companies table error:", compErr.message);
      }

      // ── Step 2: Fetch jobs (source of truth when companies table is empty) ─
      const { data: jobsData, error: jobsErr } = await supabase
        .from("jobs")
        .select("id, firm_name, company_id, city, state, organization_type, status, posted_date");

      if (jobsErr) {
        console.warn("jobs table error:", jobsErr.message);
      }

      // ── Step 3: Fetch profiles (for Created By) ────────────────────────────
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name, full_name, username, role");

      const profilesMap: Record<string, any> = {};
      if (profilesData) {
        profilesData.forEach((p) => {
          profilesMap[p.id] = p;
        });
      }

      // ── Step 4: Build grouped company map ─────────────────────────────────
      // Key = firm_name (company name). Companies table takes priority; jobs fill gaps.
      const grouped: Record<string, any> = {};

      // Add records from the companies table first
      if (companiesData && companiesData.length > 0) {
        companiesData.forEach((comp) => {
          if (!comp.firm_name) return;
          grouped[comp.firm_name] = {
            ...comp,
            totalJobs: 0,
            activeJobs: 0,
            creatorProfile: comp.created_by ? profilesMap[comp.created_by] : null,
            isFromCompaniesTable: true,
          };
        });
      }

      // Merge jobs: increment counts + create fallback entries for companies
      // that only exist as firm_name on jobs (companies table is empty)
      if (jobsData) {
        jobsData.forEach((job: any) => {
          const name = job.firm_name;
          if (!name) return; // skip jobs with no company name

          if (!grouped[name]) {
            // Company not in companies table — create a virtual entry from the job
            grouped[name] = {
              id: null, // no real company record
              firm_name: name,
              city: job.city || "",
              state: job.state || "",
              organization_type: job.organization_type || "Architecture Firm",
              is_hidden: false,
              created_by: null,
              created_at: job.posted_date, // best available date
              logo_url: null,
              creatorProfile: null,
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

      // Sort: published companies first, then by name
      result.sort((a: any, b: any) => {
        if (b.activeJobs !== a.activeJobs) return b.activeJobs - a.activeJobs;
        return (a.firm_name || "").localeCompare(b.firm_name || "");
      });

      setCompanies(result);
    } catch (err: any) {
      console.error("fetchCompanies error:", err);
      setError("Failed to load companies: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Helper: decide what to show in "Created By" column
  const resolveCreatedBy = (company: any): string => {
    const profile = company.creatorProfile;
    if (!profile) return "—";

    const myRoleNorm = (currentUser?.role || "").toLowerCase().replace(/[\s_]+/g, "");

    if (myRoleNorm === "ceo") {
      // CEO sees the actual name
      return profile.display_name || profile.full_name || profile.username || "Admin";
    }

    // Other admins: only see their own name, otherwise see a role label
    if (currentUser?.username && profile.username === currentUser.username) {
      return profile.display_name || profile.full_name || profile.username || "Admin";
    }

    const pRoleNorm = (profile.role || "").toLowerCase().replace(/[\s_]+/g, "");
    if (pRoleNorm === "ceo") return "CEO";
    if (pRoleNorm === "superadmin") return "Super Admin";
    return "Admin";
  };

  const handleHideToggle = async (company: any) => {
    if (!company.isFromCompaniesTable || !company.id) {
      alert(
        "This company was auto-detected from a job post and doesn't have a separate companies record. Visibility can be managed through the job itself."
      );
      return;
    }

    const action = company.is_hidden ? "Unhide" : "Hide";
    const msg = company.is_hidden
      ? "Unhide this company? It will become visible in public listings again."
      : "Hide this company? Existing job records will not be deleted.";

    if (confirm(msg)) {
      const { error } = await supabase
        .from("companies")
        .update({ is_hidden: !company.is_hidden })
        .eq("id", company.id);

      if (!error) {
        fetchCompanies();
      } else {
        alert("Error updating visibility: " + error.message);
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col">
      <Navbar />
      <section className="flex-1 w-full px-6 lg:px-12 py-10 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Companies</h1>
            <p className="text-gray-600 mt-2">Manage registered companies and their visibility.</p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition flex items-center gap-2 shrink-0"
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Company</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Created By</th>
                  <th className="px-6 py-4 font-semibold">Created On</th>
                  <th className="px-6 py-4 font-semibold">Jobs (Total / Active)</th>
                  <th className="px-6 py-4 font-semibold">Visibility</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-700 md:text-gray-400">
                      Loading companies...
                    </td>
                  </tr>
                ) : companies.length > 0 ? (
                  companies.map((c, i) => (
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
                            <div className="w-10 h-10 bg-gray-100 rounded-md border flex items-center justify-center text-gray-700 md:text-gray-400 text-xs font-bold">
                              {(c.firm_name || "?")[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900">{c.firm_name}</div>
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

                      {/* Job counts */}
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{c.totalJobs}</span>
                        {" / "}
                        <span className="text-green-600 font-medium">{c.activeJobs} active</span>
                      </td>

                      {/* Visibility */}
                      <td className="px-6 py-4">
                        {c.is_hidden ? (
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
                          <button
                            onClick={() =>
                              alert(
                                "Company editing will be available in the company edit page."
                              )
                            }
                            className="p-2 text-gray-800 md:text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Company"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleHideToggle(c)}
                            className={`p-2 rounded-lg transition ${
                              c.is_hidden
                                ? "text-gray-800 md:text-gray-500 hover:text-green-600 hover:bg-green-50"
                                : "text-gray-800 md:text-gray-500 hover:text-red-600 hover:bg-red-50"
                            }`}
                            title={c.is_hidden ? "Unhide Company" : "Hide Company"}
                          >
                            {c.is_hidden ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-700 md:text-gray-400">
                      No companies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}




