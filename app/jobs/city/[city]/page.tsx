// @ts-nocheck
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/Jobcard";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { MapPin, ArrowRight, Briefcase, Bell, CheckCircle2 } from "lucide-react";

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
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const cityName = formatSlug(city);
  const title = `Architecture & Interior Design Jobs in ${cityName} | Latest Openings`;
  const description = `Explore the latest architecture jobs, interior designer openings, junior & senior architect vacancies, and internships in ${cityName}. Apply directly on Trapped Into Architecture.`;
  const url = `https://trappedintoarchitecture.com/jobs/city/${encodeURIComponent(city.toLowerCase())}`;

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

export default async function CityJobsPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const cityName = formatSlug(city);

  // Fetch all jobs in this city (including outdated/expired so candidates have complete design directory history)
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .ilike("city", `%${cityName}%`)
    .order("posted_date", { ascending: false });

  // If a city has 0 jobs, don't show an empty dead-end page — immediately redirect to the main directory
  if (!jobs || jobs.length === 0) {
    redirect("/jobs");
  }

  const activeJobs = jobs;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Architecture & Interior Design Jobs in ${cityName}`,
    "description": `Current architectural and design openings in ${cityName}`,
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
          <span className="text-black font-semibold">{cityName}</span>
        </nav>

        {/* HERO BANNER */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700 mb-3">
                <MapPin size={14} className="text-red-500" />
                <span>City Directory</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Architecture & Interior Jobs in {cityName}
              </h1>
              <p className="text-gray-600 mt-2 text-base max-w-2xl leading-relaxed">
                Discover verified architectural practices, interior studios, and design consultancies in {cityName}. Browse current openings and historical vacancies.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href={`/jobs?city=${encodeURIComponent(cityName)}`}
                className="px-5 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-sm text-center"
              >
                <span>Filter {cityName} Jobs</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/jobs"
                className="px-5 py-3 bg-gray-100 text-gray-800 text-sm font-semibold rounded-xl hover:bg-gray-200 transition text-center"
              >
                All Jobs Directory
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-6 text-sm text-gray-500">
            <div>
              <span className="font-bold text-gray-900 text-lg">{activeJobs.length}</span>{" "}
              {activeJobs.length === 1 ? "Total Listing" : "Total Listings"}
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Briefcase size={16} className="text-gray-400" />
              <span>Verified Studios & Practices</span>
            </div>
          </div>
        </div>

        {/* WHATSAPP SUBSCRIPTION CTA BANNER */}
        <div className="bg-gradient-to-r from-emerald-900 to-green-800 rounded-3xl p-6 sm:p-8 text-white shadow-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-emerald-200">
              <Bell size={14} className="animate-pulse" />
              <span>WhatsApp Job Delivery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Get {cityName} Architecture & Interior Jobs on WhatsApp
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Don't miss openings in {cityName}. Receive verified job alerts and internship updates delivered straight to your WhatsApp as soon as firms post them.
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0">
            <Link
              href={`/contact?subject=${encodeURIComponent(`WhatsApp Alerts Subscription for ${cityName}`)}`}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold rounded-2xl text-sm transition shadow-lg"
            >
              <span>Subscribe for {cityName} Alerts</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* SECTION HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Listings in {cityName}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Showing active and recent openings. Click any position to view full details.
            </p>
          </div>
        </div>

        {/* LISTINGS */}
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
      </main>

      <Footer />
    </div>
  );
}
