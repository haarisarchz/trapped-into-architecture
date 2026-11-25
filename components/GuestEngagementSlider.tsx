"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

export default function GuestEngagementSlider() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const firstTimerRef = useRef<NodeJS.Timeout | null>(null);
  const secondTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to safely dispatch Google Analytics events
  const trackGaEvent = (eventName: string, params: Record<string, any>) => {
    try {
      if (typeof window !== "undefined") {
        if (typeof (window as any).gtag === "function") {
          (window as any).gtag("event", eventName, params);
        } else if ((window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: eventName,
            ...params,
          });
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    // 1. Never show on admin pages
    if (pathname && pathname.startsWith("/admin")) return;

    // 2. Never show if user is registered and logged in
    try {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) return;

      // 3. Track how many times it has been shown in this browsing session
      const rawCount = sessionStorage.getItem("ti2a_slider_session_shows");
      const shownCount = rawCount ? parseInt(rawCount, 10) : 0;

      // Max 2 shows per session
      if (shownCount >= 2) return;

      if (shownCount === 0) {
        // FIRST SHOW: Exactly 20 seconds after user arrives (or 40% scroll)
        firstTimerRef.current = setTimeout(() => {
          triggerShow(1, "slider_first_20s");
        }, 20000); // 20 seconds

        const handleScroll = () => {
          const scrollPosition = window.scrollY + window.innerHeight;
          const totalHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
          if (totalHeight > 0 && scrollPosition / totalHeight >= 0.45) {
            if (firstTimerRef.current) clearTimeout(firstTimerRef.current);
            triggerShow(1, "slider_first_scroll");
            window.removeEventListener("scroll", handleScroll);
          }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
          if (firstTimerRef.current) clearTimeout(firstTimerRef.current);
          window.removeEventListener("scroll", handleScroll);
        };
      } else if (shownCount === 1) {
        // SECOND SHOW: If user navigated or stayed longer, wait 60s for the 2nd (final) reminder
        secondTimerRef.current = setTimeout(() => {
          triggerShow(2, "slider_second_reminder");
        }, 60000); // 60 seconds of continued browsing

        return () => {
          if (secondTimerRef.current) clearTimeout(secondTimerRef.current);
        };
      }
    } catch (e) {}
  }, [pathname]);

  useEffect(() => {
    // Hide register popup immediately if user opens live chat
    const handleChatOpened = () => {
      setVisible(false);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ti2a_guest_slider_state", { detail: { visible: false } }));
      }
    };
    window.addEventListener("ti2a_chat_opened", handleChatOpened);
    return () => window.removeEventListener("ti2a_chat_opened", handleChatOpened);
  }, []);

  const triggerShow = (showNumber: number, source: string) => {
    try {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) return;

      sessionStorage.setItem("ti2a_slider_session_shows", String(showNumber));
      setVisible(true);

      // Notify other floating widgets (e.g. chat on mobile)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ti2a_guest_slider_state", { detail: { visible: true } }));
      }

      // Track in GA4
      trackGaEvent("guest_popup_view", {
        source,
        show_number: showNumber,
      });
    } catch (e) {}
  };

  const handleDismiss = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ti2a_guest_slider_state", { detail: { visible: false } }));
    }
    try {
      const rawCount = sessionStorage.getItem("ti2a_slider_session_shows");
      const shownCount = rawCount ? parseInt(rawCount, 10) : 1;

      // If this was the first show, start the timer for the 2nd show if they stay for long
      if (shownCount < 2) {
        if (secondTimerRef.current) clearTimeout(secondTimerRef.current);
        secondTimerRef.current = setTimeout(() => {
          triggerShow(2, "slider_second_reminder");
        }, 60000); // 60 seconds after closing the first one
      }
    } catch (e) {}
  };

  const handleRegisterClick = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ti2a_guest_slider_state", { detail: { visible: false } }));
    }
    try {
      // Mark as completed for this session
      sessionStorage.setItem("ti2a_slider_session_shows", "2");
    } catch (e) {}

    // Track conversion click
    trackGaEvent("guest_register_click", {
      source: "guest_slider_popup",
      category: "conversion",
    });
    trackGaEvent("register_intent_click", {
      source: "guest_slider",
      category: "conversion",
    });

    // Trigger registration modal in Navbar
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "register" }));
    }
  };

  if (!visible) return null;

  const isJobPage = pathname && pathname.startsWith("/jobs/");

  return (
    <div
      role="dialog"
      aria-label="Unlock more features on Trapped Into Architecture"
      className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:bottom-6 z-40 sm:w-[400px] max-w-[calc(100vw-1.5rem)] bg-[#14161d] border border-[#282c38] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-6 duration-300 text-left overflow-hidden text-slate-100"
    >
      {/* ARCHITECTURAL AMBER ACCENT RULER */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

      {/* CLOSE BUTTON */}
      <button
        onClick={handleDismiss}
        aria-label="Close prompt"
        className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 w-7 h-7 flex items-center justify-center rounded-lg bg-[#1f232d] border border-[#2d3340] text-gray-400 hover:text-white transition cursor-pointer"
      >
        <X size={14} />
      </button>

      {/* TOPMOST BADGE */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9.5px] sm:text-[10.5px] font-extrabold uppercase tracking-wider bg-amber-500/15 border border-amber-500/35 text-amber-300 mb-1.5 sm:mb-2">
        <Sparkles size={11} className="text-amber-400" />
        <span>Unlock More Features</span>
      </div>

      {/* HEADLINE */}
      <h4 className="text-[13.5px] sm:text-base font-extrabold text-white leading-tight mb-2.5 sm:mb-3 pr-6">
        {isJobPage ? (
          <>
            Save Opening &amp;{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              Apply in 1-Click
            </span>
          </>
        ) : (
          <>
            Join{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              10,000+ Architects
            </span>{" "}
            &amp; Students across India
          </>
        )}
      </h4>

      {/* 2-COLUMN STRUCTURED FEATURE CHIPS (COMPACT & MOBILE-OPTIMIZED) */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1c202a] border border-[#2a303e] px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10.5px] sm:text-xs font-semibold text-slate-200">
          <span className="text-[12px] sm:text-[13px] shrink-0">🏛️</span>
          <span className="truncate">Create / Claim Firms</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1c202a] border border-[#2a303e] px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10.5px] sm:text-xs font-semibold text-slate-200">
          <span className="text-[12px] sm:text-[13px] shrink-0">📢</span>
          <span className="truncate">Post Job Openings</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1c202a] border border-[#2a303e] px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10.5px] sm:text-xs font-semibold text-slate-200">
          <span className="text-[12px] sm:text-[13px] shrink-0">✨</span>
          <span className="truncate">Enrich Profile &amp; Bio</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1c202a] border border-[#2a303e] px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10.5px] sm:text-xs font-semibold text-slate-200">
          <span className="text-[12px] sm:text-[13px] shrink-0">🎯</span>
          <span className="truncate">Architecture Quizzes</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1c202a] border border-[#2a303e] px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10.5px] sm:text-xs font-semibold text-slate-200">
          <span className="text-[12px] sm:text-[13px] shrink-0">🔖</span>
          <span className="truncate">Bookmark Openings</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-500/10 border border-amber-500/30 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10.5px] sm:text-xs font-bold text-amber-300">
          <span className="text-[12px] sm:text-[13px] shrink-0">⚡</span>
          <span className="truncate">&amp; Much More</span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <button
          onClick={handleRegisterClick}
          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm py-2 sm:py-2.5 px-3.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <span>Register Free in 15s</span>
          <ArrowRight size={14} />
        </button>
        <button
          onClick={handleDismiss}
          className="text-xs text-slate-400 hover:text-white font-bold px-2 py-1.5 cursor-pointer transition shrink-0"
        >
          Later
        </button>
      </div>
    </div>
  );
}
