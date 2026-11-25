"use client";

import React from "react";
import { Trophy, Sparkles, CheckCircle2, ArrowRight, X, ShieldAlert } from "lucide-react";

interface GuestGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedScoresCount?: number;
}

export default function GuestGateModal({
  isOpen,
  onClose,
  savedScoresCount = 0
}: GuestGateModalProps) {
  if (!isOpen) return null;

  const handleOpenAuth = (tab: "register" | "login") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openAuth", { detail: tab }));
      window.dispatchEvent(new CustomEvent("open-auth", { detail: tab }));
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-gray-200 max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-center animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Hero Badge & Icon */}
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner text-amber-600">
          <Trophy size={32} className="text-amber-600" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 mb-3">
          <ShieldAlert size={13} className="text-amber-700" />
          <span>2 Free Guest Games Completed</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug">
          Register to Claim Your Scores &amp; Keep Playing
        </h3>

        <p className="text-xs sm:text-sm text-gray-600 mt-2.5 leading-relaxed">
          You&apos;ve enjoyed your 2 free guest chances!{" "}
          {savedScoresCount > 0 ? (
            <span className="font-bold text-gray-900">
              You have <span className="text-amber-600 font-black">{savedScoresCount} saved score{savedScoresCount > 1 ? "s" : ""}</span> from this device waiting to be claimed on the verified leaderboard.
            </span>
          ) : (
            <span>
              Create a free account to enter the official architect &amp; student leaderboard and unlock unlimited quiz play.
            </span>
          )}
        </p>

        {/* Benefits Checklist */}
        <div className="bg-gray-50 rounded-2xl p-4 my-5 text-left border border-gray-100 space-y-2.5 text-xs text-gray-700 font-medium">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span><strong className="text-gray-900 font-bold">Claim &amp; Save Scores:</strong> Automatically link your points to your permanent profile</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span><strong className="text-gray-900 font-bold">Official Leaderboard:</strong> Compete with architecture students &amp; professionals</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span><strong className="text-gray-900 font-bold">Unlimited Gameplay:</strong> Unlimited access to all 7+ curated architecture quizzes</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles size={15} className="text-amber-600 shrink-0" />
            <span><strong className="text-gray-900 font-bold">100% Free:</strong> Fast 30-second sign up — no card or fees required</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenAuth("register")}
            className="w-full py-3.5 px-5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <span>Register Free to Claim Scores</span>
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            onClick={() => handleOpenAuth("login")}
            className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition cursor-pointer border border-gray-200"
          >
            Already have an account? Log In
          </button>
        </div>

        <p className="text-[10px] text-gray-400 mt-3">
          Your scores are temporarily held in this browser until you sign up or log in.
        </p>
      </div>
    </div>
  );
}
