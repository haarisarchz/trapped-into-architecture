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

  useEffect(() => {

  fetchJobs();

}, [statusFilter, typeFilter]); 

  /* FETCH JOBS */

const fetchJobs = async () => {
    const user = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );

    let query = supabase
      .from("jobs")
      .select("*");

    if (statusFilter && !["active", "expired"].includes(statusFilter)) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query.order("id", {
      ascending: false,
    });

    if (error) {
      console.log(error);
      return;
    }

    let filteredJobs = data || [];

    // Enforce role locally to prevent schema crash if migration hasn't run
    const roleStr = (user?.role || "").toLowerCase().replace(/[\s_]+/g, "");
    if (roleStr !== "ceo") {
      filteredJobs = filteredJobs.filter((job: any) => !job.author_id || job.author_id === user?.id);
    }


  if (statusFilter === "active") {

    const today = new Date();

    filteredJobs = filteredJobs.filter(
      (job) =>
        !job.post_expiry_date ||
        new Date(job.post_expiry_date) >= today
    );

  }

  if (statusFilter === "expired") {

    const today = new Date();

    filteredJobs = filteredJobs.filter(
      (job) =>
        job.post_expiry_date &&
        new Date(job.post_expiry_date) < today
    );

  }

  setJobs(filteredJobs);

};
  /* DELETE JOB */

  const deleteJob = async (id: number) => {

    const confirmDelete =
      confirm("Delete this job?");

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id);

    if (error) {

      console.log(error);

    } else {

      fetchJobs();

    }

  };

  return (

    <main className="min-h-screen bg-white">

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

                  <th className="text-left px-6 py-5">
                    Position
                  </th>

                  <th className="text-left px-6 py-5">
                    Firm
                  </th>

                  <th className="text-left px-6 py-5">
                    City
                  </th>

                  <th className="text-left px-6 py-5">
                    Posted By
                  </th>

                  <th className="text-left px-6 py-5">
                    Posted On
                  </th>

                  <th className="text-left px-6 py-5">
                    Status
                  </th>

                  <th className="text-left px-6 py-5">
                    Actions
                  </th>

                </tr>

              </thead>

              {/* TABLE BODY */}

              <tbody>

                {jobs.map((job) => {

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
                        {job.position}
                      </td>

                      {/* FIRM */}

                      <td className="px-6 py-5">
                        {job.firm_name}
                      </td>

                      {/* CITY */}

                      <td className="px-6 py-5">
                        {job.city}
                      </td>

                      {/* POSTED BY */}

                      <td className="px-6 py-5">
                        {job.profiles?.display_name || job.profiles?.full_name || job.profiles?.username || "Admin"}
                      </td>

                      {/* POSTED ON */}

                      <td className="px-6 py-5">
                        {job.created_at
                          ? new Date(
                              job.created_at
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

{/* EDIT */}

<button
  onClick={(e) => {

    e.stopPropagation();

    window.open(
      `/admin/add-job?id=${job.id}`,
      "_blank"
    );

  }}
  className="px-4 py-2 rounded-xl border hover:bg-white transition"
>
  Edit
</button>
                          {/* DELETE */}

                          <button
                            onClick={(e) => {

                              e.stopPropagation();

                              deleteJob(job.id);

                            }}
                            className="px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition"
                          >
                            Delete
                          </button>

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