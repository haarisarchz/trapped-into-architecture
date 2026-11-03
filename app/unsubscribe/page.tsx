"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (emailParam && emailParam.includes("@")) {
      handleUnsubscribe(emailParam);
    }
  }, [emailParam]);

  const handleUnsubscribe = async (targetEmail: string) => {
    if (!targetEmail || !targetEmail.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch(`/api/unsubscribe?email=${encodeURIComponent(targetEmail)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(`You have been unsubscribed. ${targetEmail} will no longer receive weekly job digests.`);
      } else {
        setStatus("error");
        setMessage(data.error || "Unable to unsubscribe. Please try again.");
      }
    } catch (e: any) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
          {status === "loading" && <Loader2 className="w-8 h-8 text-black animate-spin" />}
          {status === "success" && <CheckCircle2 className="w-8 h-8 text-emerald-600" />}
          {status === "error" && <AlertCircle className="w-8 h-8 text-rose-500" />}
          {status === "idle" && <Mail className="w-8 h-8 text-slate-700" />}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {status === "success" ? "Unsubscribed" : "Weekly Job Digest"}
        </h1>

        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          {status === "success"
            ? message
            : status === "loading"
            ? "Processing your unsubscribe request..."
            : "Opt out of receiving our weekly architecture opportunities newsletter."}
        </p>

        {status !== "success" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUnsubscribe(email);
            }}
            className="space-y-4 mb-6"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 px-4 bg-black text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition disabled:opacity-50"
            >
              {status === "loading" ? "Unsubscribing..." : "Unsubscribe from Weekly Digest"}
            </button>
          </form>
        )}

        <div className="pt-6 border-t border-slate-100 flex flex-col space-y-2">
          <Link
            href="/jobs"
            className="text-sm font-semibold text-black hover:underline"
          >
            Browse Active Job Listings →
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-600 transition"
          >
            Return to Trapped Into Architecture
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 text-black animate-spin" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
