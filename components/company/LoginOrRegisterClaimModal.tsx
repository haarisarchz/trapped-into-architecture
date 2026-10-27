"use client";

import React, { useEffect } from "react";
import { X, LogIn, UserPlus, Building2, ShieldCheck, ArrowRight } from "lucide-react";

interface LoginOrRegisterClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
}

export default function LoginOrRegisterClaimModal({
  isOpen,
  onClose,
  companyName,
}: LoginOrRegisterClaimModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenLogin = () => {
    onClose();
    window.dispatchEvent(new CustomEvent("openAuth", { detail: "login" }));
  };

  const handleOpenRegister = () => {
    onClose();
    window.dispatchEvent(new CustomEvent("openAuth", { detail: "register" }));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-gray-100 my-auto text-left relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 transition cursor-pointer"
          title="Close dialog"
        >
          <X size={20} />
        </button>

        {/* HEADER ICON & TITLE */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Login or Register to Claim this Studio
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Verify your affiliation to represent <span className="font-semibold text-gray-800">{companyName}</span>
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Claiming this studio allows you to edit studio statements, showcase built architectural projects, post career openings, and maintain your practice profile. Please choose how you want to proceed:
        </p>

        {/* TWO INTERACTIVE BOXES: LOGIN & REGISTER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* BOX 1: LOGIN */}
          <div
            onClick={handleOpenLogin}
            className="group relative bg-gray-50 hover:bg-blue-50/50 border-2 border-gray-200 hover:border-blue-500 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-md"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-white text-blue-600 border border-gray-200 group-hover:border-blue-300 flex items-center justify-center mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                <LogIn size={20} />
              </div>
              <h4 className="text-base font-extrabold text-gray-900 group-hover:text-blue-700 transition">
                Login
              </h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Already registered? Sign in to your account to claim and manage {companyName}.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
              <span>Sign In to Continue</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* BOX 2: REGISTER */}
          <div
            onClick={handleOpenRegister}
            className="group relative bg-gray-50 hover:bg-indigo-50/50 border-2 border-gray-200 hover:border-indigo-500 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-md"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                <UserPlus size={20} />
              </div>
              <h4 className="text-base font-extrabold text-gray-900 group-hover:text-indigo-700 transition">
                Register
              </h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                New user? Create a free account in seconds to submit your studio claim request.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
              <span>Create Free Account</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* FOOTER NOTICE */}
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-150">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span>All studio claims are reviewed to ensure only verified studio representatives have access.</span>
        </div>
      </div>
    </div>
  );
}
