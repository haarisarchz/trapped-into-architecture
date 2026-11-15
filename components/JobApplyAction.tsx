"use client";

import React, { useState } from "react";
import { X, Sparkles, Check, ArrowRight, Zap, FileText, FolderArchive, Mail, Lock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { compileEmailTemplate, getSmartApplyDocStatus } from "@/utils/smartApply";

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
  const [showSmartApplyModal, setShowSmartApplyModal] = useState(false);
  const [showSilverUpgradeModal, setShowSilverUpgradeModal] = useState(false);
  const [compiledPreview, setCompiledPreview] = useState<{ subject: string; body: string } | null>(null);

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

      if (meter.count >= 2) {
        setShowLimitModal(true);
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "guest_popup_view", { source: "apply_limit_modal" });
        }
        return false;
      }

      meter.count += 1;
      localStorage.setItem("ti2a_guest_apply_meter", JSON.stringify(meter));
      return true;
    } catch (e) {
      return true;
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    if (!checkGuestAllowance()) {
      e.preventDefault();
      return;
    }

    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "job_apply_click", {
        job_id: jobId,
        firm_name: firmName,
        position: position,
        method: "apply_link",
      });
    }
  };

  const handleManualEmailClick = (e: React.MouseEvent) => {
    if (!checkGuestAllowance()) {
      e.preventDefault();
      return;
    }

    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "job_apply_click", {
        job_id: jobId,
        firm_name: firmName,
        position: position,
        method: "email_manual",
      });
    }
  };

  // Smart Apply Click Handler
  const handleSmartApplyClick = () => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      setShowSilverUpgradeModal(true);
      return;
    }

    const user = JSON.parse(userStr);
    const tier = user?.badge_tier || "bronze";
    const isSilverOrAbove = ["silver", "gold", "platinum", "diamond"].includes(tier);

    if (!isSilverOrAbove) {
      setShowSilverUpgradeModal(true);
      return;
    }

    // Compile email
    const compiled = compileEmailTemplate(
      {
        subject: user.custom_mail_subject,
        body: user.custom_mail_body,
      },
      {
        user,
        job: { position, firm_name: firmName },
      }
    );

    setCompiledPreview(compiled);
    setShowSmartApplyModal(true);
  };

  const handleLaunchEmailClient = () => {
    if (!displayEmail || !compiledPreview) return;

    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "job_apply_click", {
        job_id: jobId,
        firm_name: firmName,
        position: position,
        method: "ti2a_smart_apply",
      });
    }

    const mailto = `mailto:${displayEmail}?subject=${encodeURIComponent(compiledPreview.subject)}&body=${encodeURIComponent(compiledPreview.body)}`;
    window.location.href = mailto;
    setShowSmartApplyModal(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {/* BUTTON 1: DIRECT APPLY LINK (IF PROVIDED) */}
        {applyLink && (
          <a
            href={applyLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleApplyClick}
            className="bg-black text-white px-7 py-3 rounded-xl text-sm sm:text-base font-bold hover:bg-gray-800 transition w-full sm:w-auto text-center shadow-md cursor-pointer"
          >
            Apply on Website ↗
          </a>
        )}

        {/* BUTTON 2: ⚡ TI2A SMART APPLY (PRIMARY BRAND ACTION) */}
        {displayEmail && (
          <button
            type="button"
            onClick={handleSmartApplyClick}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-black hover:from-blue-700 hover:to-gray-900 text-white px-7 py-3 rounded-xl text-sm sm:text-base font-extrabold transition w-full sm:w-auto text-center shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2"
          >
            <Zap size={18} className="fill-amber-400 text-amber-400" />
            <span>⚡ TI2A Smart Apply</span>
          </button>
        )}

        {/* BUTTON 3: MANUAL EMAIL (EXISTING FALLBACK) */}
        {displayEmail && (
          <a
            href={`mailto:${displayEmail}?subject=Application for ${encodeURIComponent(position)} at ${encodeURIComponent(firmName)}`}
            onClick={handleManualEmailClick}
            className="bg-white text-gray-700 hover:text-black px-5 py-3 rounded-xl text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition w-full sm:w-auto text-center shadow-xs cursor-pointer"
          >
            Email Manually
          </a>
        )}

        {!applyLink && !displayEmail && (
          <span className="text-gray-500 text-sm italic">No application method provided</span>
        )}
      </div>

      {/* MODAL 1: SMART APPLY PREVIEW & LAUNCH */}
      {showSmartApplyModal && compiledPreview && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowSmartApplyModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-gray-100 relative text-left my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSmartApplyModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚡</span>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                TI2A Smart Apply Ready
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-5">
              Review your compiled cover letter, portfolio link, and verified credentials before sending.
            </p>

            {/* PREVIEW CONTAINER */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mb-6 space-y-3 text-xs text-gray-800 font-sans">
              <div>
                <span className="font-bold text-gray-500 block mb-0.5">To:</span>
                <span className="font-semibold text-black bg-white px-2 py-1 rounded-md border border-gray-200 block truncate">
                  {displayEmail}
                </span>
              </div>

              <div>
                <span className="font-bold text-gray-500 block mb-0.5">Subject:</span>
                <span className="font-semibold text-black bg-white px-2 py-1 rounded-md border border-gray-200 block truncate">
                  {compiledPreview.subject}
                </span>
              </div>

              <div>
                <span className="font-bold text-gray-500 block mb-0.5">Cover Letter Body:</span>
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto font-sans text-gray-700">
                  {compiledPreview.body}
                </div>
              </div>
            </div>

            {/* ACTION LAUNCH */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleLaunchEmailClient}
                className="w-full sm:flex-1 bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Mail size={16} />
                <span>Open in Email App & Send ↗</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSmartApplyModal(false)}
                className="w-full sm:w-auto text-xs font-semibold text-gray-500 hover:text-black py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SILVER TIER UPGRADE PROMPT */}
      {showSilverUpgradeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowSilverUpgradeModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSilverUpgradeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center mb-4 shadow-md">
              <Zap size={24} className="fill-white" />
            </div>

            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">
              Unlock ⚡ TI2A Smart Apply
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-5">
              TI2A Smart Apply allows verified candidates to apply to architectural studios in 1 click with their <strong>5MB portfolio</strong>, <strong>1MB resume</strong>, and auto-composed human cover letter.
            </p>

            <div className="space-y-2.5 mb-6 text-xs text-gray-800 font-semibold bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <span>Upload 5MB Architectural Portfolio</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <span>Upload 1MB Resume & Experience Certificates</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <span>Auto-generate professional cover letters</span>
              </div>
            </div>

            <Link
              href="/profile"
              onClick={() => setShowSilverUpgradeModal(false)}
              className="w-full bg-black hover:bg-gray-800 text-white text-sm font-bold py-3.5 px-6 rounded-2xl text-center block transition shadow-md"
            >
              Complete Profile to Silver (50%) & Activate
            </Link>
          </div>
        </div>
      )}

      {/* 2-FREE-CLICKS DAILY LIMIT MODAL (PRESERVED) */}
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
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-4 shadow-md">
              <Sparkles size={24} />
            </div>

            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
              Free Daily Limit Reached
            </h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              You have used your 2 free applications for today. Join <strong className="text-black">Trapped Into Architecture</strong> for free to get unlimited job applications, save openings, and claim your studio!
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm font-medium text-gray-800">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Unlimited direct email applications</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-800">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Bookmark and track dream openings</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowLimitModal(false);
                const registerBtn = document.querySelector('button[data-auth-tab="register"]') as HTMLButtonElement;
                if (registerBtn) {
                  registerBtn.click();
                } else {
                  window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { tab: "register" } }));
                }
              }}
              className="w-full bg-black text-white py-3.5 px-6 rounded-2xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
