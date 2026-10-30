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
} from "lucide-react";

type ActiveTab = "universal" | "members" | "studios" | "badges";

export default function BadgesAndPerksPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("universal");

  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col">
      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-4">
            <Award size={14} className="text-amber-600" />
            <span>Levels, Badges &amp; Privileges</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight max-w-3xl mx-auto leading-tight">
            Platform Badges &amp; Tier Perks
          </h1>

          <p className="mt-4 text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Trapped Into Architecture is built on trust, transparency, and architectural excellence.
            Discover how our universal tier progression unlocks hiring powers, studio ownership, and verified community recognition.
          </p>

          {/* TAB SELECTOR */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 max-w-2xl mx-auto p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
            <button
              onClick={() => setActiveTab("universal")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "universal"
                  ? "bg-black text-white shadow-xs"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Universal Tiers
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "members"
                  ? "bg-black text-white shadow-xs"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Member Perks
            </button>
            <button
              onClick={() => setActiveTab("studios")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "studios"
                  ? "bg-black text-white shadow-xs"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Studio Perks
            </button>
            <button
              onClick={() => setActiveTab("badges")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "badges"
                  ? "bg-black text-white shadow-xs"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Special Badges
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full space-y-12">
        {/* ================= TAB 1: UNIVERSAL TIERS ================= */}
        {activeTab === "universal" && (
          <div className="space-y-10 animate-in fade-in duration-200">
            {/* INTRO EXPLANATION */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    The Universal Standard Scale (0% – 100%)
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                    Unlike fragmented platforms with inconsistent scoring, Trapped Into Architecture uses a single,
                    harmonized percentage threshold for both <strong>Architect Candidates (Members)</strong> and <strong>Architecture Firms (Studios)</strong>.
                    As you fill out details, your score rises dynamically, unlocking platform privileges automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* 5 TIERS OVERVIEW CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Bronze */}
              <div className="bg-white rounded-3xl p-5 border border-amber-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">🥉</span>
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      0% – 44%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base mb-1">Bronze Tier</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Entry level granted upon registration. Essential browsing &amp; knowledge tools.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 text-[11px] font-semibold text-amber-800">
                  ✓ Base Explorer Access
                </div>
              </div>

              {/* Silver */}
              <div className="bg-white rounded-3xl p-5 border border-slate-300 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">🥈</span>
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                      45% – 65%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base mb-1">Silver Tier</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Studio Ownership threshold. Unlock firm claiming and practice registration.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 text-[11px] font-bold text-slate-800 flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  <span>Studio Ownership</span>
                </div>
              </div>

              {/* Gold */}
              <div className="bg-white rounded-3xl p-5 border border-yellow-300 shadow-xs flex flex-col justify-between hover:shadow-md transition ring-2 ring-yellow-400/40">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">🥇</span>
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300">
                      66% – 80%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base mb-1">Gold Tier</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Hiring &amp; Public Visibility unlock. Post architecture jobs and list your profile.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 text-[11px] font-bold text-yellow-900 flex items-center gap-1">
                  <Briefcase size={12} className="text-yellow-700" />
                  <span>Job Posting Unlocked</span>
                </div>
              </div>

              {/* Platinum */}
              <div className="bg-white rounded-3xl p-5 border border-cyan-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">💎</span>
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-900 border border-cyan-200">
                      81% – 90%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base mb-1">Platinum Tier</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Priority recommendation to hiring studios, featured talent badge &amp; job alerts.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 text-[11px] font-bold text-cyan-900 flex items-center gap-1">
                  <Flame size={12} className="text-cyan-600" />
                  <span>Featured Talent</span>
                </div>
              </div>

              {/* Diamond */}
              <div className="bg-white rounded-3xl p-5 border border-purple-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">👑</span>
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                      91% – 100%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base mb-1">Diamond Tier</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Pure completion rank for the top 1% architectural dossiers. Highest prestige.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 text-[11px] font-bold text-purple-900 flex items-center gap-1">
                  <Star size={12} className="text-purple-600" />
                  <span>Elite Top 1% Rank</span>
                </div>
              </div>
            </div>

            {/* QUICK COMPARISON TABLE */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-extrabold text-gray-900 text-lg">
                  Universal Progression Matrix
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  See how member permissions and company capabilities align side-by-side
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <th className="py-3 px-4">Tier &amp; Score</th>
                      <th className="py-3 px-4">Member (Architect) Privileges</th>
                      <th className="py-3 px-4">Studio (Practice) Privileges</th>
                      <th className="py-3 px-4 text-center">Gating Enforced</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                        🥉 Bronze (0% – 44%)
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 leading-relaxed">
                        Browse all jobs, bookmark openings, favorite firms, participate in architectural quizzes &amp; exams.
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 leading-relaxed">
                        Listed in directory with basic office profile, searchable by city &amp; typology.
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">None</span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/50 bg-slate-50/20">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        🥈 Silver (45% – 65%)
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 leading-relaxed font-medium">
                        <strong>Studio Ownership:</strong> Eligible to <strong>claim an existing studio</strong> or <strong>register a new practice</strong>. Direct contact coordinates visible.
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 leading-relaxed">
                        Direct office contact details visible to verified candidates; team directory preview.
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                          Claim &amp; Register Gate
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-yellow-50/50 bg-yellow-50/30">
                      <td className="py-3.5 px-4 font-bold text-yellow-950 whitespace-nowrap">
                        🥇 Gold (66% – 80%)
                      </td>
                      <td className="py-3.5 px-4 text-yellow-900 leading-relaxed font-medium">
                        <strong>Job Posting:</strong> Eligible to <strong>post vacancies</strong> on behalf of a verified studio. Opt-in to public listing in Professionals Directory.
                      </td>
                      <td className="py-3.5 px-4 text-yellow-900 leading-relaxed font-medium">
                        <strong>Publish Openings:</strong> Studio is eligible to publish active recruitment listings to the platform.
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-yellow-200 text-yellow-900">
                          Job Posting Gate
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-cyan-50/50">
                      <td className="py-3.5 px-4 font-bold text-cyan-950 whitespace-nowrap">
                        💎 Platinum (81% – 90%)
                      </td>
                      <td className="py-3.5 px-4 text-cyan-900 leading-relaxed">
                        Priority recruiter matchmaking recommendations, exclusive job notification alert subscriptions.
                      </td>
                      <td className="py-3.5 px-4 text-cyan-900 leading-relaxed">
                        Featured studio banner on browse pages, highlighted vacancies, prioritized social distribution.
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800">Priority</span>
                      </td>
                    </tr>

                    <tr className="hover:bg-purple-50/50">
                      <td className="py-3.5 px-4 font-bold text-purple-950 whitespace-nowrap">
                        👑 Diamond (91% – 100%)
                      </td>
                      <td className="py-3.5 px-4 text-purple-900 leading-relaxed">
                        Elite Top 1% Architect recognition badge across directory, search, and leaderboard.
                      </td>
                      <td className="py-3.5 px-4 text-purple-900 leading-relaxed">
                        Elite Top 1% Architectural Practice badge, premier portfolio presentation and showcase.
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Elite</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MEMBER LEVELS & POINTS BREAKDOWN ================= */}
        {activeTab === "members" && (
          <div className="space-y-10 animate-in fade-in duration-200">
            {/* Header Note */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Candidate &amp; Member Profile Scoring
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                    Every section of your architectural profile awards points. Verified contact coordinates and credentials earn the highest trust weights.
                    Profiles can also mark sensitive personal details (such as phone number or email) as <strong>Secret</strong> without sacrificing any score!
                  </p>
                </div>
              </div>
            </div>

            {/* 100% POINTS BREAKDOWN TABLE */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">
                    Member Points Breakdown (100% Total)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Accurate distribution used to calculate your dynamic level
                  </p>
                </div>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                  100% Complete Scale
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Profile Field / Requirement</th>
                      <th className="py-2.5 px-4 text-center">Verification Method</th>
                      <th className="py-2.5 px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* Basic Identity */}
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-gray-900" rowSpan={4}>
                        Basic Identity<br/>
                        <span className="text-[10px] text-gray-500 font-normal">20% total</span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-medium">Full Name &amp; Unique Username</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">On Signup</span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-gray-900">5%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800 font-medium">Email Address Added</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">On Signup</span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-gray-900">5%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Profile Picture / Avatar Uploaded</td>
                      <td className="py-3 px-4 text-center text-gray-400">Media Upload</td>
                      <td className="py-3 px-4 text-right font-extrabold text-gray-900">5%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Professional Tagline / Headline</td>
                      <td className="py-3 px-4 text-center text-gray-400">Text Entry</td>
                      <td className="py-3 px-4 text-right font-extrabold text-gray-900">5%</td>
                    </tr>

                    {/* Contact & Verification */}
                    <tr className="hover:bg-blue-50/30 bg-blue-50/10">
                      <td className="py-3 px-4 font-bold text-blue-900" rowSpan={4}>
                        Contact &amp; Verifications<br/>
                        <span className="text-[10px] text-blue-600 font-normal">20% total</span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-medium">Phone Number Added</td>
                      <td className="py-3 px-4 text-center text-gray-400">Can be marked Secret</td>
                      <td className="py-3 px-4 text-right font-extrabold text-blue-900">5%</td>
                    </tr>
                    <tr className="hover:bg-blue-50/30 bg-blue-50/10">
                      <td className="py-3 px-4 text-gray-800 font-medium">WhatsApp Number (or Same as Phone)</td>
                      <td className="py-3 px-4 text-center text-gray-400">Direct Contact</td>
                      <td className="py-3 px-4 text-right font-extrabold text-blue-900">5%</td>
                    </tr>
                    <tr className="hover:bg-blue-50/30 bg-blue-50/10">
                      <td className="py-3 px-4 text-emerald-800 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Email Verification Confirmed</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Email Link</span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-800">5%</td>
                    </tr>
                    <tr className="hover:bg-blue-50/30 bg-blue-50/10">
                      <td className="py-3 px-4 text-emerald-800 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Phone Verification Confirmed</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Active Contact</span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-800">5%</td>
                    </tr>

                    {/* Professional Credentials & Social */}
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-gray-900" rowSpan={3}>
                        Credentials &amp; Social<br/>
                        <span className="text-[10px] text-gray-500 font-normal">25% total</span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-medium">Profession Selection</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">On Signup</span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-gray-900">10%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800 font-medium">
                        Council of Architecture (COA) Number / Highest Qual
                      </td>
                      <td className="py-3 px-4 text-center text-gray-400">High-Trust Verification</td>
                      <td className="py-3 px-4 text-right font-extrabold text-gray-900">10%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">LinkedIn Profile or Portfolio Website URL</td>
                      <td className="py-3 px-4 text-center text-gray-400">External Work Link</td>
                      <td className="py-3 px-4 text-right font-extrabold text-gray-900">5%</td>
                    </tr>

                    {/* Bio & Personal */}
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-gray-900" rowSpan={2}>
                        Bio &amp; Personal<br/>
                        <span className="text-[10px] text-gray-500 font-normal">10% total</span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">About Me / Professional Biography</td>
                      <td className="py-3 px-4 text-center text-gray-400">Detailed Narrative</td>
                      <td className="py-3 px-4 text-right font-extrabold text-gray-900">5%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Date of Birth &amp; Gender</td>
                      <td className="py-3 px-4 text-center text-gray-400">Can be marked Secret</td>
                      <td className="py-3 px-4 text-right font-extrabold text-gray-900">5%</td>
                    </tr>

                    {/* Education & Experience */}
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-gray-900" rowSpan={2}>
                        Experience &amp; Edu<br/>
                        <span className="text-[10px] text-gray-500 font-normal">25% total</span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-medium">Add at least one Education Degree (B.Arch, M.Arch, etc.)</td>
                      <td className="py-3 px-4 text-center text-gray-400">Education Tab</td>
                      <td className="py-3 px-4 text-right font-extrabold text-gray-900">15%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800 font-medium">Add at least one Professional Work Experience</td>
                      <td className="py-3 px-4 text-center text-gray-400">Experience Tab</td>
                      <td className="py-3 px-4 text-right font-extrabold text-gray-900">10%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PRIVACY GUARANTEE BANNER */}
            <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
              <EyeOff size={22} className="text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm leading-relaxed">
                <p className="font-bold text-emerald-900 mb-0.5">
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

        {/* ================= TAB 3: STUDIO LEVELS ================= */}
        {activeTab === "studios" && (
          <div className="space-y-10 animate-in fade-in duration-200">
            {/* Header Note */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Architecture Firm &amp; Practice Levels
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                    Studio levels are calculated dynamically based on studio profile completeness. To prevent fake openings and ensure candidate trust,
                    a firm must reach <strong>Gold Level Studio (66%)</strong> before publishing vacancies on the platform.
                  </p>
                </div>
              </div>
            </div>

            {/* STUDIO SCORING CRITERIA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <Award size={18} className="text-amber-600" />
                  <span>How Studios Reach 100% Score</span>
                </h3>
                <div className="space-y-2.5 text-xs text-gray-700">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span>Firm Name</span>
                    <span className="font-bold text-gray-900">+10%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span>Studio Logo Uploaded</span>
                    <span className="font-bold text-gray-900">+15%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span>Studio Overview / About Narrative</span>
                    <span className="font-bold text-gray-900">+15%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span>Complete City &amp; State Location</span>
                    <span className="font-bold text-gray-900">+15%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span>Official Contact Email</span>
                    <span className="font-bold text-gray-900">+10%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span>Phone or WhatsApp Number</span>
                    <span className="font-bold text-gray-900">+10%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span>Official Website Link</span>
                    <span className="font-bold text-gray-900">+5%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span>Practice Typology (Residential, Commercial, Landscape, etc.)</span>
                    <span className="font-bold text-gray-900">+5%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span>Founded Year &amp; Team Size</span>
                    <span className="font-bold text-gray-900">+5%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span>Social Media Channels (Instagram / LinkedIn)</span>
                    <span className="font-bold text-gray-900">+5%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <span>Verified Contact / Email Bonus</span>
                    <span className="font-bold text-emerald-800">+5% Bonus</span>
                  </div>
                </div>
              </div>

              {/* STUDIO PRIVILEGES ACCORDING TO TIER */}
              <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-white border border-amber-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-amber-900 text-sm">🥉 Bronze Studio (0% – 44%)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Directory Indexed</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Basic office directory entry created from historical job vacancy data.
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-300 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 text-sm">🥈 Silver Studio (45% – 65%)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">Contact Visible</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Logo, bio, and verified coordinates unlocked for job seekers. Authorized representatives can manage team and portfolio previews.
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-yellow-300 shadow-xs ring-1 ring-yellow-400">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-yellow-950 text-sm">🥇 Gold Studio (66% – 80%)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-900">Job Posting Unlocked</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <strong>Hiring Authorization:</strong> The practice meets verified credibility standards and can publish openings, internships, and receive applicant portfolios.
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-cyan-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-cyan-900 text-sm">💎 Platinum Studio (81% – 90%)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-900">Featured Placement</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Featured placement on the Companies directory, priority inclusion in WhatsApp job digests, and spotlight badges.
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-purple-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-purple-900 text-sm">👑 Diamond Studio (91% – 100%)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900">Elite 1% Studio</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Top 1% architectural practice distinction. Complete built works, rendering galleries, and distinguished portfolio presentations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SPECIAL BADGES ================= */}
        {activeTab === "badges" && (
          <div className="space-y-10 animate-in fade-in duration-200">
            {/* Header */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                  <BadgeCheck size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Special Badges &amp; Trust Marks
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                    In addition to completion tiers, Trapped Into Architecture awards special verified badges that recognize professional authority,
                    hiring status, and administrative credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* BADGES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recruiter Badge */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-full">
                    <Building2 size={13} className="text-indigo-600" />
                    <span>Recruiter • [Firm Name]</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Role Badge</span>
                </div>
                <h3 className="font-extrabold text-base text-gray-900">Verified Recruiter Badge</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Awarded automatically to architects and managers who own or have verified claim over an active practice.
                  Displayed prominently under the user's name on public profiles to signal authentic hiring authority.
                </p>
                <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <strong>How to get it:</strong> Register a practice at <Link href="/companies/new" className="text-indigo-600 font-bold underline">/companies/new</Link> or claim your studio from the directory.
                </div>
              </div>

              {/* COA Verified */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-full">
                    <ShieldCheck size={13} className="text-blue-600" />
                    <span>COA Verified</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Council Badge</span>
                </div>
                <h3 className="font-extrabold text-base text-gray-900">Council of Architecture (India) Badge</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Confirms registration with the Council of Architecture (India). Validates that the individual is legally authorized
                  to practice architecture in India under the Architects Act, 1972.
                </p>
                <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <strong>How to get it:</strong> Enter your valid CA registration number in your profile credentials.
                </div>
              </div>

              {/* VIP Distinction */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold rounded-full">
                    <Star size={13} className="text-amber-600 fill-amber-500" />
                    <span>VIP Member</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Honorary Badge</span>
                </div>
                <h3 className="font-extrabold text-base text-gray-900">VIP Honorary Status</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  A rare honorary badge granted exclusively by platform administrators to key community figures, celebrated studio founders,
                  and exceptional contributors to the architectural ecosystem.
                </p>
                <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <strong>Criteria:</strong> Conferred manually based on industry reputation, community impact, or verified practice leadership.
                </div>
              </div>

              {/* Contact Verification Badges */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>Email &amp; Phone Verified</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Security Badge</span>
                </div>
                <h3 className="font-extrabold text-base text-gray-900">Contact Verification Badges</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Verifies that the candidate or recruiter has confirmed ownership of their contact coordinates.
                  Each confirmation awards <strong>+5%</strong> toward your universal tier score.
                </p>
                <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <strong>How to get it:</strong> Click "Verify Email" and "Verify Phone" under your Profile Details tab.
                </div>
              </div>

              {/* User Tracks */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Community Tracks
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Categorization</span>
                </div>
                <h3 className="font-extrabold text-base text-gray-900">User Track Roles</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Helps employers and peers instantly recognize your role and purpose within the community:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 font-semibold">
                    🎯 Job Seeker / Candidate
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-900 font-semibold">
                    🎓 Architecture Student / Intern
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-900 font-semibold">
                    🏢 Recruiter / Architecture Firm
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 font-semibold">
                    🏛️ Academician / Researcher
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 font-semibold">
                    💼 Freelancer / Consultant
                  </div>
                  <div className="p-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-800 font-semibold">
                    ☕ Explorer / Architecture Enthusiast
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM ACTION CTA */}
        <section className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xs text-center">
          <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Award size={32} />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
            Level Up Your Architectural Profile Today
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed mb-6">
            Complete your dossier, verify your credentials, and unlock your recruiter or candidate privileges across India's premier architecture portal.
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
              className="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center justify-center"
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
