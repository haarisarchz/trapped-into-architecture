"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AdminJobsPage() {

  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {

    fetchJobs();

  }, []);

  /* FETCH JOBS */

  const fetchJobs = async () => {

    const { data, error } =
      await supabase
        .from("jobs")
        .select("*")
        .order("id", {
  ascending: false,
});

    if (error) {

      console.log(error);

    } else {

      setJobs(data || []);

    }

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

    <main className="min-h-screen bg-gray-100">

      <Navbar />

      <section className="w-full px-6 lg:px-12 py-10">

        {/* PAGE TITLE */}

        <div className="mb-10">

          <h1 className="text-4xl font-bold">
            Manage Jobs
          </h1>

          <p className="text-gray-600 mt-2">
            View and manage all published jobs.
          </p>

        </div>

        {/* JOBS TABLE */}

        <div className="bg-white rounded-3xl shadow-md border overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              {/* TABLE HEAD */}

              <thead className="bg-gray-50 border-b">

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
  className="border-b hover:bg-gray-50 transition"
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
                        {job.moderator || "Admin"}
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

                        {isExpired ? (

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
  className="px-4 py-2 rounded-xl border hover:bg-gray-100 transition"
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
  className="px-4 py-2 rounded-xl border hover:bg-gray-100 transition"
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