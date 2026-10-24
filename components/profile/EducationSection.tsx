"use client";

import React, { useState } from "react";
import { GraduationCap, Plus, Pencil, Trash2, Calendar, MapPin, School } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { EducationEntry } from "@/utils/profileCompletion";
import { SCHOOL_BOARDS, POPULAR_UNIVERSITIES } from "@/utils/institutionsData";

interface EducationSectionProps {
  userId: string;
  isOwner: boolean;
  educations: EducationEntry[];
  onEducationsChange: (newEducations: EducationEntry[]) => void;
}

const LEVEL_LABELS: Record<string, string> = {
  phd: "PhD / Doctorate",
  pg: "Postgraduate (Masters / M.Arch)",
  ug: "Undergraduate (Bachelors / B.Arch)",
  diploma: "Diploma in Architecture / Design",
  high_school: "High School / Secondary",
};

export default function EducationSection({
  userId,
  isOwner,
  educations,
  onEducationsChange,
}: EducationSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [level, setLevel] = useState<EducationEntry["level"]>("ug");
  const [degreeName, setDegreeName] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [schoolBoard, setSchoolBoard] = useState(SCHOOL_BOARDS[0]);
  const [schoolName, setSchoolName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("India");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [score, setScore] = useState("");

  const resetForm = () => {
    setLevel("ug");
    setDegreeName("");
    setUniversityName("");
    setCollegeName("");
    setSchoolBoard(SCHOOL_BOARDS[0]);
    setSchoolName("");
    setCity("");
    setCountry("India");
    setStartDate("");
    setEndDate("");
    setIsCurrent(false);
    setScore("");
    setEditingId(null);
  };

  const openAddModal = (defaultLevel?: EducationEntry["level"]) => {
    resetForm();
    if (defaultLevel) setLevel(defaultLevel);
    setModalOpen(true);
  };

  const openEditModal = (entry: EducationEntry) => {
    setEditingId(entry.id || null);
    setLevel(entry.level);
    setDegreeName(entry.degree_name || "");
    setUniversityName(entry.university_name || "");
    setCollegeName(entry.college_name || "");
    setSchoolBoard(entry.school_board || SCHOOL_BOARDS[0]);
    setSchoolName(entry.school_name || "");
    setCity(entry.city || "");
    setCountry(entry.country || "India");
    setStartDate(entry.start_date || "");
    setEndDate(entry.end_date || "");
    setIsCurrent(Boolean(entry.is_current));
    setScore(entry.score_or_percentage || "");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: any = {
        user_id: userId,
        level,
        degree_name: degreeName.trim() || (level === "high_school" ? "12th / High School" : ""),
        university_name: level === "high_school" ? null : universityName.trim() || null,
        college_name: level === "high_school" ? null : collegeName.trim() || null,
        school_board: level === "high_school" ? schoolBoard : null,
        school_name: level === "high_school" ? schoolName.trim() || null : null,
        city: city.trim() || null,
        country: country.trim() || "India",
        start_date: startDate || null,
        end_date: isCurrent ? null : endDate || null,
        is_current: isCurrent,
        score_or_percentage: score.trim() || null,
      };

      if (editingId) {
        // Update
        const { error } = await supabase
          .from("profile_educations")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;

        const updated = educations.map((item) =>
          item.id === editingId ? { ...item, ...payload } : item
        );
        onEducationsChange(updated);
      } else {
        // Insert
        const { data, error } = await supabase
          .from("profile_educations")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;

        onEducationsChange([...educations, data || { ...payload, id: `temp-${Date.now()}` }]);
      }

      setModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Error saving education:", err);
      alert(err.message || "Failed to save education entry.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to remove this education entry?")) return;

    try {
      const { error } = await supabase
        .from("profile_educations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      onEducationsChange(educations.filter((e) => e.id !== id));
    } catch (err: any) {
      console.error("Error deleting education:", err);
      alert("Failed to delete entry.");
    }
  };

  // Group or sort by degree level
  const levelOrder = ["phd", "pg", "ug", "diploma", "high_school"];
  const sortedEducations = [...educations].sort((a, b) => {
    return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
  });

  return (
    <div className="border rounded-3xl p-6 md:p-8 bg-gray-50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Education Details</h2>
          <p className="text-sm text-gray-500 mt-1">
            Academic qualifications, universities, colleges, and schooling
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-semibold transition text-sm shadow-sm"
          >
            <Plus size={16} />
            <span>Add Education</span>
          </button>
        )}
      </div>

      {sortedEducations.length === 0 ? (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-10 text-center">
          <GraduationCap size={40} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No Education Details Added</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Adding your architecture degree, college, and university builds credibility and boosts your profile badge rank.
          </p>
          {isOwner && (
            <button
              onClick={() => openAddModal("ug")}
              className="mt-5 bg-black hover:bg-gray-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
            >
              Add Undergraduate (B.Arch / Design)
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEducations.map((entry) => {
            const isHighSchool = entry.level === "high_school";

            return (
              <div
                key={entry.id || Math.random()}
                className="bg-white rounded-2xl p-5 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-black">
                    {isHighSchool ? <School size={22} /> : <GraduationCap size={22} />}
                  </div>

                  <div>
                    {/* Degree & Level Tag */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {isHighSchool
                          ? entry.school_name || "High School"
                          : entry.degree_name || LEVEL_LABELS[entry.level]}
                      </h3>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {LEVEL_LABELS[entry.level] || entry.level}
                      </span>
                    </div>

                    {/* Separate University & College display */}
                    {!isHighSchool ? (
                      <div className="mt-1.5 space-y-0.5 text-sm">
                        {entry.college_name && (
                          <p className="font-semibold text-gray-800">
                            🏛️ College: <span className="font-normal">{entry.college_name}</span>
                          </p>
                        )}
                        {entry.university_name && (
                          <p className="font-semibold text-gray-600">
                            🎓 University: <span className="font-normal">{entry.university_name}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1.5 space-y-0.5 text-sm">
                        {entry.school_board && (
                          <p className="font-semibold text-gray-700">
                            📋 Board: <span className="font-normal">{entry.school_board}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Metadata Row: Location, Timeline, Score */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500 font-medium">
                      {(entry.city || entry.country) && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-gray-400" />
                          {[entry.city, entry.country].filter(Boolean).join(", ")}
                        </span>
                      )}

                      {(entry.start_date || entry.end_date || entry.is_current) && (
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-gray-400" />
                          {entry.start_date ? new Date(entry.start_date).getFullYear() : "Started"} –{" "}
                          {entry.is_current ? (
                            <span className="text-emerald-600 font-semibold">Currently Studying</span>
                          ) : entry.end_date ? (
                            new Date(entry.end_date).getFullYear()
                          ) : (
                            "Graduated"
                          )}
                        </span>
                      )}

                      {entry.score_or_percentage && (
                        <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold border border-amber-200">
                          Score / Percentage: {entry.score_or_percentage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Owner Actions */}
                {isOwner && (
                  <div className="flex items-center gap-2 self-end md:self-start">
                    <button
                      onClick={() => openEditModal(entry)}
                      className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition"
                      title="Edit Entry"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Entry"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD / EDIT EDUCATION */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-gray-100 my-8">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {editingId ? "Edit Education" : "Add Education Entry"}
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Enter your academic qualifications with separate university and college details.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Level Selector */}
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                  Education Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as EducationEntry["level"])}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                >
                  <option value="ug">Undergraduate (UG / B.Arch / B.Des / B.Plan)</option>
                  <option value="pg">Postgraduate (PG / M.Arch / M.Des / M.Plan)</option>
                  <option value="phd">PhD / Doctorate / Research</option>
                  <option value="diploma">Diploma in Architecture / Interior</option>
                  <option value="high_school">High School (12th / Secondary)</option>
                </select>
              </div>

              {level === "high_school" ? (
                <>
                  {/* High School Board */}
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                      School Board <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={schoolBoard}
                      onChange={(e) => setSchoolBoard(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                    >
                      {SCHOOL_BOARDS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* High School Name */}
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                      School Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. Delhi Public School, R.K. Puram"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Degree Name */}
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                      Degree Title / Field <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={degreeName}
                      onChange={(e) => setDegreeName(e.target.value)}
                      placeholder={level === "ug" ? "e.g. Bachelor of Architecture (B.Arch)" : "e.g. M.Arch Urban Design"}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                    />
                  </div>

                  {/* College Name (Separate) */}
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                      College / Institution Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="e.g. School of Architecture and Planning / Sir JJ College"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                    />
                  </div>

                  {/* University Name (Separate) with popular suggestions */}
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                      Affiliated University Name
                    </label>
                    <input
                      type="text"
                      list="university-list"
                      value={universityName}
                      onChange={(e) => setUniversityName(e.target.value)}
                      placeholder="e.g. Anna University / VTU / University of Mumbai"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                    />
                    <datalist id="university-list">
                      {POPULAR_UNIVERSITIES.map((u) => (
                        <option key={u} value={u} />
                      ))}
                    </datalist>
                  </div>
                </>
              )}

              {/* Location: City & Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai / New Delhi"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Timeline: Start Date & End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                    End Date / Graduation
                  </label>
                  <input
                    type="date"
                    disabled={isCurrent}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Currently Studying checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="w-4 h-4 text-black rounded"
                />
                <span className="text-sm font-medium text-gray-700">Currently studying here</span>
              </label>

              {/* Percentage / CGPA */}
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                  Percentage / CGPA / Grade (Optional)
                </label>
                <input
                  type="text"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g. 82.5% or 8.4 CGPA or First Class with Distinction"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-black transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  {submitting ? "Saving..." : editingId ? "Update Entry" : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
