"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function FortnightlyBriefingBanner() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.from("contact_inquiries").insert([
        {
          name: "Guest Subscriber",
          email: cleanEmail,
          subject: "SUBSCRIBE_FORTNIGHTLY_BRIEFING",
          message: `Subscriber requested Ti2A Fortnightly Briefing delivered on 1st & 15th (${cleanEmail}).`,
          is_read: false,
        },
      ]);

      if (error) {
        console.warn("Could not save briefing subscriber:", error.message);
      }

      setSubscribed(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-10">
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl border border-neutral-800">
        {/* Architectural subtle ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl space-y-3.5 relative z-10 text-left">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <span>📬 Delivered Every 1st &amp; 15th</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Ti2A Fortnightly Briefing
          </h3>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
            Receive the top 5 architecture openings, premier hiring studios, and architectural career drops directly in your inbox twice a month. Completely free, zero spam.
          </p>

          {subscribed ? (
            <div className="inline-flex items-center gap-2.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl text-xs font-bold mt-2">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span>You&apos;re all set! You will receive the next briefing on the 1st and 15th.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="pt-2">
              <div className="flex flex-col sm:flex-row gap-2.5 max-w-lg">
                <div className="relative flex-1">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your architect email..."
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-neutral-400 text-xs pl-10 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-white hover:bg-neutral-100 text-black font-extrabold text-xs px-6 py-3.5 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  <span>{submitting ? "Subscribing..." : "Subscribe Free"}</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {errorMsg && (
                <p className="text-red-400 text-xs mt-2 font-medium">{errorMsg}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
