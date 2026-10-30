"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Award, X, Sparkles, ShieldCheck, MailCheck, PhoneCall, Building2, CheckCircle2 } from "lucide-react";

interface CompanyBadgeExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: string;
  currentPercentage?: number;
}

export default function CompanyBadgeExplanationModal({
  isOpen,
  onClose,
  currentTier = "bronze",
  currentPercentage = 20,
}: CompanyBadgeExplanationModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-2xl border border-gray-100 my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Award size={22} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900">
                Studio Levels & Verification Badges
              </h3>
              <p className="text-xs text-gray-500">
                High-trust scoring weights and studio credibility milestones
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 transition cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* SECTION 1: THE 5 STUDIO LEVELS */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            1. Studio Levels & Required Scores
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* Bronze */}
            <div className={`p-3 rounded-2xl border ${currentTier === 'bronze' ? 'ring-2 ring-amber-500 bg-amber-100/70 border-amber-300' : 'border-amber-200 bg-amber-50/60'} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">🥉</span>
                <div>
                  <p className="font-bold text-amber-900">Bronze Level Studio</p>
                  <p className="text-[11px] text-amber-700">Created from job listing (20% base)</p>
                </div>
              </div>
              <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-amber-200 text-amber-800 shrink-0">
                0% – 44%
              </span>
            </div>

            {/* Silver */}
            <div className={`p-3 rounded-2xl border ${currentTier === 'silver' ? 'ring-2 ring-slate-500 bg-slate-100 border-slate-300' : 'border-slate-200 bg-slate-50'} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">🥈</span>
                <div>
                  <p className="font-bold text-slate-800">Silver Level Studio</p>
                  <p className="text-[11px] text-slate-600">Logo, bio, website & socials added</p>
                </div>
              </div>
              <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shrink-0">
                45% – 65%
              </span>
            </div>

            {/* Gold */}
            <div className={`p-3 rounded-2xl border ${currentTier === 'gold' ? 'ring-2 ring-yellow-500 bg-yellow-100/80 border-yellow-300' : 'border-yellow-300 bg-yellow-50/80'} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">🥇</span>
                <div>
                  <p className="font-bold text-yellow-900">Gold Level Studio</p>
                  <p className="text-[11px] text-yellow-700">Claimed & contact verified</p>
                </div>
              </div>
              <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-yellow-300 text-yellow-900 shrink-0">
                66% – 80%
              </span>
            </div>

            {/* Platinum */}
            <div className={`p-3 rounded-2xl border ${currentTier === 'platinum' ? 'ring-2 ring-cyan-500 bg-cyan-100/80 border-cyan-300' : 'border-cyan-200 bg-cyan-50/70'} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">💎</span>
                <div>
                  <p className="font-bold text-cyan-900">Platinum Level Studio</p>
                  <p className="text-[11px] text-cyan-700">Team linked & verified track record</p>
                </div>
              </div>
              <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-cyan-200 text-cyan-900 shrink-0">
                81% – 90%
              </span>
            </div>

            {/* Diamond */}
            <div className={`p-3.5 rounded-2xl border ${currentTier === 'diamond' ? 'ring-2 ring-purple-500 bg-purple-100 border-purple-300' : 'border-purple-200 bg-purple-50/80'} flex items-center justify-between sm:col-span-2`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">👑</span>
                <div>
                  <p className="font-bold text-purple-900">Diamond Level Studio</p>
                  <p className="text-[11px] text-purple-700">Full architectural dossier, portfolio showcase & top employer credibility</p>
                </div>
              </div>
              <span className="font-extrabold text-xs px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-900 shrink-0">
                91% – 100%
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: TRUST & VERIFICATION BADGES */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            2. Trust & Verification Badges
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl border border-blue-200 bg-blue-50/60 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <Building2 size={16} className="text-blue-600" />
                <span>Claimed Studio</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Profile is claimed and actively managed by verified studio leadership.
              </p>
            </div>

            <div className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <MailCheck size={16} className="text-emerald-600" />
                <span>Email Verified</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Official domain / HR contact email has been tested and verified.
              </p>
            </div>

            <div className="p-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 font-bold text-indigo-900">
                <PhoneCall size={16} className="text-indigo-600" />
                <span>Phone Verified</span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Studio office contact line is verified for applicant outreach.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: POINTS DISTRIBUTION TABLE */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            3. Points Distribution (Total: 100%)
          </h4>

          <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Field / Requirement</th>
                  <th className="py-2.5 px-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50 bg-amber-50/20">
                  <td className="py-2 px-3 font-semibold text-gray-900">Base Listing</td>
                  <td className="py-2 px-3 text-gray-800">Firm Name, Organization Type, City & State</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">20%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 font-semibold text-gray-900" rowSpan={2}>Branding & Bio</td>
                  <td className="py-2 px-3 text-gray-700">Studio Logo / Brand Mark</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">10%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-700">Company Bio / Design Philosophy</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">10%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 font-semibold text-gray-900" rowSpan={2}>Web & Social</td>
                  <td className="py-2 px-3 text-gray-700">Official Website URL</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">10%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-700">Instagram & LinkedIn profiles</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">10%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 font-semibold text-gray-900" rowSpan={2}>Studio Info</td>
                  <td className="py-2 px-3 text-gray-700">Principal Architect / Founders</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-700">Team Size & Founded Year</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-blue-50/20">
                  <td className="py-2 px-3 font-semibold text-blue-900" rowSpan={3}>Verification</td>
                  <td className="py-2 px-3 text-blue-950 font-medium">Claimed Studio Profile</td>
                  <td className="py-2 px-3 text-right font-bold text-blue-900">15%</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-emerald-50/20">
                  <td className="py-2 px-3 text-emerald-950 font-medium">Email Verified</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-900">10%</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-indigo-50/20">
                  <td className="py-2 px-3 text-indigo-950 font-medium">Phone Verified</td>
                  <td className="py-2 px-3 text-right font-bold text-indigo-900">5%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
