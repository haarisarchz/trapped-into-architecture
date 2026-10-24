"use client";

import React, { useState } from "react";
import { Briefcase, Plus, Pencil, Trash2, Calendar, MapPin, Building2, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ExperienceEntry, calculateTotalExperience } from "@/utils/profileCompletion";
import { ORGANIZATION_TYPES } from "@/utils/institutionsData";

interface ExperienceSectionProps {
  userId: string;
  isOwner: boolean;
  experiences: ExperienceEntry[];
  onExperiencesChange: (newExp: ExperienceEntry[]) => void;
}

export default function ExperienceSection({
  userId,
  isOwner,
  experiences,
  onExperiencesChange,
}: ExperienceSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [firmName, setFirmName] = useState("");
  const [organizationType, setOrganizationType] = useState(ORGANIZATION_TYPES[0]);
  const [position, setPosition] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("India");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);

  const totalExp = calculateTotalExperience(experiences);

  const resetForm = () => {
    setFirmName("");
    setOrganizationType(ORGANIZATION_TYPES[0]);
    setPosition("");
    setRoleDescription("");
    setCity("");
    setCountry("India");
    setStartDate("");
    setEndDate("");
    setIsCurrent(false);
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (entry: ExperienceEntry) => {
    setEditingId(entry.id || null);
    setFirmName(entry.firm_name || "");
    setOrganizationType(entry.organization_type || ORGANIZATION_TYPES[0]);
    setPosition(entry.position || "");
    setRoleDescription(entry.role_description || "");
    setCity(entry.city || "");
    setCountry(entry.country || "India");
    setStartDate(entry.start_date || "");
    setEndDate(entry.end_date || "");
    setIsCurrent(Boolean(entry.is_current));
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: any = {
        user_id: userId,
        firm_name: firmName.trim(),
        organization_type: organizationType,
        position: position.trim(),
        role_description: roleDescription.trim() || null,
        city: city.trim() || null,
        country: country.trim() || "India",
        start_date: startDate,
        end_date: isCurrent ? null : endDate || null,
        is_current: isCurrent,
      };

      if (editingId) {
        // Update
        const { error } = await supabase
          .from("profile_experiences")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;

        const updated = experiences.map((item) =>
          item.id === editingId ? { ...item, ...payload } : item
        );
        onExperiencesChange(updated);
      } else {
        // Insert
        const { data, error } = await supabase
          .from("profile_experiences")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;

        onExperiencesChange([...experiences, data || { ...payload, id: `temp-${Date.now()}` }]);
      }

      setModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Error saving experience:", err);
      alert(err.message || "Failed to save work experience.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this experience entry?")) return;

    try {
      const { error } = await supabase
        .from("profile_experiences")
        .delete()
        .eq("id", id);

      if (error) throw error;

      onExperiencesChange(experiences.filter((e) => e.id !== id));
    } catch (err: any) {
      console.error("Error deleting experience:", err);
      alert("Failed to delete experience.");
    }
  };

  // Sort experiences reverse chronologically
  const sortedExperiences = [...experiences].sort((a, b) => {
    const timeA = a.is_current ? Infinity : new Date(a.end_date || a.start_date).getTime();
    const timeB = b.is_current ? Infinity : new Date(b.end_date || b.start_date).getTime();
    return timeB - timeA;
  });

  return (
    <div className="border rounded-3xl p-6 md:p-8 bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
          <p className="text-sm text-gray-500 mt-1">
            Firms, academic institutions, design roles, and project leadership
          </p>
        </div>

        {isOwner && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-semibold transition text-sm shadow-sm self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add Experience</span>
          </button>
        )}
      </div>

      {/* Auto-computed Total Experience Bar */}
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
              Cumulative Experience
            </p>
            <p className="text-base font-extrabold text-emerald-950">
              {totalExp.years > 0 || totalExp.months > 0 || totalExp.days > 0
                ? `${totalExp.years} Years, ${totalExp.months} Months, ${totalExp.days} Days`
                : "Fresher / No work history added"}
            </p>
          </div>
        </div>
      </div>

      {/* Experience List */}
      {sortedExperiences.length === 0 ? (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-10 text-center">
          <Briefcase size={40} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No Work Experience Added</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Add your architectural practice, internships, academic teaching, or firm engagements to showcase your industry tenure.
          </p>
          {isOwner && (
            <button
              onClick={openAddModal}
              className="mt-5 bg-black hover:bg-gray-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
            >
              Add First Experience
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedExperiences.map((exp) => (
            <div
              key={exp.id || Math.random()}
              className="bg-white rounded-2xl p-5 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-black">
                  <Building2 size={22} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">{exp.position}</h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {exp.organization_type || "Firm"}
                    </span>
                  </div>

                  <p className="text-base font-semibold text-gray-800 mt-0.5">
                    {exp.firm_name}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-gray-500 font-medium">
                    {(exp.city || exp.country) && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-gray-400" />
                        {[exp.city, exp.country].filter(Boolean).join(", ")}
                      </span>
                    )}

                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-gray-400" />
                      {exp.start_date ? new Date(exp.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""} –{" "}
                      {exp.is_current ? (
                        <span className="text-emerald-600 font-semibold">Present (Currently Working)</span>
                      ) : exp.end_date ? (
                        new Date(exp.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                      ) : (
                        "Present"
                      )}
                    </span>
                  </div>

                  {exp.role_description && (
                    <p className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 whitespace-pre-wrap leading-relaxed">
                      {exp.role_description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              {isOwner && (
                <div className="flex items-center gap-2 self-end md:self-start">
                  <button
                    onClick={() => openEditModal(exp)}
                    className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition"
                    title="Edit Experience"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Experience"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD / EDIT EXPERIENCE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-gray-100 my-8">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {editingId ? "Edit Work Experience" : "Add Work Experience"}
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Detail your role, firm or institutional background, and timeline.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Firm Name */}
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                  Firm / Institution Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  placeholder="e.g. Sanjay Puri Architects / Morphogenesis / SPA Delhi"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                />
              </div>

              {/* Organization Type */}
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                  Organization Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                >
                  {ORGANIZATION_TYPES.map((org) => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                  Position / Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Senior Project Architect / Assistant Professor / Architectural Intern"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                />
              </div>

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
                    placeholder="e.g. Bengaluru / Ahmedabad"
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
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                    End Date
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

              {/* Currently Working Here */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="w-4 h-4 text-black rounded"
                />
                <span className="text-sm font-medium text-gray-700">Currently working in this role</span>
              </label>

              {/* Role & Project Responsibilities */}
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                  Responsibilities & Projects Handled
                </label>
                <textarea
                  rows={3}
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Outline key project typologies, BIM coordination, client presentations, construction drawings, or academic courses taught..."
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-white"
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
                  {submitting ? "Saving..." : editingId ? "Update Experience" : "Save Experience"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
