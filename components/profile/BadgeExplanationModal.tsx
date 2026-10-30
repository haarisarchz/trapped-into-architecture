"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Award, X, Sparkles, Shield, EyeOff } from "lucide-react";

interface BadgeExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BadgeExplanationModal({
  isOpen,
  onClose,
}: BadgeExplanationModalProps) {
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
                High-trust scoring weights and member tier milestones
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

        {/* SECTION 1: THE 5 MEMBER LEVELS */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            1. Member Levels & Required Scores
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* Bronze */}
            <div className="p-3 rounded-2xl border border-amber-200 bg-amber-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥉</span>
                <div>
                  <p className="font-bold text-amber-900">Bronze Member</p>
                  <p className="text-[11px] text-amber-700">Unlocked immediately on signup (20%)</p>
                </div>
              </div>
              <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-amber-200 text-amber-800 shrink-0">
                0% – 44%
              </span>
            </div>

            {/* Silver */}
            <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥈</span>
                <div>
                  <p className="font-bold text-slate-800">Silver Member</p>
                  <p className="text-[11px] text-slate-600">Avatar, phone, whatsapp & bio added</p>
                </div>
              </div>
              <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shrink-0">
                45% – 65%
              </span>
            </div>

            {/* Gold */}
            <div className="p-3 rounded-2xl border border-yellow-300 bg-yellow-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥇</span>
                <div>
                  <p className="font-bold text-yellow-900">Gold Member</p>
                  <p className="text-[11px] text-yellow-700">COA registration & degrees added</p>
                </div>
              </div>
              <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-yellow-300 text-yellow-900 shrink-0">
                66% – 80%
              </span>
            </div>

            {/* Platinum */}
            <div className="p-3 rounded-2xl border border-cyan-200 bg-cyan-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">💎</span>
                <div>
                  <p className="font-bold text-cyan-900">Platinum Member</p>
                  <p className="text-[11px] text-cyan-700">In-depth practice tenure & portfolio</p>
                </div>
              </div>
              <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-cyan-200 text-cyan-900 shrink-0">
                81% – 90%
              </span>
            </div>

            {/* Diamond */}
            <div className="p-3.5 rounded-2xl border border-purple-200 bg-purple-50/80 flex items-center justify-between sm:col-span-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">👑</span>
                <div>
                  <p className="font-bold text-purple-900">Diamond Member</p>
                  <p className="text-[11px] text-purple-700">Complete, authentic architectural dossier across all fields</p>
                </div>
              </div>
              <span className="font-extrabold text-xs px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-900 shrink-0">
                91% – 100%
              </span>
            </div>
          </div>

          {/* PRIVACY & VIP NOTE */}
          <div className="mt-3 space-y-2 text-xs">
            <div className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-2.5 text-emerald-950">
              <EyeOff size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="font-bold">Privacy Guarantee:</strong> You can mark your Phone Number, WhatsApp Number, Email, or Date of Birth as <strong>Secret</strong> under <span className="font-semibold underline">Settings → Privacy</span>. Secret fields are never exposed publicly and still earn 100% full points towards your Diamond status!
              </p>
            </div>

            <div className="p-3 rounded-2xl border border-amber-200 bg-amber-50/50 flex items-start gap-2.5 text-amber-950">
              <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="font-bold">⭐ VIP User Status:</strong> VIP is an honorary Diamond distinction awarded to important community figures, platform favorites, and top contributors.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: FIELD DISTRIBUTION TABLE */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            2. High-Trust Points Breakdown (Total: 100%)
          </h4>

          <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                  <th className="py-2.5 px-3">Section</th>
                  <th className="py-2.5 px-3">Field / Data Point</th>
                  <th className="py-2.5 px-3 text-center">Type</th>
                  <th className="py-2.5 px-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Registration Identity */}
                <tr className="hover:bg-gray-50 bg-amber-50/20">
                  <td className="py-2 px-3 font-semibold text-gray-900" rowSpan={4}>
                    Identity<br/>
                    <span className="text-[10px] text-gray-500 font-normal">(25% total)</span>
                  </td>
                  <td className="py-2 px-3 text-gray-800 font-medium">Full Name & Username</td>
                  <td className="py-2 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px]">On Signup</span></td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-amber-50/20">
                  <td className="py-2 px-3 text-gray-800 font-medium">Email Address (Can be hidden)</td>
                  <td className="py-2 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px]">On Signup</span></td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-700">Profile Picture / Avatar</td>
                  <td className="py-2 px-3 text-center text-gray-400">Optional</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">10%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-700">Professional Tagline (Headline)</td>
                  <td className="py-2 px-3 text-center text-gray-400">Optional</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                </tr>

                {/* High Trust Contact & Social */}
                <tr className="hover:bg-gray-50 bg-blue-50/20">
                  <td className="py-2 px-3 font-semibold text-blue-900" rowSpan={3}>
                    Trust Contacts<br/>
                    <span className="text-[10px] text-blue-600 font-normal">(15% total)</span>
                  </td>
                  <td className="py-2 px-3 text-gray-800 font-medium">Phone Number (Can be made Secret)</td>
                  <td className="py-2 px-3 text-center"><span className="text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-bold text-[10px]">High Trust</span></td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-blue-50/20">
                  <td className="py-2 px-3 text-gray-800 font-medium">WhatsApp Number / Same as Phone (Can be Secret)</td>
                  <td className="py-2 px-3 text-center"><span className="text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-bold text-[10px]">High Trust</span></td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-blue-50/20">
                  <td className="py-2 px-3 text-gray-800 font-medium">LinkedIn or Portfolio URL</td>
                  <td className="py-2 px-3 text-center text-gray-400">Optional</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                </tr>

                {/* Professional & COA Credentials */}
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 font-semibold text-gray-900" rowSpan={2}>
                    Credentials<br/>
                    <span className="text-[10px] text-gray-500 font-normal">(25% total)</span>
                  </td>
                  <td className="py-2 px-3 text-gray-800 font-medium">Profession Selection</td>
                  <td className="py-2 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px]">On Signup</span></td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">10%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-800 font-medium">Council of Architecture (COA) Registration</td>
                  <td className="py-2 px-3 text-center"><span className="text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded font-bold text-[10px]">Top Credibility</span></td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">15%</td>
                </tr>

                {/* Bio & Personal */}
                <tr className="hover:bg-gray-50 bg-gray-50/50">
                  <td className="py-2 px-3 font-semibold text-gray-900" rowSpan={2}>
                    About<br/>
                    <span className="text-[10px] text-gray-500 font-normal">(10% total)</span>
                  </td>
                  <td className="py-2 px-3 text-gray-700">About Me / Professional Bio</td>
                  <td className="py-2 px-3 text-center text-gray-400">Optional</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-gray-50/50">
                  <td className="py-2 px-3 text-gray-700">Date of Birth & Gender (Can be Secret)</td>
                  <td className="py-2 px-3 text-center text-gray-400">Optional</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                </tr>

                {/* Education */}
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-3 font-semibold text-gray-900">
                    Education<br/>
                    <span className="text-[10px] text-gray-500 font-normal">(15% total)</span>
                  </td>
                  <td className="py-2 px-3 text-gray-700">Architecture degree / schooling with separated college & university</td>
                  <td className="py-2 px-3 text-center text-gray-400">Optional</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">15%</td>
                </tr>

                {/* Experience */}
                <tr className="hover:bg-gray-50 bg-gray-50/50">
                  <td className="py-2 px-3 font-semibold text-gray-900">
                    Experience<br/>
                    <span className="text-[10px] text-gray-500 font-normal">(10% total)</span>
                  </td>
                  <td className="py-2 px-3 text-gray-700">Work experience / practice roles with firm name & dates</td>
                  <td className="py-2 px-3 text-center text-gray-400">Optional</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-900">10%</td>
                </tr>

                {/* Total Row */}
                <tr className="bg-black text-white font-bold">
                  <td className="py-2.5 px-3" colSpan={3}>
                    Total Profile Score (Initial registration gives Bronze 20%)
                  </td>
                  <td className="py-2.5 px-3 text-right text-sm">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between sticky bottom-0 bg-white pt-2 border-t border-gray-100">
          <Link
            href="/badges-and-perks"
            onClick={onClose}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
          >
            <span>View Full Badges &amp; Perks Guide &rarr;</span>
          </Link>
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
