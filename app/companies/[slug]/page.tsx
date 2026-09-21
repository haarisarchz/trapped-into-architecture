import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import CompanyActions from "@/components/CompanyActions";
import { generateJobUrl, generateCompanySlug } from "@/utils/jobUrl";
import { Metadata } from "next";
import { Building2, Globe, Mail, MapPin, Briefcase } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let companyData = null;

  const { data: company } = await supabase
    .from("companies")
    .select("firm_name, company_description, logo_url")
    .eq("slug", slug)
    .maybeSingle();

  if (company) {
    companyData = company;
  } else {
    // Fallback to jobs table if company not explicitly created
    const { data: jobs } = await supabase
      .from("jobs")
      .select("firm_name, city, state")
      .eq("status", "published");
      
    if (jobs) {
      const match = jobs.find(j => {
        const genSlug = generateCompanySlug(j.firm_name || "");
        return genSlug === slug;
      });
      if (match) companyData = { firm_name: match.firm_name, company_description: "" };
    }
  }

  if (!companyData) {
    return { title: "Company Not Found" };
  }

  return {
    title: `${companyData.firm_name} | Trapped Into Architecture`,
    description: companyData.company_description || `View architecture jobs and company profile for ${companyData.firm_name}`,
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let company: any = null;
  const { data: companyRecord } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  company = companyRecord;

  // Always fetch open jobs for this company slug
  // We need to fetch all published jobs, then filter by slug in JS to handle both real companies and legacy jobs
  const { data: allJobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const companyJobs = (allJobs || []).filter(j => {
    const genSlug = generateCompanySlug(j.firm_name || "");
    return genSlug === slug;
  });

  // If no company record exists, but we have jobs, construct a virtual company
  if (!company && companyJobs.length > 0) {
    const representativeJob = companyJobs[0];
    company = {
      firm_name: representativeJob.firm_name,
      organization_type: representativeJob.organization_type || "Firm",
      city: representativeJob.city,
      state: representativeJob.state,
      logo_url: representativeJob.image || "", // Use job image as fallback logo if exists
      company_description: "",
      website_link: "",
      contact_email: representativeJob.application_email || "",
      linkedin: "",
      instagram: "",
    };
  }

  if (!company) {
    return (
      <main className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Company Not Found</h1>
          <p className="text-gray-500 mb-8">The company you are looking for does not exist or has no active listings.</p>
          <Link href="/companies" className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition">
            Browse All Companies
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const location = [company.city, company.state].filter(Boolean).join(", ");

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 md:py-16">
        {/* COMPANY HEADER */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-start mb-10">
          {/* LOGO */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.firm_name} className="w-full h-full object-cover" />
            ) : (
              <Building2 size={40} className="text-gray-400" />
            )}
          </div>

          {/* DETAILS */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{company.firm_name}</h1>
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
                  {company.organization_type || "Firm"}
                </span>
              </div>
              
              <div className="md:ml-auto shrink-0 pt-2 md:pt-0">
                <CompanyActions slug={slug} companyName={company.firm_name} variant="page" />
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-gray-600 text-sm md:text-base mb-6">
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-gray-400" />
                  {location}
                </div>
              )}
              {company.website_link && (
                <a href={company.website_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-black transition">
                  <Globe size={18} className="text-gray-400" />
                  Website
                </a>
              )}
              {company.contact_email && (
                <a href={`mailto:${company.contact_email}`} className="flex items-center gap-2 hover:text-black transition">
                  <Mail size={18} className="text-gray-400" />
                  Email
                </a>
              )}
            </div>

            {company.company_description && (
              <div className="prose prose-sm md:prose-base text-gray-700 max-w-none border-t border-gray-100 pt-6">
                <p className="whitespace-pre-wrap">{company.company_description}</p>
              </div>
            )}
          </div>
        </div>

        {/* OPEN POSITIONS */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Current Open Positions</h2>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
              {companyJobs.length} {companyJobs.length === 1 ? 'Job' : 'Jobs'}
            </span>
          </div>

          {companyJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companyJobs.map((job: any) => (
                <Link
                  key={job.id}
                  href={generateJobUrl(job)}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-300 transition group flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-500 transition mb-2">
                      {job.position}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                      <Briefcase size={16} />
                      {job.experience ? job.experience : "Experience not specified"}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.employment_type && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-200">
                        {job.employment_type}
                      </span>
                    )}
                    {job.workplace_type && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-200">
                        {job.workplace_type}
                      </span>
                    )}
                    {(job.city || job.state) && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-200 flex items-center gap-1">
                        <MapPin size={12} />
                        {[job.city, job.state].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <p className="text-gray-500">No open positions available at this time.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}