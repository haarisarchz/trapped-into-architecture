"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export function getPaginationPages(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If near the beginning
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  // If near the end
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  // In the middle
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export default function PaginationControls({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [20, 50, 100],
  itemLabel = "companies",
  className = "",
}: PaginationControlsProps) {
  if (totalItems === 0) return null;

  const pages = getPaginationPages(currentPage, totalPages);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={`bg-white p-4 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-700 select-none ${className}`}
    >
      {/* LEFT: ITEM RANGE & PER PAGE DROPDOWN */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-gray-500 font-medium">
          Showing <strong className="text-gray-900 font-bold">{startItem}</strong>–<strong className="text-gray-900 font-bold">{endItem}</strong> of{" "}
          <strong className="text-gray-900 font-bold">{totalItems}</strong> {itemLabel}
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <span className="text-gray-400 text-xs">Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
            >
              {pageSizeOptions.map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* RIGHT: GOOGLE-STYLE NUMBERED BUTTONS */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* PREVIOUS BUTTON */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white text-xs font-semibold text-gray-700 transition cursor-pointer disabled:cursor-not-allowed"
          title="Previous page"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* PAGE NUMBERS & ELLIPSIS */}
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400 font-bold text-xs">
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                isActive
                  ? "bg-black text-white shadow-xs"
                  : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* NEXT BUTTON */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white text-xs font-semibold text-gray-700 transition cursor-pointer disabled:cursor-not-allowed"
          title="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
