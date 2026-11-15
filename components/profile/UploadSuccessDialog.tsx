"use client";

import React from "react";
import { CheckCircle2, X } from "lucide-react";

interface UploadSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileType: string; // "Resume" | "Portfolio" | "Experience Certificate"
  fileSizeFormatted: string;
  validityDays?: number;
}

export default function UploadSuccessDialog({
  isOpen,
  onClose,
  fileName,
  fileType,
  fileSizeFormatted,
  validityDays,
}: UploadSuccessDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-100 relative animate-in zoom-in-95 duration-200">
        {/* CLOSE X BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-black p-2 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* ICON & TITLE */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">
            File Uploaded Successfully!
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Your {fileType} has been securely uploaded and attached to your profile.
          </p>
        </div>

        {/* FILE DETAILS CARD */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 mb-6 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-gray-600">
            <span className="font-medium text-gray-500">Document Type</span>
            <span className="font-bold text-gray-900">{fileType}</span>
          </div>
          <div className="flex items-center justify-between text-gray-600">
            <span className="font-medium text-gray-500">File Name</span>
            <span className="font-bold text-gray-900 truncate max-w-[200px]" title={fileName}>
              {fileName}
            </span>
          </div>
          <div className="flex items-center justify-between text-gray-600">
            <span className="font-medium text-gray-500">File Size</span>
            <span className="font-bold text-gray-900">{fileSizeFormatted}</span>
          </div>
          {validityDays ? (
            <div className="flex items-center justify-between text-gray-600 pt-2 border-t border-gray-200">
              <span className="font-medium text-gray-500">Storage Validity</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {validityDays} Days Active
              </span>
            </div>
          ) : null}
        </div>

        {/* ACTIONS: OKAY BUTTON AND CLOSE BUTTON */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-black hover:bg-gray-800 text-white font-bold py-3 px-5 rounded-xl transition text-sm shadow-sm cursor-pointer text-center"
          >
            Okay
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-semibold py-3 px-5 rounded-xl transition text-sm cursor-pointer text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
