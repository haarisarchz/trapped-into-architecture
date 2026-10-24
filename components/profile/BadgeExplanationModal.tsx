"use client";

import React, { useEffect } from "react";
import { Award, X } from "lucide-react";

interface BadgeExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BadgeExplanationModal({
  isOpen,
  onClose,
}: BadgeExplanationModalProps) {
  // Prevent background scroll when modal is open
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
                Profile Badges & Scoring System
              </h3>
              <p className="text-xs text-gray-500">
                How levels are calculated and points distributed
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

        {/* SECTION 1: BADGE TIERS & PERCENTAGE RANGES */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            1. Member Levels & Required Scores
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl border border-amber-200 bg-amber-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥉</span>
                <div>
                  <p className="font-bold text-amber-900">Bronze Member</p>
                  <p className="text-[11px] text-amber-700">Basic identification & profile start</p>
                </div>
              </div>
              <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-amber-200 text-amber-800 shrink-0">
                20% – 49%
              </span>
            </div>

            <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥈</span>
                <div>
                  <p className="font-bold text-slate-800">Silver Member</p>
                  <p className="text-[11px] text-slate-600">Core details & education added</p>
                </div>
              </div>
              <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shrink-0">
                50% – 69%
              </span>
            </div>

            <div className="p-3 rounded-2xl border border-yellow-300 bg-yellow-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥇</span>
                <div>
                  <p className="font-bold text-yellow-900">Gold Member</p>
                  <p className="text-[11px] text-yellow-700">Detailed degrees, bio & experience</p>
                </div>
              </div>
              <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-yellow-300 text-yellow-900 shrink-0">
                70% – 84%
              </span>
            </div>

            <div className="p-3 rounded-2xl border border-cyan-200 bg-cyan-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">💎</span>
                <div>
                  <p className="font-bold text-cyan-900">Platinum Member</p>
                  <p className="text-[11px] text-cyan-700">Comprehensive professional portfolio</p>
                </div>
              </div>
              <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-cyan-200 text-cyan-900 shrink-0">
                85% – 94%
              </span>
            </div>

            <div className="p-3 rounded-2xl border border-purple-200 bg-purple-50/80 flex items-center justify-between sm:col-span-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">👑</span>
                <div>
                  <p className="font-bold text-purple-900">Diamond Member</p>
                  <p className="text-[11px] text-purple-700">Complete architectural dossier across all fields</p>
                </div>
              </div>
              <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-purple-200 text-purple-900 shrink-0">
                95% – 100%
              </span>
            </div>

            <div className="p-3 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 flex items-center justify-between sm:col-span-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <div>
                  <p className="font-bold text-amber-950">VIP User Status</p>
                  <p className="text-[11px] text-amber-800">Special privilege for 95%+ completion + Active COA Architect or Vetted Recruiter</p>
                </div>
              </div>
              <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-amber-400 text-black shrink-0">
                Elite
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: FIELD DISTRIBUTION TABLE */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            2. Field Distribution & Points Chart (Total: 100%)
          </h4>

          <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Field / Requirement</th>
                  <th className="py-2.5 px-3 text-center">Type</th>
                  <th className="py-2.5 px-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Basic Identity */}
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 font-semibold text-gray-900" rowSpan={6}>
                    Basic Identity<br/>
                    <span className="text-[10px] text-gray-500 font-normal">(40% total)</span>
                  </td>
                  <td className="py-2 px-3 text-gray-700">Full Name & Username</td>
                  <td className="py-2 px-3 text-center"><span className="text-red-500 font-bold">Required</span></td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-700">Profile Picture / Avatar</td>
                  <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">10%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-700">Professional Tagline (Headline)</td>
                  <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-700">About Me / Professional Bio</td>
                  <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">10%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-700">Date of Birth & Gender</td>
                  <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-700">Phone Number & Email</td>
                  <td className="py-2 px-3 text-center"><span className="text-red-500 font-bold">Required</span></td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                </tr>

                {/* Professional Credentials */}
                <tr className="hover:bg-gray-50 bg-gray-50/50">
                  <td className="py-2 px-3 font-semibold text-gray-900" rowSpan={2}>
                    Credentials<br/>
                    <span className="text-[10px] text-gray-500 font-normal">(20% total)</span>
                  </td>
                  <td className="py-2 px-3 text-gray-700">Profession Selection</td>
                  <td className="py-2 px-3 text-center"><span className="text-red-500 font-bold">Required</span></td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">10%</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-gray-50/50">
                  <td className="py-2 px-3 text-gray-700">COA Registration (or Highest Qual for Students)</td>
                  <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">10%</td>
                </tr>

                {/* Education */}
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 font-semibold text-gray-900" rowSpan={2}>
                    Education<br/>
                    <span className="text-[10px] text-gray-500 font-normal">(20% total)</span>
                  </td>
                  <td className="py-2 px-3 text-gray-700">At least 1 Education entry (UG / PG / PhD / School)</td>
                  <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">15%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-700">Separation of University & College (or Board & School)</td>
                  <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                </tr>

                {/* Experience */}
                <tr className="hover:bg-gray-50 bg-gray-50/50">
                  <td className="py-2 px-3 font-semibold text-gray-900" rowSpan={2}>
                    Experience<br/>
                    <span className="text-[10px] text-gray-500 font-normal">(20% total)</span>
                  </td>
                  <td className="py-2 px-3 text-gray-700">At least 1 Work Experience or Internship entry</td>
                  <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">15%</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-gray-50/50">
                  <td className="py-2 px-3 text-gray-700">Organization Type & Responsibilities filled</td>
                  <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                </tr>

                {/* Total Row */}
                <tr className="bg-black text-white font-bold">
                  <td className="py-2.5 px-3" colSpan={3}>Total Profile Score</td>
                  <td className="py-2.5 px-3 text-right text-sm">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end sticky bottom-0 bg-white pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
