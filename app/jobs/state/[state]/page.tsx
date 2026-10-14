// @ts-nocheck
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LocationJobsView from "@/components/LocationJobsView";
import { supabase } from "@/lib/supabase";
import { generateJobUrl } from "@/utils/jobUrl";
import Link from "next/link";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { MapPin, ArrowRight, Bell } from "lucide-react";

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
  const title = `Architect and Interior Designer Jobs in ${stateName} | Verified Openings`;
  const description = `Discover Architect, Senior Architect, Junior Architect, Interior Designer, and Draftsperson jobs across ${stateName}. Apply directly on Trapped Into Architecture.`;
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

  if (!jobs || jobs.length === 0) {
    redirect("/jobs");
  }

  const activeJobs = jobs;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Architect and Interior Designer Jobs in ${stateName}`,
    "description": `Current architectural and interior design job openings in ${stateName}`,
    "itemListElement": activeJobs.map((j, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://trappedintoarchitecture.com${generateJobUrl(j)}`,
      "name": `${j.position} at ${j.firm_name}`,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://trappedintoarchitecture.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Architecture Jobs",
        "item": "https://trappedintoarchitecture.com/jobs"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${stateName} Jobs`,
        "item": `https://trappedintoarchitecture.com/jobs/state/${encodeURIComponent(state.toLowerCase())}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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

        {/* TOP SECTION: HERO ON LEFT + WHATSAPP BANNER ON RIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch">
          
          {/* HERO BANNER (LEFT 2 COLUMNS) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700 mb-3">
                <MapPin size={14} className="text-red-500" />
                <span>State Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                Architect and Interior Designer Jobs in {stateName}
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed">
                Discover jobs in {stateName}: Senior Architect, Junior Architect, Junior Interior Designer, Senior Interior Designer, Draftsperson, and 3D Visualizer openings.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-500 font-medium">
                Total Listings: <strong className="text-black font-bold">{activeJobs.length}</strong>
              </span>
              <Link
                href="/jobs"
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Browse All Jobs</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* WHATSAPP SUBSCRIPTION CTA BANNER (RIGHT COLUMN) */}
          <div className="bg-gradient-to-br from-emerald-950 to-green-900 rounded-3xl p-6 sm:p-7 text-white shadow-sm flex flex-col justify-between border border-emerald-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-200 rounded-full text-xs font-semibold mb-3">
                <Bell size={13} className="animate-pulse" />
                <span>WhatsApp Job Alerts</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                Get Architect and Interior Designer Jobs on WhatsApp
              </h2>
              <p className="text-emerald-100/90 text-xs sm:text-sm mt-2 leading-relaxed">
                Get personalized notifications in your WhatsApp directly. Choose your experience and salary preferences.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-800/80">
              <Link
                href={`/contact?subject=${encodeURIComponent(`WhatsApp Job Alerts for ${stateName}`)}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold rounded-xl text-xs sm:text-sm transition shadow-md"
              >
                <span>Subscribe for WhatsApp Alerts</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>

        {/* FULL FILTER & VIEW SYSTEM */}
        <LocationJobsView
          initialJobs={activeJobs}
          locationName={stateName}
          locationType="state"
        />
      </main>

      <Footer />
    </div>
  );
}
