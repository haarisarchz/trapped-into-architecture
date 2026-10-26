"use client";

import React, { useState, useEffect } from "react";
import { X, Building2, ShieldCheck, Send, CheckCircle2, Sparkles, AlertCircle, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface ClaimCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId?: string;
  companySlug: string;
  companyName: string;
}

export default function ClaimCompanyModal({
  isOpen,
  onClose,
  companyId,
  companySlug,
  companyName,
}: ClaimCompanyModalProps) {
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [designation, setDesignation] = useState("");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsLoggedIn(true);
          if (user.full_name) setFullName(user.full_name);
          if (user.email) setWorkEmail(user.email);
        } catch (e) {}
      } else {
        setIsLoggedIn(false);
      }
    } else {
      document.body.style.overflow = "unset";
      setSubmitted(false);
      setErrorMsg("");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workEmail) {
      setErrorMsg("Please enter your official work email.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const userStr = localStorage.getItem("currentUser");
      let userId: string | null = null;
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user.id || null;
        } catch (e) {}
      }

      const { error } = await supabase.from("company_claim_requests").insert([
        {
          company_id: companyId || null,
          company_slug: companySlug,
          company_name: companyName,
          user_id: userId,
          requester_name: fullName,
          work_email: workEmail,
          phone_number: phoneNumber,
          designation,
          verification_notes: verificationNotes,
          status: "pending",
        },
      ]);

      if (error) {
        console.warn("Could not save to company_claim_requests:", error.message);
      }
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit claim request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-gray-100 my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900">
                Claim {companyName}
              </h3>
              <p className="text-xs text-gray-500">
                Verify studio leadership to manage jobs, portfolio & team
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Claim Request Received!</h4>
            <p className="text-gray-600 text-sm max-w-sm mb-6 leading-relaxed">
              Thank you! Our platform team will verify your credentials for <strong>{companyName}</strong> and activate your verified studio management privileges shortly.
            </p>
            <button
              onClick={onClose}
              className="bg-black text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoggedIn && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2">
                <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <p>
                  You are submitting as a guest representative. Once approved, this studio profile will be verified and linked to your contact info.
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ar. Haaris"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Official Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  placeholder="contact@studio.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Your Role / Designation *
              </label>
              <select
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black bg-white"
              >
                <option value="">Select your role</option>
                <option value="Principal Architect">Principal Architect / Head</option>
                <option value="Founder / Partner">Founder / Partner / Director</option>
                <option value="HR / Studio Manager">HR / Talent Manager</option>
                <option value="Associate / Senior Architect">Associate / Senior Architect</option>
                <option value="Authorized Representative">Authorized Representative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Verification Proof (LinkedIn / Website / Studio Note)
              </label>
              <textarea
                rows={3}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Paste your LinkedIn profile URL, link to official studio website team page, or verification note..."
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Submitting claim...</span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Claim Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
