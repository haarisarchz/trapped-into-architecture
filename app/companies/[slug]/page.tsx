export const dynamic = 'force-dynamic';
// @ts-nocheck
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import CompanyActions from "@/components/CompanyActions";
import CompanyHeaderAndTabs from "@/components/company/CompanyHeaderAndTabs";
import { generateJobUrl, generateCompanySlug } from "@/utils/jobUrl";
import { Metadata } from "next";
import { Building2, Globe, Mail, MapPin, Briefcase } from "lucide-react";
import { formatExperience } from "@/utils/formatJobDetails";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    let companyData = null;

    const { data: company } = await supabase
      .from("companies")
      .select("firm_name, company_description, logo_url, city, state")
      .eq("slug", slug)
      .maybeSingle();

    if (company) {
      companyData = company;
    } else {
      // Fetch only firm names to prevent massive data loading
      const { data: firms } = await supabase
        .from("jobs")
        .select("firm_name")
        .eq("status", "published");
        
      if (firms) {
        const match = firms.find(j => {
          const genSlug = generateCompanySlug(j.firm_name || "");
          return genSlug === slug;
        });
        if (match) {
          companyData = { firm_name: match.firm_name, company_description: "", city: null, state: null, logo_url: null };
        }
      }
    }

    if (!companyData) {
      return { title: "Company Not Found | Trapped Into Architecture" };
    }

    const compLocation = [companyData.city, companyData.state].filter(Boolean).join(", ");
    const locSnippet = compLocation ? ` in ${compLocation}` : "";
    const title = `${companyData.firm_name} Architecture Firm${locSnippet} - Jobs & Profile | Trapped Into Architecture`;
    const description = companyData.company_description?.slice(0, 160) || `Explore architecture jobs, internships, and design portfolio at ${companyData.firm_name}${locSnippet}. Find career opportunities on Trapped Into Architecture.`;
    const companyUrl = `https://trappedintoarchitecture.com/companies/${slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: companyUrl,
      },
      openGraph: {
        title,
        description,
        url: companyUrl,
        images: companyData.logo_url ? [companyData.logo_url] : ["https://trappedintoarchitecture.com/default-logo.png"],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: companyData.logo_url ? [companyData.logo_url] : ["https://trappedintoarchitecture.com/default-logo.png"],
      }
    };
  } catch (error) {
    console.error("Error in generateMetadata:", error);
    return { title: "Error | Trapped Into Architecture" };
  }
}


export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;

    let company: any = null;
    const { data: companyRecord, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (companyError) {
      console.error("Error fetching company:", companyError);
    }

    company = companyRecord;
    let companyJobs = [];

    if (companyRecord) {
      // If we have a real company, just fetch its jobs
              // Fetch jobs by both company_id and firm_name to support legacy jobs
        const { data: jobsById, error: errId } = await supabase.from("jobs").select("*").eq("status", "published").eq("company_id", companyRecord.id);
        const { data: jobsByFirm, error: errFirm } = await supabase.from("jobs").select("*").eq("status", "published").eq("firm_name", companyRecord.firm_name);
        
        if (errId) console.error("Error fetching jobs by id:", errId);
        if (errFirm) console.error("Error fetching jobs by firm:", errFirm);
        
        const combined = [...(jobsById || []), ...(jobsByFirm || [])];
        const uniqueJobs = Array.from(new Map(combined.map(job => [job.id, job])).values());
        
        companyJobs = uniqueJobs.sort((a: any, b: any) => new Date(b.posted_date || 0).getTime() - new Date(a.posted_date || 0).getTime());
    } else {
      // If no company record, we must identify the firm_name first to avoid fetching ALL jobs
      const { data: firms, error: firmsError } = await supabase
        .from("jobs")
        .select("firm_name")
        .eq("status", "published");
        
      if (firmsError) {
        console.error("Error fetching firm names:", firmsError);
      } else if (firms) {
        const match = firms.find(j => generateCompanySlug(j.firm_name || "") === slug);
        if (match && match.firm_name) {
          const { data: matchedJobs, error: matchError } = await supabase
            .from("jobs")
            .select("*")
            .eq("status", "published")
            .eq("firm_name", match.firm_name)
            .order("posted_date", { ascending: false });
            
          if (matchError) console.error("Error fetching matched jobs:", matchError);
          companyJobs = matchedJobs || [];
        }
      }
    }

    // If no company record exists, but we have jobs, construct a virtual company
    if (!company && companyJobs.length > 0) {
      const representativeJob = companyJobs[0];
      company = {
          firm_name: representativeJob.firm_name || "Unknown Firm",
          organization_type: representativeJob.organization_type || "Firm",
          city: representativeJob.city || "",
          state: representativeJob.state || "",
          neighborhood: representativeJob.area || "",
          logo_url: representativeJob.image || "",
          company_description: "",
          website_link: "",
          contact_email: representativeJob.application_email || "",
          phone: "",
          linkedin: "",
          instagram: "",
          facebook: "",
        };
    }

    if (!company) {
      return (
        <main className="min-h-screen flex flex-col bg-gray-50 text-black">
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

    let favoriteCount = 0;
    try {
      const { count } = await supabase.from("favorite_companies").select("*", { count: "exact", head: true }).eq("company_slug", slug);
      if (count) favoriteCount = count;
    } catch (e) {}
    
    const location = [company.address, company.neighborhood, company.city, company.state].filter(Boolean).join(", ");

    const companyJsonLd = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": company.firm_name,
      "description": company.company_description || `Architecture firm and design practice: ${company.firm_name}`,
      "image": company.logo_url || "https://trappedintoarchitecture.com/default-logo.png",
      "url": `https://trappedintoarchitecture.com/companies/${slug}`,
      ...(company.contact_email ? { "email": company.contact_email } : {}),
      ...(company.phone ? { "telephone": company.phone } : {}),
      ...(company.website_link ? { "sameAs": [company.website_link, company.linkedin, company.instagram].filter(Boolean) } : {}),
      "address": {
        "@type": "PostalAddress",
        "streetAddress": company.neighborhood || company.address || "",
        "addressLocality": company.city || "India",
        "addressRegion": company.state || "",
        "addressCountry": "IN"
      }
    };

    return (
      <main className="min-h-screen flex flex-col bg-gray-50 text-black">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(companyJsonLd) }}
        />
        <Navbar />

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 md:py-16">
          <CompanyHeaderAndTabs
            company={company}
            companyJobs={companyJobs}
            slug={slug}
            favoriteCount={favoriteCount}
          />
        </div>

        <Footer />
      </main>
    );
  } catch (error) {
    console.error("Fatal error rendering company page:", error);
    return (
      <main className="min-h-screen flex flex-col bg-gray-50 text-black">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h1 className="text-3xl font-bold text-red-600 mb-4">An error occurred</h1>
          <p className="text-gray-500 mb-8">We encountered a problem loading this company profile. Please try again later.</p>
          <Link href="/companies" className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition">
            Back to Companies
          </Link>
        </div>
        <Footer />
      </main>
    );
  }
}


