import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { generateJobUrl, decodeUuid, generateCompanySlug } from "@/utils/jobUrl";
import ShareButtons from "@/components/ShareButtons";

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
    .select("slug")
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
  const hasDescription = job.job_description && job.job_description.trim();
  const hasSalary = job.salary && job.salary.trim();
  const hasExperience = job.experience && ((Array.isArray(job.experience) && job.experience.length > 0) || (typeof job.experience === "string" && job.experience.trim()));
  const hasSource = job.source && job.source.trim();

  const cityJobs = jobs.filter((j: any) => j.city === job.city).slice(0, 5);
  const positionJobs = jobs.filter((j: any) => j.position === job.position).slice(0, 5);
  const recentJobs = [...jobs].sort((a,b) => new Date(b.created_at || b.posted_date).getTime() - new Date(a.created_at || a.posted_date).getTime()).slice(0, 5);
  const popularJobs = [...jobs].sort((a,b) => (b.save_count || 0) - (a.save_count || 0)).slice(0, 5);

  return (
    <main className="min-h-screen bg-gray-50">
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

                {/* IMAGE */}
                {job.image && (
                  <div className="md:w-[38%] bg-gray-50 flex items-start justify-center p-4">
                    <img
                      src={job.image}
                      alt={job.position}
                      className="w-full object-contain rounded-xl"
                    />
                  </div>
                )}

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
                        {Array.isArray(job.experience) ? job.experience.join(", ") : job.experience}
                      </span>
                    )}
                    {hasSalary && (
                      <span className="bg-green-50 text-green-800 text-sm font-medium px-3 py-1.5 rounded-lg border border-green-200">
                        {job.salary}
                      </span>
                    )}
                  </div>

                  {/* CTA BUTTONS */}
                  <div className="flex flex-wrap items-center gap-3 mt-6">
                    {isExpired ? (
                      <button disabled className="bg-gray-200 text-gray-500 px-6 py-3 rounded-xl text-base font-semibold cursor-not-allowed">
                        Post Expired
                      </button>
                    ) : (
                      <>
                        {job.apply_link && (
                          <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="bg-black text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-gray-800 transition">
                            Apply Now →
                          </a>
                        )}
                        <ShareButtons url={`https://trappedintoarchitecture.com${generateJobUrl(job)}`} jobId={job.id} companyName={job.firm_name} position={job.position} experience={job.experience} initialShares={job.share_count || 0} organizationType={job.organization_type} location={`${job.city}, ${job.state}`} variant="button" />
                        {job.application_email && (
                          <a href={`mailto:${job.application_email}?subject=Application for ${encodeURIComponent(job.position)} at ${encodeURIComponent(job.firm_name)}`} className="bg-white text-black px-6 py-3 rounded-xl text-base font-semibold border-2 border-black hover:bg-gray-50 transition">
                            Email Now
                          </a>
                        )}
                        {!job.apply_link && !job.application_email && (
                          <span className="text-gray-500 text-sm italic">No application method provided</span>
                        )}
                      </>
                    )}
                    
                    <div className="ml-auto flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-gray-700 font-semibold text-lg px-2 py-1.5" aria-label="Save count">
                        <Bookmark size={20} className="text-gray-500" /> {job.save_count || 0}
                      </div>
                      <ShareButtons url={`https://trappedintoarchitecture.com${generateJobUrl(job)}`} jobId={job.id} companyName={job.firm_name} position={job.position} experience={job.experience} initialShares={job.share_count || 0} organizationType={job.organization_type} location={`${job.city}, ${job.state}`} variant="statistic" />
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* QUALIFICATIONS */}
            {hasQualifications && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Qualifications</h2>
                <p className="text-gray-700 leading-relaxed">
                  {Array.isArray(job.qualifications) ? job.qualifications.join(", ") : job.qualifications}
                </p>
              </div>
            )}

            {/* SKILLS */}
            {hasSkills && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Skills Required</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.filter(Boolean).map((skill: string) => (
                    <span key={skill.trim()} className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* DESCRIPTION */}
            {hasDescription && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Job Description</h2>
                <div className="text-gray-700 leading-8 whitespace-pre-line">
                  {job.job_description}
                </div>
              </div>
            )}

            {/* DATES */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Job Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                {job.post_expiry_date && (
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

          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">

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
