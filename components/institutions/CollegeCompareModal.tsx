"use client";

import React from "react";
import { X, ExternalLink, MapPin, Building2, Calendar, Award, CheckCircle2, ShieldAlert } from "lucide-react";

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutions: any[];
  onRemove: (id: string) => void;
}

export default function CollegeCompareModal({
  isOpen,
  onClose,
  institutions,
  onRemove,
}: CompareModalProps) {
  if (!isOpen || institutions.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Compare Architecture Institutions</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Side-by-side comparison of official COA records, location, and approved seats
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto flex-1 p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 w-44 rounded-l-lg">
                  Attribute
                </th>
                {institutions.map((inst) => (
                  <th key={inst.id} className="p-3 text-left bg-gray-50 min-w-[240px]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="inline-block px-2 py-0.5 text-[11px] font-mono font-bold bg-black text-white rounded mb-1">
                          {inst.coa_code || "CODE N/A"}
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{inst.institution_name}</h3>
                      </div>
                      <button
                        onClick={() => onRemove(inst.id)}
                        className="text-gray-400 hover:text-red-600 transition p-1"
                        title="Remove from comparison"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {/* Location */}
              <tr>
                <td className="p-3 font-semibold text-gray-500 bg-gray-50/50">Location</td>
                {institutions.map((inst) => (
                  <td key={inst.id} className="p-3 text-gray-800">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400 shrink-0" />
                      <span>
                        {[inst.locality, inst.city || inst.district, inst.state].filter(Boolean).join(", ") || "—"}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Affiliated University */}
              <tr>
                <td className="p-3 font-semibold text-gray-500 bg-gray-50/50">Affiliated University</td>
                {institutions.map((inst) => (
                  <td key={inst.id} className="p-3 text-gray-800">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={14} className="text-gray-400 shrink-0" />
                      <span>{inst.affiliated_university || "—"}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Established / Started */}
              <tr>
                <td className="p-3 font-semibold text-gray-500 bg-gray-50/50">Course Started / Estd</td>
                {institutions.map((inst) => (
                  <td key={inst.id} className="p-3 text-gray-800">
                    {inst.establishment_year ? `${inst.establishment_year}` : "—"}
                  </td>
                ))}
              </tr>

              {/* Latest Approved Intake */}
              <tr>
                <td className="p-3 font-semibold text-gray-500 bg-gray-50/50">Latest Approved Intake</td>
                {institutions.map((inst) => {
                  const latest = inst.latest_record;
                  return (
                    <td key={inst.id} className="p-3">
                      {latest ? (
                        <div>
                          <span className="text-lg font-extrabold text-gray-900">{latest.approved_intake}</span>
                          <span className="text-xs text-gray-500 ml-1">seats</span>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {latest.course_name || "B.Arch"} ({latest.academic_year})
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* NIRF Architecture Ranking */}
              <tr>
                <td className="p-3 font-semibold text-gray-500 bg-gray-50/50">NIRF Ranking</td>
                {institutions.map((inst) => {
                  const rank = inst.best_rank;
                  return (
                    <td key={inst.id} className="p-3">
                      {rank ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Award size={13} className="text-amber-600" />
                          #{rank.rank_number} ({rank.ranking_year})
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Status */}
              <tr>
                <td className="p-3 font-semibold text-gray-500 bg-gray-50/50">Status</td>
                {institutions.map((inst) => {
                  const latest = inst.latest_record;
                  const status = latest?.approval_status || (inst.is_active ? "Approved" : "Under Review");
                  const isApproved = status.toLowerCase().includes("approved");
                  return (
                    <td key={inst.id} className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isApproved ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {isApproved ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
                        {status}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Historical Intake Records */}
              <tr>
                <td className="p-3 font-semibold text-gray-500 bg-gray-50/50 align-top">Historical Intake</td>
                {institutions.map((inst) => {
                  const records = inst.annual_records || [];
                  return (
                    <td key={inst.id} className="p-3 align-top">
                      {records.length > 0 ? (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {records.map((r: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-gray-50">
                              <span className="text-gray-600 font-mono">{r.academic_year}</span>
                              <span className="font-bold text-gray-900">{r.approved_intake} seats</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No historical records available</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Official Website */}
              <tr>
                <td className="p-3 font-semibold text-gray-500 bg-gray-50/50">Official Website</td>
                {institutions.map((inst) => (
                  <td key={inst.id} className="p-3">
                    {inst.website ? (
                      <a
                        href={inst.website.startsWith("http") ? inst.website : `https://${inst.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Visit Website <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">Not available</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Disclaimer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 leading-relaxed">
          <strong>Notice:</strong> All approved intake and status figures shown are regulatory data compiled from official Council of Architecture (COA) documents. They do not constitute an evaluation of academic excellence, campus infrastructure, or placement performance.
        </div>
      </div>
    </div>
  );
}
