"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Building2, X, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ClaimCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: {
    id: string;
    firm_name: string;
    city?: string;
    state?: string;
    logo_url?: string;
  };
  currentUser: any;
  onSuccess?: () => void;
}

export default function ClaimCompanyModal({
  isOpen,
  onClose,
  company,
  currentUser,
  onSuccess,
}: ClaimCompanyModalProps) {
  const [claimantName, setClaimantName] = useState("");
  const [designation, setDesignation] = useState("Principal Architect");
  const [customDesignation, setCustomDesignation] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [proofNotes, setProofNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingClaim, setExistingClaim] = useState<any>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      setClaimantName(currentUser.displayName || currentUser.fullName || "");
      setOfficialEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
      checkIfAlreadyClaimed();
    }
  }, [isOpen, currentUser, company.id]);

  const checkIfAlreadyClaimed = async () => {
    if (!company.id || !currentUser) return;
    setCheckingExisting(true);
    try {
      let userId = currentUser.id;
      if (!userId && (currentUser.username || currentUser.email)) {
        const { data: p } = await supabase
          .from("profiles")
          .select("id")
          .eq(currentUser.username ? "username" : "email", currentUser.username || currentUser.email)
          .maybeSingle();
        if (p) userId = p.id;
      }

      if (userId) {
        const { data: claims } = await supabase
          .from("company_claims")
          .select("*")
          .eq("company_id", company.id)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (claims && claims.length > 0) {
          setExistingClaim(claims[0]);
        }
      }
    } catch (e) {
      console.warn("Could not check existing claims:", e);
    } finally {
      setCheckingExisting(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!claimantName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!officialEmail.trim() || !officialEmail.includes("@")) {
      setErrorMessage("Please enter a valid official email address.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Please enter a contact phone number.");
      return;
    }

    setSubmitting(true);
    try {
      let userId = currentUser.id;
      if (!userId && (currentUser.username || currentUser.email)) {
        const { data: p } = await supabase
          .from("profiles")
          .select("id")
          .eq(currentUser.username ? "username" : "email", currentUser.username || currentUser.email)
          .maybeSingle();
        if (p) userId = p.id;
      }

      const finalDesignation = designation === "Other" ? (customDesignation || "Representative") : designation;

      const { data, error } = await supabase.from("company_claims").insert([
        {
          company_id: company.id || null,
          company_name: company.firm_name,
          company_slug: company.firm_name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, ""),
          user_id: userId,
          claimant_name: claimantName.trim(),
          designation: finalDesignation,
          official_email: officialEmail.trim(),
          phone: phone.trim(),
          proof_notes: proofNotes.trim() || null,
          status: "pending",
        },
      ]).select().single();

      if (error) {
        // Fallback if table is not yet migrated in Supabase
        if (error.code === "PGRST205" || error.message?.includes("company_claims")) {
          setErrorMessage("The claims feature is being initialized in the database. Please contact admin.ti2a@gmail.com directly.");
          return;
        }
        throw error;
      }

      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Error submitting claim:", err);
      setErrorMessage(err.message || "Failed to submit claim. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const locationText = [company.city, company.state].filter(Boolean).join(", ");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-white text-black w-full max-w-lg rounded-3xl p-6 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
        >
          <X size={18} />
        </button>

        {submitted ? (
          /* SUCCESS STATE */
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Claim Submitted!</h2>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Your claim for <strong>{company.firm_name}</strong> has been submitted to TI2A administrators for verification.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 text-left mb-6">
              <p className="font-semibold mb-1">What happens next?</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Our team will review your details against public firm records.</li>
                <li>You will receive an in-app update in your notification bell 🔔 once approved.</li>
                <li>Upon approval, your studio receives the <strong>Gold Verified ✓</strong> badge and profile editing rights.</li>
              </ul>
            </div>
            <button
              onClick={onClose}
              className="bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              Done
            </button>
          </div>
        ) : existingClaim ? (
          /* ALREADY CLAIMED BY THIS USER */
          <div className="py-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-xl font-bold mb-2">Claim Already Submitted</h2>
            <p className="text-sm text-gray-600 mb-4">
              You have already submitted a claim for <strong>{company.firm_name}</strong>.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Current Status:</span>
                <span className={`font-bold uppercase tracking-wider ${
                  existingClaim.status === "approved" ? "text-emerald-600" :
                  existingClaim.status === "scrutiny_needed" ? "text-amber-600" :
                  existingClaim.status === "rejected" ? "text-red-600" : "text-blue-600"
                }`}>
                  {existingClaim.status === "approved" ? "Gold Verified ✓" :
                   existingClaim.status === "scrutiny_needed" ? "Scrutiny Needed" :
                   existingClaim.status === "rejected" ? "Rejected" : "Pending Review"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Submitted On:</span>
                <span>{new Date(existingClaim.created_at).toLocaleDateString()}</span>
              </div>
              {existingClaim.admin_notes && (
                <div className="pt-2 border-t text-gray-700">
                  <span className="font-semibold text-gray-900">Admin Note: </span>
                  {existingClaim.admin_notes}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              Close
            </button>
          </div>
        ) : (
          /* CLAIM FORM */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* TARGET COMPANY BANNER */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                {company.logo_url ? (
                  <img src={company.logo_url} alt={company.firm_name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={24} className="text-gray-400" />
                )}
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Claiming Profile</span>
                <h3 className="text-base font-bold text-gray-900 leading-tight">{company.firm_name}</h3>
                {locationText && <p className="text-xs text-gray-500">{locationText}</p>}
              </div>
            </div>

            <div className="border-b pb-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck size={22} className="text-black" />
                Claim Studio Ownership
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Verify that you are authorized to represent this studio on Trapped Into Architecture.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FULL NAME */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                placeholder="e.g. Ar. Ramesh Kumar"
                required
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* DESIGNATION */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Role / Designation in Firm <span className="text-red-500">*</span>
              </label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="Principal Architect">Principal Architect / Founder</option>
                <option value="Partner / Co-Founder">Partner / Co-Founder</option>
                <option value="Associate Architect">Associate Architect</option>
                <option value="HR / Talent Lead">HR / Talent Acquisition Lead</option>
                <option value="Studio Manager">Studio Manager / Admin</option>
                <option value="Other">Other</option>
              </select>
              {designation === "Other" && (
                <input
                  type="text"
                  value={customDesignation}
                  onChange={(e) => setCustomDesignation(e.target.value)}
                  placeholder="Specify your designation"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              )}
            </div>

            {/* OFFICIAL EMAIL */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Official Studio Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                placeholder="e.g. contact@studiolotus.in or studio@gmail.com"
                required
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Using an email matching the studio domain expedites verification.
              </p>
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Contact Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                required
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* PROOF / NOTES */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Supporting Verification Details <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                placeholder="Enter Council of Architecture (CoA) Registration No., official studio website, or Instagram handle..."
                rows={2}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting Claim...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Submit Claim for Verification
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
