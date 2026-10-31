"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Award,
  ShieldCheck,
  Building2,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  EyeOff,
  Check,
  Users,
  Briefcase,
  Star,
  GraduationCap,
  Flame,
  Shield,
  Info,
  Phone,
  Mail,
  Zap,
  ChevronRight,
  BadgeCheck,
  Share2,
} from "lucide-react";

type ActiveTab = "members" | "studios" | "badges";

export default function BadgesAndPerksPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("members");

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-gray-900 flex flex-col">
      <Navbar />

      {/* HERO SECTION WITH WARM ARCHITECTURAL SANDSTONE / BEACH EMBOSSED THEME */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#ECE7DC] via-[#F2EDE4] to-[#F7F5F0] border-b border-[#E2DBD0] pt-12 pb-16 md:py-20 px-6 text-center">
        {/* Subtle architectural grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5DFD3] border border-[#D5CDBD] text-[#635542] text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
            <Award size={15} className="text-[#966E2E]" />
            <span>Levels, Badges &amp; Platform Privileges</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Badges, Tiers &amp; Studio Perks
          </h1>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Trapped Into Architecture is powered by verified trust. Discover what each level unlocks for architects, designers, and architectural practices across India.
          </p>

          {/* STREAMLINED TAB SELECTOR (Member Perks | Studio Perks | Special Badges) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-9 max-w-xl mx-auto p-1.5 bg-[#E2DBD0]/70 backdrop-blur-xs rounded-2xl border border-[#D0C7B8] shadow-inner">
            <button
              onClick={() => setActiveTab("members")}
              className={`flex-1 min-w-[140px] px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "members"
                  ? "bg-black text-white shadow-md transform scale-[1.02]"
                  : "text-gray-700 hover:text-black hover:bg-white/40"
              }`}
            >
              <Users size={16} />
              <span>Member Perks</span>
            </button>

            <button
              onClick={() => setActiveTab("studios")}
              className={`flex-1 min-w-[140px] px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "studios"
                  ? "bg-black text-white shadow-md transform scale-[1.02]"
                  : "text-gray-700 hover:text-black hover:bg-white/40"
              }`}
            >
              <Building2 size={16} />
              <span>Studio Perks</span>
            </button>

            <button
              onClick={() => setActiveTab("badges")}
              className={`flex-1 min-w-[140px] px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "badges"
                  ? "bg-black text-white shadow-md transform scale-[1.02]"
                  : "text-gray-700 hover:text-black hover:bg-white/40"
              }`}
            >
              <BadgeCheck size={16} />
              <span>Special Badges</span>
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT CANVAS */}
      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full space-y-12">
        {/* ================= TAB 1: MEMBER PERKS ================= */}
        {activeTab === "members" && (
          <div className="space-y-10 animate-in fade-in duration-200">
            {/* EMBOSSED MEMBER INTRO BANNER */}
            <div className="bg-gradient-to-br from-white via-[#FCFAF7] to-[#F5EFE6] rounded-3xl p-6 sm:p-8 border border-[#E4DCD0] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100/70 border border-amber-200 text-amber-900 flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
                    👨‍💼
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                      Architect &amp; Candidate Member Tiers
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                      Progress automatically from Bronze (0%) to Diamond (91%–100%) as you build your dossier.
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                >
                  <span>Check Your Score</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* 5 EMBOSSED TIER BOXES WITH DISTINCT ARCHITECTURAL COLOR VARIATIONS */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Bronze Member */}
              <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F4EEE0] rounded-3xl p-5 border border-[#E2D4BE] shadow-[0_4px_16px_-4px_rgba(180,83,9,0.08)] flex flex-col justify-between hover:translate-y-[-2px] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl drop-shadow-xs">🥉</span>
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#EFE3CF] text-[#784F17] border border-[#DECDAF]">
                      0% – 44%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base mb-1.5">Bronze Member</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Entry level awarded on signup. Full access to search architecture vacancies, bookmark jobs, and take exams.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E8DEC9] mt-4 space-y-1.5 text-[11px] text-[#7C5A24] font-semibold">
                  <p>✓ Browse All Openings</p>
                  <p>✓ Bookmark &amp; Like Posts</p>
                  <p>✓ Architecture Quizzes</p>
                </div>
              </div>

              {/* Silver Member */}
              <div className="bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] rounded-3xl p-5 border border-[#CBD5E1] shadow-[0_4px_16px_-4px_rgba(100,116,139,0.12)] flex flex-col justify-between hover:translate-y-[-2px] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl drop-shadow-xs">🥈</span>
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#E2E8F0] text-[#334155] border border-[#CBD5E1]">
                      45% – 65%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base mb-1.5">Silver Member</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Studio Ownership:</strong> Unlocks claiming existing firms and registering new practice profiles.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#CBD5E1] mt-4 space-y-1.5 text-[11px] text-slate-800 font-bold">
                  <p className="text-emerald-700">✓ Claim Architecture Firms</p>
                  <p className="text-emerald-700">✓ Register New Studios</p>
                  <p>✓ View Direct Coordinates</p>
                </div>
              </div>

              {/* Gold Member */}
              <div className="bg-gradient-to-br from-[#FFFDF2] via-[#FEFCE8] to-[#FEF08A]/40 rounded-3xl p-5 border-2 border-[#EAB308]/60 shadow-[0_6px_24px_-4px_rgba(234,179,8,0.22)] flex flex-col justify-between hover:translate-y-[-2px] transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#EAB308] text-black font-extrabold text-[9px] uppercase px-3 py-0.5 rounded-bl-xl tracking-wider">
                  Hiring Tier
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl drop-shadow-xs">🥇</span>
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#FEF08A] text-[#854D0E] border border-[#FACC15]">
                      66% – 80%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-yellow-950 text-base mb-1.5">Gold Member</h3>
                  <p className="text-xs text-yellow-900/80 leading-relaxed">
                    <strong>Hiring Authorization:</strong> Unlocks posting and publishing architectural jobs and internships!
                  </p>
                </div>
                <div className="pt-3 border-t border-[#FACC15]/40 mt-4 space-y-1.5 text-[11px] text-yellow-950 font-bold">
                  <p className="text-yellow-900">✓ Post Architecture Jobs</p>
                  <p className="text-yellow-900">✓ Public Profile Directory</p>
                  <p>✓ Verified Recruiter Eligibility</p>
                </div>
              </div>

              {/* Platinum Member */}
              <div className="bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#BAE6FD]/40 rounded-3xl p-5 border border-[#7DD3FC] shadow-[0_4px_16px_-4px_rgba(14,165,233,0.15)] flex flex-col justify-between hover:translate-y-[-2px] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl drop-shadow-xs">💎</span>
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#BAE6FD] text-[#0369A1] border border-[#7DD3FC]">
                      81% – 90%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sky-950 text-base mb-1.5">Platinum Member</h3>
                  <p className="text-xs text-sky-900/80 leading-relaxed">
                    Featured matchmaking tier. Receive priority recommendations from studios and exclusive notifications.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#7DD3FC]/50 mt-4 space-y-1.5 text-[11px] text-sky-950 font-bold">
                  <p>✓ Priority Recruiter Match</p>
                  <p>✓ Instant Job Alert Digest</p>
                  <p>✓ Featured Dossier Badge</p>
                </div>
              </div>

              {/* Diamond Member */}
              <div className="bg-gradient-to-br from-[#FAF5FF] via-[#F3E8FF] to-[#DDD6FE]/40 rounded-3xl p-5 border border-[#C4B5FD] shadow-[0_4px_20px_-4px_rgba(147,51,234,0.18)] flex flex-col justify-between hover:translate-y-[-2px] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl drop-shadow-xs">👑</span>
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#DDD6FE] text-[#6B21A8] border border-[#C4B5FD]">
                      91% – 100%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-purple-950 text-base mb-1.5">Diamond Member</h3>
                  <p className="text-xs text-purple-900/80 leading-relaxed">
                    Elite Top 1% Architect recognition across India. Pure authentic architectural completion.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#C4B5FD]/50 mt-4 space-y-1.5 text-[11px] text-purple-950 font-bold">
                  <p>✓ Top 1% Elite Rank</p>
                  <p>✓ Leaderboard Spotlight</p>
                  <p>✓ Maximum Employer Trust</p>
                </div>
              </div>
            </div>

            {/* 100% POINTS BREAKDOWN TABLE WITH DISTINCT SECTION COLORS */}
            <div className="bg-white rounded-3xl border border-[#E2DBD0] overflow-hidden shadow-xs">
              <div className="p-6 bg-gradient-to-r from-[#FAF8F5] to-[#F3EEE6] border-b border-[#E2DBD0] flex items-center justify-between">
                <div>
                  <h3 className="font-black text-gray-900 text-lg">
                    Member Points Breakdown (100% Total)
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    How every section and credential adds up to your dynamic score
                  </p>
                </div>
                <span className="text-xs font-extrabold bg-[#E6DFD3] text-[#554633] border border-[#D5CDBD] px-3.5 py-1 rounded-full">
                  100% Full Scale
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#EFEAE1] text-gray-800 font-extrabold border-b border-[#E2DBD0]">
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Profile Field / Milestone</th>
                      <th className="py-3 px-4 text-center">Verification Method</th>
                      <th className="py-3 px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE5DC]">
                    {/* Basic Identity */}
                    <tr className="hover:bg-stone-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-gray-900" rowSpan={4}>
                        Basic Identity<br/>
                        <span className="text-[10px] text-gray-500 font-medium">20% total</span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-semibold">Full Name &amp; Unique Username</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-medium">On Signup</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900 font-mono text-xs">+5%</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 text-gray-800 font-semibold">Email Address Added</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-medium">On Signup</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900 font-mono text-xs">+5%</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 text-gray-800 font-semibold">Profile Picture / Avatar Uploaded</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-medium">Media Upload</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900 font-mono text-xs">+5%</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 text-gray-800 font-semibold">Professional Tagline / Headline</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-medium">Text Entry</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900 font-mono text-xs">+5%</td>
                    </tr>

                    {/* Contact & Verification */}
                    <tr className="hover:bg-stone-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-gray-900" rowSpan={4}>
                        Contact &amp; Verifications<br/>
                        <span className="text-[10px] text-gray-500 font-medium">20% total</span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-semibold">Phone Number Added</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-medium">Can be marked Secret</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900 font-mono text-xs">+5%</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 text-gray-800 font-semibold">WhatsApp Number (or Same as Phone)</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-medium">Direct Contact</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900 font-mono text-xs">+5%</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 text-gray-800 font-semibold">Email Address Verification</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-medium">Email Link</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900 font-mono text-xs">+5%</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 text-gray-800 font-semibold">Phone / WhatsApp Verification</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-medium">Active Contact</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900 font-mono text-xs">+5%</td>
                    </tr>

                    {/* Professional Credentials & Social */}
                    <tr className="hover:bg-stone-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-gray-900" rowSpan={3}>
                        Credentials &amp; Social<br/>
                        <span className="text-[10px] text-gray-500 font-medium">25% total</span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-semibold">Profession Selection</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-medium">On Signup</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900 font-mono text-xs">+10%</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 text-gray-800 font-semibold">
                        Council of Architecture (COA) Registration / Highest Qual
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-medium">High-Trust Proof</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900 font-mono text-xs">+10%</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 text-gray-800 font-semibold">LinkedIn Profile or Portfolio Website URL</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-medium">External Work Link</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900 font-mono text-xs">+5%</td>
                    </tr>

                    {/* Bio & Personal */}
                    <tr className="hover:bg-stone-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-gray-900" rowSpan={2}>
                        Bio &amp; Personal<br/>
                        <span className="text-[10px] text-gray-500 font-medium">10% total</span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-semibold">About Me / Professional Biography</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-medium">Text Narrative</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900 font-mono text-xs">+5%</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 text-gray-800 font-semibold">Date of Birth &amp; Gender</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-medium">Can be marked Secret</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900 font-mono text-xs">+5%</td>
                    </tr>

                    {/* Education & Experience */}
                    <tr className="hover:bg-stone-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-gray-900" rowSpan={2}>
                        Experience &amp; Edu<br/>
                        <span className="text-[10px] text-gray-500 font-medium">25% total</span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-semibold">Add at least one Education Degree (B.Arch, M.Arch, etc.)</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-medium">Degree Details</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900 font-mono text-xs">+15%</td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 text-gray-800 font-semibold">Add at least one Professional Work Experience</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-medium">Work Experience</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900 font-mono text-xs">+10%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PRIVACY GUARANTEE BANNER */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-[#F0FDF4] via-[#DCFCE7]/60 to-[#F0FDF4] border border-emerald-300 text-emerald-950 flex items-start gap-3 shadow-xs">
              <EyeOff size={22} className="text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm leading-relaxed">
                <p className="font-extrabold text-emerald-900 mb-0.5">
                  100% Privacy Protection Guarantee
                </p>
                <p>
                  You can set your <strong>Phone Number, WhatsApp Number, Email, Date of Birth, or COA Number</strong> to <strong>Secret</strong> under your Profile Details tab.
                  Secret fields are completely hidden from public visitors while still awarding <strong>100% full points</strong> toward your tier progression!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: STUDIO PERKS ================= */}
        {activeTab === "studios" && (
          <div className="space-y-10 animate-in fade-in duration-200">
            {/* EMBOSSED STUDIO INTRO BANNER */}
            <div className="bg-gradient-to-br from-white via-[#FCFAF7] to-[#F5EFE6] rounded-3xl p-6 sm:p-8 border border-[#E4DCD0] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100/70 border border-purple-200 text-purple-900 flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
                    🏛️
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                      Architecture Firm &amp; Practice Levels
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                      Firms must reach <strong>Gold Level Studio (66%)</strong> to publish vacancies and protect candidate trust.
                    </p>
                  </div>
                </div>

                <Link
                  href="/companies/new"
                  className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                >
                  <span>Register a Practice</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* 5 EMBOSSED STUDIO TIER BOXES */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Bronze Studio */}
              <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F4EEE0] rounded-3xl p-5 border border-[#E2D4BE] shadow-[0_4px_16px_-4px_rgba(180,83,9,0.08)] flex flex-col justify-between hover:translate-y-[-2px] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl drop-shadow-xs">🥉</span>
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#EFE3CF] text-[#784F17] border border-[#DECDAF]">
                      0% – 44%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base mb-1.5">Bronze Studio</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Basic office profile indexed in the directory, discoverable by city and practice typology.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E8DEC9] mt-4 text-[11px] text-[#7C5A24] font-semibold">
                  ✓ Directory Listing
                </div>
              </div>

              {/* Silver Studio */}
              <div className="bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] rounded-3xl p-5 border border-[#CBD5E1] shadow-[0_4px_16px_-4px_rgba(100,116,139,0.12)] flex flex-col justify-between hover:translate-y-[-2px] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl drop-shadow-xs">🥈</span>
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#E2E8F0] text-[#334155] border border-[#CBD5E1]">
                      45% – 65%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base mb-1.5">Silver Studio</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Contact coordinates (phone, email, website) visible to verified candidates. Team directory preview.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#CBD5E1] mt-4 text-[11px] text-slate-800 font-bold">
                  ✓ Contact Unlocked
                </div>
              </div>

              {/* Gold Studio */}
              <div className="bg-gradient-to-br from-[#FFFDF2] via-[#FEFCE8] to-[#FEF08A]/40 rounded-3xl p-5 border-2 border-[#EAB308]/60 shadow-[0_6px_24px_-4px_rgba(234,179,8,0.22)] flex flex-col justify-between hover:translate-y-[-2px] transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#EAB308] text-black font-extrabold text-[9px] uppercase px-3 py-0.5 rounded-bl-xl tracking-wider">
                  Posting Gate
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl drop-shadow-xs">🥇</span>
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#FEF08A] text-[#854D0E] border border-[#FACC15]">
                      66% – 80%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-yellow-950 text-base mb-1.5">Gold Studio</h3>
                  <p className="text-xs text-yellow-900/80 leading-relaxed">
                    <strong>Hiring Privileges Unlocked:</strong> Studio meets verification standards and can publish vacancies!
                  </p>
                </div>
                <div className="pt-3 border-t border-[#FACC15]/40 mt-4 text-[11px] text-yellow-950 font-bold">
                  ✓ Publish Openings Live
                </div>
              </div>

              {/* Platinum Studio */}
              <div className="bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#BAE6FD]/40 rounded-3xl p-5 border border-[#7DD3FC] shadow-[0_4px_16px_-4px_rgba(14,165,233,0.15)] flex flex-col justify-between hover:translate-y-[-2px] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl drop-shadow-xs">💎</span>
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#BAE6FD] text-[#0369A1] border border-[#7DD3FC]">
                      81% – 90%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sky-950 text-base mb-1.5">Platinum Studio</h3>
                  <p className="text-xs text-sky-900/80 leading-relaxed">
                    Featured studio banner across homepage and directory. Priority WhatsApp distribution.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#7DD3FC]/50 mt-4 text-[11px] text-sky-950 font-bold">
                  ✓ Featured Studio Banner
                </div>
              </div>

              {/* Diamond Studio */}
              <div className="bg-gradient-to-br from-[#FAF5FF] via-[#F3E8FF] to-[#DDD6FE]/40 rounded-3xl p-5 border border-[#C4B5FD] shadow-[0_4px_20px_-4px_rgba(147,51,234,0.18)] flex flex-col justify-between hover:translate-y-[-2px] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl drop-shadow-xs">👑</span>
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#DDD6FE] text-[#6B21A8] border border-[#C4B5FD]">
                      91% – 100%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-purple-950 text-base mb-1.5">Diamond Studio</h3>
                  <p className="text-xs text-purple-900/80 leading-relaxed">
                    Elite 1% architectural studio distinction. Rich built works &amp; award portfolio showcase.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#C4B5FD]/50 mt-4 text-[11px] text-purple-950 font-bold">
                  ✓ Elite 1% Practice
                </div>
              </div>
            </div>

            {/* STUDIO SCORING CRITERIA TABLE */}
            <div className="bg-white rounded-3xl border border-[#E2DBD0] overflow-hidden shadow-xs">
              <div className="p-6 bg-gradient-to-r from-[#FAF8F5] to-[#F3EEE6] border-b border-[#E2DBD0]">
                <h3 className="font-black text-gray-900 text-lg">
                  How Studios Reach 100% Completeness
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Required credentials for practices to reach Gold (66%) and publish architectural vacancies
                </p>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DEC9]">
                    <span className="font-bold text-gray-900">Firm Name</span>
                    <span className="font-extrabold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">+10%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DEC9]">
                    <span className="font-bold text-gray-900">Studio Logo Uploaded</span>
                    <span className="font-extrabold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">+15%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DEC9]">
                    <span className="font-bold text-gray-900">Studio Overview / About Description</span>
                    <span className="font-extrabold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">+15%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DEC9]">
                    <span className="font-bold text-gray-900">Complete City &amp; State Location</span>
                    <span className="font-extrabold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">+15%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DEC9]">
                    <span className="font-bold text-gray-900">Official Contact Email</span>
                    <span className="font-extrabold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">+10%</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DEC9]">
                    <span className="font-bold text-gray-900">Phone or WhatsApp Contact Number</span>
                    <span className="font-extrabold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">+10%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DEC9]">
                    <span className="font-bold text-gray-900">Official Website URL</span>
                    <span className="font-extrabold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">+5%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DEC9]">
                    <span className="font-bold text-gray-900">Practice Typology (Residential, Commercial, etc.)</span>
                    <span className="font-extrabold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">+5%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DEC9]">
                    <span className="font-bold text-gray-900">Founded Year &amp; Team Size</span>
                    <span className="font-extrabold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">+5%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DEC9]">
                    <span className="font-bold text-gray-900">Social Channels (Instagram / LinkedIn)</span>
                    <span className="font-extrabold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">+5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: SPECIAL BADGES ================= */}
        {activeTab === "badges" && (
          <div className="space-y-10 animate-in fade-in duration-200">
            {/* Header */}
            <div className="bg-gradient-to-br from-white via-[#FCFAF7] to-[#F5EFE6] rounded-3xl p-6 sm:p-8 border border-[#E4DCD0] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/70 border border-amber-200 text-amber-900 flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
                  🛡️
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                    Special Verified Badges &amp; Trust Marks
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    Recognizing legal architecture registration, authentic hiring authority, and community roles.
                  </p>
                </div>
              </div>
            </div>

            {/* BADGES GRID WITH VARIED EMBOSSED BACKGROUNDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recruiter Badge */}
              <div className="bg-gradient-to-br from-white via-[#FAF5FF] to-[#F3E8FF]/60 rounded-3xl p-6 sm:p-7 border border-[#DDD6FE] shadow-[0_4px_18px_-4px_rgba(147,51,234,0.12)] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-black rounded-full shadow-xs">
                    <Building2 size={13} className="text-indigo-700" />
                    <span>Recruiter • [Firm Name]</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">Hiring Badge</span>
                </div>
                <h3 className="font-black text-lg text-gray-900">Verified Recruiter Badge</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Conferred automatically to architects and studio leaders who register an architecture practice or claim an existing firm.
                  Guarantees that job listings posted by the user are genuine and authorized by the practice.
                </p>
                <div className="text-[11px] text-gray-700 bg-white/80 p-3.5 rounded-2xl border border-purple-200">
                  <strong>How to unlock:</strong> Register a practice at <Link href="/companies/new" className="text-indigo-600 font-bold underline">/companies/new</Link> or claim an active studio.
                </div>
              </div>

              {/* COA Verified */}
              <div className="bg-gradient-to-br from-white via-[#F0F9FF] to-[#E0F2FE]/60 rounded-3xl p-6 sm:p-7 border border-[#BAE6FD] shadow-[0_4px_18px_-4px_rgba(14,165,233,0.12)] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-100 text-blue-900 border border-blue-300 text-xs font-black rounded-full shadow-xs">
                    <ShieldCheck size={14} className="text-blue-700" />
                    <span>COA Verified</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Statutory Badge</span>
                </div>
                <h3 className="font-black text-lg text-gray-900">Council of Architecture (India) Badge</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Confirms registration under the Architects Act, 1972 with the Council of Architecture (India).
                  Signifies legal authorization to practice architecture in India and gives candidates supreme credibility.
                </p>
                <div className="text-[11px] text-gray-700 bg-white/80 p-3.5 rounded-2xl border border-blue-200">
                  <strong>How to unlock:</strong> Add your valid CA registration number under Profile Credentials (+10% score).
                </div>
              </div>

              {/* VIP Distinction */}
              <div className="bg-gradient-to-br from-white via-[#FFFDF2] to-[#FEF9C3]/50 rounded-3xl p-6 sm:p-7 border border-[#FDE047] shadow-[0_4px_18px_-4px_rgba(234,179,8,0.15)] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-100 text-amber-950 border border-amber-300 text-xs font-black rounded-full shadow-xs">
                    <Star size={13} className="text-amber-600 fill-amber-500" />
                    <span>VIP Member</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Honorary Mark</span>
                </div>
                <h3 className="font-black text-lg text-gray-900">VIP Honorary Status</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  An honorary distinction granted manually by platform administrators to notable industry figures, studio founders,
                  and key contributors to the architectural ecosystem.
                </p>
                <div className="text-[11px] text-gray-700 bg-white/80 p-3.5 rounded-2xl border border-amber-200">
                  <strong>Conferral:</strong> Conferred manually based on industry reputation and community contributions.
                </div>
              </div>

              {/* Contact Verification Badges */}
              <div className="bg-gradient-to-br from-white via-[#F0FDF4] to-[#DCFCE7]/50 rounded-3xl p-6 sm:p-7 border border-[#86EFAC] shadow-[0_4px_18px_-4px_rgba(34,197,94,0.12)] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-black rounded-full shadow-xs">
                    <CheckCircle2 size={14} className="text-emerald-700" />
                    <span>Email &amp; Phone Verified</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Trust Badge</span>
                </div>
                <h3 className="font-black text-lg text-gray-900">Contact Verification Badges</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Confirms that the user's email address and active mobile / WhatsApp contact numbers have been verified.
                  Each verification awards <strong>+5%</strong> toward your universal tier score.
                </p>
                <div className="text-[11px] text-gray-700 bg-white/80 p-3.5 rounded-2xl border border-emerald-200">
                  <strong>How to unlock:</strong> Click "Verify Email" and "Verify Phone" under your Profile Details tab.
                </div>
              </div>

              {/* User Tracks */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DBD0] shadow-xs space-y-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg text-gray-900">Community Track Roles</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-1 rounded">Role Categories</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Displayed on your profile hero to help hiring studios, mentors, and peers understand your focus:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 font-bold">
                    🎯 Job Seeker / Candidate
                  </div>
                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 text-purple-900 font-bold">
                    🎓 Architecture Student / Intern
                  </div>
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-indigo-900 font-bold">
                    🏢 Recruiter / Architecture Firm
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 font-bold">
                    🏛️ Academician / Researcher
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 font-bold">
                    💼 Freelancer / Consultant
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-100 border border-gray-200 text-gray-800 font-bold">
                    ☕ Explorer / Enthusiast
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM ACTION CTA */}
        <section className="bg-gradient-to-br from-white via-[#FCFAF7] to-[#F5EFE6] rounded-3xl p-8 sm:p-12 border border-[#E2DBD0] shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <Award size={32} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
            Build Your Architectural Dossier
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed mb-6">
            Complete your profile, verify credentials, and unlock your recruiter or candidate privileges across India's premier architecture platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Link
              href="/profile"
              className="py-3 px-6 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>View Your Profile Score</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/companies"
              className="py-3 px-6 bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 rounded-xl text-xs font-bold transition flex items-center justify-center"
            >
              Browse 100+ Architecture Studios
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
