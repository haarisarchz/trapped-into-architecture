// @ts-nocheck
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/Jobcard";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";
import { MapPin, ArrowRight, Briefcase } from "lucide-react";

export const revalidate = 60;

function formatSlug(slug: string) {
  if (!slug) return "";
  return decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  const stateName = formatSlug(state);
  const title = `Architecture Jobs in ${stateName} | Design Practices & Vacancies`;
  const description = `Discover architecture vacancies, junior & senior architect jobs, and internships across ${stateName}. Apply directly to leading architectural practices.`;
  const url = `https://trappedintoarchitecture.com/jobs/state/${encodeURIComponent(state.toLowerCase())}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      images: ["https://trappedintoarchitecture.com/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://trappedintoarchitecture.com/og-image.png"],
    },
  };
}

export default async function StateJobsPage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const stateName = formatSlug(state);

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .ilike("state", `%${stateName}%`)
    .order("posted_date", { ascending: false });

  const activeJobs = jobs || [];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Architecture Jobs in ${stateName}`,
    "description": `Current architectural job openings across ${stateName}`,
    "itemListElement": activeJobs.map((j, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://trappedintoarchitecture.com/jobs/${j.id}`,
      "name": `${j.position} at ${j.firm_name}`,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-black transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-black transition">
            Jobs
          </Link>
          <span>/</span>
          <span className="text-black font-semibold">{stateName}</span>
        </nav>

        {/* HERO BANNER */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700 mb-3">
                <MapPin size={14} className="text-red-500" />
                <span>State Directory</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Architecture Jobs in {stateName}
              </h1>
              <p className="text-gray-600 mt-2 text-base max-w-2xl leading-relaxed">
                Explore architectural opportunities across {stateName}. Browse verified openings from top architecture studios, interior firms, and design consultancies.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href={`/jobs?state=${encodeURIComponent(stateName)}`}
                className="px-5 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Filter {stateName} Jobs</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/jobs"
                className="px-5 py-3 bg-gray-100 text-gray-800 text-sm font-semibold rounded-xl hover:bg-gray-200 transition text-center"
              >
                All Jobs in India
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-6 text-sm text-gray-500">
            <div>
              <span className="font-bold text-gray-900 text-lg">{activeJobs.length}</span>{" "}
              {activeJobs.length === 1 ? "Job Opening" : "Job Openings"}
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Briefcase size={16} className="text-gray-400" />
              <span>Verified Firms</span>
            </div>
          </div>
        </div>

        {/* LISTINGS */}
        {activeJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No active jobs in {stateName} right now
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
              New architectural posts are updated daily. Check out jobs in other states or view all India vacancies.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition text-sm"
            >
              Browse All Jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeJobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                firm_name={job.firm_name}
                organization_type={job.organization_type}
                area={job.area || ""}
                city={job.city || ""}
                state={job.state || ""}
                position={job.position || ""}
                experience={job.experience || ""}
                salary={job.salary || ""}
                qualifications={job.qualifications || []}
                skills_required={job.skills_required || []}
                posted_date={job.posted_date || ""}
                last_date_to_apply={job.last_date_to_apply || ""}
                post_expiry_date={job.post_expiry_date || ""}
                job_description={job.job_description || ""}
                application_type={job.application_type || ""}
                apply_link={job.apply_link}
                application_email={job.application_email}
                source={job.source || ""}
                image={job.image || ""}
                viewMode="grid"
                save_count={job.save_count || 0}
                share_count={job.share_count || 0}
                employment_type={job.employment_type}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
