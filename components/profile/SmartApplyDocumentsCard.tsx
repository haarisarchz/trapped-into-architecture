"use client";

import React, { useState } from "react";
import {
  FileText,
  FolderArchive,
  Upload,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  Lock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BadgeTier } from "@/utils/profileCompletion";
import {
  getSmartApplyDocStatus,
  getValidityDaysForTier,
} from "@/utils/smartApply";

interface SmartApplyDocumentsCardProps {
  user: any;
  isOwner: boolean;
  onUserUpdate: (updated: any) => void;
}

const MAX_RESUME_SIZE = 1 * 1024 * 1024; // 1 MB
const MAX_PORTFOLIO_SIZE = 5 * 1024 * 1024; // 5 MB

export default function SmartApplyDocumentsCard({
  user,
  isOwner,
  onUserUpdate,
}: SmartApplyDocumentsCardProps) {
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const docStatus = getSmartApplyDocStatus(user);
  const userTier: BadgeTier = (user?.badge_tier as BadgeTier) || "bronze";
  const isSilverOrAbove = ["silver", "gold", "platinum", "diamond"].includes(userTier);

  const validityDays = getValidityDaysForTier(userTier);

  // If viewing someone else's profile and they haven't uploaded any documents, don't show an empty card
  if (!isOwner && !user?.resume_url && !user?.portfolio_file_url) {
    return null;
  }

  // Generic file uploader using ImageKit (or Supabase fallback)
  const uploadFile = async (file: File, folder: string): Promise<string> => {
    // 1. Try ImageKit upload endpoint
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }

    // 2. Supabase Storage fallback
    const ext = file.name.split(".").pop() || "pdf";
    const filename = `${user.id}-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("applicant-docs")
      .upload(filename, file, { upsert: true });

    if (uploadErr) throw uploadErr;

    const { data: publicData } = supabase.storage
      .from("applicant-docs")
      .getPublicUrl(filename);

    return publicData.publicUrl;
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSilverOrAbove) {
      alert("Reach Silver Member tier (50% profile completion) to unlock TI2A Smart Apply document uploads!");
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      alert(`Resume file size exceeds 1 MB limit (your file: ${(file.size / (1024 * 1024)).toFixed(1)} MB). Please compress your PDF.`);
      return;
    }

    setUploadingResume(true);
    setErrorMessage(null);

    try {
      const fileUrl = await uploadFile(file, "/resumes");
      const uploadedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();

      const payload = {
        resume_url: fileUrl,
        resume_name: file.name,
        resume_size: file.size,
        docs_uploaded_at: uploadedAt,
        docs_expires_at: expiresAt,
      };

      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id);

      if (error) throw error;

      const updated = { ...user, ...payload };
      onUserUpdate(updated);

      // sync localStorage
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem("currentUser", JSON.stringify({ ...parsed, ...payload }));
      }
    } catch (err: any) {
      console.error("Resume upload error:", err);
      setErrorMessage(err.message || "Failed to upload resume. Please try again.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSilverOrAbove) {
      alert("Reach Silver Member tier (50% profile completion) to unlock TI2A Smart Apply document uploads!");
      return;
    }

    if (file.size > MAX_PORTFOLIO_SIZE) {
      alert(`Portfolio file size exceeds 5 MB limit (your file: ${(file.size / (1024 * 1024)).toFixed(1)} MB). Please optimize your PDF.`);
      return;
    }

    setUploadingPortfolio(true);
    setErrorMessage(null);

    try {
      const fileUrl = await uploadFile(file, "/portfolios");
      const uploadedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();

      const payload = {
        portfolio_file_url: fileUrl,
        portfolio_file_name: file.name,
        portfolio_file_size: file.size,
        docs_uploaded_at: uploadedAt,
        docs_expires_at: expiresAt,
      };

      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id);

      if (error) throw error;

      const updated = { ...user, ...payload };
      onUserUpdate(updated);

      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem("currentUser", JSON.stringify({ ...parsed, ...payload }));
      }
    } catch (err: any) {
      console.error("Portfolio upload error:", err);
      setErrorMessage(err.message || "Failed to upload portfolio. Please try again.");
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handleRemoveResume = async () => {
    if (!confirm("Are you sure you want to remove your resume?")) return;
    try {
      const payload = { resume_url: null, resume_name: null, resume_size: null };
      await supabase.from("profiles").update(payload).eq("id", user.id);
      onUserUpdate({ ...user, ...payload });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemovePortfolio = async () => {
    if (!confirm("Are you sure you want to remove your portfolio?")) return;
    try {
      const payload = { portfolio_file_url: null, portfolio_file_name: null, portfolio_file_size: null };
      await supabase.from("profiles").update(payload).eq("id", user.id);
      onUserUpdate({ ...user, ...payload });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200/80 shadow-sm">
      {/* CARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              TI2A Smart Apply Documents
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Silver+ Perk
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Upload your portfolio & resume once. Apply to architectural firms in 1 click!
          </p>
        </div>

        {/* STATUS PILL */}
        {docStatus.hasDocs && (
          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold border self-start sm:self-auto ${
              docStatus.isExpired
                ? "bg-red-50 text-red-700 border-red-200"
                : docStatus.isExpiringSoon
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            <Clock size={13} />
            <span>{docStatus.statusLabel}</span>
          </div>
        )}
      </div>

      {/* ERROR NOTICE IF ANY */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TIER BENEFIT EXPLANATION BAR */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50/40 border border-gray-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-700">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-500 shrink-0" />
          <div>
            <span className="font-bold text-gray-900">Tier Storage Retention: </span>
            <span>
              Silver: <strong>1 Week</strong> • Gold: <strong>2 Weeks</strong> • Platinum/Diamond: <strong>1 Month</strong>
            </span>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-gray-500">
          Your current tier gives <strong>{validityDays} days</strong> active storage
        </span>
      </div>

      {/* DOCUMENT UPLOAD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. RESUME / CV CARD (MAX 1 MB) */}
        <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Resume / CV</h4>
                  <p className="text-[11px] text-gray-500">Max size: 1 MB (PDF)</p>
                </div>
              </div>
              {user.resume_url && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={11} /> Attached
                </span>
              )}
            </div>

            {user.resume_url ? (
              <div className="bg-white p-3 rounded-xl border border-gray-200 mb-4 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {user.resume_name || "Resume.pdf"}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {user.resume_size ? `${(user.resume_size / 1024).toFixed(0)} KB` : "PDF document"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={user.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100 transition"
                    title="View file"
                  >
                    <ExternalLink size={14} />
                  </a>
                  {isOwner && (
                    <button
                      onClick={handleRemoveResume}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Remove file"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-4 italic">
                No resume attached yet. Uploading lets firms review your credentials instantly.
              </p>
            )}
          </div>

          {/* ACTION BUTTON */}
          {isOwner && (
            <div>
              {isSilverOrAbove ? (
                <label className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition shadow-xs">
                  <Upload size={14} />
                  <span>{uploadingResume ? "Uploading..." : user.resume_url ? "Replace Resume (Max 1MB)" : "Upload Resume (Max 1MB)"}</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="w-full flex items-center justify-center gap-1.5 bg-gray-200 text-gray-600 text-xs font-bold py-2.5 px-4 rounded-xl cursor-not-allowed">
                  <Lock size={13} />
                  <span>Reach Silver Tier (50%) to Upload</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. ARCHITECTURAL PORTFOLIO CARD (MAX 5 MB) */}
        <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <FolderArchive size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Selected Portfolio</h4>
                  <p className="text-[11px] text-gray-500">Max size: 5 MB (PDF)</p>
                </div>
              </div>
              {user.portfolio_file_url && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={11} /> Attached
                </span>
              )}
            </div>

            {user.portfolio_file_url ? (
              <div className="bg-white p-3 rounded-xl border border-gray-200 mb-4 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {user.portfolio_file_name || "Portfolio.pdf"}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {user.portfolio_file_size ? `${(user.portfolio_file_size / (1024 * 1024)).toFixed(1)} MB` : "PDF document"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={user.portfolio_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100 transition"
                    title="View file"
                  >
                    <ExternalLink size={14} />
                  </a>
                  {isOwner && (
                    <button
                      onClick={handleRemovePortfolio}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Remove file"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-4 italic">
                No portfolio attached yet. Selected works showcase your drawings and design vision.
              </p>
            )}
          </div>

          {/* ACTION BUTTON */}
          {isOwner && (
            <div>
              {isSilverOrAbove ? (
                <label className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition shadow-xs">
                  <Upload size={14} />
                  <span>{uploadingPortfolio ? "Uploading..." : user.portfolio_file_url ? "Replace Portfolio (Max 5MB)" : "Upload Portfolio (Max 5MB)"}</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePortfolioUpload}
                    disabled={uploadingPortfolio}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="w-full flex items-center justify-center gap-1.5 bg-gray-200 text-gray-600 text-xs font-bold py-2.5 px-4 rounded-xl cursor-not-allowed">
                  <Lock size={13} />
                  <span>Reach Silver Tier (50%) to Upload</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
