"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Mail, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenParam = searchParams.get("token") || searchParams.get("code") || "";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState(tokenParam);
  const [loading, setLoading] = useState(Boolean(tokenParam && emailParam));
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    tokenParam && emailParam ? "verifying" : "idle"
  );
  const [message, setMessage] = useState("");

  const executeVerification = async (verifyEmail: string, verifyCode: string) => {
    if (!verifyEmail || !verifyCode) {
      setStatus("error");
      setMessage("Email and verification code are required.");
      return;
    }

    setLoading(true);
    setStatus("verifying");

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verifyEmail.trim().toLowerCase(),
          code: verifyCode.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(
          data.message ||
            "Your email has been verified successfully! Your Verified Badge (+5% profile score) is now active."
        );
      } else {
        setStatus("error");
        setMessage(data.error || "The verification link or code is invalid or has expired.");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenParam && emailParam) {
      executeVerification(emailParam, tokenParam);
    }
  }, [tokenParam, emailParam]);

  return (
    <div className="max-w-md w-full mx-auto my-16 p-8 bg-white border border-gray-200 rounded-3xl shadow-xl text-center">
      {status === "verifying" && (
        <div className="py-12 space-y-4">
          <RefreshCw size={44} className="animate-spin text-black mx-auto" />
          <h2 className="text-2xl font-extrabold text-gray-900">Verifying Your Email...</h2>
          <p className="text-sm text-gray-500">
            Please wait while we confirm your credentials with the platform.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="py-6 space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={48} strokeWidth={2.5} />
          </div>

          <div className="space-y-2">
            <div className="inline-block bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
              Verified Member
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Email Verified Successfully!
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
              {message}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left text-xs space-y-2 text-gray-700">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>What has been unlocked:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Verified Badge visible on your architectural profile</li>
              <li>+5% boost to your Profile Completion Score</li>
              <li>Priority studio & job recommendation eligibility</li>
            </ul>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href="/profile"
              className="w-full bg-black hover:bg-gray-800 text-white py-3.5 px-6 rounded-2xl font-bold transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>View My Profile</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/jobs"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-2xl font-bold transition flex items-center justify-center text-xs"
            >
              Explore Architecture Jobs →
            </Link>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="py-6 space-y-6">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle size={48} strokeWidth={2.5} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Verification Failed
            </h1>
            <p className="text-sm text-red-600 font-medium">
              {message}
            </p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Verification codes and links expire after 24 hours. You can request a fresh code anytime from your profile.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href="/profile"
              className="w-full bg-black hover:bg-gray-800 text-white py-3.5 px-6 rounded-2xl font-bold transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>Go to Profile to Request Fresh Code</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-2xl font-bold transition flex items-center justify-center text-xs"
            >
              Back to Home
            </Link>
          </div>
        </div>
      )}

      {status === "idle" && (
        <div className="py-6 space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-blue-100">
            <Mail size={32} />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-gray-900">Enter Verification Code</h1>
            <p className="text-xs text-gray-500">
              Enter the 6-digit code sent to your registered email address
            </p>
          </div>

          <div className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">6-Digit Code</label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[12px] text-2xl font-mono font-bold py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <button
              type="button"
              disabled={loading || code.length !== 6 || !email}
              onClick={() => executeVerification(email, code)}
              className="w-full bg-black hover:bg-gray-800 disabled:opacity-50 text-white py-3.5 rounded-2xl font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Verify Email (+5% Score)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Navbar />
      <Suspense
        fallback={
          <div className="py-24 text-center">
            <RefreshCw size={36} className="animate-spin text-black mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">Loading verification...</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
      <Footer />
    </main>
  );
}
