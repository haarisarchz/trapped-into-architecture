"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, CircleAlert, Sparkles } from "lucide-react";
import { ProfileCompletionResult, getBadgeDetails } from "@/utils/profileCompletion";

interface CompletionMeterProps {
  completion: ProfileCompletionResult;
  onNavigateToTab?: (tab: string) => void;
}

export default function CompletionMeter({
  completion,
  onNavigateToTab,
}: CompletionMeterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { percentage, badgeTier, missingFields, isVip } = completion;
  const badge = getBadgeDetails(badgeTier, isVip);

  // Next tier helper
  let nextTierMessage = "";
  if (percentage < 50) {
    nextTierMessage = `Complete ${50 - percentage}% more to unlock Silver Member 🥈`;
  } else if (percentage < 70) {
    nextTierMessage = `Complete ${70 - percentage}% more to unlock Gold Member 🥇`;
  } else if (percentage < 85) {
    nextTierMessage = `Complete ${85 - percentage}% more to unlock Platinum Member 💎`;
  } else if (percentage < 95) {
    nextTierMessage = `Complete ${95 - percentage}% more to unlock Diamond Member 👑`;
  } else {
    nextTierMessage = "🎉 Outstanding! Your profile is at maximum completeness.";
  }

  // Bar color based on percentage
  let progressColor = "bg-amber-500";
  if (percentage >= 85) progressColor = "bg-purple-600";
  else if (percentage >= 70) progressColor = "bg-emerald-500";
  else if (percentage >= 50) progressColor = "bg-blue-500";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900">
              Profile Completeness
            </h2>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.color} ${badge.border}`}
            >
              {badge.icon} {badge.title}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{nextTierMessage}</p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-2xl font-black text-gray-900">
            {percentage}%
          </span>
          {missingFields.length > 0 && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 border border-gray-200 px-2.5 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
            >
              {isOpen ? "Hide Checklist" : "Improve Profile"}
              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${progressColor} transition-all duration-700 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Expandable Missing Items Checklist */}
      {isOpen && missingFields.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
            Recommended Additions:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {missingFields.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <CircleAlert size={14} className="text-amber-500 shrink-0" />
                  <span>{item.label}</span>
                </div>
                <span className="text-xs font-bold text-gray-500 shrink-0">
                  +{item.points}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
