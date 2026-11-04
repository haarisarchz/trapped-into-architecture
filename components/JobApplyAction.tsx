"use client";

import React, { useState } from "react";
import { X, Sparkles, Check, ArrowRight } from "lucide-react";

interface JobApplyActionProps {
  jobId: string;
  firmName: string;
  position: string;
  applyLink?: string | null;
  displayEmail?: string | null;
  isExpired?: boolean;
}

export default function JobApplyAction({
  jobId,
  firmName,
  position,
  applyLink,
  displayEmail,
  isExpired,
}: JobApplyActionProps) {
  const [showLimitModal, setShowLimitModal] = useState(false);

  if (isExpired) {
    return (
      <button disabled className="bg-gray-200 text-gray-500 px-8 py-3.5 rounded-xl text-lg font-bold cursor-not-allowed w-full sm:w-auto text-center">
        Post Expired
      </button>
    );
  }

  // Check guest click allowance (2 free clicks per day)
  const checkGuestAllowance = (): boolean => {
    try {
      const userStr = localStorage.getItem("currentUser");
      // Registered users have unlimited applications
      if (userStr) return true;

      const today = new Date().toISOString().split("T")[0];
      const rawMeter = localStorage.getItem("ti2a_guest_apply_meter");
      let meter: { date: string; count: number } = { date: today, count: 0 };

      if (rawMeter) {
        try {
          const parsed = JSON.parse(rawMeter);
          if (parsed && parsed.date === today) {
            meter = parsed;
          }
        } catch (e) {}
      }

      // If user has already used 2 clicks today, show limit modal!
      if (meter.count >= 2) {
        setShowLimitModal(true);
        return false;
      }

      // Otherwise increment and allow click
      meter.count += 1;
      meter.date = today;
      localStorage.setItem("ti2a_guest_apply_meter", JSON.stringify(meter));
      return true;
    } catch (e) {
      return true;
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    const allowed = checkGuestAllowance();
    if (!allowed) {
      e.preventDefault();
      return;
    }

    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "apply_click", {
        job_id: jobId,
        firm_name: firmName,
        position: position,
      });
    }
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    const allowed = checkGuestAllowance();
    if (!allowed) {
      e.preventDefault();
      return;
    }

    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "email_click", {
        job_id: jobId,
        firm_name: firmName,
        position: position,
      });
    }
  };

  const handleRegisterFromModal = () => {
    setShowLimitModal(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "register" }));
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        {applyLink && (
          <a
            href={applyLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleApplyClick}
            className="bg-black text-white px-8 py-3 rounded-xl text-base font-bold hover:bg-gray-800 transition w-full sm:w-auto text-center shadow-md cursor-pointer"
          >
            Apply Now ↗
          </a>
        )}
        {displayEmail && (
          <a
            href={`mailto:${displayEmail}?subject=Application for ${encodeURIComponent(position)} at ${encodeURIComponent(firmName)}`}
            onClick={handleEmailClick}
            className="bg-white text-black px-8 py-3 rounded-xl text-base font-bold border-2 border-black hover:bg-gray-50 transition w-full sm:w-auto text-center shadow-sm cursor-pointer"
          >
            Email Now
          </a>
        )}
        {!applyLink && !displayEmail && (
          <span className="text-gray-500 text-sm italic">No application method provided</span>
        )}
      </div>

      {/* 2-FREE-CLICKS DAILY LIMIT MODAL */}
      {showLimitModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowLimitModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLimitModal(false)}
              aria-label="Close dialog"
              className="absolute top-4 right-4 text-gray-400 hover:text-black p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-100 to-amber-200 text-amber-900 flex items-center justify-center text-2xl border border-amber-300 shadow-xs shrink-0">
                🥉
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 inline-block mb-1">
                  Daily Limit Reached (2/2 Used)
                </span>
                <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight">
                  Register Free to Continue Applying
                </h3>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              You&apos;ve used your <strong>2 free guest applications for today</strong>. Join India&apos;s premier architecture network in 15 seconds to unlock unlimited applications and studio coordinates.
            </p>

            {/* RAPID BENEFITS */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2 mb-5 text-xs text-gray-700">
              <div className="flex items-start gap-2">
                <Check size={14} className="text-emerald-600 shrink-0 mt-0.5 font-bold" />
                <span><strong>Unlimited Applications:</strong> Apply directly to all studios without daily caps</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={14} className="text-emerald-600 shrink-0 mt-0.5 font-bold" />
                <span><strong>Bronze Member Dossier:</strong> Instant 20% profile score and public URL</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={14} className="text-emerald-600 shrink-0 mt-0.5 font-bold" />
                <span><strong>1-Click Bookmarks:</strong> Save jobs and favorite architecture practices</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={14} className="text-emerald-600 shrink-0 mt-0.5 font-bold" />
                <span><strong>Fortnightly Briefing:</strong> Top 5 openings sent directly on the 1st &amp; 15th</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleRegisterFromModal}
                className="w-full bg-black hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm py-3.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create Free Account (Takes 15s)</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full text-gray-500 hover:text-gray-800 text-xs font-semibold py-1.5 cursor-pointer"
              >
                Continue Reading Job Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
