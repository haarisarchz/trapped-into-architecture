"use client";

import React, { useState } from "react";
import { Lock, EyeOff, Shield, Check, GraduationCap, Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProfileSettingsTabProps {
  user: any;
  onUserUpdate: (updated: any) => void;
}

export default function ProfileSettingsTab({
  user,
  onUserUpdate,
}: ProfileSettingsTabProps) {
  const [hidePhone, setHidePhone] = useState<boolean>(Boolean(user.hide_phone));
  const [hideWhatsapp, setHideWhatsapp] = useState<boolean>(Boolean(user.hide_whatsapp));
  const [hideEmail, setHideEmail] = useState<boolean>(Boolean(user.hide_email));
  const [hideDob, setHideDob] = useState<boolean>(Boolean(user.hide_dob));
  const [hideCoa, setHideCoa] = useState<boolean>(Boolean(user.hide_coa));
  const [hideExperience, setHideExperience] = useState<boolean>(Boolean(user.hide_experience));
  const [hideEducation, setHideEducation] = useState<boolean>(Boolean(user.hide_education));

  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSavePrivacy = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      const payload = {
        hide_phone: hidePhone,
        hide_whatsapp: hideWhatsapp,
        hide_email: hideEmail,
        hide_dob: hideDob,
        hide_coa: hideCoa,
        hide_experience: hideExperience,
        hide_education: hideEducation,
      };

      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id);

      if (error) throw error;

      const updated = {
        ...user,
        ...payload,
      };

      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const curr = JSON.parse(stored);
        localStorage.setItem("currentUser", JSON.stringify({ ...curr, ...payload }));
      }

      onUserUpdate(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving privacy settings:", err);
      alert(err.message || "Failed to update privacy settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-3xl p-6 md:p-8 bg-gray-50">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Lock size={22} className="text-gray-700" />
            <span>Profile Settings & Privacy</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose which personal and professional details to keep secret from public view
          </p>
        </div>
      </div>

      {/* Helpful Guarantee Note */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-8 flex items-start gap-3 text-xs md:text-sm text-emerald-950">
        <Shield size={20} className="text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-emerald-900 mb-0.5">
            Diamond Points & Privacy Guarantee
          </p>
          <p className="text-emerald-800 leading-relaxed text-xs">
            Hiding any of your details will <strong>never decrease your profile completion score</strong>. You still earn 100% full points and maintain your <strong>Gold, Platinum, or Diamond Member</strong> rank while keeping your sensitive records completely secret from public visitors.
          </p>
        </div>
      </div>

      {/* Privacy Checkboxes */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
          Make Personal & Professional Details Secret
        </h3>

        {/* 1. Hide Phone */}
        <label className="flex items-start justify-between p-3.5 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer">
          <div className="pr-4">
            <div className="flex items-center gap-2">
              <EyeOff size={15} className="text-gray-600" />
              <p className="text-sm font-bold text-gray-900">Hide Phone Number</p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Public visitors and other users will not see your phone number. Only you can view it.
            </p>
          </div>
          <input
            type="checkbox"
            checked={hidePhone}
            onChange={(e) => setHidePhone(e.target.checked)}
            className="w-5 h-5 text-black rounded mt-1 cursor-pointer"
          />
        </label>

        {/* 2. Hide WhatsApp */}
        <label className="flex items-start justify-between p-3.5 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer">
          <div className="pr-4">
            <div className="flex items-center gap-2">
              <EyeOff size={15} className="text-gray-600" />
              <p className="text-sm font-bold text-gray-900">Hide WhatsApp Number</p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Keep your WhatsApp contact number hidden from public visitors.
            </p>
          </div>
          <input
            type="checkbox"
            checked={hideWhatsapp}
            onChange={(e) => setHideWhatsapp(e.target.checked)}
            className="w-5 h-5 text-black rounded mt-1 cursor-pointer"
          />
        </label>

        {/* 3. Hide Email */}
        <label className="flex items-start justify-between p-3.5 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer">
          <div className="pr-4">
            <div className="flex items-center gap-2">
              <EyeOff size={15} className="text-gray-600" />
              <p className="text-sm font-bold text-gray-900">Hide Email Address</p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Prevent visitors from viewing your direct email address.
            </p>
          </div>
          <input
            type="checkbox"
            checked={hideEmail}
            onChange={(e) => setHideEmail(e.target.checked)}
            className="w-5 h-5 text-black rounded mt-1 cursor-pointer"
          />
        </label>

        {/* 4. Hide Date of Birth */}
        <label className="flex items-start justify-between p-3.5 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer">
          <div className="pr-4">
            <div className="flex items-center gap-2">
              <EyeOff size={15} className="text-gray-600" />
              <p className="text-sm font-bold text-gray-900">Hide Date of Birth</p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Keep your exact birth date private from public view.
            </p>
          </div>
          <input
            type="checkbox"
            checked={hideDob}
            onChange={(e) => setHideDob(e.target.checked)}
            className="w-5 h-5 text-black rounded mt-1 cursor-pointer"
          />
        </label>

        {/* 5. Hide COA Number */}
        <label className="flex items-start justify-between p-3.5 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer">
          <div className="pr-4">
            <div className="flex items-center gap-2">
              <EyeOff size={15} className="text-gray-600" />
              <p className="text-sm font-bold text-gray-900">Hide COA Registration Number</p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Keeps your official registration number secret while still proudly showing the &quot;COA Verified&quot; badge to visitors.
            </p>
          </div>
          <input
            type="checkbox"
            checked={hideCoa}
            onChange={(e) => setHideCoa(e.target.checked)}
            className="w-5 h-5 text-black rounded mt-1 cursor-pointer"
          />
        </label>

        {/* 6. Hide Work Experience */}
        <label className="flex items-start justify-between p-3.5 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer">
          <div className="pr-4">
            <div className="flex items-center gap-2">
              <Briefcase size={15} className="text-gray-600" />
              <p className="text-sm font-bold text-gray-900">Hide Work Experience Details</p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Keep past firm names, roles, and employment history private from other users.
            </p>
          </div>
          <input
            type="checkbox"
            checked={hideExperience}
            onChange={(e) => setHideExperience(e.target.checked)}
            className="w-5 h-5 text-black rounded mt-1 cursor-pointer"
          />
        </label>

        {/* 7. Hide Education */}
        <label className="flex items-start justify-between p-3.5 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer">
          <div className="pr-4">
            <div className="flex items-center gap-2">
              <GraduationCap size={15} className="text-gray-600" />
              <p className="text-sm font-bold text-gray-900">Hide Education Details</p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Keep your colleges, universities, and high school records private from other users.
            </p>
          </div>
          <input
            type="checkbox"
            checked={hideEducation}
            onChange={(e) => setHideEducation(e.target.checked)}
            className="w-5 h-5 text-black rounded mt-1 cursor-pointer"
          />
        </label>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        {savedSuccess ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl">
            <Check size={14} />
            <span>Privacy settings saved!</span>
          </span>
        ) : (
          <span className="text-xs text-gray-500">
            Changes take effect immediately on your public profile.
          </span>
        )}

        <button
          onClick={handleSavePrivacy}
          disabled={saving}
          className="bg-black hover:bg-gray-800 text-white text-sm font-semibold px-6 py-3 rounded-xl transition cursor-pointer shadow-sm"
        >
          {saving ? "Saving..." : "Save Privacy Settings"}
        </button>
      </div>
    </div>
  );
}
