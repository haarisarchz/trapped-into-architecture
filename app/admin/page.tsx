"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [isJobMenuOpen, setIsJobMenuOpen] = useState(true);
  const [isDbMenuOpen, setIsDbMenuOpen] = useState(true);

  const [jobs, setJobs] = useState<any[]>([]);

  const [activeJobs, setActiveJobs] = useState(0);

const [expiredJobs, setExpiredJobs] = useState(0);
const [outdatedJobs, setOutdatedJobs] = useState(0);
const [draftJobs, setDraftJobs] = useState(0);

const [scheduledJobs, setScheduledJobs] = useState(0);

const [totalJobs, setTotalJobs] = useState(0);
const [pendingClaimsCount, setPendingClaimsCount] = useState(0);

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

  const allowedRoles = ["superadmin", "admin", "ceo", "jobadmin"];
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

    const { data, error } = await supabase.from("jobs").select("*").order("posted_date", { ascending: false });
if (!error) {
  
}

    if (error) {

      console.log(error);

      return;

    }

    if (data) {

    setJobs(data);

setTotalJobs(data.length);

try {
  const { count } = await supabase
    .from("company_claim_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  if (typeof count === "number") setPendingClaimsCount(count);
} catch (e) {
  // table might be empty or migrating
}

const today =
new Date().toISOString().split("T")[0];

const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

const active = data.filter(
  (job) => {
    if (job.status !== "published") return false;
    const isExplicitlyExpired = job.post_expiry_date && job.post_expiry_date < today;
    const isOld = job.posted_date && new Date(job.posted_date) < thirtyDaysAgo;
    return !isExplicitlyExpired && !isOld;
  }
);

const outdated = data.filter(
  (job) => {
    if (job.status !== "published") return false;
    const isExplicitlyExpired = job.post_expiry_date && job.post_expiry_date < today;
    const isOld = job.posted_date && new Date(job.posted_date) < thirtyDaysAgo;
    return isOld && !isExplicitlyExpired;
  }
);

const expired = data.filter(
  (job) => job.status === "published" && job.post_expiry_date && job.post_expiry_date < today
);

const drafts = data.filter(
  (job) => job.status === "draft"
);

const scheduled = data.filter(
  (job) => job.status === "scheduled"
);

setActiveJobs(active.length);
setOutdatedJobs(outdated.length);
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

    <main className="min-h-screen bg-white text-black flex flex-col md:flex-row">

      {/* SIDEBAR */}

      <aside className="flex w-full md:w-64 lg:w-72 bg-black text-white md:sticky md:top-0 md:h-screen p-4 flex-col justify-between gap-3 overflow-y-auto">

        <div>

          {/* WEBSITE NAME */}

          <div className="mb-3.5">

            <h1 className="text-xl font-bold tracking-tight text-white">
              Trapped Into Architecture
            </h1>

            <p className="text-xs text-gray-400 mt-0.5 font-medium tracking-wide">
              Admin Panel
            </p>

          </div>

          {/* MENU */}

          <div className="space-y-1.5 flex-1">
            
            {/* ADMIN ACTIVITY */}
            <button
              onClick={() => router.push("/admin/activity")}
              className="w-full text-left px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 transition text-white font-bold text-sm"
            >
              Admin Activity
            </button>

            {/* JOBS DASHBOARD */}
            <div>
              <button
                onClick={() => setIsJobMenuOpen(!isJobMenuOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2 bg-gray-900 rounded-xl text-white font-bold hover:bg-gray-800 transition text-sm"
              >
                <span>Job Dashboard</span>
                {isJobMenuOpen ? <Minus size={15} /> : <Plus size={15} />}
              </button>

              {isJobMenuOpen && (
                <div className="mt-1 space-y-0.5 pl-2.5 border-l border-gray-800 ml-2">
                  <button
                    onClick={() => router.push("/admin")}
                    className="w-full text-left px-3 py-1.5 rounded-lg bg-gray-800 transition text-[13px] font-medium text-white"
                  >
                    Job Dashboard
                  </button>
                  <button
                    onClick={() => router.push("/admin/jobs")}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-gray-800 transition text-[13px] font-medium text-gray-200 hover:text-white"
                  >
                    Manage Jobs
                  </button>
                  <button
                    onClick={() => router.push("/admin/add-job")}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-gray-800 transition text-[13px] font-medium text-gray-200 hover:text-white"
                  >
                    Add New Job
                  </button>
                  <button
                    onClick={() => router.push("/admin/companies")}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-gray-800 transition text-[13px] font-medium text-gray-200 hover:text-white"
                  >
                    Companies
                  </button>
                  {(userRole === "ceo" || userRole === "superadmin") && (
                    <>
                      <button
                        onClick={() => router.push("/admin/badges")}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-gray-800 transition text-[13px] font-medium text-gray-200 hover:text-white flex items-center justify-between"
                      >
                        <span>Badges Managing</span>
                      </button>
                      <button
                        onClick={() => router.push("/admin/claims")}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-gray-800 transition text-[13px] font-medium text-gray-200 hover:text-white flex items-center justify-between"
                      >
                        <span>Company Claim Requests</span>
                        {pendingClaimsCount > 0 && (
                          <span className="bg-gray-800 text-gray-300 border border-gray-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
                            {pendingClaimsCount}
                          </span>
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* DATABASE DASHBOARD */}
            {userRole === "ceo" && (
              <div>
                <button
                  onClick={() => setIsDbMenuOpen(!isDbMenuOpen)}
                  className="w-full flex items-center justify-between px-3.5 py-2 bg-gray-900 rounded-xl text-white font-bold hover:bg-gray-800 transition text-sm"
                >
                  <span>Database Dashboard</span>
                  {isDbMenuOpen ? <Minus size={15} /> : <Plus size={15} />}
                </button>

                {isDbMenuOpen && (
                  <div className="mt-1 space-y-0.5 pl-2.5 border-l border-gray-800 ml-2">
                    <button
                      onClick={() => router.push("/admin/catalog")}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-gray-800 transition text-[13px] font-medium text-gray-200 hover:text-white"
                    >
                      Architecture Catalog
                    </button>
                    <button
                      onClick={() => router.push("/admin/quizzes")}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-gray-800 transition text-[13px] font-medium text-gray-200 hover:text-white"
                    >
                      Manage Quizzes
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STANDALONE MENUS */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => router.push("/admin/analytics")}
                className="w-full text-left px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 transition font-bold text-sm text-white"
              >
                Analytics
              </button>
              {userRole === "ceo" && (
                <>
                  <button
                    onClick={() => router.push("/admin/users")}
                    className="w-full text-left px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 transition font-bold text-sm text-white"
                  >
                    Users
                  </button>
                  <button
                    onClick={() => router.push("/admin/contact")}
                    className="w-full text-left px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 transition font-bold text-sm text-white"
                  >
                    Contact
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => window.open("/jobs", "_blank")}
              className="w-full mt-3 bg-white text-black py-2 rounded-xl font-bold text-xs hover:bg-gray-200 transition"
            >
              Visit Jobs Page
            </button>

          </div>

        </div>

        {/* WEBSITE BUTTON */}

        <a
          href="https://www.trappedintoarchitecture.com/" target="_blank" rel="noopener noreferrer"
          className="border border-gray-800 rounded-xl px-3 py-2 hover:bg-gray-900 transition text-center block w-full text-xs text-gray-300 hover:text-white"
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
              Job Dashboard
            </h1>

            <p className="text-gray-800 md:text-gray-500 mt-2">
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

<div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">

  {/* ACTIVE JOBS */}

  <div
    onClick={() => router.push("/admin/jobs?status=active")}
    className="bg-white rounded-3xl p-4 sm:p-6 shadow cursor-pointer hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center justify-center"
  >
    <p className="text-gray-600 font-semibold text-center text-sm sm:text-base">
      Active Jobs
    </p>

    <h2 className="text-3xl sm:text-5xl font-bold text-center mt-2 sm:mt-6 text-green-600">
      {activeJobs}
    </h2>
  </div>

  {/* DRAFT JOBS */}

  <div
    onClick={() => router.push("/admin/jobs?status=draft")}
    className="bg-white rounded-3xl p-4 sm:p-6 shadow cursor-pointer hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center justify-center"
  >
    <p className="text-gray-600 font-semibold text-center text-sm sm:text-base">
      Draft Jobs
    </p>

    <h2 className="text-3xl sm:text-5xl font-bold text-center mt-2 sm:mt-6 text-yellow-500">
      {draftJobs}
    </h2>
  </div>

  {/* SCHEDULED JOBS */}

  <div
    onClick={() => router.push("/admin/jobs?status=scheduled")}
    className="bg-white rounded-3xl p-4 sm:p-6 shadow cursor-pointer hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center justify-center"
  >
    <p className="text-gray-600 font-semibold text-center text-sm sm:text-base">
      Scheduled Jobs
    </p>

    <h2 className="text-3xl sm:text-5xl font-bold text-center mt-2 sm:mt-6 text-blue-600">
      {scheduledJobs}
    </h2>
  </div>

  {/* OUTDATED JOBS */}

  <div
    onClick={() => router.push("/admin/jobs?status=outdated")}
    className="bg-white rounded-3xl p-4 sm:p-6 shadow cursor-pointer hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center justify-center"
  >
    <p className="text-gray-600 font-semibold text-center text-sm sm:text-base">
      Outdated Jobs
    </p>

    <h2 className="text-3xl sm:text-5xl font-bold text-center mt-2 sm:mt-6 text-orange-500">
      {outdatedJobs}
    </h2>
  </div>

  {/* EXPIRED JOBS */}

  <div
    onClick={() => router.push("/admin/jobs?status=expired")}
    className="bg-white rounded-3xl p-4 sm:p-6 shadow cursor-pointer hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center justify-center"
  >
    <p className="text-gray-600 font-semibold text-center text-sm sm:text-base">
      Expired Jobs
    </p>

    <h2 className="text-3xl sm:text-5xl font-bold text-center mt-2 sm:mt-6 text-red-600">
      {expiredJobs}
    </h2>
  </div>

  {/* TOTAL JOBS */}

  <div
    onClick={() => router.push("/admin/jobs")}
    className="bg-white rounded-3xl p-4 sm:p-6 shadow cursor-pointer hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center justify-center"
  >
    <p className="text-gray-600 font-semibold text-center text-sm sm:text-base">
      Total Jobs
    </p>

    <h2 className="text-3xl sm:text-5xl font-bold text-center mt-2 sm:mt-6">
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

  <div className="hidden md:grid grid-cols-4 gap-4 border-b pb-4 mb-4 text-gray-800 md:text-gray-500 font-medium">

    <div>Position</div>

    <div>Location</div>

    <div>Firm</div>

    <div>Posted Date</div>

  </div>

  {/* JOB LIST */}

  <div className="space-y-1">

    {jobs
      .slice(0, 5)
      .map((job) => (

        <div
          key={job.id}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 border rounded-2xl px-4 py-2.5 items-center hover:bg-white transition"
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

          <div className="text-gray-800 md:text-gray-500 text-sm">

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




