"use client";

import React, { useState } from "react";
import { Lock, EyeOff, Shield, Check, Info } from "lucide-react";
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
            Control which contact details and personal information are visible publicly
          </p>
        </div>
      </div>

      {/* Helpful Guarantee Note */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-8 flex items-start gap-3 text-xs md:text-sm text-emerald-950">
        <Shield size={20} className="text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-emerald-900 mb-0.5">
            Badge Points Guarantee
          </p>
          <p className="text-emerald-800 leading-relaxed text-xs">
            Hiding your phone number, WhatsApp, email, or date of birth will <strong>never reduce your profile completion score</strong>. You still receive 100% full points and maintain your <strong>Gold, Platinum, or Diamond Member</strong> rank while keeping your sensitive details completely secret.
          </p>
        </div>
      </div>

      {/* Privacy Checkboxes */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 mb-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
          Make Personal Details Secret
        </h3>

        {/* 1. Hide Phone */}
        <label className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer">
          <div className="pr-4">
            <div className="flex items-center gap-2">
              <EyeOff size={16} className="text-gray-600" />
              <p className="text-sm font-bold text-gray-900">Hide Phone Number</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
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
        <label className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer">
          <div className="pr-4">
            <div className="flex items-center gap-2">
              <EyeOff size={16} className="text-gray-600" />
              <p className="text-sm font-bold text-gray-900">Hide WhatsApp Number</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Keep your WhatsApp contact number hidden from public profile visitors.
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
        <label className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer">
          <div className="pr-4">
            <div className="flex items-center gap-2">
              <EyeOff size={16} className="text-gray-600" />
              <p className="text-sm font-bold text-gray-900">Hide Email Address</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Prevent public visitors from viewing your direct email address.
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
        <label className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer">
          <div className="pr-4">
            <div className="flex items-center gap-2">
              <EyeOff size={16} className="text-gray-600" />
              <p className="text-sm font-bold text-gray-900">Hide Date of Birth</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your birth date will be kept private from other users while still enabling birthday congratulations.
            </p>
          </div>
          <input
            type="checkbox"
            checked={hideDob}
            onChange={(e) => setHideDob(e.target.checked)}
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
