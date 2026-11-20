"use client";

import React, { useState, useEffect } from "react";
import { X, Building2, ShieldCheck, Send, CheckCircle2, Sparkles, AlertCircle, Lock, ArrowRight, KeyRound, RefreshCw } from "lucide-react";
import { calculateProfileCompletion } from "@/utils/profileCompletion";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/utils/analytics";
import Link from "next/link";

interface ClaimCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId?: string;
  companySlug: string;
  companyName: string;
  onClaimSuccess?: (companyId: string) => void;
}

export default function ClaimCompanyModal({
  isOpen,
  onClose,
  companyId,
  companySlug,
  companyName,
  onClaimSuccess,
}: ClaimCompanyModalProps) {
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [designation, setDesignation] = useState("Principal Architect");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [userCompletion, setUserCompletion] = useState<number | null>(null);
  const [userUsername, setUserUsername] = useState<string>("");

  // OTP Verification state
  const [claimRequestId, setClaimRequestId] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setStep("form");
      setOtpCode("");
      setErrorMsg("");
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsLoggedIn(true);
          if (user.full_name) setFullName(user.full_name);
          if (user.email) setWorkEmail(user.email);
          if (user.username) setUserUsername(user.username);

          // Calculate profile completion score
          const uId = user.id;
          const uName = user.username;
          supabase
            .from("profiles")
            .select("*")
            .eq(uId ? "id" : "username", uId || uName)
            .maybeSingle()
            .then(async ({ data: prof }) => {
              if (prof) {
                if (prof.username) setUserUsername(prof.username);
                const { data: edus } = await supabase.from('profile_educations').select("*").eq("user_id", prof.id);
                const { data: exps } = await supabase.from('profile_experiences').select("*").eq("user_id", prof.id);
                const { data: projs } = await supabase.from('projects').select("*").eq("user_id", prof.id);
                const completion = calculateProfileCompletion(prof, edus || [], exps || [], projs || []);
                setUserCompletion(completion.percentage);
              }
            });
        } catch (e) {
          setIsLoggedIn(false);
        }
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Request OTP to the company's official email
  const handleInitiateClaim = async (e: React.FormEvent) => {
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

      const res = await fetch("/api/companies/claim-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          companySlug,
          requesterUserId: userId,
          requesterEmail: workEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Fallback: If no official studio email is found on file, save standard manual claim request
        if (data.error && data.error.includes("does not have an official email")) {
          const { error: manualErr } = await supabase.from("company_claim_requests").insert([
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
          if (manualErr) throw manualErr;
          setStep("success");
          setSuccessMsg("Claim request submitted! Our admin team will verify and activate your studio access.");
          return;
        }
        throw new Error(data.error || "Failed to dispatch verification code.");
      }

      setClaimRequestId(data.requestId);
      setMaskedEmail(data.maskedEmail);
      setStep("otp");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate verification.");
    } finally {
      setSubmitting(false);
    }
  };

  // Verify OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    setVerifyingOtp(true);
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

      const res = await fetch("/api/companies/claim-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: claimRequestId,
          companyId,
          code: otpCode.trim(),
          userId,
          designation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to verify code.");
      }

      setStep("success");
      setSuccessMsg(data.message || `Ownership of ${companyName} has been verified and linked to your profile!`);
      if (onClaimSuccess && companyId) {
        onClaimSuccess(companyId);
      }
      trackEvent("claim_studio_verified", {
        company_id: companyId || null,
        company_slug: companySlug,
        company_name: companyName,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid verification code.");
    } finally {
      setVerifyingOtp(false);
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
                Verify studio leadership via official company email OTP
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

        {isLoggedIn && userCompletion !== null && userCompletion < 45 ? (
          <div className="py-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3 border border-amber-200">
              <ShieldCheck size={28} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full mb-2 inline-block">
              Silver Member (45%) Required
            </span>
            <h4 className="text-xl font-extrabold text-gray-900 mb-2">
              Silver Status Required to Claim Practice
            </h4>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed max-w-sm mx-auto">
              Your profile is currently at <strong>{userCompletion}%</strong>. To protect architectural practices from false claims, only members at <strong>Silver Tier (45%)</strong> or above can claim studio profiles.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-sm mx-auto">
              <Link
                href={`/profile/${userUsername || ""}?tab=details`}
                className="w-full py-3 px-5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Complete Profile (+{45 - userCompletion}% needed)</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : step === "success" ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Studio Ownership Confirmed! 🎉</h4>
            <p className="text-gray-600 text-sm max-w-sm mb-6 leading-relaxed">
              {successMsg || `You are now the verified administrator of ${companyName}. You can post vacancies, update studio portfolio, and verify team members.`}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-sm">
              <Link
                href="/post-job"
                className="w-full py-3 px-5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition text-center shadow-xs"
              >
                Post a Job Now ↗
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : step === "otp" ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <KeyRound size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-gray-900 mb-0.5">Verification Code Dispatched</p>
                <p>
                  We sent a 6-digit verification code to the studio&apos;s registered official address: <strong className="text-black">{maskedEmail}</strong>.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Enter 6-Digit Code *
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[12px] text-2xl font-mono font-bold py-3 px-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-black focus:bg-white focus:outline-none transition shadow-inner"
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={verifyingOtp || otpCode.length < 6}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {verifyingOtp ? <span>Verifying code...</span> : <span>Confirm &amp; Link Studio Profile</span>}
              </button>

              <button
                type="button"
                onClick={() => setStep("form")}
                className="text-xs text-gray-500 hover:text-black py-1 text-center"
              >
                ← Back to edit details
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleInitiateClaim} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2">
              <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <p>
                An OTP will be sent to the studio&apos;s official contact inbox to verify you have direct authorization to manage <strong>{companyName}</strong>.
              </p>
            </div>

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
                  Official Work / Studio Email *
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
                Your Role / Designation at Firm *
              </label>
              <select
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black bg-white"
              >
                <option value="Principal Architect">Principal Architect / Head</option>
                <option value="Founder / Partner">Founder / Partner / Director</option>
                <option value="HR / Studio Manager">HR / Talent Manager</option>
                <option value="Associate / Senior Architect">Associate / Senior Architect</option>
                <option value="Authorized Representative">Authorized Representative</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Dispatching verification code...</span>
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>Send Verification Code to Official Email</span>
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
