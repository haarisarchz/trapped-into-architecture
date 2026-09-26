"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { generateJobUrl } from "@/utils/jobUrl";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function AdminJobsContent() {
  const [highlightId, setHighlightId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hid = params.get("highlight");
    if (hid) {
      setHighlightId(hid);
      setTimeout(() => {
        const el = document.getElementById(`job-${hid}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
      setTimeout(() => setHighlightId(null), 4000);
    }
  }, []);


  const router = useRouter();

  const searchParams = useSearchParams();

const statusFilter = searchParams.get("status");
const typeFilter = searchParams.get("type");

    const [jobs, setJobs] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loggedProfile, setLoggedProfile] = useState<any>(null);
  const [jobToDelete, setJobToDelete] = useState<any>(null);
  
  const [sortField, setSortField] = useState<string>("posted_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => { setCurrentUser(JSON.parse(localStorage.getItem("currentUser") || "null")); }, []);

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, typeFilter]); 

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getSortedJobs = (jobsList: any[]) => {
    return [...jobsList].sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case "position":
          valA = a.position || "";
          valB = b.position || "";
          break;
        case "firm_name":
          valA = a.firm_name || "";
          valB = b.firm_name || "";
          break;
        case "id":
          valA = a.id || 0;
          valB = b.id || 0;
          break;
        case "state":
          valA = a.state || "";
          valB = b.state || "";
          break;
        case "city":
          valA = a.city || "";
          valB = b.city || "";
          break;
        case "posted_by":
          valA = a.profiles?.display_name || a.profiles?.full_name || a.profiles?.username || "Unknown";
          valB = b.profiles?.display_name || b.profiles?.full_name || b.profiles?.username || "Unknown";
          break;
        case "posted_date":
          valA = a.posted_date ? new Date(a.posted_date).getTime() : 0;
          valB = b.posted_date ? new Date(b.posted_date).getTime() : 0;
          break;
        case "status":
          valA = a.status || "";
          valB = b.status || "";
          break;
        default:
          valA = 0;
          valB = 0;
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  /* FETCH JOBS */

const fetchJobs = async () => {
    const stored = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );

    let callerProfile: any = null;
    const lookupVal = stored?.username || stored?.email;
    const lookupField = stored?.username ? "username" : "email";
    if (lookupVal) {
      const { data: cp } = await supabase
        .from("profiles")
        .select("id, username, display_name, full_name, role")
        .eq(lookupField, lookupVal)
        .single();
      callerProfile = cp;
    }
    setLoggedProfile(callerProfile);

    let query = supabase.from("jobs").select("*");
    if (statusFilter && !["active", "expired"].includes(statusFilter)) {
      query = query.eq("status", statusFilter);
    }
    const { data, error } = await query.order("id", { ascending: false });
    if (error) console.log(error);
    let filteredJobs = data || [];
    const { data: profilesData } = await supabase.from("profiles").select("id, display_name, full_name, username, role");
    const profilesMap: any = {};
    if (profilesData) {
      profilesData.forEach(p => profilesMap[p.id] = p);
    }
    const roleStr = (callerProfile?.role || stored?.role || "").toLowerCase().replace(/[\s_]+/g, "");
    filteredJobs = filteredJobs.map((job) => ({
      ...job,
      profiles: job.author_id ? profilesMap[job.author_id] : null
    }));
    if (statusFilter === "active") {
      const today = new Date();
      filteredJobs = filteredJobs.filter(
        (job) => !job.post_expiry_date || new Date(job.post_expiry_date) >= today
      );
    }
    if (statusFilter === "expired") {
      const today = new Date();
      filteredJobs = filteredJobs.filter(
        (job) => job.post_expiry_date && new Date(job.post_expiry_date) < today
      );
    }

    setJobs(filteredJobs);
  };

  /* DELETE JOB MODAL LOGIC */
  const deleteJob = (job: any) => {
    setJobToDelete(job);
  };

  const executeDelete = async (mode: "single" | "all") => {
    if (!jobToDelete) return;
    
    if (mode === "single") {
      await supabase.from("jobs").delete().eq("id", jobToDelete.id);
    } else {
      let query = supabase.from("jobs").delete()
        .eq("firm_name", jobToDelete.firm_name)
        .eq("status", jobToDelete.status);
      
      if (jobToDelete.posted_date) query = query.eq("posted_date", jobToDelete.posted_date);
      if (jobToDelete.image) query = query.eq("image", jobToDelete.image);
      
      await query;
    }
    
    setJobToDelete(null);
    fetchJobs();
  };

return (

    <main className="min-h-screen bg-white text-black">

      <Navbar />

      <section className="w-full px-6 lg:px-12 py-10">

        {/* PAGE TITLE */}

<div className="flex justify-between items-start mb-10">

  <div>

    <h1 className="text-4xl font-bold">
      Manage Jobs
    </h1>

    <p className="text-gray-600 mt-2">
      View and manage all Active jobs.
    </p>

    {/* FILTERS */}

<div className="flex flex-wrap gap-3 mt-8 mb-8">

  <button
    onClick={() => router.push("/admin/jobs")}
    className={`px-5 py-2 rounded-full border transition ${
      !statusFilter
        ? "bg-black text-white border-black"
        : "bg-white hover:bg-white"
    }`}
  >
    All Jobs
  </button>

  <button
    onClick={() =>
      router.push("/admin/jobs?status=active")
    }
    className={`px-5 py-2 rounded-full border transition ${
      statusFilter === "active"
        ? "bg-black text-white border-black"
        : "bg-white hover:bg-white"
    }`}
  >
    Active
  </button>

  <button
    onClick={() =>
      router.push("/admin/jobs?status=draft")
    }
    className={`px-5 py-2 rounded-full border transition ${
      statusFilter === "draft"
        ? "bg-black text-white border-black"
        : "bg-white hover:bg-white"
    }`}
  >
    Drafts
  </button>

  <button
    onClick={() =>
      router.push("/admin/jobs?status=scheduled")
    }
    className={`px-5 py-2 rounded-full border transition ${
      statusFilter === "scheduled"
        ? "bg-black text-white border-black"
        : "bg-white hover:bg-white"
    }`}
  >
    Scheduled
  </button>

  <button
    onClick={() =>
      router.push("/admin/jobs?status=expired")
    }
    className={`px-5 py-2 rounded-full border transition ${
      statusFilter === "expired"
        ? "bg-black text-white border-black"
        : "bg-white hover:bg-white"
    }`}
  >
    Expired
  </button>

</div>

  </div>

  <button
    onClick={() => router.push("/admin")}
    className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition flex items-center gap-2 shrink-0"
  >
    ← Back to Dashboard
  </button>

</div>
        {/* JOBS TABLE */}

        <div className="bg-white rounded-3xl shadow-md border overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              {/* TABLE HEAD */}

              <thead className="bg-white border-b">
  <tr>
    <th className="text-left px-6 py-5 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('position')}>
      Position {sortField === 'position' && (sortOrder === 'asc' ? '↑' : '↓')}
    </th>
    <th className="text-left px-6 py-5 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('firm_name')}>
      Firm {sortField === 'firm_name' && (sortOrder === 'asc' ? '↑' : '↓')}
    </th>
    <th className="text-left px-6 py-5 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('city')}>
      City {sortField === 'city' && (sortOrder === 'asc' ? '↑' : '↓')}
    </th>
    <th className="text-left px-6 py-5 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('state')}>
      State {sortField === 'state' && (sortOrder === 'asc' ? '↑' : '↓')}
    </th>
    <th className="text-left px-6 py-5 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('posted_by')}>
      Posted By {sortField === 'posted_by' && (sortOrder === 'asc' ? '↑' : '↓')}
    </th>
    <th className="text-left px-6 py-5 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('posted_date')}>
      Posted On {sortField === 'posted_date' && (sortOrder === 'asc' ? '↑' : '↓')}
    </th>
    <th className="text-left px-6 py-5 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('status')}>
      Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
    </th>
    <th className="text-left px-6 py-5">
      Actions
    </th>
  </tr>
</thead>

              {/* TABLE BODY */}

              <tbody>

                {getSortedJobs(jobs).map((job) => {

                  const today = new Date();

                  const isExpired =
                    job.post_expiry_date &&
                    new Date(job.post_expiry_date) < today;

                  return (

                    <tr
  key={job.id}
  className="border-b hover:bg-white transition"
>
                      {/* POSITION */}

                      <td className="px-6 py-5 font-semibold">
                        {job.positions && Array.isArray(job.positions) ? job.positions.map((p: any) => p.position).join(", ") : job.position || "---"}
                      </td>

                      {/* FIRM */}

                      <td className="px-6 py-5">
                        {job.firm_name}
                      </td>

                      {/* CITY */}

                      <td className="px-6 py-5">
                        {job.city}
                      </td>

                        <td className="px-6 py-5">
                          {job.state}
                        </td>

                      {/* POSTED BY */}

                      <td className="px-6 py-5">
                        {(() => {
  if (!job.profiles) return "—";
  const isViewerCEO = (loggedProfile?.role || "").toLowerCase().replace(/[\s_]+/g, "") === "ceo";
    if (isViewerCEO || loggedProfile?.id === job.author_id) {
      return job.profiles.display_name || job.profiles.full_name || job.profiles.username || "Admin";
  }
  const pRole = (job.profiles.role || "").toLowerCase().replace(/[\s_]+/g, "");
  if (pRole === "ceo") return "CEO";
  if (pRole === "superadmin") return "Super Admin";
  return "Admin";
})()}
                      </td>

                      {/* POSTED ON */}

                      <td className="px-6 py-5">
                        {job.posted_date
                          ? new Date(
                              job.posted_date
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-5">

                        {job.status === "draft" ? (

  <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm">
    Draft
  </span>

) : job.status === "scheduled" ? (

  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm">
    Scheduled
  </span>

) : isExpired ? (

  <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm">
    Expired
  </span>

) : (

  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
    Active
  </span>

)}

                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-5">

                        <div className="flex gap-2 flex-wrap">

                          {/* VIEW */}

<button
  onClick={(e) => {

    e.stopPropagation();

    window.open(
      `/jobs/${job.id}`,
      "_blank"
    );

  }}
  className="px-4 py-2 rounded-xl border hover:bg-white transition"
>
  View
</button>

{(() => {
  const myRole = (loggedProfile?.role || "").toLowerCase().replace(/[\s_]+/g, "");
  const canEdit = myRole === "ceo" || loggedProfile?.id === job.author_id;
  if (!canEdit) return null;
  return (
    <>
      {/* EDIT */}
      <button onClick={(e) => { e.stopPropagation(); window.open(`/admin/add-job?id=${job.id}`, "_blank"); }} className="px-4 py-2 rounded-xl border hover:bg-white transition">Edit</button>
      {/* DELETE */}
      <button onClick={(e) => { e.stopPropagation(); deleteJob(job); }} className="px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition">Delete</button>
    </>
  );
})()}

                        </div>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        </div>

      </section>

      <Footer />

    
      {jobToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Delete Job</h2>
            <p className="mb-6 text-gray-600 text-sm">Do you want to delete just this position, or all positions created together in this form?</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => {
                if (window.confirm("Confirm delete ONE job?")) {
                  executeDelete("single");
                }
              }} className="px-5 py-3.5 bg-red-50 text-red-700 font-bold rounded-xl hover:bg-red-100 transition border border-red-100">
                Delete One Job
              </button>
              
              <button onClick={() => {
                if (window.confirm("Are you sure you want to delete ALL jobs in this form?")) {
                  executeDelete("all");
                }
              }} className="px-5 py-3.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-md">
                Delete All Jobs in Form
              </button>

              <button onClick={() => setJobToDelete(null)} className="px-5 py-3.5 border rounded-xl hover:bg-gray-50 mt-2 font-semibold transition text-gray-700">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>

  );

}

export default function AdminJobsPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <AdminJobsContent />
    </Suspense>
  );
}





