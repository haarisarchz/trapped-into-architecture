"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Building2, ExternalLink, ArrowRight, Check, Plus, Award } from "lucide-react";

interface InstitutionCardProps {
  institution: any;
  isCompared?: boolean;
  onToggleCompare?: (inst: any) => void;
  canCompare?: boolean;
}

export default function InstitutionCard({
  institution,
  isCompared = false,
  onToggleCompare,
  canCompare = true,
}: InstitutionCardProps) {
  const latestRecord = institution.latest_record;
  const bestRank = institution.best_rank;

  const isClosed = institution.institution_type && /closed/i.test(institution.institution_type);
  const isProgressive = institution.institution_type && /progressive closure/i.test(institution.institution_type);
  const closureYearMatch = institution.institution_type ? institution.institution_type.match(/(\d{4}[-–_]\d{4}|\b20\d\d\b)/) : null;
  const shortClosureYr = closureYearMatch ? closureYearMatch[1].replace(/^20/, "").replace(/[-–_]20/, "-") : "";

  const locationString = [institution.locality, institution.city || institution.district, institution.state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {institution.coa_code ? (
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-black text-white rounded-md tracking-wider">
                {institution.coa_code}
              </span>
            ) : null}
            <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md">
              {institution.state}
            </span>
            {isClosed ? (
              <span className="text-xs font-bold px-2.5 py-1 bg-red-100 text-red-800 border border-red-200 rounded-md">
                Closed ({shortClosureYr || "COA"})
              </span>
            ) : isProgressive ? (
              <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-md">
                Prog. Closure (26-27)
              </span>
            ) : null}
            {bestRank && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
                <Award size={12} className="text-amber-600" />
                NIRF #{bestRank.rank_number}
              </span>
            )}
          </div>

          {/* Compare Button */}
          {onToggleCompare && (
            <button
              onClick={() => onToggleCompare(institution)}
              disabled={!isCompared && !canCompare}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition flex items-center gap-1 shrink-0 ${
                isCompared
                  ? "bg-black text-white border-black hover:bg-gray-800"
                  : canCompare
                  ? "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                  : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
              }`}
              title={isCompared ? "Remove from comparison" : canCompare ? "Add to compare" : "Maximum 3 institutions selected"}
            >
              {isCompared ? (
                <>
                  <Check size={13} />
                  <span>Compared</span>
                </>
              ) : (
                <>
                  <Plus size={13} />
                  <span>Compare</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Institution Name */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-black transition leading-snug line-clamp-2 mb-2">
          <Link href={`/institutions/${institution.slug}`}>
            {institution.institution_name}
          </Link>
        </h3>

        {/* Location & Affiliation */}
        <div className="space-y-1.5 text-xs text-gray-600 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-gray-400 shrink-0" />
            <span className="truncate">{locationString || "Location details pending"}</span>
          </div>
          {institution.affiliated_university && (
            <div className="flex items-center gap-1.5">
              <Building2 size={14} className="text-gray-400 shrink-0" />
              <span className="truncate">{institution.affiliated_university}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Bottom: Approved Intake & Action */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4 mt-2">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">
            {isClosed
              ? "Admissions Status"
              : isProgressive
              ? "Admissions Status"
              : latestRecord
              ? `Approved Intake (${latestRecord.academic_year})`
              : "Approved Intake"}
          </div>
          <div className="text-sm font-extrabold mt-0.5">
            {isClosed ? (
              <span className="text-xs font-bold text-red-600">
                Discontinued (Closed w.e.f. {shortClosureYr || "Gazette"})
              </span>
            ) : isProgressive ? (
              <span className="text-xs font-bold text-amber-700">
                0 Fresh Seats (Progressive Closure)
              </span>
            ) : latestRecord ? (
              <span className="text-gray-900">
                {latestRecord.approved_intake} <span className="text-xs font-normal text-gray-500">seats ({latestRecord.course_name || "B.Arch"})</span>
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-400">Record pending</span>
            )}
          </div>
        </div>

        <Link
          href={`/institutions/${institution.slug}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 hover:text-blue-600 transition group-hover:translate-x-0.5 py-1.5 px-3 rounded-lg hover:bg-gray-50"
        >
          View Profile <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
