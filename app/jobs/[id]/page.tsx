import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { generateJobUrl, decodeUuid, generateCompanySlug } from "@/utils/jobUrl";
import ShareButtons from "@/components/ShareButtons";
import SaveButton from "@/components/SaveButton";

import { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: rawId } = await params;
  let id = rawId;
  const uuidMatch = rawId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  if (uuidMatch) {
    id = uuidMatch[0];
  } else if (rawId.length === 22 && !rawId.includes("-")) {
    const decoded = decodeUuid(rawId);
    if (decoded) id = decoded;
  }
  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single();
  
  if (!job) {
    return { title: "Job Not Found" };
  }
  
  return {
    title: `${job.position} — ${job.firm_name} | Trapped Into Architecture`,
    description: `${job.position} opportunity at ${job.firm_name} in ${job.city}, ${job.state}.`,
    openGraph: {
      title: `${job.position} — ${job.firm_name} | Trapped Into Architecture`,
      description: `${job.position} opportunity at ${job.firm_name} in ${job.city}, ${job.state}.`,
      url: `https://trappedintoarchitecture.com${generateJobUrl(job)}`,
      images: job.image ? [job.image] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${job.position} — ${job.firm_name} | Trapped Into Architecture`,
      description: `${job.position} opportunity at ${job.firm_name} in ${job.city}, ${job.state}.`,
      images: job.image ? [job.image] : [],
    }
  };
}


  const formatExperience = (exp: any) => {
      if (!exp) return "";
      let str = Array.isArray(exp) ? exp.join(", ") : String(exp);
      const parts = str.split(",").map(p => p.trim()).filter(Boolean);
      const unique = [];
      const lowerSeen = new Set();
      for (const p of parts) {
         if (!lowerSeen.has(p.toLowerCase())) {
            lowerSeen.add(p.toLowerCase());
            unique.push(p);
         }
      }
      return unique.join(", ");
  };

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  let id = rawId;
  const uuidMatch = rawId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  if (uuidMatch) {
    id = uuidMatch[0];
  } else if (rawId.length === 22 && !rawId.includes("-")) {
    const decoded = decodeUuid(rawId);
    if (decoded) id = decoded;
  }

  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  const { data: company } = await supabase
    .from("companies")
    .select("slug, phone, email, website")
    .eq("firm_name", job?.firm_name || "")
    .maybeSingle();

  const { data: jobs = [] } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .neq("id", id)
    .limit(20);

  if (!job || error) {
    return (
      <main className="p-10">
        <h1 className="text-5xl font-bold">Job Not Found</h1>
      </main>
    );
  }

  const companySlug = company?.slug || generateCompanySlug(job.firm_name);
  const isExpired = job.post_expiry_date && new Date(job.post_expiry_date) < new Date();

  const hasSkills = job.skills_required && Array.isArray(job.skills_required) && job.skills_required.filter(Boolean).length > 0;
  const hasQualifications = job.qualifications && ((Array.isArray(job.qualifications) && job.qualifications.filter(Boolean).length > 0) || (typeof job.qualifications === "string" && job.qualifications.trim()));
  
    let jobRole = "";
    let cleanDescription = job.job_description || "";
      let jobVacancies = "";
      
      // Parse Job Role
      if (cleanDescription.startsWith("**Job Role:**")) {
        const parts = cleanDescription.split("\n\n");
        if (parts.length > 1) {
          jobRole = parts[0].replace("**Job Role:**", "").trim();
          cleanDescription = parts.slice(1).join("\n\n");
        } else {
          jobRole = cleanDescription.replace("**Job Role:**", "").trim();
          cleanDescription = "";
        }
      }
      
      // Parse Number of Positions (could be at start now if no Job Role)
      if (cleanDescription.startsWith("**Number of Positions:**")) {
        const parts = cleanDescription.split("\n\n");
        if (parts.length > 1) {
          jobVacancies = parts[0].replace("**Number of Positions:**", "").trim();
          cleanDescription = parts.slice(1).join("\n\n");
        } else {
          jobVacancies = cleanDescription.replace("**Number of Positions:**", "").trim();
          cleanDescription = "";
        }
      }
    const hasDescription = cleanDescription.trim();
    const hasRole = jobRole.trim();

  const lowerSalary = job.salary ? job.salary.trim().toLowerCase() : "";
  const hasSalary = lowerSalary && !["not disclosed", "not specified", "negotiable", "-", "null", "as per industry standards"].includes(lowerSalary);
  const isIntern = job.employment_type === "Internship" || (job.position && job.position.toLowerCase().includes("intern"));
  const hasExperience = !isIntern && job.experience && ((Array.isArray(job.experience) && job.experience.length > 0) || (typeof job.experience === "string" && job.experience.trim()));
  const hasSource = job.source && job.source.trim();
    
    // Auto-extract contact details for older jobs
    const phoneRegex = /(?:\+?91|0)?\s*([6-9]\d{9})/g;
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    
    let extractedPhones = [];
    let match;
    while ((match = phoneRegex.exec(cleanDescription)) !== null) {
      extractedPhones.push(match[1]);
    }
    const fallbackPhone = extractedPhones.length > 0 ? extractedPhones[0] : null;
    
    let extractedEmails = [];
    while ((match = emailRegex.exec(cleanDescription)) !== null) {
      extractedEmails.push(match[1]);
    }
    const fallbackEmail = extractedEmails.length > 0 ? extractedEmails[0] : null;
    
    const displayEmail = job.application_email || company?.email || fallbackEmail;
    const displayPhone = company?.phone || fallbackPhone;
      const phoneArray = displayPhone ? String(displayPhone).split(',').map((p: string) => p.trim()).filter(Boolean) : [];
    

  
    const autoExpiryDate = new Date(new Date(job.posted_date || job.created_at).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const showExpiry = job.post_expiry_date && job.post_expiry_date !== autoExpiryDate;

  const cityJobs = jobs.filter((j: any) => j.city === job.city).slice(0, 3);
  const positionJobs = jobs.filter((j: any) => j.position === job.position).slice(0, 3);
  const recentJobs = [...jobs].sort((a,b) => new Date(b.created_at || b.posted_date).getTime() - new Date(a.created_at || a.posted_date).getTime()).slice(0, 3);
  const popularJobs = [...jobs].sort((a,b) => (b.save_count || 0) - (a.save_count || 0)).slice(0, 3);

  return (
    <main className="min-h-screen bg-gray-50 text-black">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "JobPosting",
              "title": job.position,
              "description": job.description || `Job opportunity for ${job.position} at ${job.firm_name}.`,
              "identifier": {
                "@type": "PropertyValue",
                "name": job.firm_name,
                "value": job.id
              },
              "datePosted": job.created_at,
              "validThrough": job.post_expiry_date || new Date(new Date(job.created_at).getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
              "employmentType": job.employment_type === "Full Time" ? "FULL_TIME" : job.employment_type === "Part Time" ? "PART_TIME" : job.employment_type === "Internship" ? "INTERN" : job.employment_type === "Freelance" ? "CONTRACTOR" : "OTHER",
              "hiringOrganization": {
                "@type": "Organization",
                "name": job.firm_name,
                "sameAs": job.website || "https://trappedintoarchitecture.com",
                "logo": job.logo_url || "https://trappedintoarchitecture.com/default-logo.png"
              },
              "jobLocation": {
                "@type": "Place",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": job.city,
                  "addressRegion": job.state,
                  "addressCountry": "IN"
                }
              },
              ...(job.salary && job.salary.toLowerCase() !== "not disclosed" && job.salary.toLowerCase() !== "negotiable" ? {
                "baseSalary": {
                  "@type": "MonetaryAmount",
                  "currency": "INR",
                  "value": {
                    "@type": "QuantitativeValue",
                    "value": job.salary,
                    "unitText": "MONTH"
                  }
                }
              } : {})
            })
          }}
        />
      <Navbar />

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-black transition">Jobs</Link>
          <span>/</span>
          <span className="text-black font-medium truncate">{job.position}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

          {/* MAIN CONTENT */}
          <div className="space-y-6">

            {/* HERO CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex flex-col md:flex-row">

                {/* LEFT COLUMN: IMAGE + SOCIAL ACTIONS */}
                <div className="md:w-[45%] bg-gray-50 flex flex-col border-b md:border-b-0 md:border-r border-gray-100">
                  {job.image ? (
                    <div className="flex-1 flex items-start justify-center p-6 sm:p-8">
                      <img
                        src={job.image}
                        alt={job.position}
                        className="w-full object-contain rounded-xl sticky top-8"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-6 text-gray-400 italic">
                      No Image Available
                    </div>
                  )}

                  {/* SAVE / SHARE (Moved from main content) */}
                  <div className="p-6 bg-gray-100 border-t border-gray-200 flex flex-col items-center justify-center gap-4 mt-auto">
                    <div className="flex items-center gap-3">
                      <SaveButton jobId={job.id} initialSaves={job.save_count || 0} variant="button" />
                      <ShareButtons url={`https://trappedintoarchitecture.com${generateJobUrl(job)}`} jobId={job.id} companyName={job.firm_name} position={job.position} organizationType={job.organization_type} city={job.city} state={job.state} area={job.area} experience={job.experience} employmentType={job.employment_type} initialShares={job.share_count || 0} variant="button" />
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                      <SaveButton jobId={job.id} initialSaves={job.save_count || 0} variant="statistic" />
                      <ShareButtons url={`https://trappedintoarchitecture.com${generateJobUrl(job)}`} jobId={job.id} companyName={job.firm_name} position={job.position} organizationType={job.organization_type} city={job.city} state={job.state} area={job.area} experience={job.experience} employmentType={job.employment_type} initialShares={job.share_count || 0} variant="statistic" />
                    </div>
                  </div>
                </div>

                {/* INFO */}
                <div className="flex-1 p-6 sm:p-8">

                  {/* POSITION — clickable */}
                  <Link href={`/jobs?position=${encodeURIComponent(job.position)}`} className="group">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-gray-600 transition">
                      {job.position}
                    </h1>
                  </Link>

                  {/* COMPANY — clickable */}
                  <Link href={`/companies/${companySlug}`} className="group">
                    <p className="text-lg text-gray-700 mt-1 group-hover:text-black group-hover:underline transition">
                      {job.firm_name}
                    </p>
                  </Link>

                  <p className="text-gray-500 mt-1">
                    {job.area && (
                      <>
                        <span className="text-gray-800">{job.area}</span>,{" "}
                      </>
                    )}
                    <Link href={`/jobs?city=${encodeURIComponent(job.city)}`} className="hover:underline hover:text-gray-800 transition">
                      {job.city}
                    </Link>
                    {job.state ? (
                      <>
                        ,{" "}
                        <Link href={`/jobs?state=${encodeURIComponent(job.state)}`} className="hover:underline hover:text-gray-800 transition">
                          {job.state}
                        </Link>
                      </>
                    ) : ""}
                  </p>

                  {/* TAGS */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.employment_type && (
                      <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200">
                        {job.employment_type}
                      </span>
                    )}
                    {job.workplace_type && (
                      <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200">
                        {job.workplace_type}
                      </span>
                    )}
                    {hasExperience && (
                      <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200">
                        {formatExperience(job.experience)}
                      </span>
                    )}
                    {hasSalary && (
                      <span className="bg-green-50 text-green-800 text-sm font-medium px-3 py-1.5 rounded-lg border border-green-200">
                        {job.salary}
                      </span>
                    )}
                  </div>

                  

                  {/* ADDITIONAL DETAILS BUNDLED INTO HERO CARD */}
                  <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                    
                    {/* QUALIFICATIONS */}
                    {hasQualifications && (
                      <div>
                        <h2 className="text-base font-bold mb-1 text-gray-900">Qualifications</h2>
                        <p className="text-gray-700 leading-relaxed">
                          {Array.isArray(job.qualifications) ? job.qualifications.join(", ") : job.qualifications}
                        </p>
                      </div>
                    )}

                    {/* SKILLS */}
                    {hasSkills && (
                      <div>
                        <h2 className="text-base font-bold mb-1 text-gray-900">Skills Required</h2>
                        <div className="flex flex-wrap gap-2">
                          {job.skills_required.filter(Boolean).map((skill: string) => (
                            <span key={skill.trim()} className="bg-gray-100 text-gray-800 border border-gray-200 px-4 py-2 rounded-full text-sm font-medium">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    
                      {/* JOB ROLE */}
                      {hasRole && (
                        <div>
                          <h2 className="text-base font-bold mb-1 text-gray-900">Job Role</h2>
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {jobRole}
                            </div>
                          </div>
                        )}
                        {jobVacancies && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                              <span className="text-xl">👥</span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Number of Positions</p>
                              <p className="font-semibold text-black">{jobVacancies}</p>
                            </div>
                          </div>
                        )}

                    
                    {/* CONTACT DETAILS (Moved here per user request) */}
                    {(displayEmail || displayPhone || company?.website) && (
                      <div className="pt-3 mt-3 border-t border-gray-100">
                        <h2 className="text-base font-bold mb-1 text-gray-900">Contact Details</h2>
                        <div className="flex flex-col gap-2">
                          {displayEmail && (
                            <p className="font-semibold text-black break-all">
                              <span className="text-gray-500 font-normal mr-1">Email:</span>
                              <a href={`mailto:${displayEmail}`} className="text-blue-600 hover:underline">{displayEmail}</a>
                            </p>
                          )}
                          {displayPhone && (
                            <p className="font-semibold text-black">
                              <span className="text-gray-500 font-normal mr-1">Phone:</span>
                              <a href={`tel:${displayPhone}`} className="text-blue-600 hover:underline">{displayPhone}</a>
                            </p>
                          )}
                          {company?.website && (
                            <p className="font-semibold text-black break-all">
                              <span className="text-gray-500 font-normal mr-1">Website:</span>
                              <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{company.website}</a>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* DATES */}
                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                        {job.posted_date && (
                          <div>
                            <p className="text-sm text-gray-500">Posted Date</p>
                            <p className="font-semibold mt-1">{job.posted_date}</p>
                          </div>
                        )}
                        {job.last_date_to_apply && (
                          <div>
                            <p className="text-sm text-gray-500">Last Date To Apply</p>
                            <p className="font-semibold mt-1">{job.last_date_to_apply}</p>
                          </div>
                        )}
                        {showExpiry && (
                            <div>
                              <p className="text-sm text-gray-500">Post Expiry Date</p>
                              <p className="font-semibold mt-1">{job.post_expiry_date}</p>
                            </div>
                          )}
                        {hasSource && (
                          <div>
                            <p className="text-sm text-gray-500">Source</p>
                            <p className="font-semibold mt-1">{job.source}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* APPLY / EMAIL NOW (Moved to bottom center) */}
                    <div className="pt-4 mt-4 border-t border-gray-100 flex justify-center w-full">
                      {isExpired ? (
                        <button disabled className="bg-gray-200 text-gray-500 px-8 py-3.5 rounded-xl text-lg font-bold cursor-not-allowed w-full sm:w-auto text-center">
                          Post Expired
                        </button>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                          {job.apply_link && (
                            <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="bg-black text-white px-8 py-3 rounded-xl text-base font-bold hover:bg-gray-800 transition w-full sm:w-auto text-center shadow-md">
                              Apply Now ↗
                            </a>
                          )}
                          {displayEmail && (
                              <a href={`mailto:${displayEmail}?subject=Application for ${encodeURIComponent(job.position)} at ${encodeURIComponent(job.firm_name)}`} className="bg-white text-black px-8 py-3 rounded-xl text-base font-bold border-2 border-black hover:bg-gray-50 transition w-full sm:w-auto text-center shadow-sm">
                                Email Now
                              </a>
                            )}
                          {!job.apply_link && !displayEmail && (
                            <span className="text-gray-500 text-sm italic">No application method provided</span>
                          )}
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            </div>


          
            {/* JOB DESCRIPTION CARD (Full Width Bottom Box) */}
            {hasDescription && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Job Description</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                  {cleanDescription}
                  </div>
                </div>
              )}


            
            </div>
            {/* SIDEBAR */}
          <aside className="space-y-6 lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full pr-1">

  {/* SAME POSITION JOBS */}
  {positionJobs.length > 0 && (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{job.position} Jobs</h2>
        <Link href={`/jobs?position=${encodeURIComponent(job.position)}`} className="text-sm text-gray-500 hover:text-black transition">View All</Link>
      </div>
      <div className="space-y-3">
        {positionJobs.map((pj: any) => (
          <Link key={pj.id} href={generateJobUrl(pj)} className="block border rounded-xl p-3 hover:bg-gray-50 transition">
            <h3 className="font-semibold">{pj.position}</h3>
            <p className="text-gray-500 text-sm mt-0.5">{pj.firm_name} · {pj.city}</p>
          </Link>
        ))}
      </div>
    </div>
  )}

  {/* JOBS IN SAME CITY */}
  {cityJobs.length > 0 && (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Jobs in {job.city}</h2>
        <Link href={`/jobs?city=${encodeURIComponent(job.city)}`} className="text-sm text-gray-500 hover:text-black transition">View All</Link>
      </div>
      <div className="space-y-3">
        {cityJobs.map((cj: any) => (
          <Link key={cj.id} href={generateJobUrl(cj)} className="block border rounded-xl p-3 hover:bg-gray-50 transition">
            <h3 className="font-semibold">{cj.position}</h3>
            <p className="text-gray-500 text-sm mt-0.5">{cj.firm_name}</p>
          </Link>
        ))}
      </div>
    </div>
  )}

  {/* POPULAR JOBS */}
  {popularJobs.length > 0 && (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Popular Jobs</h2>
        <Link href="/jobs" className="text-sm text-gray-500 hover:text-black transition">View All</Link>
      </div>
      <div className="space-y-2">
        {popularJobs.map((pj: any) => (
          <Link key={pj.id} href={generateJobUrl(pj)} className="block py-2 border-b last:border-none hover:bg-gray-50 transition px-1 rounded">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-black">{pj.firm_name}</span>
              {" "}is hiring{" "}
              <span className="font-semibold text-black">{pj.position}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">♡ {pj.save_count || 0} saved</p>
          </Link>
        ))}
      </div>
    </div>
  )}

  {/* RECENT JOBS */}
  {recentJobs.length > 0 && (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Recent Jobs</h2>
        <Link href="/jobs" className="text-sm text-gray-500 hover:text-black transition">View All</Link>
      </div>
      <div className="space-y-2">
        {recentJobs.map((rj: any) => (
          <Link key={rj.id} href={generateJobUrl(rj)} className="block py-2 border-b last:border-none hover:bg-gray-50 transition px-1 rounded">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-black">{rj.firm_name}</span>
              {" "}is hiring{" "}
              <span className="font-semibold text-black">{rj.position}</span>
              {" "}in{" "}
              <span className="text-gray-500">{rj.city}</span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  )}

  </aside>

        </div>

      </section>

      <Footer />
    </main>
  );
}


