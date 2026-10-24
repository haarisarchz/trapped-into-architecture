"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, User, Briefcase, Mail, Phone, Calendar, Heart } from "lucide-react";

interface PersonalInfoTabProps {
  user: any;
  isOwner: boolean;
  onUserUpdate: (updated: any) => void;
}

const VALID_PROFESSIONS = [
  "Practising Architect",
  "Academician",
  "Undergraduate Student",
  "Postgraduate Student",
  "Research Scholar",
];

const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Non-Binary",
  "Prefer not to say",
];

const QUALIFICATION_LEVELS = [
  "PhD / Doctorate",
  "Postgraduate (Masters / M.Arch)",
  "Undergraduate (Bachelors / B.Arch)",
  "Diploma",
  "High School / Secondary",
];

export default function PersonalInfoTab({
  user,
  isOwner,
  onUserUpdate,
}: PersonalInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.fullName || formData.fullName.trim() === "") {
      alert("Full Name is a required field.");
      return;
    }

    if (!formData.profession || !VALID_PROFESSIONS.includes(formData.profession)) {
      alert("Please select a valid Profession. It is required.");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        full_name: formData.fullName,
        display_name: formData.displayName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob || null,
        profession: formData.profession,
        education: formData.education || null,
        bio: formData.bio || null,
        tagline: formData.tagline || null,
        gender: formData.gender || null,
        highest_qualification: formData.highest_qualification || null,
        user_track: formData.user_track || "job_seeker",
        coa_number: formData.coa_number || null,
        coa_registration_date: formData.coa_registration_date || null,
        coa_is_active: Boolean(formData.coa_is_active),
      };

      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id);

      if (error) {
        alert(error.message);
        return;
      }

      const updatedUser = {
        ...user,
        ...formData,
      };

      // Sync local storage
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const current = JSON.parse(stored);
        if (current.id === user.id || current.username === user.username) {
          localStorage.setItem("currentUser", JSON.stringify({ ...current, ...updatedUser }));
        }
      }

      onUserUpdate(updatedUser);
      setIsEditing(false);
      alert("Personal information saved successfully!");
    } catch (err: any) {
      console.error("Save error:", err);
      alert(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-3xl p-6 md:p-8 bg-gray-50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Personal & Professional Info</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your identity, career track, and architectural council details
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setFormData({ ...user });
                setIsEditing(true);
              }
            }}
            disabled={saving}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-semibold transition"
          >
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Edit Details"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FULL NAME */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            Full Name <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.fullName || ""}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
              placeholder="Your official full name"
            />
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.fullName || "Not provided"}
            </p>
          )}
        </div>

        {/* DISPLAY NAME */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            Display Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.displayName || ""}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
              placeholder="Short public name"
            />
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.displayName || user.fullName || "Not added"}
            </p>
          )}
        </div>

        {/* TAGLINE / HEADLINE */}
        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            Professional Tagline / Headline (LinkedIn Style)
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.tagline || ""}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
              placeholder="e.g. Senior Project Architect | Sustainable Design Specialist | LEED AP"
            />
          ) : (
            <p className="text-base font-medium text-gray-800 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.tagline || "No headline added yet"}
            </p>
          )}
        </div>

        {/* USER TRACK */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            Profile Track
          </label>
          {isEditing ? (
            <select
              value={formData.user_track || "job_seeker"}
              onChange={(e) => setFormData({ ...formData, user_track: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="job_seeker">Job Seeker / Candidate</option>
              <option value="recruiter">Recruiter / Employer / Firm</option>
            </select>
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.user_track === "recruiter" ? "🏢 Recruiter / Firm" : "🎯 Job Seeker / Candidate"}
            </p>
          )}
        </div>

        {/* PROFESSION */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            Profession <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <select
              value={formData.profession || ""}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="" disabled>Select Profession</option>
              {VALID_PROFESSIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.profession || "Not specified"}
            </p>
          )}
        </div>

        {/* HIGHEST QUALIFICATION */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            Highest Qualification
          </label>
          {isEditing ? (
            <select
              value={formData.highest_qualification || ""}
              onChange={(e) => setFormData({ ...formData, highest_qualification: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="">Select Highest Level</option>
              {QUALIFICATION_LEVELS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.highest_qualification || "Not specified"}
            </p>
          )}
        </div>

        {/* GENDER */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            Gender
          </label>
          {isEditing ? (
            <select
              value={formData.gender || ""}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="">Select Gender</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.gender || "Not added"}
            </p>
          )}
        </div>

        {/* DATE OF BIRTH */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            Date of Birth
          </label>
          {isEditing ? (
            <input
              type="date"
              value={formData.dob || ""}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.dob || "Not added"}
            </p>
          )}
        </div>

        {/* EMAIL */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            Email Address
          </label>
          {isEditing ? (
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.email || "Not added"}
            </p>
          )}
        </div>

        {/* PHONE */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            Phone Number
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.phone || "Not added"}
            </p>
          )}
        </div>

        {/* COA SECTION (Council of Architecture) */}
        <div className="md:col-span-2 bg-blue-50/60 border border-blue-200/80 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="text-blue-600" size={20} />
            <h3 className="font-bold text-gray-900 text-base">
              Council of Architecture (COA) Registration
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 block">
                COA Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.coa_number || ""}
                  onChange={(e) => setFormData({ ...formData, coa_number: e.target.value })}
                  placeholder="CA/YYYY/XXXXX"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white text-sm"
                />
              ) : (
                <p className="text-sm font-semibold text-gray-900 bg-white p-2.5 rounded-xl border border-blue-100">
                  {user.coa_number || "Not registered / Not added"}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 block">
                Registration Date / Year
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.coa_registration_date || ""}
                  onChange={(e) => setFormData({ ...formData, coa_registration_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white text-sm"
                />
              ) : (
                <p className="text-sm font-semibold text-gray-900 bg-white p-2.5 rounded-xl border border-blue-100">
                  {user.coa_registration_date || "Not added"}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 block">
                COA Active Status
              </label>
              {isEditing ? (
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.coa_is_active ?? true}
                    onChange={(e) => setFormData({ ...formData, coa_is_active: e.target.checked })}
                    className="w-4 h-4 text-black rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Registration is Active</span>
                </label>
              ) : (
                <p className="text-sm font-semibold text-gray-900 bg-white p-2.5 rounded-xl border border-blue-100">
                  {user.coa_number ? (user.coa_is_active ? "Active ✅" : "Inactive ⚠️") : "N/A"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* BIO / ABOUT */}
        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            About Me / Professional Bio
          </label>
          {isEditing ? (
            <textarea
              rows={4}
              value={formData.bio || ""}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full border border-gray-300 rounded-xl p-4 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
              placeholder="Tell other architects, institutions, and recruiters about your design philosophy, areas of practice, and accomplishments..."
            />
          ) : (
            <p className="text-sm text-gray-700 bg-white p-4 rounded-xl border border-gray-100 leading-relaxed whitespace-pre-wrap">
              {user.bio || "No bio added yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
