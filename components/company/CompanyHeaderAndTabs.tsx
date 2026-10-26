"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FolderGit2,
  Trophy,
  Edit,
  PlusCircle,
  X,
  UserPlus,
  MessageCircle,
  Copy,
  Check,
  Compass,
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

const ensureUrl = (url?: string) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
};

const getDisplayUrl = (url?: string) => {
  if (!url) return "";
  const trimmed = url.trim();
  try {
    const full = trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
    const parsed = new URL(full);
    const host = parsed.hostname.replace(/^www\./i, "");
    const pathname = parsed.pathname !== "/" ? parsed.pathname : "";
    return `${host}${pathname}`;
  } catch (e) {
    return trimmed.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
  }
};

const formatPracticeTypology = (raw?: string): string => {
  if (!raw) return "Architecture Firm";
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  // If already ends with an architectural firm classification, keep as is
  if (/\b(firm|studio|practice|office|atelier|agency)\b$/i.test(trimmed)) {
    return trimmed;
  }

  if (lower.includes("architecture") && lower.includes("interior")) {
    return "Architecture & Interior Design Firm";
  }
  if (lower.includes("interior")) {
    return "Interior Design Studio";
  }
  if (lower.includes("architecture") || lower.includes("architectural")) {
    return "Architecture Firm";
  }
  return `${trimmed} Firm`;
};

// Interactive Phone Dropdown: On Desktop shows Copy + WhatsApp, on Mobile shows Call + WhatsApp
function PhoneActionDropdown({ phone, isMobile }: { phone: string; isMobile: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const cleanNumber = phone.replace(/\D/g, "");
  const waNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 1200);
  };

  const handleCall = () => {
    window.location.href = `tel:${cleanNumber}`;
    setIsOpen(false);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${waNumber}`, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="font-medium hover:text-blue-600 underline decoration-dotted underline-offset-2 transition cursor-pointer flex items-center gap-1"
        title="Click to view contact options"
      >
        <span>{phone}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-gray-200 shadow-2xl rounded-2xl py-1.5 min-w-[210px] text-xs font-semibold text-gray-800 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100 mb-1 flex items-center justify-between">
            <span>{phone}</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-black p-0.5 cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>

          {/* DESKTOP VS MOBILE PRIMARY ACTION */}
          {isMobile ? (
            <button
              type="button"
              onClick={handleCall}
              className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-gray-900 transition cursor-pointer"
            >
              <PhoneCall size={14} className="text-blue-600" />
              <span>Call {phone}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCopy}
              className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 flex items-center justify-between text-gray-900 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-gray-600" />}
                <span>{copied ? "Phone Number Copied!" : "Copy Phone Number"}</span>
              </div>
              {copied && <span className="text-[10px] text-emerald-600 font-bold">✓</span>}
            </button>
          )}

          {/* WHATSAPP ACTION */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/60 flex items-center gap-2 text-emerald-700 transition cursor-pointer"
          >
            <MessageCircle size={14} className="text-emerald-600 fill-emerald-600" />
            <span>Chat on WhatsApp</span>
          </button>
        </div>
      )}
    </div>
  );
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        const role = (user.role || "").toLowerCase().replace(/[\s_]+/g, "");
        if (role === "admin" || role === "superadmin" || role === "ceo" || role === "jobadmin") {
          setIsAdmin(true);
        }
      }
    } catch (e) {}

    const checkMobile = () => {
      setIsMobile(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClaimClick = () => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      setAuthNotice("Register as a user to claim this studio");
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "register" }));
      setTimeout(() => setAuthNotice(null), 6000);
      return;
    }
    setIsClaimModalOpen(true);
  };

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
  const googleMapsUrl = location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${company.firm_name} ${location}`)}`
    : "";

  const websiteRaw = company.website || company.website_link;
  const websiteUrl = ensureUrl(websiteRaw);
  const displayWebsite = getDisplayUrl(websiteRaw);
  const emailAddr = company.email || company.contact_email;
  const formattedTypology = formatPracticeTypology(company.organization_type);

  return (
    <div className="w-full relative">
      {/* FLOATING AUTH NOTIFICATION TOAST */}
      {authNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-top-4 duration-300 max-w-md w-[92%] sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <UserPlus size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-tight">
              Register as a user to claim this studio
            </p>
            <p className="text-xs text-gray-300 mt-0.5 truncate">
              Create a free account to manage {company.firm_name}.
            </p>
          </div>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("openAuth", { detail: "register" }));
              setAuthNotice(null);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0"
          >
            Register
          </button>
          <button
            onClick={() => setAuthNotice(null)}
            className="text-gray-400 hover:text-white p-1 cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
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

              {/* SPECIFIC TYPOLOGY + PRIMARY ACTION (ADMIN EDIT OR USER CLAIM) + VERIFICATION BADGES */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-lg">
                  {formattedTypology}
                </span>

                {/* SINGLE PRIMARY BUTTON: Admin gets "Edit / Add Company Details", Visitors get "Claim this Studio" */}
                {isAdmin ? (
                  <Link
                    href={`/admin/companies/edit/${company.id || "new"}?name=${encodeURIComponent(company.firm_name)}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer"
                  >
                    <Edit size={13} />
                    <span>Edit / Add Company Details</span>
                  </Link>
                ) : isClaimed ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg">
                    <ShieldCheck size={13} className="text-blue-600" />
                    <span>Claimed Studio</span>
                  </span>
                ) : (
                  <button
                    onClick={handleClaimClick}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs hover:shadow-md transition cursor-pointer"
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

            {/* LIKE & SHARE ACTIONS ONLY (CLEAN AND COMPACT) */}
            <div className="md:ml-auto shrink-0 pt-2 md:pt-0 flex items-center gap-2">
              <CompanyActions slug={slug} companyName={company.firm_name} initialFavorites={favoriteCount} variant="page" />
            </div>
          </div>

          {/* CONTACT & LOCATION SNIPPETS */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-gray-600 text-xs md:text-sm mt-4">
            {/* GOOGLE MAPS LOCATION LINK */}
            {location && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-blue-600 transition group"
                title="Open address in Google Maps"
              >
                <MapPin size={16} className="text-gray-400 group-hover:text-red-500 transition shrink-0" />
                <span className="underline decoration-dotted underline-offset-2">{location}</span>
                <ExternalLink size={11} className="text-gray-400 opacity-60 group-hover:opacity-100" />
              </a>
            )}

            {/* WEBSITE LINK WITH ACTUAL URL (ONLY SHOWN IF URL EXISTS) */}
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-blue-600 transition group"
                title="Open official studio website"
              >
                <Globe size={16} className="text-gray-400 group-hover:text-blue-500 transition shrink-0" />
                <span className="font-medium">{displayWebsite}</span>
                <ExternalLink size={11} className="text-gray-400 opacity-60 group-hover:opacity-100" />
              </a>
            )}

            {/* MAILING EMAIL LINK */}
            {emailAddr && (
              <a
                href={`mailto:${emailAddr}`}
                className="flex items-center gap-1.5 hover:text-blue-600 transition group"
                title={`Send email to ${emailAddr}`}
              >
                <Mail size={16} className="text-gray-400 group-hover:text-indigo-500 transition shrink-0" />
                <span>{emailAddr}</span>
              </a>
            )}

            {/* CLEAN PHONE NUMBER WITH POPUP OPTIONS */}
            {company.phone && (
              <div className="flex items-center gap-1.5">
                <PhoneCall size={16} className="text-gray-400 shrink-0" />
                <div className="flex flex-wrap items-center gap-2">
                  {String(company.phone)
                    .split(",")
                    .map((p) => p.trim())
                    .filter(Boolean)
                    .map((ph, idx, arr) => (
                      <span key={idx} className="flex items-center gap-1">
                        <PhoneActionDropdown phone={ph} isMobile={isMobile} />
                        {idx < arr.length - 1 && <span className="text-gray-300">,</span>}
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
              ? "border-black text-black font-extrabold"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "jobs"
              ? "border-black text-black font-extrabold"
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
              ? "border-black text-black font-extrabold"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          People & Team
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "projects"
              ? "border-black text-black font-extrabold"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Projects & Portfolio
        </button>

        <button
          onClick={() => setActiveTab("awards")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "awards"
              ? "border-black text-black font-extrabold"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          Awards & Press
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW (SINGLE UNIFIED ELEGANT WHITE BOX WITH SUBHEADINGS) */}
      {activeTab === "overview" && (
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xs border border-gray-100 divide-y divide-gray-100 space-y-8">
          {/* SUBHEADING 1: ABOUT / STUDIO STATEMENT */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass size={20} className="text-gray-900" />
                <h2 className="text-lg md:text-xl font-extrabold text-gray-900">
                  About {company.firm_name}
                </h2>
              </div>
              {isAdmin && (
                <Link
                  href={`/admin/companies/edit/${company.id || "new"}?name=${encodeURIComponent(company.firm_name)}`}
                  className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 hover:underline"
                >
                  <Edit size={12} />
                  <span>Edit Details</span>
                </Link>
              )}
            </div>

            {(company.company_description || company.description) ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base font-normal">
                {company.company_description || company.description}
              </p>
            ) : (
              <div className="p-6 md:p-8 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center flex flex-col items-center">
                <Compass size={28} className="text-gray-400 mb-2" />
                <p className="text-sm font-bold text-gray-800 mb-1">
                  No studio overview has been curated yet
                </p>
                <p className="text-xs text-gray-500 max-w-md mb-4">
                  {isAdmin
                    ? "Add this practice's design philosophy, typologies, and history to complete the studio profile."
                    : "Are you representing this architecture studio? Claim this profile to share your design statement, showcase built works, and post open positions."}
                </p>
                {isAdmin ? (
                  <Link
                    href={`/admin/companies/edit/${company.id || "new"}?name=${encodeURIComponent(company.firm_name)}`}
                    className="inline-flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
                  >
                    <Edit size={13} />
                    <span>Edit / Add Company Details</span>
                  </Link>
                ) : !isClaimed ? (
                  <button
                    onClick={handleClaimClick}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                  >
                    <Building2 size={13} />
                    <span>Claim this Studio</span>
                  </button>
                ) : null}
              </div>
            )}
          </div>

          {/* SUBHEADING 2: OFFICIAL CHANNELS & VERIFIED WEB PRESENCE */}
          <div className="pt-8">
            <div className="mb-4">
              <h3 className="text-base font-extrabold text-gray-900">
                Official Channels & Verified Web Presence
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Direct studio links for portfolios, inquiries, and public profiles
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* OFFICIAL WEBSITE - DISPLAYS ACTUAL WEB ADDRESS */}
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs group"
                >
                  <Globe size={15} className="text-gray-300 group-hover:text-white" />
                  <span className="font-semibold">{displayWebsite}</span>
                  <ExternalLink size={12} className="opacity-60 group-hover:opacity-100" />
                </a>
              )}

              {/* INSTAGRAM */}
              {company.instagram && (
                <a
                  href={company.instagram.startsWith("http") ? company.instagram : `https://instagram.com/${company.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs group"
                >
                  <span className="text-sm">📸</span>
                  <span>Instagram</span>
                  <ExternalLink size={12} className="text-gray-400 group-hover:text-black" />
                </a>
              )}

              {/* LINKEDIN */}
              {company.linkedin && (
                <a
                  href={company.linkedin.startsWith("http") ? company.linkedin : `https://linkedin.com/company/${company.linkedin.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs group"
                >
                  <span className="text-sm">💼</span>
                  <span>LinkedIn</span>
                  <ExternalLink size={12} className="text-gray-400 group-hover:text-black" />
                </a>
              )}

              {/* FACEBOOK */}
              {company.facebook && (
                <a
                  href={ensureUrl(company.facebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs group"
                >
                  <span>Facebook</span>
                  <ExternalLink size={12} className="text-gray-400 group-hover:text-black" />
                </a>
              )}

              {/* TWITTER */}
              {company.twitter && (
                <a
                  href={ensureUrl(company.twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs group"
                >
                  <span>X (Twitter)</span>
                  <ExternalLink size={12} className="text-gray-400 group-hover:text-black" />
                </a>
              )}

              {/* EMAIL */}
              {emailAddr && (
                <a
                  href={`mailto:${emailAddr}`}
                  className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs group"
                >
                  <Mail size={14} className="text-indigo-500" />
                  <span>{emailAddr}</span>
                </a>
              )}

              {/* EMPTY CHANNELS NOTICE */}
              {!websiteUrl && !company.instagram && !company.linkedin && !company.facebook && !company.twitter && !emailAddr && (
                <p className="text-xs text-gray-400 italic">No external web channels added yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: JOBS & OPEN POSITIONS */}
      {activeTab === "jobs" && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Current Open Positions</h2>
              <span className="text-xs text-gray-500 font-medium">
                {companyJobs.length} {companyJobs.length === 1 ? "position" : "positions"} available
              </span>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/add-job?firm_name=${encodeURIComponent(company.firm_name)}`}
                  className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <PlusCircle size={14} />
                  <span>Add / Post Position</span>
                </Link>
                <Link
                  href={`/admin/companies/edit/${company.id || "new"}?name=${encodeURIComponent(company.firm_name)}`}
                  className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition flex items-center gap-1 cursor-pointer"
                >
                  <Edit size={13} />
                  <span>Edit Studio</span>
                </Link>
              </div>
            )}
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
              <p className="text-gray-500 text-sm mb-4">No open positions available at this time.</p>
              {isAdmin && (
                <Link
                  href={`/admin/add-job?firm_name=${encodeURIComponent(company.firm_name)}`}
                  className="inline-flex items-center gap-1.5 bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition cursor-pointer"
                >
                  <PlusCircle size={14} />
                  <span>Post First Job for {company.firm_name}</span>
                </Link>
              )}
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
              onClick={handleClaimClick}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
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
