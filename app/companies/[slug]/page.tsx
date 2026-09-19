import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { generateJobUrl } from "@/utils/jobUrl";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: company } = await supabase
    .from("companies")
    .select("firm_name, company_description, logo_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!company) {
    return { title: "Company Not Found" };
  }

  return {
    title: `${company.firm_name} | Architecture Jobs`,
    description: company.company_description || `View architecture jobs and company profile for ${company.firm_name}`,
    openGraph: {
      title: `${company.firm_name} | Architecture Jobs`,
      description: company.company_description || `View architecture jobs and company profile for ${company.firm_name}`,
      images: company.logo_url ? [{ url: company.logo_url }] : [],
    },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Fetch Company
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!company) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto py-24 text-center">
          <h1 className="text-4xl font-bold">Company Not Found</h1>
        </div>
        <Footer />
      </main>
    );
  }

  // 2. Fetch Active Jobs for this company
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("firm_name", company.firm_name);

  const activeJobs = jobs || [];

  // 3. Fetch Similar Companies (same org type)
  const { data: similarCompanies } = await supabase
    .from("companies")
    .select("firm_name, slug, city, logo_url")
    .eq("organization_type", company.organization_type)
    .neq("id", company.id)
    .limit(3);

  // 4. Fetch Companies in same city
  const { data: cityCompanies } = await supabase
    .from("companies")
    .select("firm_name, slug, logo_url")
    .eq("city", company.city)
    .neq("id", company.id)
    .limit(3);

  // 5. Fetch Recently Added Companies
  const { data: recentCompanies } = await supabase
    .from("companies")
    .select("firm_name, slug, logo_url")
    .neq("id", company.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.firm_name,
    description: company.company_description,
    url: company.website,
    logo: company.logo_url,
    address: {
      "@type": "PostalAddress",
      addressLocality: company.city,
      addressRegion: company.state,
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 py-8">
        <Link href="/companies" className="inline-block mb-6 text-black hover:underline">
          ← Back to Companies
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* HERO */}
            <div className="bg-white rounded-3xl shadow p-8">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Logo */}
                <div className="w-28 h-28 rounded-full bg-gray-100 border shadow flex items-center justify-center overflow-hidden flex-shrink-0">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={company.firm_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-5xl font-bold text-gray-400">
                      {company.firm_name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Company Info */}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold">{company.firm_name}</h1>
                  <p className="text-black mt-2">{company.organization_type}</p>
                  <p className="text-gray-500 mt-2">
                    📍 {company.city}, {company.state}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-5">
                    <span className="px-4 py-2 rounded-full bg-gray-200 text-gray-900 text-sm">
                      {activeJobs.length} Active Jobs
                    </span>
                    <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm">
                      {company.state}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm">
                      Verified Company
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ABOUT + CONTACT */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-3xl shadow p-8">
                <h2 className="text-2xl font-bold mb-5">About Company</h2>
                <p className="text-gray-600 leading-8 whitespace-pre-line">
                  {company.company_description ||
                    "This company has not added its profile yet. Once verified, the complete company description, vision, services, founder information and practice philosophy will appear here."}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mt-8">
                  <div>
                    <h4 className="font-semibold">Founder</h4>
                    <p className="text-gray-500">{company.founder || "Not Available"}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Founded</h4>
                    <p className="text-gray-500">{company.founded_year || "Not Available"}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Company Size</h4>
                    <p className="text-gray-500">{company.employee_size || company.company_size || "Not Available"}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Specialisation</h4>
                    <p className="text-gray-500">{company.specialisation || "Architecture"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow p-6">
                  <h2 className="text-xl font-bold mb-5">Contact</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>📍 {company.city}, {company.state}</p>
                    <p>📧 {company.email || "Not Available"}</p>
                    <p>📞 {company.phone || "Not Available"}</p>
                    <p className="truncate">🌐 {company.website ? <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{company.website}</a> : "Not Available"}</p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow p-6">
                  <h2 className="text-xl font-bold mb-5">Company Statistics</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100 rounded-xl p-4 text-center">
                      <h3 className="text-2xl font-bold">{activeJobs.length}</h3>
                      <p className="text-sm text-gray-500">Jobs</p>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4 text-center">
                      <h3 className="text-2xl font-bold">0</h3>
                      <p className="text-sm text-gray-500">Projects</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* JOBS TAB */}
            <div className="bg-white rounded-3xl shadow p-8">
              <h2 className="text-2xl font-bold mb-6">Current Openings</h2>
              {activeJobs.length > 0 ? (
                <div className="space-y-5">
                  {activeJobs.map((job: any) => (
                    <div
                      key={job.id}
                      className="border rounded-2xl p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
                    >
                      <div>
                        <h3 className="text-xl font-semibold">{job.position}</h3>
                        <p className="text-gray-500 mt-2">
                          {job.city}, {job.state}
                        </p>
                      </div>
                      <Link
                        href={generateJobUrl(job)}
                        className="bg-black text-white px-6 py-3 rounded-xl text-center hover:bg-gray-900 transition"
                      >
                        View Job
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No active jobs found for this company.</p>
              )}
            </div>

          </div> {/* END LEFT COLUMN */}

          {/* RIGHT SIDEBAR */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Similar Companies */}
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Similar Companies</h3>
              </div>
              <div className="space-y-4">
                {similarCompanies && similarCompanies.length > 0 ? (
                  similarCompanies.map((sim: any) => (
                    <Link key={sim.slug} href={`/companies/${sim.slug}`} className="flex items-center gap-3 pb-3 border-b last:border-0 hover:bg-gray-50 p-2 rounded-lg transition">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {sim.logo_url && <img src={sim.logo_url} alt={sim.firm_name} className="w-full h-full object-cover"/>}
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate max-w-[150px]">{sim.firm_name}</p>
                        <p className="text-xs text-gray-500">{sim.city}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No similar companies found.</p>
                )}
              </div>
            </div>

            {/* Companies in City */}
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Companies in {company.city}</h3>
              </div>
              <div className="space-y-4">
                {cityCompanies && cityCompanies.length > 0 ? (
                  cityCompanies.map((sim: any) => (
                    <Link key={sim.slug} href={`/companies/${sim.slug}`} className="block pb-3 border-b last:border-0 hover:text-black transition">
                      <p className="font-medium text-sm truncate">{sim.firm_name}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No other companies in this city.</p>
                )}
              </div>
            </div>

            {/* Recently Added */}
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Recently Added</h3>
              </div>
              <div className="space-y-4">
                {recentCompanies && recentCompanies.length > 0 ? (
                  recentCompanies.map((sim: any) => (
                    <Link key={sim.slug} href={`/companies/${sim.slug}`} className="block pb-3 border-b last:border-0 hover:text-black transition">
                      <p className="font-medium text-sm truncate">{sim.firm_name}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">None recently added.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}