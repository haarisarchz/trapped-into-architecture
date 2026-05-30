"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {

  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);

  const [activeJobs, setActiveJobs] =
    useState(0);

  const [expiredJobs, setExpiredJobs] =
    useState(0);

  const [totalJobs, setTotalJobs] =
    useState(0);

  useEffect(() => {

    fetchDashboardData();

  }, []);

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
            !job.post_expiry_date ||
            job.post_expiry_date >= today
        );

      const expired =
        data.filter(
          (job) =>
            job.post_expiry_date &&
            job.post_expiry_date < today
        );

      setActiveJobs(active.length);

      setExpiredJobs(expired.length);

    }

  };

  return (

    <main className="min-h-screen bg-gray-100 flex">

      {/* SIDEBAR */}

      <aside className="w-72 bg-black text-white min-h-screen p-6 flex flex-col justify-between">

        <div>

          {/* WEBSITE NAME */}

          <div className="mb-12">

            <h1 className="text-3xl font-bold">
              Crafted Architecture
            </h1>

            <p className="text-gray-400 mt-1">
              Admin Panel
            </p>

          </div>

          {/* MENU */}

          <div className="space-y-3">

            <button
              onClick={() =>
                router.push("/admin")
              }
              className="w-full text-left px-5 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 transition"
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
              className="w-full text-left px-5 py-4 rounded-2xl hover:bg-gray-800 transition"
            >
              Analytics
            </button>

            <button
              className="w-full text-left px-5 py-4 rounded-2xl hover:bg-gray-800 transition"
            >
              Settings
            </button>

          </div>

        </div>

        {/* WEBSITE BUTTON */}

        <button
          onClick={() =>
            router.push("/")
          }
          className="border border-gray-700 rounded-2xl px-5 py-4 hover:bg-gray-800 transition"
        >
          View Website
        </button>

      </aside>

      {/* MAIN */}

      <section className="flex-1 p-10">

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
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-2xl font-semibold transition"
          >
            + Add New Job
          </button>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          {/* ACTIVE JOBS */}

          <div className="bg-white rounded-3xl p-6 shadow">

            <p className="text-gray-500">
              Active Jobs
            </p>

            <h2 className="text-4xl font-bold mt-3">
              {activeJobs}
            </h2>

          </div>

          {/* EXPIRED JOBS */}

          <div className="bg-white rounded-3xl p-6 shadow">

            <p className="text-gray-500">
              Expired Jobs
            </p>

            <h2 className="text-4xl font-bold mt-3">
              {expiredJobs}
            </h2>

          </div>

          {/* TOTAL JOBS */}

          <div className="bg-white rounded-3xl p-6 shadow">

            <p className="text-gray-500">
              Total Jobs
            </p>

            <h2 className="text-4xl font-bold mt-3">
              {totalJobs}
            </h2>

          </div>

        </div>

       ```tsx
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
      className="text-purple-600 font-medium"
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
          className="grid grid-cols-1 md:grid-cols-4 gap-4 border rounded-2xl px-5 py-4 items-center hover:bg-gray-50 transition"
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
