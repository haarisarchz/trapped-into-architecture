"use client";

import Link from "next/link";
import { Sparkles, Check, ArrowRight, SlidersHorizontal } from "lucide-react";

export default function JobAlertsSubscribeCard() {
  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-white border border-amber-300/80 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-2.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
          <SlidersHorizontal size={11} className="text-amber-600" />
          <span>Custom Subscription</span>
        </div>
        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
          Tailored Alerts
        </span>
      </div>

      <h3 className="text-base font-bold text-gray-950 mb-1">
        Subscribe with Custom Filters
      </h3>
      <p className="text-xs text-gray-600 mb-4 leading-relaxed">
        Receive curated architectural vacancies matching your exact preferences — customized by preferred city, studio typology, experience level, and salary.
      </p>

      {/* Feature highlights */}
      <div className="space-y-2 mb-4 bg-white/80 rounded-xl p-3 border border-amber-100 text-xs text-gray-700">
        <div className="flex items-start gap-2">
          <Check size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong className="text-gray-900">Custom City & Role Filters</strong> (Architect, BIM, Interior, Urban)
          </span>
        </div>
        <div className="flex items-start gap-2">
          <Check size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong className="text-gray-900">Priority Instant Alerts</strong> delivered directly before public listing
          </span>
        </div>
        <div className="flex items-start gap-2">
          <Check size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong className="text-gray-900">Verified Studio Openings</strong> with direct recruiter access
          </span>
        </div>
      </div>

      {/* CTA Button directing to contact page */}
      <Link
        href="/contact"
        className="w-full inline-flex items-center justify-center gap-2 bg-gray-950 hover:bg-black text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition shadow-xs group"
      >
        <span>Subscribe & Set Custom Filters</span>
        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
      </Link>

      <p className="text-[10px] text-gray-400 text-center mt-2.5">
        Custom plan activation • Dedicated subscription portal coming soon
      </p>
    </div>
  );
}
