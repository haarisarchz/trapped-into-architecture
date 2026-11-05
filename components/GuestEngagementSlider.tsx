"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Bookmark, ArrowRight } from "lucide-react";

export default function GuestEngagementSlider() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 1. Never show if user is already registered and logged in
    try {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) return;

      // 2. Do not show if dismissed in current browsing session
      const dismissed = sessionStorage.getItem("ti2a_slider_dismissed");
      if (dismissed === "true") return;

      // 3. Determine if first-time or returning visitor
      const rawVisits = localStorage.getItem("ti2a_guest_visits");
      const visitCount = rawVisits ? parseInt(rawVisits, 10) : 0;
      localStorage.setItem("ti2a_guest_visits", String(visitCount + 1));

      // First-time guest: 45s delay; Returning guest: 20s delay
      const delayMs = visitCount === 0 ? 45000 : 20000;

      let timerFired = false;
      const timer = setTimeout(() => {
        timerFired = true;
        setVisible(true);
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "guest_popup_view", { source: "slider_timer" });
        }
      }, delayMs);

      // 4. Scroll depth trigger (scrolled 50% down page)
      const handleScroll = () => {
        if (timerFired) return;
        const scrollPosition = window.scrollY + window.innerHeight;
        const totalHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        if (totalHeight > 0 && scrollPosition / totalHeight >= 0.5) {
          clearTimeout(timer);
          setVisible(true);
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "guest_popup_view", { source: "slider_scroll" });
          }
          window.removeEventListener("scroll", handleScroll);
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        clearTimeout(timer);
        window.removeEventListener("scroll", handleScroll);
      };
    } catch (e) {
      // LocalStorage access fallback
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem("ti2a_slider_dismissed", "true");
    } catch (e) {}
  };

  const handleRegisterClick = () => {
    handleDismiss();
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "guest_register_click", {
        source: "guest_slider_popup",
        category: "conversion",
      });
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "register" }));
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Register to save job"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 max-w-sm w-[calc(100%-2rem)] sm:w-full bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-gray-200 transition-all animate-in fade-in slide-in-from-bottom-6 duration-300 text-left"
    >
      {/* CLOSE BUTTON */}
      <button
        onClick={handleDismiss}
        aria-label="Close prompt"
        className="absolute top-3.5 right-3.5 text-gray-400 hover:text-black p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3.5">
        {/* MEDAL BADGE */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-100 to-amber-200 text-amber-900 flex items-center justify-center text-xl shrink-0 border border-amber-300 shadow-xs">
          🥉
        </div>

        <div className="flex-1 pr-4">
          <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mb-1">
            <Sparkles size={11} className="text-amber-700" />
            <span>Bronze Member Perk</span>
          </div>

          <h4 className="text-sm font-extrabold text-gray-900 leading-tight">
            Bookmark this opening?
          </h4>

          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Create your free architectural dossier to save jobs, get your <strong>Bronze Medal (+20% Score)</strong>, and receive direct recruiter alerts.
          </p>

          <div className="flex items-center gap-2 mt-3.5">
            <button
              onClick={handleRegisterClick}
              className="bg-black hover:bg-neutral-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Register Free (15s)</span>
              <ArrowRight size={13} />
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs text-gray-500 hover:text-gray-900 font-bold px-2 py-1.5 cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
