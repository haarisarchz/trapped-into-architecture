"use client";
import React, { useState, useEffect, useRef } from "react";

interface AutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (val: string, record?: any) => void;
  fetchSuggestions: (query: string) => Promise<any[]>;
  placeholder?: string;
  className?: string;
  renderItem?: (item: any) => React.ReactNode;
  extractValue?: (item: any) => string;
}

export default function Autocomplete({
  value,
  onChange,
  onSelect,
  fetchSuggestions,
  placeholder,
  className,
  renderItem,
  extractValue
}: AutocompleteProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || value.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await fetchSuggestions(value);
        setSuggestions(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, isOpen, fetchSuggestions]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (value.length >= 2) setIsOpen(true);
        }}
        placeholder={placeholder}
        className={className}
      />
      {isOpen && (suggestions.length > 0 || loading) && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {loading && suggestions.length === 0 && (
            <li className="px-4 py-3 text-gray-500 text-sm">Searching...</li>
          )}
          {suggestions.map((item, index) => {
            const displayValue = extractValue ? extractValue(item) : (typeof item === 'string' ? item : item.name || item.title || item.firm_name || "");
            return (
              <li
                key={index}
                className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-black border-b last:border-b-0 border-gray-100"
                onClick={() => {
                  onChange(displayValue);
                  setIsOpen(false);
                  if (onSelect) onSelect(displayValue, item);
                }}
              >
                {renderItem ? renderItem(item) : displayValue}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}