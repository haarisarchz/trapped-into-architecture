"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Briefcase,
  Users,
  Award,
  Sparkles,
  ShieldCheck,
  MailCheck,
  PhoneCall,
  Calendar,
  Layers,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FolderGit2,
  Trophy,
} from "lucide-react";
import CompanyActions from "@/components/CompanyActions";
import CompanyBadgeExplanationModal from "./CompanyBadgeExplanationModal";
import ClaimCompanyModal from "./ClaimCompanyModal";
import { generateJobUrl } from "@/utils/jobUrl";
import { formatExperience } from "@/utils/formatJobDetails";

interface CompanyHeaderAndTabsProps {
  company: any;
  companyJobs: any[];
  slug: string;
  favoriteCount: number;
}

export default function CompanyHeaderAndTabs({
  company,
  companyJobs,
  slug,
  favoriteCount,
}: CompanyHeaderAndTabsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "team" | "projects" | "awards">("overview");
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        const role = (user.role || "").toLowerCase().replace(/[\s_]+/g, "");
        if (role === "admin" || role === "superadmin" || role === "ceo" || role === "jobadmin") {
          setIsAdmin(true);
        }
      }
    } catch (e) {}
  }, []);

  const tier = (company.badge_tier || "bronze").toLowerCase();
  const completionPercentage = company.completion_percentage ?? 20;
  const isClaimed = Boolean(company.is_claimed);
  const isEmailVerified = Boolean(company.email_verified || company.is_verified);
  const isPhoneVerified = Boolean(company.phone_verified);

  const tierBadgeInfo: Record<string, { label: string; icon: string; bg: string; text: string; border: string }> = {
    bronze: { label: "Bronze Level Studio", icon: "🥉", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
    silver: { label: "Silver Level Studio", icon: "🥈", bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300" },
    gold: { label: "Gold Level Studio", icon: "🥇", bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-300" },
    platinum: { label: "Platinum Level Studio", icon: "💎", bg: "bg-cyan-50", text: "text-cyan-800", border: "border-cyan-300" },
    diamond: { label: "Diamond Level Studio", icon: "👑", bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-300" },
  };

  const currentTierBadge = tierBadgeInfo[tier] || tierBadgeInfo.bronze;
  const location = [company.neighborhood, company.address, company.city, company.state].filter(Boolean).join(", ");

  return (
    <div className="w-full">
      {/* ADMIN AI NOTICE BANNER */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                Admin Studio Controls & AI Suggested Edits
              </p>
              <p className="text-xs text-gray-600">
                Auto-enrich details, adjust verification badges, and edit company attributes.
              </p>
            </div>
          </div>
          <Link
            href={`/admin/companies/edit/${company.id || "new"}?name=${encodeURIComponent(company.firm_name)}&ai=true`}
            className="shrink-0 bg-black text-white hover:bg-gray-800 text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <span>Edit & AI Enrich</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* COMPANY HEADER CARD */}
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-start mb-8">
        {/* LOGO */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 shadow-xs">
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.firm_name} className="w-full h-full object-cover" />
          ) : (
            <Building2 size={40} className="text-gray-400" />
          )}
        </div>

        {/* DETAILS */}
        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{company.firm_name}</h1>

                {/* LEVEL BADGE PILL WITH QUESTION MARK */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentTierBadge.bg} ${currentTierBadge.text} ${currentTierBadge.border}`}>
                  <span>{currentTierBadge.icon}</span>
                  <span>{currentTierBadge.label}</span>
                  <button
                    onClick={() => setIsBadgeModalOpen(true)}
                    className="p-0.5 rounded-full hover:bg-black/10 transition cursor-pointer text-gray-500 hover:text-black ml-0.5"
                    title="View Studio Level & Badges Info"
                  >
                    <HelpCircle size={14} />
                  </button>
                </div>
              </div>

              {/* BADGES & CATEGORY ROW */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg">
                  {company.organization_type || "Architecture Firm"}
                </span>

                {isClaimed ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg">
                    <ShieldCheck size={13} className="text-blue-600" />
                    <span>Claimed Studio</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setIsClaimModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-300 text-xs font-medium rounded-lg transition cursor-pointer"
                  >
                    <Building2 size={13} />
                    <span>Claim this Studio</span>
                  </button>
                )}

                {isEmailVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg">
                    <MailCheck size={13} className="text-emerald-600" />
                    <span>Email Verified</span>
                  </span>
                )}

                {isPhoneVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg">
                    <PhoneCall size={13} className="text-indigo-600" />
                    <span>Phone Verified</span>
                  </span>
                )}
              </div>
            </div>

            {/* LIKE & SHARE ACTIONS */}
            <div className="md:ml-auto shrink-0 pt-2 md:pt-0">
              <CompanyActions slug={slug} companyName={company.firm_name} initialFavorites={favoriteCount} variant="page" />
            </div>
          </div>

          {/* CONTACT & LOCATION SNIPPETS */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600 text-xs md:text-sm mt-4">
            {location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-gray-400 shrink-0" />
                <span>{location}</span>
              </div>
            )}
            {(company.website || company.website_link) && (
              <a
                href={company.website || company.website_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-black transition"
              >
                <Globe size={16} className="text-gray-400 shrink-0" />
                <span>Website</span>
                <ExternalLink size={12} className="text-gray-400" />
              </a>
            )}
            {(company.email || company.contact_email) && (
              <a
                href={`mailto:${company.email || company.contact_email}`}
                className="flex items-center gap-1.5 hover:text-black transition"
              >
                <Mail size={16} className="text-gray-400 shrink-0" />
                <span>{company.email || company.contact_email}</span>
              </a>
            )}
            {company.phone && (
              <div className="flex items-center gap-1.5">
                <PhoneCall size={16} className="text-gray-400 shrink-0" />
                <div className="flex gap-1">
                  {String(company.phone).split(",").map((p) => p.trim()).filter(Boolean).map((ph, idx, arr) => (
                    <span key={idx}>
                      <a href={`tel:${ph}`} className="hover:text-black transition">{ph}</a>
                      {idx < arr.length - 1 && <span>,</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SUB-MENU TABS */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-8 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "overview"
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "jobs"
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <span>Open Positions</span>
          <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
            {companyJobs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("team")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "team"
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          People & Team
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "projects"
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Projects & Portfolio
        </button>

        <button
          onClick={() => setActiveTab("awards")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "awards"
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Awards & Press
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* DESCRIPTION */}
          {(company.company_description || company.description) ? (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About {company.firm_name}</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {company.company_description || company.description}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-xs border border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
                No detailed description has been added for {company.firm_name} yet.
              </p>
            </div>
          )}

          {/* STUDIO SPECS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {company.principal_architect && (
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Principal Architect / Leadership
                </span>
                <p className="text-sm font-bold text-gray-900">{company.principal_architect}</p>
              </div>
            )}

            {company.employee_size && (
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Studio Size
                </span>
                <p className="text-sm font-bold text-gray-900">{company.employee_size} employees</p>
              </div>
            )}

            {company.founded_year && (
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Founded Year
                </span>
                <p className="text-sm font-bold text-gray-900">{company.founded_year}</p>
              </div>
            )}

            {company.organization_type && (
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Practice Typology
                </span>
                <p className="text-sm font-bold text-gray-900">{company.organization_type}</p>
              </div>
            )}

            {location && (
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Studio Headquarters
                </span>
                <p className="text-sm font-bold text-gray-900">{location}</p>
              </div>
            )}
          </div>

          {/* SOCIAL MEDIA HANDLES */}
          {(company.instagram || company.linkedin || company.facebook || company.twitter || company.whatsapp) && (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-4">Official Channels & Socials</h3>
              <div className="flex flex-wrap gap-3">
                {company.instagram && (
                  <a
                    href={company.instagram.startsWith("http") ? company.instagram : `https://instagram.com/${company.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-pink-50 text-pink-700 hover:bg-pink-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>📸 Instagram</span>
                  </a>
                )}
                {company.linkedin && (
                  <a
                    href={company.linkedin.startsWith("http") ? company.linkedin : `https://linkedin.com/company/${company.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>💼 LinkedIn</span>
                  </a>
                )}
                {company.facebook && (
                  <a
                    href={company.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>Facebook</span>
                  </a>
                )}
                {company.twitter && (
                  <a
                    href={company.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>X (Twitter)</span>
                  </a>
                )}
                {company.whatsapp && (
                  <a
                    href={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: JOBS & OPEN POSITIONS */}
      {activeTab === "jobs" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Current Open Positions</h2>
            <span className="text-xs text-gray-500 font-medium">
              {companyJobs.length} {companyJobs.length === 1 ? "position" : "positions"} available
            </span>
          </div>

          {companyJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companyJobs.map((job: any) => (
                <Link
                  key={job.id}
                  href={generateJobUrl(job)}
                  className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 hover:shadow-md hover:border-gray-300 transition group flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-500 transition mb-2">
                      {job.position}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
                      <Briefcase size={14} />
                      <span>{job.experience ? formatExperience(job.experience) : "Experience not specified"}</span>
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
                        <MapPin size={11} />
                        {[job.city, job.state].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
              <p className="text-gray-500 text-sm">No open positions available at this time.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PEOPLE & TEAM (PREVIEW) */}
      {activeTab === "team" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">People & Studio Team</h3>
            <p className="text-xs text-gray-500 mb-6">
              Core leadership, principal architects, and team members associated with this practice.
            </p>

            {company.principal_architect ? (
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 flex items-center gap-4 max-w-md">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base shrink-0">
                  {company.principal_architect.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{company.principal_architect}</h4>
                  <p className="text-xs text-gray-500">Principal Architect / Leadership</p>
                </div>
              </div>
            ) : null}

            {/* CONNECT INVITATION */}
            <div className="mt-6 p-6 rounded-2xl border border-dashed border-gray-300 text-center flex flex-col items-center">
              <Users size={32} className="text-gray-400 mb-2" />
              <h4 className="text-sm font-bold text-gray-900 mb-1">
                Are you working at {company.firm_name}?
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mb-4">
                Connect your individual architect or designer profile with this studio to appear in the team roster.
              </p>
              <Link
                href="/profile"
                className="bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-800 transition"
              >
                Add Experience to Your Profile
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROJECTS & PORTFOLIO (PREVIEW) */}
      {activeTab === "projects" && (
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xs border border-gray-100 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center mx-auto mb-4">
            <FolderGit2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Built Projects & Portfolio</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Architectural studios will soon be able to showcase their built works, 3D renderings, and project drawings directly on their profile.
          </p>
          {!isClaimed && (
            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-800 transition"
            >
              Claim this Studio to Add Projects
            </button>
          )}
        </div>
      )}

      {/* TAB CONTENT: AWARDS & PRESS (PREVIEW) */}
      {activeTab === "awards" && (
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xs border border-gray-100 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Awards, Honors & Publications</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Design competition honors, Council of Architecture awards, and architectural magazine features will appear in this section.
          </p>
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
            Coming Soon
          </span>
        </div>
      )}

      {/* EXPLANATION MODAL */}
      <CompanyBadgeExplanationModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        currentTier={tier}
        currentPercentage={completionPercentage}
      />

      {/* CLAIM PROFILE MODAL */}
      <ClaimCompanyModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        companyId={company.id}
        companySlug={slug}
        companyName={company.firm_name}
      />
    </div>
  );
}
