"use client";

import React, { useState, useEffect } from "react";
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
import UploadSuccessDialog from "./UploadSuccessDialog";

interface SmartApplyDocumentsCardProps {
  user: any;
  isOwner: boolean;
  onUserUpdate: (updated: any) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
}

const MAX_RESUME_SIZE = 1 * 1024 * 1024; // 1 MB
const MAX_PORTFOLIO_SIZE = 5 * 1024 * 1024; // 5 MB

export default function SmartApplyDocumentsCard({
  user,
  isOwner,
  onUserUpdate,
  onUploadStateChange,
}: SmartApplyDocumentsCardProps) {
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeProgress, setResumeProgress] = useState(0);

  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [portfolioProgress, setPortfolioProgress] = useState(0);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success dialog state
  const [successDialog, setSuccessDialog] = useState<{
    isOpen: boolean;
    fileName: string;
    fileType: string;
    fileSizeFormatted: string;
    validityDays?: number;
  }>({
    isOpen: false,
    fileName: "",
    fileType: "",
    fileSizeFormatted: "",
  });

  const docStatus = getSmartApplyDocStatus(user);
  const userTier: BadgeTier = (user?.badge_tier as BadgeTier) || "bronze";
  const isSilverOrAbove = ["silver", "gold", "platinum", "diamond"].includes(userTier);
  const validityDays = getValidityDaysForTier(userTier);

  // Inform parent when any upload is in progress
  useEffect(() => {
    const isUploading = uploadingResume || uploadingPortfolio;
    if (onUploadStateChange) {
      onUploadStateChange(isUploading);
    }

    // Warn if user attempts to reload or leave the page while upload is in progress
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = "A file is currently uploading. If you leave now, the upload will be cancelled.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [uploadingResume, uploadingPortfolio, onUploadStateChange]);

  // If viewing someone else's profile and they haven't uploaded any documents, don't show an empty card
  if (!isOwner && !user?.resume_url && !user?.portfolio_file_url) {
    return null;
  }

  // Upload with XMLHttpRequest for genuine progress tracking
  const uploadFileWithProgress = (
    file: File,
    folder: string,
    onProgress: (percent: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.min(95, Math.round((event.loaded / event.total) * 100));
          onProgress(percent);
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.url) {
              onProgress(100);
              resolve(data.url);
              return;
            }
          } catch (e) {}
        }

        // Fallback to Supabase Storage if ImageKit fails
        try {
          const ext = file.name.split(".").pop() || "pdf";
          const filename = `${user.id}-${Date.now()}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from("applicant-docs")
            .upload(filename, file, { upsert: true });

          if (uploadErr) throw uploadErr;

          const { data: publicData } = supabase.storage
            .from("applicant-docs")
            .getPublicUrl(filename);

          onProgress(100);
          resolve(publicData.publicUrl);
        } catch (fallbackErr: any) {
          reject(new Error(xhr.responseText || fallbackErr.message || "Failed to upload file."));
        }
      };

      xhr.onerror = async () => {
        try {
          const ext = file.name.split(".").pop() || "pdf";
          const filename = `${user.id}-${Date.now()}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from("applicant-docs")
            .upload(filename, file, { upsert: true });

          if (uploadErr) throw uploadErr;

          const { data: publicData } = supabase.storage
            .from("applicant-docs")
            .getPublicUrl(filename);

          onProgress(100);
          resolve(publicData.publicUrl);
        } catch (fallbackErr: any) {
          reject(fallbackErr);
        }
      };

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check PDF only
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      alert("Only PDF files are accepted for Resume. Please select a valid PDF file.");
      e.target.value = "";
      return;
    }

    if (!isSilverOrAbove) {
      alert("Reach Silver Member tier (50% profile completion) to unlock TI2A Smart Apply document uploads!");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      alert(
        `Resume file size exceeds the 1 MB limit (your file: ${(file.size / (1024 * 1024)).toFixed(2)} MB). Please compress your PDF to 1 MB or less.`
      );
      e.target.value = "";
      return;
    }

    setUploadingResume(true);
    setResumeProgress(5);
    setErrorMessage(null);

    try {
      const fileUrl = await uploadFileWithProgress(file, "/resumes", (percent) => {
        setResumeProgress(percent);
      });

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

      // Show Upload Success Dialog
      setSuccessDialog({
        isOpen: true,
        fileName: file.name,
        fileType: "Resume / CV",
        fileSizeFormatted: `${(file.size / 1024).toFixed(1)} KB`,
        validityDays: validityDays,
      });
    } catch (err: any) {
      console.error("Resume upload error:", err);
      setErrorMessage(err.message || "Failed to upload resume. Please try again.");
    } finally {
      setUploadingResume(false);
      setResumeProgress(0);
      e.target.value = "";
    }
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check PDF only
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      alert("Only PDF files are accepted for Portfolio. Please select a valid PDF file.");
      e.target.value = "";
      return;
    }

    if (!isSilverOrAbove) {
      alert("Reach Silver Member tier (50% profile completion) to unlock TI2A Smart Apply document uploads!");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_PORTFOLIO_SIZE) {
      alert(
        `Portfolio file size exceeds the 5 MB limit (your file: ${(file.size / (1024 * 1024)).toFixed(2)} MB). Please compress your PDF to 5 MB or less.`
      );
      e.target.value = "";
      return;
    }

    setUploadingPortfolio(true);
    setPortfolioProgress(5);
    setErrorMessage(null);

    try {
      const fileUrl = await uploadFileWithProgress(file, "/portfolios", (percent) => {
        setPortfolioProgress(percent);
      });

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

      // Show Upload Success Dialog
      setSuccessDialog({
        isOpen: true,
        fileName: file.name,
        fileType: "Architectural Portfolio",
        fileSizeFormatted: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        validityDays: validityDays,
      });
    } catch (err: any) {
      console.error("Portfolio upload error:", err);
      setErrorMessage(err.message || "Failed to upload portfolio. Please try again.");
    } finally {
      setUploadingPortfolio(false);
      setPortfolioProgress(0);
      e.target.value = "";
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
    <>
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
              Upload your portfolio & resume once (PDF only). Apply to architectural firms in 1 click!
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

        {/* TIER BENEFIT NOTICE FOR BRONZE */}
        {!isSilverOrAbove && isOwner && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Lock size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900">
                  TI2A Smart Apply Document Uploads are Locked
                </p>
                <p className="text-[11px] text-amber-700">
                  Complete your profile details to reach Silver Tier (50%) to upload your Resume and Portfolio.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TWO DOCUMENT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. RESUME / CV CARD (MAX 1 MB, PDF ONLY) */}
          <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Resume / CV</h4>
                    <p className="text-[11px] text-gray-500">Max size: 1 MB (PDF only)</p>
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
                        disabled={uploadingResume}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
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

              {/* PROGRESS BAR NEAR RESUME SECTION */}
              {uploadingResume && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900 mb-1.5">
                    <span>Uploading Resume...</span>
                    <span>{resumeProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200/70 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-150"
                      style={{ width: `${resumeProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTON */}
            {isOwner && (
              <div>
                {isSilverOrAbove ? (
                  <label
                    className={`w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition shadow-xs ${
                      uploadingResume ? "opacity-60 pointer-events-none" : ""
                    }`}
                  >
                    <Upload size={14} />
                    <span>
                      {uploadingResume
                        ? `Uploading (${resumeProgress}%)...`
                        : user.resume_url
                        ? "Replace Resume (Max 1MB PDF)"
                        : "Upload Resume (Max 1MB PDF)"}
                    </span>
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

          {/* 2. ARCHITECTURAL PORTFOLIO CARD (MAX 5 MB, PDF ONLY) */}
          <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                    <FolderArchive size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Selected Portfolio</h4>
                    <p className="text-[11px] text-gray-500">Max size: 5 MB (PDF only)</p>
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
                      {user.portfolio_file_size
                        ? `${(user.portfolio_file_size / (1024 * 1024)).toFixed(2)} MB`
                        : "PDF document"}
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
                        disabled={uploadingPortfolio}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
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

              {/* PROGRESS BAR NEAR PORTFOLIO SECTION */}
              {uploadingPortfolio && (
                <div className="mb-4 bg-purple-50 border border-purple-200 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-900 mb-1.5">
                    <span>Uploading Portfolio...</span>
                    <span>{portfolioProgress}%</span>
                  </div>
                  <div className="w-full bg-purple-200/70 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-150"
                      style={{ width: `${portfolioProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTON */}
            {isOwner && (
              <div>
                {isSilverOrAbove ? (
                  <label
                    className={`w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition shadow-xs ${
                      uploadingPortfolio ? "opacity-60 pointer-events-none" : ""
                    }`}
                  >
                    <Upload size={14} />
                    <span>
                      {uploadingPortfolio
                        ? `Uploading (${portfolioProgress}%)...`
                        : user.portfolio_file_url
                        ? "Replace Portfolio (Max 5MB PDF)"
                        : "Upload Portfolio (Max 5MB PDF)"}
                    </span>
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

      {/* UPLOAD SUCCESS DIALOG MODAL */}
      <UploadSuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog({ ...successDialog, isOpen: false })}
        fileName={successDialog.fileName}
        fileType={successDialog.fileType}
        fileSizeFormatted={successDialog.fileSizeFormatted}
        validityDays={successDialog.validityDays}
      />
    </>
  );
}
