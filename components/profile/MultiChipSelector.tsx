"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Check, ChevronDown, Plus, Search } from "lucide-react";

export interface ChipOption {
  value: string;
  label: string;
  desc?: string;
}

interface MultiChipSelectorProps {
  selected: string[];
  onChange: (items: string[]) => void;
  maxItems: number;
  options: ChipOption[];
  placeholder?: string;
  allowCustom?: boolean;
  fieldLabel: string;
}

export default function MultiChipSelector({
  selected,
  onChange,
  maxItems,
  options,
  placeholder = "Type to search or select...",
  allowCustom = false,
  fieldLabel,
}: MultiChipSelectorProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
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

  const handleRemove = (itemToRemove: string) => {
    onChange(selected.filter((item) => item !== itemToRemove));
  };

  const handleSelect = (itemToAdd: string) => {
    const trimmed = itemToAdd.trim();
    if (!trimmed) return;
    if (selected.includes(trimmed)) return;
    if (selected.length >= maxItems) return;

    onChange([...selected, trimmed]);
    setQuery("");
    if (selected.length + 1 >= maxItems) {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (allowCustom && query.trim()) {
        handleSelect(query.trim());
      } else if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0].value);
      }
    } else if (e.key === "Backspace" && !query && selected.length > 0) {
      handleRemove(selected[selected.length - 1]);
    }
  };

  // Find human label for a value
  const getDisplayLabel = (val: string) => {
    const found = options.find(
      (o) => o.value.toLowerCase() === val.toLowerCase()
    );
    return found ? found.label : val;
  };

  // Filter options based on query and remove already selected
  const filteredOptions = options.filter((opt) => {
    const alreadySelected = selected.some(
      (s) => s.toLowerCase() === opt.value.toLowerCase()
    );
    if (alreadySelected) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      opt.label.toLowerCase().includes(q) ||
      opt.value.toLowerCase().includes(q) ||
      (opt.desc && opt.desc.toLowerCase().includes(q))
    );
  });

  const isMaxReached = selected.length >= maxItems;

  // Custom addition check
  const showCustomOption =
    allowCustom &&
    query.trim().length > 0 &&
    !options.some(
      (o) => o.value.toLowerCase() === query.trim().toLowerCase()
    ) &&
    !selected.some(
      (s) => s.toLowerCase() === query.trim().toLowerCase()
    );

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* BOX CONTAINER WITH CHIPS & INPUT */}
      <div
        onClick={() => {
          if (!isMaxReached) setIsOpen(true);
        }}
        className={`w-full min-h-[50px] p-2 bg-white border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-black focus-within:border-black transition flex flex-wrap items-center gap-2 cursor-text ${
          isMaxReached ? "bg-gray-50/70" : ""
        }`}
      >
        {/* SELECTED CHIPS WITH 'X' BUTTON */}
        {selected.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-semibold shadow-xs animate-in zoom-in-95 duration-150"
          >
            <span>{getDisplayLabel(item)}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(item);
              }}
              className="text-gray-400 hover:text-white hover:bg-white/20 p-0.5 rounded-md transition cursor-pointer"
              title={`Remove ${getDisplayLabel(item)}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}

        {/* INPUT OR LIMIT REACHED BADGE */}
        {!isMaxReached ? (
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              selected.length === 0
                ? placeholder
                : `+ Add another (up to ${maxItems})`
            }
            className="flex-1 min-w-[140px] bg-transparent text-sm text-gray-900 focus:outline-none py-1 px-1"
          />
        ) : (
          <span className="text-xs text-gray-400 font-semibold italic py-1 px-1">
            Maximum {maxItems} selected (click &times; to replace)
          </span>
        )}

        {/* CHEVRON TOGGLE */}
        {!isMaxReached && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="ml-auto text-gray-400 hover:text-black p-1 transition cursor-pointer"
          >
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      {/* COUNTER HINT */}
      <div className="flex items-center justify-between mt-1 px-1 text-[11px] text-gray-500 font-medium">
        <span>
          {isMaxReached ? (
            <span className="text-emerald-700 font-bold">
              ✓ Limit reached ({selected.length}/{maxItems})
            </span>
          ) : (
            `Select up to ${maxItems} ${fieldLabel} (${selected.length}/${maxItems} selected)`
          )}
        </span>
        {allowCustom && !isMaxReached && (
          <span className="text-gray-400 italic">Type & press Enter to add custom</span>
        )}
      </div>

      {/* SCROLLABLE DROPDOWN WITH SCROLLBAR */}
      {isOpen && !isMaxReached && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-100 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Custom Typed Option */}
          {showCustomOption && (
            <button
              type="button"
              onClick={() => handleSelect(query.trim())}
              className="w-full text-left px-4 py-3 bg-blue-50/80 hover:bg-blue-100/90 text-blue-900 transition flex items-center justify-between gap-2 border-b border-blue-200 font-semibold text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <Plus size={14} className="shrink-0 text-blue-700" />
                <span>
                  Add custom: <span className="font-bold underline">{query.trim()}</span>
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                Custom Title
              </span>
            </button>
          )}

          {/* Filtered Standard Suggestions */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-100/80 transition flex items-center justify-between gap-3 text-xs cursor-pointer group"
              >
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 group-hover:text-black">
                    {opt.label}
                  </p>
                  {opt.desc && (
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {opt.desc}
                    </p>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-gray-400 group-hover:text-black shrink-0">
                  Select &rarr;
                </span>
              </button>
            ))
          ) : (
            !showCustomOption && (
              <div className="p-4 text-center text-xs text-gray-500">
                No matching options found for &quot;{query}&quot;
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
