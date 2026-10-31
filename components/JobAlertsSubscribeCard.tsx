"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Sparkles, Bell } from "lucide-react";

export default function JobAlertsSubscribeCard() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubmitted(true);
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-white border border-amber-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2 text-amber-700 font-semibold text-xs uppercase tracking-wider">
        <Bell size={14} className="text-amber-600 animate-pulse" />
        <span>Instant Notifications</span>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">Subscribe for Job Alerts</h3>
      <p className="text-xs text-gray-600 mb-4 leading-relaxed">
        Get curated architecture openings, studio calls, and internship vacancies delivered directly to your inbox every morning.
      </p>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-emerald-800">You're on the list!</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              We'll send you daily 9:00 AM digests of architectural opportunities matching your profile.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "all", label: "All Roles" },
              { id: "architect", label: "Architects" },
              { id: "intern", label: "Internships" },
              { id: "interior", label: "Interiors" },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition ${
                  selectedRole === r.id
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              required
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition text-gray-800"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-black text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Get Daily Alerts at 9 AM</span>
          </button>
        </form>
      )}
    </div>
  );
}
