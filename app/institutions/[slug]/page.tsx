export const dynamic = "force-dynamic";

import React from "react";
import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Globe,
  Mail,
  Phone,
  User,
  GraduationCap,
  Calendar,
  Award,
  ExternalLink,
  ChevronLeft,
  Info,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;

    const { data: inst } = await supabase
      .from("institutions")
      .select("institution_name, coa_code, city, district, state, affiliated_university")
      .eq("slug", slug)
      .maybeSingle();

    if (!inst) {
      return { title: "Institution Not Found | Trapped Into Architecture" };
    }

    const loc = [inst.city || inst.district, inst.state].filter(Boolean).join(", ");
    const codeStr = inst.coa_code ? ` (${inst.coa_code})` : "";
    const title = `${inst.institution_name}${codeStr} - Architecture College in ${loc} | TI2A`;
    const description = `Explore official Council of Architecture (COA) approval status, approved B.Arch intake history, university affiliation, and contact details for ${inst.institution_name}${loc ? ` in ${loc}` : ""}.`;
    const url = `https://trappedintoarchitecture.com/institutions/${slug}`;

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
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch (err) {
    return { title: "Institution Directory | Trapped Into Architecture" };
  }
}

export default async function InstitutionProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Fetch institution master record
  const { data: inst, error: instError } = await supabase
    .from("institutions")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (instError || !inst) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-20 text-center">
          <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Institution Not Found</h1>
          <p className="text-sm text-gray-500 mb-6">
            The requested architecture institution profile could not be found or has not been published yet.
          </p>
          <Link
            href="/institutions"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition"
          >
            <ChevronLeft size={16} /> Back to Institutions Directory
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // 2. Fetch all annual approval and intake records
  const { data: recordsData } = await supabase
    .from("institution_annual_records")
    .select("*, source_documents(document_title, source_name, academic_year, file_url)")
    .eq("institution_id", inst.id)
    .order("academic_year", { ascending: false });

  const records = recordsData || [];
  const latestRecord = records[0] || null;

  // 3. Fetch NIRF rankings if available
  const { data: rankingsData } = await supabase
    .from("institution_rankings")
    .select("*")
    .eq("institution_id", inst.id)
    .order("ranking_year", { ascending: false });

  const rankings = rankingsData || [];

  const locationString = [inst.address, inst.locality, inst.city, inst.district, inst.state, inst.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* BREADCRUMB & BACK LINK */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
          <Link
            href="/institutions"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black transition"
          >
            <ChevronLeft size={14} /> Back to All Institutions
          </Link>
        </div>

        {/* HERO / HEADER SECTION */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {inst.coa_code && (
                    <span className="font-mono text-xs font-extrabold px-3 py-1 bg-black text-white rounded-md tracking-wider">
                      COA CODE: {inst.coa_code}
                    </span>
                  )}
                  <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-800 rounded-md">
                    {inst.state}
                  </span>
                  {inst.institution_type && (
                    <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-md">
                      {inst.institution_type}
                    </span>
                  )}
                  {rankings.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
                      <Award size={13} className="text-amber-600" />
                      NIRF Ranked #{rankings[0].rank_number} ({rankings[0].ranking_year})
                    </span>
                  )}
                </div>

                {/* Institution Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-snug">
                  {inst.institution_name}
                </h1>

                {/* Affiliation & Locality */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-gray-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-gray-400 shrink-0" />
                    <span>{[inst.locality, inst.city || inst.district, inst.state].filter(Boolean).join(", ")}</span>
                  </div>
                  {inst.affiliated_university && (
                    <div className="flex items-center gap-1.5">
                      <Building2 size={16} className="text-gray-400 shrink-0" />
                      <span>Affiliated to {inst.affiliated_university}</span>
                    </div>
                  )}
                  {inst.establishment_year && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={16} className="text-gray-400 shrink-0" />
                      <span>Architecture Started: {inst.establishment_year}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* LATEST APPROVED INTAKE HERO CARD */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shrink-0 min-w-[240px] text-left">
                <div className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
                  Latest Approved Intake
                </div>
                {latestRecord ? (
                  <>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-gray-900">
                        {latestRecord.approved_intake}
                      </span>
                      <span className="text-sm font-semibold text-gray-500">
                        seats / year
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 font-medium mt-1">
                      Course: <strong>{latestRecord.course_name || "B.Arch"}</strong>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Academic Year: {latestRecord.academic_year}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-1.5 text-xs text-green-700 font-bold">
                      <CheckCircle2 size={14} />
                      {latestRecord.approval_status || "COA Approved"}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-400 mt-2">
                    Intake records currently pending synchronization.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* DETAILS GRID: 2 COLUMNS */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN COLUMN (LEFT): INTAKE HISTORY & ACADEMIC INFO */}
          <div className="lg:col-span-2 space-y-8">
            {/* SECTION: ANNUAL COA APPROVAL & INTAKE HISTORY */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Annual Approved Intake History</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Year-by-year regulatory sanctions published by the Council of Architecture
                  </p>
                </div>
                <div className="text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg">
                  {records.length} Year{records.length === 1 ? "" : "s"} Recorded
                </div>
              </div>

              {records.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">
                  No historical intake records have been published for this institution yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                        <th className="py-3 px-3 rounded-l-lg">Academic Year</th>
                        <th className="py-3 px-3">Course</th>
                        <th className="py-3 px-3">Approved Seats</th>
                        <th className="py-3 px-3">Trend</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 rounded-r-lg">Source Document</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {records.map((rec: any, idx: number) => {
                        const prevRec = records[idx + 1];
                        let trendIcon = <Minus size={13} className="text-gray-300" />;
                        let trendText = "Unchanged";

                        if (prevRec && typeof prevRec.approved_intake === "number") {
                          if (rec.approved_intake > prevRec.approved_intake) {
                            trendIcon = <TrendingUp size={14} className="text-green-600" />;
                            trendText = `+${rec.approved_intake - prevRec.approved_intake}`;
                          } else if (rec.approved_intake < prevRec.approved_intake) {
                            trendIcon = <TrendingDown size={14} className="text-red-500" />;
                            trendText = `-${prevRec.approved_intake - rec.approved_intake}`;
                          }
                        }

                        const isLatest = idx === 0;

                        return (
                          <tr
                            key={rec.id || idx}
                            className={`hover:bg-gray-50/70 transition ${
                              isLatest ? "bg-blue-50/30" : ""
                            }`}
                          >
                            <td className="py-3.5 px-3 font-mono font-bold text-gray-900 whitespace-nowrap">
                              {rec.academic_year}
                              {isLatest && (
                                <span className="ml-2 text-[10px] font-sans font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                                  Current
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-gray-700 whitespace-nowrap">
                              {rec.course_name || "B.Arch"}
                            </td>
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="text-base font-extrabold text-gray-900">
                                {rec.approved_intake}
                              </span>
                              <span className="text-xs text-gray-400 ml-1">seats</span>
                            </td>
                            <td className="py-3.5 px-3 text-xs whitespace-nowrap">
                              <div className="flex items-center gap-1 font-semibold text-gray-600">
                                {trendIcon}
                                <span>{trendText}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                {rec.approval_status || "Approved"}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-xs text-gray-500 whitespace-nowrap">
                              {rec.source_documents?.document_title || "COA Gazette Record"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Regulatory Notice Footer */}
              <div className="mt-5 p-3.5 bg-gray-50 rounded-xl text-xs text-gray-500 leading-relaxed flex items-start gap-2 border border-gray-100">
                <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Important Regulatory Context:</strong> Changes in intake or absence in a given reporting year do not necessarily reflect permanent closure or institutional quality. Always refer to official Council of Architecture gazette updates for statutory admissions decisions.
                </span>
              </div>
            </div>

            {/* SECTION: NIRF RANKINGS (IF AVAILABLE) */}
            {rankings.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <Award size={20} className="text-amber-500" />
                  <h2 className="text-lg font-bold text-gray-900">National Institutional Ranking Framework (NIRF)</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {rankings.map((rk: any, i: number) => (
                    <div key={i} className="bg-amber-50/50 border border-amber-200/70 rounded-2xl p-3.5 text-center">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                        NIRF {rk.ranking_year}
                      </div>
                      <div className="text-2xl font-black text-amber-950 mt-1">
                        #{rk.rank_number}
                      </div>
                      <div className="text-[10px] text-amber-700 mt-0.5">Architecture</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDE COLUMN (RIGHT): CONTACT, LOCATION, SOURCE INFO */}
          <div className="space-y-6">
            {/* CONTACT & LOCATION CARD */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Institution Contact & Address
              </h3>

              {/* Address */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <MapPin size={12} /> Address
                </div>
                <div className="text-xs text-gray-700 leading-relaxed font-medium">
                  {locationString || "Complete postal address pending validation."}
                </div>
              </div>

              {/* Head of Institution */}
              {inst.head_of_institution && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                    <User size={12} /> Head / Principal / Director
                  </div>
                  <div className="text-xs text-gray-900 font-bold">
                    {inst.head_of_institution}
                  </div>
                </div>
              )}

              {/* Website */}
              {inst.website && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                    <Globe size={12} /> Official Website
                  </div>
                  <div>
                    <a
                      href={inst.website.startsWith("http") ? inst.website : `https://${inst.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {inst.website} <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}

              {/* Email */}
              {inst.official_email && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                    <Mail size={12} /> Official Email
                  </div>
                  <div>
                    <a
                      href={`mailto:${inst.official_email}`}
                      className="text-xs font-semibold text-gray-800 hover:text-black underline break-all"
                    >
                      {inst.official_email}
                    </a>
                  </div>
                </div>
              )}

              {/* Phone */}
              {inst.official_phone && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                    <Phone size={12} /> Contact Number
                  </div>
                  <div className="text-xs text-gray-800 font-semibold">
                    {inst.official_phone}
                  </div>
                </div>
              )}
            </div>

            {/* DATA AUDIT & VERIFICATION CARD */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <FileText size={16} className="text-gray-400" /> Source & Audit Trail
              </h3>

              <div className="text-xs space-y-2 text-gray-600">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Primary Source</span>
                  <span className="font-bold text-gray-900">Council of Architecture (COA)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">COA Identifier</span>
                  <span className="font-mono font-bold text-gray-900">{inst.coa_code || "Pending"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Latest Year Data</span>
                  <span className="font-bold text-gray-900">{latestRecord?.academic_year || "2024-2025"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Last Verified</span>
                  <span className="font-bold text-gray-900">
                    {inst.updated_at ? new Date(inst.updated_at).toLocaleDateString("en-IN") : "Recent"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://www.coa.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition"
                >
                  Visit Council of Architecture (COA) <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
