"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, Sparkles, Briefcase, ArrowRight } from "lucide-react";
import {
  getPositionSuggestions,
  getClubbedPositionInfo,
  normalizePosition,
  PositionSuggestionItem,
} from "@/utils/positionNormalize";

interface SearchWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  jobs?: any[];
  onSelectSuggestion?: (suggestion: string) => void;
}

export default function SearchWithSuggestions({
  value,
  onChange,
  placeholder = "Search jobs by position, company, or city...",
  className = "",
  jobs = [],
  onSelectSuggestion,
}: SearchWithSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute suggestions based on typed query
  const { suggestions, clubInfo, clubJobCount } = useMemo(() => {
    const q = (value || "").trim();
    if (!q || q.length < 2) {
      return { suggestions: [], clubInfo: null, clubJobCount: 0 };
    }

    const suggList = getPositionSuggestions(q, 10);
    const club = getClubbedPositionInfo(q);

    let count = 0;
    if (club && jobs && jobs.length > 0) {
      count = jobs.filter((j: any) => {
        const norm = normalizePosition(j.position);
        return (
          norm.toLowerCase() === club.canonical.toLowerCase() ||
          club.synonyms.some((s) =>
            (j.position || "").toLowerCase().includes(s.toLowerCase())
          )
        );
      }).length;
    }

    return {
      suggestions: suggList,
      clubInfo: club,
      clubJobCount: count,
    };
  }, [value, jobs]);

  const handleSelect = (text: string) => {
    onChange(text);
    if (onSelectSuggestion) onSelectSuggestion(text);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center w-full">
        <Search
          size={18}
          className="absolute left-3.5 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (value && value.trim().length >= 2) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-9 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition shadow-2xs"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* AUTOCOMPLETE / CLUBBED POSITIONS DROPDOWN */}
      {isOpen && (clubInfo || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 text-left animate-in fade-in zoom-in-95 duration-100">
          
          {/* CLUBBED POSITION HEADER CARD */}
          {clubInfo && (
            <div
              onClick={() => handleSelect(clubInfo.canonical)}
              className="p-3.5 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white hover:bg-blue-100/60 transition cursor-pointer border-b border-blue-100"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    <Sparkles size={13} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">
                        {clubInfo.canonical}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded-full">
                        Clubbed Position
                      </span>
                      {clubJobCount > 0 && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                          {clubJobCount} {clubJobCount === 1 ? "job" : "jobs"} available
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-1">
                      {clubInfo.description}
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-blue-600 shrink-0 mt-1" />
              </div>

              {/* QUICK CHIPS OF CLUBBED SYNONYMS */}
              <div className="mt-2.5 flex flex-wrap gap-1.5 pt-2 border-t border-blue-100/70">
                <span className="text-[10px] font-semibold text-gray-500 self-center mr-1">
                  Clubbed titles:
                </span>
                {clubInfo.synonyms.slice(0, 5).map((syn, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(syn);
                    }}
                    className="text-[11px] font-medium bg-white hover:bg-blue-600 hover:text-white text-gray-700 px-2 py-0.5 rounded-md border border-gray-200 transition shadow-2xs"
                  >
                    {syn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LIST OF MATCHING / RELATED POSITIONS */}
          {suggestions.length > 0 && (
            <div className="py-1.5 max-h-60 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {clubInfo ? "Suggested Variations & Related Roles" : "Position Suggestions"}
              </div>
              {suggestions.map((item, idx) => {
                const isCanonical = item.type === "canonical";
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(item.title)}
                    className="w-full px-3.5 py-2 text-left hover:bg-gray-50 flex items-center justify-between text-xs transition group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Briefcase
                        size={14}
                        className={isCanonical ? "text-blue-600" : "text-gray-400 group-hover:text-black"}
                      />
                      <span className={`truncate ${isCanonical ? "font-bold text-gray-900" : "text-gray-700 font-medium group-hover:text-black"}`}>
                        {item.title}
                      </span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                      isCanonical ? "bg-blue-50 text-blue-700" : "text-gray-400 group-hover:text-gray-600"
                    }`}>
                      {item.badge || "Position"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* FOOTER TIP */}
          <div className="px-3 py-1.5 bg-gray-50 text-[10px] text-gray-400 flex items-center justify-between">
            <span>Press Enter to search • Click to select</span>
            <span>Trapped Into Architecture</span>
          </div>
        </div>
      )}
    </div>
  );
}
