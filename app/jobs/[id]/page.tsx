import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data: job } = await supabase
    .from("jobs")
    .select("position, firm_name, job_description, image")
    .eq("id", id)
    .maybeSingle();

  if (!job) {
    return { title: "Job Not Found" };
  }

  return {
    title: `${job.position} at ${job.firm_name} | Architecture Jobs`,
    description: job.job_description ? job.job_description.slice(0, 150) + '...' : `Apply for ${job.position} at ${job.firm_name}.`,
    openGraph: {
      title: `${job.position} at ${job.firm_name} | Architecture Jobs`,
      description: job.job_description ? job.job_description.slice(0, 150) + '...' : `Apply for ${job.position} at ${job.firm_name}.`,
      images: job.image ? [{ url: job.image }] : [],
    },
  };
}

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. Fetch current job
  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (!job || error) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="p-10 text-center">
          <h1 className="text-4xl font-bold">Job Not Found</h1>
        </div>
        <Footer />
      </main>
    );
  }

  // 2. Fetch Jobs in same city
  const { data: cityJobs } = await supabase
    .from("jobs")
    .select("id, position, firm_name, city")
    .eq("city", job.city)
    .neq("id", job.id)
    .eq("status", "published")
    .limit(5);

  // 3. Fetch Jobs with same position
  const { data: positionJobs } = await supabase
    .from("jobs")
    .select("id, position, firm_name, city")
    .eq("position", job.position)
    .neq("id", job.id)
    .eq("status", "published")
    .limit(5);

  // 4. Fetch Recent Jobs
  const { data: recentJobs } = await supabase
    .from("jobs")
    .select("id, position, firm_name, city")
    .neq("id", job.id)
    .eq("status", "published")
    .order("posted_date", { ascending: false })
    .limit(5);

  // 5. JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.position,
    description: job.job_description,
    datePosted: job.posted_date || new Date().toISOString().split("T")[0],
    validThrough: job.post_expiry_date || job.last_date_to_apply,
    employmentType: "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.firm_name,
      logo: job.image,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressRegion: job.state,
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* CONTENT */}
      <section className="w-full px-4 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden flex flex-col lg:flex-row items-start">
            {/* LEFT IMAGE */}
            <div className="w-full lg:w-[38%] bg-gray-100 flex items-start justify-center p-4">
              {job.image ? (
                <img
                  src={job.image}
                  alt={job.position}
                  className="w-full object-contain rounded-2xl"
                />
              ) : (
                <div className="w-full h-[300px] bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500">
                  No Image Available
                </div>
              )}
            </div>

            {/* RIGHT CONTENT */}
            <div className="flex-1 p-8 w-full">
              {/* TITLE */}
              <div className="mb-5">
                <h1 className="text-3xl font-bold">{job.position}</h1>
                <p className="text-xl text-gray-700 mt-1">{job.firm_name}</p>
                <p className="text-gray-500 mt-1 text-lg">
                  {job.city}, {job.state}
                </p>
              </div>

              {/* QUICK INFO */}
              <div className="flex flex-wrap gap-4 mb-5">
                {/* EXPERIENCE */}
                {job.experience && (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 border w-full md:w-auto md:min-w-[160px]">
                    <p className="text-xs text-gray-500">Experience</p>
                    <h3 className="text-lg font-semibold mt-1">{job.experience}</h3>
                  </div>
                )}
                {/* SALARY */}
                {job.salary && (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 border w-full md:w-auto md:min-w-[200px]">
                    <p className="text-xs text-gray-500">Salary</p>
                    <h3 className="text-lg font-semibold mt-1">{job.salary}</h3>
                  </div>
                )}
                {/* QUALIFICATION */}
                {job.qualifications?.length > 0 && (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 border w-full md:w-auto md:min-w-[180px]">
                    <p className="text-xs text-gray-500">Qualification</p>
                    <h3 className="text-lg font-semibold mt-1">
                      {Array.isArray(job.qualifications)
                        ? job.qualifications.join(", ")
                        : job.qualifications}
                    </h3>
                  </div>
                )}
              </div>

              {/* SKILLS */}
              <div className="mb-5">
                <h2 className="text-2xl font-bold mb-2">Skills Required</h2>
                <div className="flex flex-wrap gap-3">
                  {job.skills_required?.map((skill: string) => (
                    <div
                      key={skill.trim()}
                      className="bg-black text-white px-4 py-2 rounded-full text-sm"
                    >
                      {skill.trim()}
                    </div>
                  ))}
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="mb-5">
                <h2 className="text-2xl font-bold mb-2">Job Description</h2>
                <p className="text-gray-700 leading-8 text-lg whitespace-pre-line">
                  {job.job_description}
                </p>
              </div>

              {/* DATES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
                <div>
                  <p className="text-sm text-gray-500">Posted Date</p>
                  <p className="font-semibold mt-1">{job.posted_date}</p>
                </div>
                {job.last_date_to_apply && (
                  <div>
                    <p className="text-xs text-gray-500">Last Date To Apply</p>
                    <h3 className="text-lg font-semibold mt-1">{job.last_date_to_apply}</h3>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Post Expiry Date</p>
                  <p className="font-semibold mt-1">{job.post_expiry_date}</p>
                </div>
              </div>

              {/* APPLY BUTTON */}
              {job.post_expiry_date && new Date(job.post_expiry_date) < new Date() ? (
                <button
                  disabled
                  className="inline-block bg-gray-300 text-gray-600 px-8 py-4 rounded-2xl text-lg font-semibold cursor-not-allowed"
                >
                  Post Expired
                </button>
              ) : (
                <a
                  href={job.apply_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block bg-black text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-800 transition"
                >
                  Apply Now
                </a>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            
            {/* JOBS IN SAME CITY */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold">Jobs In {job.city}</h2>
                <Link href={`/jobs?city=${encodeURIComponent(job.city)}`} className="text-sm font-medium text-black hover:text-gray-800 transition">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {cityJobs && cityJobs.length > 0 ? cityJobs.map((cityJob) => (
                  <Link
                    href={`/jobs/${cityJob.id}`}
                    key={cityJob.id}
                    className="block border rounded-2xl p-4 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <h3 className="font-semibold text-lg">{cityJob.position}</h3>
                    <p className="text-gray-600 text-sm mt-1">{cityJob.firm_name}</p>
                    <p className="text-gray-400 text-sm mt-1">{cityJob.city}</p>
                  </Link>
                )) : <p className="text-sm text-gray-500">No other jobs in {job.city}.</p>}
              </div>
            </div>

            {/* SAME POSITION JOBS */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold">{job.position} Jobs</h2>
                <Link href={`/jobs?position=${encodeURIComponent(job.position)}`} className="text-sm font-medium text-black hover:text-gray-800 transition">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {positionJobs && positionJobs.length > 0 ? positionJobs.map((positionJob) => (
                  <Link
                    href={`/jobs/${positionJob.id}`}
                    key={positionJob.id}
                    className="block border rounded-2xl p-4 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <h3 className="font-semibold text-lg">{positionJob.position}</h3>
                    <p className="text-gray-600 text-sm mt-1">{positionJob.firm_name}</p>
                    <p className="text-gray-400 text-sm mt-1">{positionJob.city}</p>
                  </Link>
                )) : <p className="text-sm text-gray-500">No other {job.position} jobs.</p>}
              </div>
            </div>

            {/* RECENT JOBS */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">Recent Jobs</h2>
                <Link href="/jobs" className="text-sm font-medium text-black hover:text-gray-800 transition">
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {recentJobs && recentJobs.length > 0 ? recentJobs.map((recentJob) => (
                  <div key={recentJob.id} className="py-3 border-b last:border-none">
                    <p className="text-sm leading-7 text-gray-700">
                      <span className="font-semibold text-black">{recentJob.firm_name}</span> is hiring{" "}
                      <Link href={`/jobs/${recentJob.id}`} className="font-semibold text-black hover:underline">
                        {recentJob.position}
                      </Link>{" "}in{" "}
                      <span className="text-gray-500">{recentJob.city}</span>
                    </p>
                  </div>
                )) : <p className="text-sm text-gray-500">No recent jobs found.</p>}
              </div>
            </div>

          </aside>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}