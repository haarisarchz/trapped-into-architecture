"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");

  const [jobs, setJobs] = useState<any[]>([]);

  const [activeJobs, setActiveJobs] = useState(0);

const [expiredJobs, setExpiredJobs] = useState(0);

const [draftJobs, setDraftJobs] = useState(0);

const [scheduledJobs, setScheduledJobs] = useState(0);

const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {

  checkAccess();

}, []);

const checkAccess = async () => {

  const currentUser =
    JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );

  if (!currentUser) {

    router.push("/");
    return;

  }

  const { data: profile, error } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("username", currentUser.username)
      .single();

  const allowedRoles = ["superadmin", "admin", "ceo"];
  const normalizedRole = (profile?.role || "").toLowerCase().replace(/[\s_]+/g, "");
  
  if (error || !profile || !allowedRoles.includes(normalizedRole)) {
    router.push("/");
    return;
  }
  
  // Actually set the userRole so the UI buttons render!
  setUserRole(normalizedRole);

  await fetchDashboardData();

  setLoading(false);

};

  const fetchDashboardData = async () => {

    const { data, error } =
      await supabase
        .from("jobs")
        .select("*")
        .order("posted_date", {
          ascending: false,
        });

    if (error) {

      console.log(error);

      return;

    }

    if (data) {

    setJobs(data);

setTotalJobs(data.length);

const today =
new Date().toISOString().split("T")[0];

const active =
data.filter(
(job) =>
job.status === "published" &&
(
!job.post_expiry_date ||
job.post_expiry_date >= today
)
);

const expired =
data.filter(
(job) =>
job.status === "published" &&
job.post_expiry_date &&
job.post_expiry_date < today
);

const drafts =
data.filter(
(job) =>
job.status === "draft"
);

const scheduled =
data.filter(
(job) =>
job.status === "scheduled"
);

setActiveJobs(active.length);

setExpiredJobs(expired.length);

setDraftJobs(drafts.length);

setScheduledJobs(scheduled.length);

    }

  };

if (loading) {

  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );

}
  return (

    <main className="min-h-screen bg-white flex flex-col md:flex-row">

      {/* SIDEBAR */}

      <aside className="flex w-full md:w-72 bg-black text-white md:min-h-screen p-6 flex-col justify-between gap-10 md:gap-0">

        <div>

          {/* WEBSITE NAME */}

          <div className="mb-12">

            <h1 className="text-3xl font-bold">
              Crafted Architecture
            </h1>

            <p className="text-gray-800 mt-1">
              Admin Panel
            </p>

          </div>

          {/* MENU */}

          <div className="space-y-3">
            <button
              onClick={() => router.push("/admin/activity")}
              className="w-full text-left px-5 py-4 rounded-2xl hover:bg-gray-800 transition text-blue-400 font-medium"
            >
              Admin Activity
            </button>

            <button
              onClick={() =>
                router.push("/admin")
              }
              className="w-full text-left px-5 py-4 rounded-2xl bg-black hover:bg-gray-900 transition"
            >
              Dashboard
            </button>

            <button
              onClick={() =>
                router.push("/admin/jobs")
              }
              className="w-full text-left px-5 py-4 rounded-2xl hover:bg-gray-800 transition"
            >
              Manage Jobs
            </button>

            <button
              onClick={() =>
                router.push("/admin/add-job")
              }
              className="w-full text-left px-5 py-4 rounded-2xl hover:bg-gray-800 transition"
            >
              Add New Job
            </button>

            <button
              onClick={() => router.push("/admin/analytics")}
              className="w-full text-left px-5 py-4 rounded-2xl hover:bg-gray-800 transition"
            >
              Analytics
            </button>
<button
  onClick={() =>
    router.push("/admin/companies")
  }
  className="w-full text-left px-5 py-4 rounded-2xl hover:bg-gray-800 transition"
>
  Companies
</button>
{userRole === "ceo" && (
<button
  onClick={() => router.push("/admin/users")}
  className="w-full text-left px-5 py-4 rounded-2xl hover:bg-gray-800 transition"
>
  Users
</button>
)}
{userRole === "ceo" && (
<button
  onClick={() => router.push("/admin/contact")}
  className="w-full text-left px-5 py-4 rounded-2xl hover:bg-gray-800 transition"
>
  Contact
</button>
)}

            <button
  onClick={() => window.open("/jobs", "_blank")}
  className="w-full mt-10 bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
>
  Visit Jobs Page
</button>

          </div>

        </div>

        {/* WEBSITE BUTTON */}

        <a
          href="https://www.trappedintoarchitecture.com/" target="_blank" rel="noopener noreferrer"
          className="border border-gray-700 rounded-2xl px-5 py-4 hover:bg-gray-800 transition text-center block w-full"
        >
          View Website
        </a>

      </aside>

      {/* MAIN */}

      <section className="flex-1 p-4 md:p-10">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-4xl font-bold">
              Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Welcome back
            </p>

          </div>

          <button
            onClick={() =>
              router.push("/admin/add-job")
            }
            className="bg-black hover:bg-gray-900 text-white px-6 py-4 rounded-2xl font-semibold transition"
          >
            + Add New Job
          </button>

        </div>

      {/* STATS */}

<div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">

  {/* ACTIVE JOBS */}

  <div
    onClick={() => router.push("/admin/jobs?status=published")}
    className="bg-white rounded-3xl p-6 shadow cursor-pointer hover:shadow-xl hover:-translate-y-1 transition duration-300"
  >
    <p className="text-gray-600 font-semibold text-center">
      Active Jobs
    </p>

    <h2 className="text-5xl font-bold text-center mt-6 text-green-600">
      {activeJobs}
    </h2>
  </div>

  {/* DRAFT JOBS */}

  <div
    onClick={() => router.push("/admin/jobs?status=draft")}
    className="bg-white rounded-3xl p-6 shadow cursor-pointer hover:shadow-xl hover:-translate-y-1 transition duration-300"
  >
    <p className="text-gray-600 font-semibold text-center">
      Draft Jobs
    </p>

    <h2 className="text-5xl font-bold text-center mt-6 text-yellow-500">
      {draftJobs}
    </h2>
  </div>

  {/* SCHEDULED JOBS */}

  <div
    onClick={() => router.push("/admin/jobs?status=scheduled")}
    className="bg-white rounded-3xl p-6 shadow cursor-pointer hover:shadow-xl hover:-translate-y-1 transition duration-300"
  >
    <p className="text-gray-600 font-semibold text-center">
      Scheduled Jobs
    </p>

    <h2 className="text-5xl font-bold text-center mt-6 text-blue-600">
      {scheduledJobs}
    </h2>
  </div>

  {/* EXPIRED JOBS */}

  <div
    onClick={() => router.push("/admin/jobs?status=expired")}
    className="bg-white rounded-3xl p-6 shadow cursor-pointer hover:shadow-xl hover:-translate-y-1 transition duration-300"
  >
    <p className="text-gray-600 font-semibold text-center">
      Expired Jobs
    </p>

    <h2 className="text-5xl font-bold text-center mt-6 text-red-600">
      {expiredJobs}
    </h2>
  </div>

  {/* TOTAL JOBS */}

  <div
    onClick={() => router.push("/admin/jobs")}
    className="bg-white rounded-3xl p-6 shadow cursor-pointer hover:shadow-xl hover:-translate-y-1 transition duration-300"
  >
    <p className="text-gray-600 font-semibold text-center">
      Total Jobs
    </p>

    <h2 className="text-5xl font-bold text-center mt-6">
      {totalJobs}
    </h2>
  </div>

</div>


{/* RECENT JOBS */}

<div className="bg-white rounded-3xl p-8 shadow">

  <div className="flex items-center justify-between mb-6">

    <h2 className="text-2xl font-bold">
      Recent Jobs
    </h2>

    <button
      onClick={() =>
        router.push("/admin/jobs")
      }
      className="text-black font-medium"
    >
      View all jobs →
    </button>

  </div>

  {/* TABLE HEADER */}

  <div className="hidden md:grid grid-cols-4 gap-4 border-b pb-4 mb-4 text-gray-500 font-medium">

    <div>Position</div>

    <div>Location</div>

    <div>Firm</div>

    <div>Posted Date</div>

  </div>

  {/* JOB LIST */}

  <div className="space-y-3">

    {jobs
      .slice(0, 5)
      .map((job) => (

        <div
          key={job.id}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 border rounded-2xl px-5 py-4 items-center hover:bg-white transition"
        >

          {/* POSITION */}

          <div>

            <h3 className="font-semibold text-lg">
              {job.position}
            </h3>

          </div>

          {/* LOCATION */}

          <div className="text-gray-600">

            {job.city}

          </div>

          {/* FIRM */}

          <div className="text-gray-600">

            {job.firm_name}

          </div>

          {/* DATE */}

          <div className="text-gray-500 text-sm">

            {job.posted_date}

          </div>

        </div>

      ))}

  </div>

</div>
```

      </section>

    </main>

  );

}
