"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
  Globe,
  EyeOff,
} from "lucide-react";
import { LinkedInBrandIcon, InstagramBrandIcon } from "@/components/icons/BrandIcons";

interface PersonalInfoTabProps {
  user: any;
  isOwner: boolean;
  onUserUpdate: (updated: any) => void;
}

const USER_TRACKS = [
  { value: "job_seeker", label: "🎯 Job Seeker / Candidate" },
  { value: "student", label: "🎓 Architecture Student / Intern" },
  { value: "recruiter", label: "🏢 Recruiter / Architecture Firm" },
  { value: "academician", label: "🏛️ Academician / Researcher / Educator" },
  { value: "freelancer", label: "💼 Freelancer / Design Consultant" },
  { value: "explorer", label: "☕ Explorer / Architecture Enthusiast" },
];

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
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  const handleVerifyEmail = async () => {
    if (!user.email) {
      alert("Please enter and save your email address first.");
      return;
    }
    setVerifyingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/profile/${user.username || ""}?verified=email`,
        },
      });
      if (error) {
        console.warn("Auth resend note:", error.message);
      }
      alert(`Verification link sent to ${user.email}! Click the link in your email to verify and unlock +5% profile completion score.`);
    } catch (e) {
      alert("Failed to send verification email. Please try again.");
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!user.phone) {
      alert("Please enter and save your phone number first.");
      return;
    }
    const confirmed = confirm(
      `Confirm Phone Verification:\n\nIs ${user.phone} your active mobile/WhatsApp contact number?\n\nClick OK to verify and add +5% to your profile completion score.`
    );
    if (!confirmed) return;

    setVerifyingPhone(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ phone_verified: true })
        .eq("id", user.id);

      if (error) throw error;

      if (onUserUpdate) {
        onUserUpdate({ ...user, phone_verified: true });
      }
      alert(`Phone number ${user.phone} verified! +5% added to your profile completion score.`);
    } catch (err: any) {
      alert(err.message || "Could not verify phone. Please try again.");
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handlePhoneChange = (val: string) => {
    const updated: any = { ...formData, phone: val };
    if (formData.whatsapp_same_as_phone) {
      updated.whatsapp_number = val;
    }
    setFormData(updated);
  };

  const handleSameAsPhoneToggle = (checked: boolean) => {
    setFormData({
      ...formData,
      whatsapp_same_as_phone: checked,
      whatsapp_number: checked ? (formData.phone || "") : (formData.whatsapp_number || ""),
    });
  };

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
        phone: formData.phone || null,
        whatsapp_number: formData.whatsapp_same_as_phone ? (formData.phone || null) : (formData.whatsapp_number || null),
        whatsapp_same_as_phone: Boolean(formData.whatsapp_same_as_phone),
        linkedin_url: formData.linkedin_url || null,
        instagram_url: formData.instagram_url || null,
        portfolio_url: formData.portfolio_url || null,
        twitter_url: formData.twitter_url || null,
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
        ...payload,
      };

      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const current = JSON.parse(stored);
        if (current.id === user.id || current.username === user.username) {
          localStorage.setItem("currentUser", JSON.stringify({ ...current, ...updatedUser }));
        }
      }

      onUserUpdate(updatedUser);
      setIsEditing(false);
      alert("Personal & contact details saved successfully!");
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
          <h2 className="text-2xl font-bold text-gray-900">Personal & Credentials</h2>
          <p className="text-sm text-gray-500 mt-1">
            Identity, Council of Architecture registration, contact info, and portfolio
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
            className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-semibold transition text-sm cursor-pointer shadow-sm"
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
              {USER_TRACKS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {USER_TRACKS.find((t) => t.value === user.user_track)?.label || "🎯 Job Seeker / Candidate"}
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
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Date of Birth
            </label>
            {user.hide_dob && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                <EyeOff size={11} /> Secret
              </span>
            )}
          </div>
          {isEditing ? (
            <input
              type="date"
              value={formData.dob || ""}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          ) : (!isOwner && user.hide_dob) ? (
            <p className="text-sm font-medium text-gray-400 bg-white p-3.5 rounded-xl border border-gray-100 italic">
              Hidden by user
            </p>
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.dob || "Not added"}
            </p>
          )}
        </div>

        {/* EMAIL */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Email Address
            </label>
            {user.hide_email && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                <EyeOff size={11} /> Secret
              </span>
            )}
          </div>
          {isEditing ? (
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          ) : (!isOwner && user.hide_email) ? (
            <p className="text-sm font-medium text-gray-400 bg-white p-3.5 rounded-xl border border-gray-100 italic">
              Hidden by user
            </p>
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.email || "Not added"}
            </p>
          )}
          <div className="flex items-center justify-between mt-2 px-1">
            {user.email_verified || user.is_email_verified ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-semibold border border-emerald-200">
                <CheckCircle2 size={11} /> Email Verified (+5% earned)
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                  <AlertCircle size={11} /> Unverified (Verify for +5%)
                </span>
                {isOwner && user.email && (
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={verifyingEmail}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer disabled:opacity-50"
                  >
                    {verifyingEmail ? "Sending..." : "Verify Email"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* PHONE NUMBER */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Phone Number
            </label>
            {user.hide_phone && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                <EyeOff size={11} /> Secret
              </span>
            )}
          </div>
          {isEditing ? (
            <input
              type="text"
              value={formData.phone || ""}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          ) : (!isOwner && user.hide_phone) ? (
            <p className="text-sm font-medium text-gray-400 bg-white p-3.5 rounded-xl border border-gray-100 italic">
              Hidden by user
            </p>
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.phone || "Not added"}
            </p>
          )}
          <div className="flex items-center justify-between mt-2 px-1">
            {user.phone_verified || user.is_phone_verified ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-semibold border border-emerald-200">
                <CheckCircle2 size={11} /> Phone Verified (+5% earned)
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                  <AlertCircle size={11} /> Unverified (Verify for +5%)
                </span>
                {isOwner && user.phone && (
                  <button
                    type="button"
                    onClick={handleVerifyPhone}
                    disabled={verifyingPhone}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer disabled:opacity-50"
                  >
                    {verifyingPhone ? "Verifying..." : "Verify Phone (+5%)"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* WHATSAPP NUMBER & "SAME AS PHONE NUMBER" */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              WhatsApp Number
            </label>
            {user.hide_whatsapp && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                <EyeOff size={11} /> Secret
              </span>
            )}
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                disabled={formData.whatsapp_same_as_phone}
                value={formData.whatsapp_same_as_phone ? (formData.phone || "") : (formData.whatsapp_number || "")}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm disabled:bg-gray-100"
              />
              <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={Boolean(formData.whatsapp_same_as_phone)}
                  onChange={(e) => handleSameAsPhoneToggle(e.target.checked)}
                  className="w-4 h-4 text-black rounded"
                />
                <span className="text-xs font-semibold text-gray-700">Same as phone number</span>
              </label>
            </div>
          ) : (!isOwner && user.hide_whatsapp) ? (
            <p className="text-sm font-medium text-gray-400 bg-white p-3.5 rounded-xl border border-gray-100 italic">
              Hidden by user
            </p>
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.whatsapp_same_as_phone
                ? `${user.phone || "Not added"} (Same as phone)`
                : user.whatsapp_number || "Not added"}
            </p>
          )}
        </div>

        {/* SOCIAL & PORTFOLIO LINKS SECTION */}
        <div className="md:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="text-gray-700" size={18} />
            <h3 className="font-bold text-gray-900 text-sm md:text-base">
              Social Media Accounts & Portfolio Links
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {/* LinkedIn */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <LinkedInBrandIcon size={14} />
                <span>LinkedIn Profile URL</span>
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.linkedin_url || ""}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs bg-white"
                />
              ) : user.linkedin_url ? (
                <a
                  href={user.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 font-semibold hover:underline block truncate bg-gray-50 p-2.5 rounded-xl border border-gray-100"
                >
                  {user.linkedin_url}
                </a>
              ) : (
                <p className="text-xs text-gray-400 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  Not added
                </p>
              )}
            </div>

            {/* Instagram */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <InstagramBrandIcon size={14} />
                <span>Instagram Profile URL</span>
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.instagram_url || ""}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/username"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs bg-white"
                />
              ) : user.instagram_url ? (
                <a
                  href={user.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-pink-600 font-semibold hover:underline block truncate bg-gray-50 p-2.5 rounded-xl border border-gray-100"
                >
                  {user.instagram_url}
                </a>
              ) : (
                <p className="text-xs text-gray-400 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  Not added
                </p>
              )}
            </div>

            {/* Portfolio / Website */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <Globe size={14} className="text-emerald-600" />
                <span>Portfolio / Behance / Website</span>
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.portfolio_url || ""}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  placeholder="https://behance.net/... or personal site"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs bg-white"
                />
              ) : user.portfolio_url ? (
                <a
                  href={user.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 font-semibold hover:underline block truncate bg-gray-50 p-2.5 rounded-xl border border-gray-100"
                >
                  {user.portfolio_url}
                </a>
              ) : (
                <p className="text-xs text-gray-400 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  Not added
                </p>
              )}
            </div>
          </div>
        </div>

        {/* COA SECTION (Council of Architecture) */}
        <div className="md:col-span-2 bg-blue-50/60 border border-blue-200/80 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="text-blue-600" size={20} />
            <h3 className="font-bold text-gray-900 text-base">
              Council of Architecture (COA) Registration
            </h3>
            <span className="text-[11px] font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full ml-auto">
              +15% High Trust
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                  COA Number
                </label>
                {user.hide_coa && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-semibold border border-amber-200">
                    <EyeOff size={11} /> Secret
                  </span>
                )}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.coa_number || ""}
                  onChange={(e) => setFormData({ ...formData, coa_number: e.target.value })}
                  placeholder="CA/YYYY/XXXXX"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white text-sm"
                />
              ) : (!isOwner && user.hide_coa) ? (
                <p className="text-sm font-semibold text-gray-900 bg-white p-2.5 rounded-xl border border-blue-100 italic">
                  {user.coa_number ? "COA Verified (Number Hidden)" : "Not registered / Not added"}
                </p>
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
