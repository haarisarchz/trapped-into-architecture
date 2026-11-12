"use client";

import React from "react";
import Link from "next/link";
import { X, ArrowRight, Layers, Sparkles, Plus } from "lucide-react";
import { useInstitutionCompare, ComparedCollege } from "@/lib/hooks/useInstitutionCompare";

interface FloatingCompareBarProps {
  onAddMoreClick?: () => void;
}

export default function FloatingCompareBar({ onAddMoreClick }: FloatingCompareBarProps) {
  const { comparedColleges, removeCollege, clearAll, maxLimit } = useInstitutionCompare();

  if (comparedColleges.length === 0) return null;

  const count = comparedColleges.length;

  const handleOpenRegister = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "register" }));
    }
  };

  return (
    <aside
      aria-label="College Comparison Floating Bar"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95vw] max-w-4xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="bg-[#121212] text-white rounded-2xl shadow-2xl border border-gray-800 p-3 sm:p-4 backdrop-blur-md">
        {/* Top subtle nudge for saving shortlist */}
        <div className="hidden sm:flex items-center justify-between text-[11px] text-gray-400 border-b border-gray-800/80 pb-2 mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-400" />
            <span>
              Want to keep your college shortlist for later?{" "}
              <button
                onClick={handleOpenRegister}
                type="button"
                className="text-white font-bold underline hover:text-amber-300 cursor-pointer transition"
              >
                Create a free account
              </button>
            </span>
          </div>
          <span className="text-gray-500 font-mono text-[10px]">
            {count} / {maxLimit} selected
          </span>
        </div>

        {/* Main Bar Content */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Left: College Chips */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-400 shrink-0 mr-1 hidden sm:flex">
              <Layers size={14} className="text-amber-400" />
              <span>Compare:</span>
            </div>

            {comparedColleges.map((college: ComparedCollege) => (
              <div
                key={college.id}
                className="flex items-center gap-1.5 bg-gray-900 border border-gray-700/80 text-white px-2.5 py-1.5 rounded-xl text-xs shrink-0 max-w-[200px] shadow-sm group hover:border-gray-500 transition"
              >
                {college.coa_code && (
                  <span className="font-mono text-[10px] font-bold bg-white text-black px-1.5 py-0.2 rounded shrink-0">
                    {college.coa_code}
                  </span>
                )}
                <span className="truncate text-xs font-semibold" title={college.name}>
                  {college.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeCollege(college.id)}
                  className="text-gray-400 hover:text-red-400 p-0.5 rounded transition shrink-0 ml-0.5"
                  title={`Remove ${college.name}`}
                  aria-label={`Remove ${college.name}`}
                >
                  <X size={13} />
                </button>
              </div>
            ))}

            {count < maxLimit && onAddMoreClick && (
              <button
                type="button"
                onClick={onAddMoreClick}
                className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-white bg-gray-900/60 border border-dashed border-gray-700 hover:border-gray-500 px-2.5 py-1.5 rounded-xl transition shrink-0"
              >
                <Plus size={12} />
                <span>Add More ({maxLimit - count} slots left)</span>
              </button>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-2 shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-gray-800">
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-gray-400 hover:text-white px-2.5 py-2 transition"
            >
              Clear
            </button>

            <Link
              href="/compare-institutions"
              className="bg-white text-black hover:bg-gray-100 font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md shrink-0 active:scale-95"
            >
              <span>Compare ({count})</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
