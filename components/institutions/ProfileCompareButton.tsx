"use client";

import React from "react";
import { Check, Plus } from "lucide-react";
import { useInstitutionCompare } from "@/lib/hooks/useInstitutionCompare";

interface ProfileCompareButtonProps {
  institution: any;
}

export default function ProfileCompareButton({ institution }: ProfileCompareButtonProps) {
  const { toggleCollege, isSelected, isFull } = useInstitutionCompare();

  if (!institution?.id) return null;

  const selected = isSelected(institution.id);

  return (
    <button
      type="button"
      onClick={() => toggleCollege(institution)}
      disabled={!selected && isFull}
      className={`w-full mt-3 py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs ${
        selected
          ? "bg-black text-white hover:bg-gray-800"
          : !isFull
          ? "bg-white text-gray-900 border border-gray-300 hover:border-black hover:bg-gray-50"
          : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
      }`}
      title={selected ? "Remove from comparison" : isFull ? "Maximum 4 institutions selected" : "Add to comparison"}
    >
      {selected ? (
        <>
          <Check size={14} className="text-emerald-400" />
          <span>Added to Compare (Click to remove)</span>
        </>
      ) : (
        <>
          <Plus size={14} />
          <span>{isFull ? "Comparison List Full (Max 4)" : "Add to Compare"}</span>
        </>
      )}
    </button>
  );
}
