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

      // Max 2 shows per session ("Show in first 20s. If they stay for long, show it one more time. That's it.")
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

  const triggerShow = (showNumber: number, source: string) => {
    try {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) return;

      sessionStorage.setItem("ti2a_slider_session_shows", String(showNumber));
      setVisible(true);

      // Track in GA4
      trackGaEvent("guest_popup_view", {
        source,
        show_number: showNumber,
      });
    } catch (e) {}
  };

  const handleDismiss = () => {
    setVisible(false);
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
    try {
      // Mark as completed for this session
      sessionStorage.setItem("ti2a_slider_session_shows", "2");
    } catch (e) {}

    // Track conversion click
    trackGaEvent("guest_register_click", {
      source: "guest_slider_popup",
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
      aria-label="Register for free"
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
        {/* ICON BADGE */}
        <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center text-lg shrink-0 shadow-xs">
          <Sparkles size={18} />
        </div>

        <div className="flex-1 pr-4">
          <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200 mb-1">
            <Sparkles size={11} className="text-black" />
            <span>Free Member Features</span>
          </div>

          <h4 className="text-sm font-extrabold text-gray-900 leading-tight">
            {isJobPage ? "Save This Opening & Apply Directly" : "Save Openings, Claim Studios & Play Quizzes"}
          </h4>

          {isJobPage ? (
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Create a free account in 15 seconds to <strong>save openings</strong>, track applications, and connect directly with India&apos;s leading architecture firms.
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-xs text-gray-600 leading-snug">
              <li className="flex items-center gap-1.5">
                <span className="text-[12px]">🔖</span>
                <span><strong>Save Openings:</strong> Bookmark jobs &amp; internships</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[12px]">🏛️</span>
                <span><strong>Claim Studios:</strong> Manage practice profiles &amp; openings</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[12px]">🎯</span>
                <span><strong>Play Quizzes:</strong> Test knowledge &amp; join leaderboard</span>
              </li>
            </ul>
          )}

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
