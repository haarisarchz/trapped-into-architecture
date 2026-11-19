"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, AlertTriangle, X, RefreshCw, Sparkles, ChevronRight } from "lucide-react";
import { getSmartApplyDocStatus } from "@/utils/smartApply";

export default function SmartApplyExpiryBanner() {
  const [show, setShow] = useState(false);
  const [docStatus, setDocStatus] = useState<any>(null);

  useEffect(() => {
    // Check local storage for current user
    const checkExpiry = () => {
      try {
        const stored = localStorage.getItem("currentUser");
        if (!stored) return;

        const user = JSON.parse(stored);
        if (!user || (!user.resume_url && !user.portfolio_file_url)) return;

        // Check if snoozed
        const snoozedUntil = localStorage.getItem("ti2a_smart_apply_snooze_until");
        if (snoozedUntil && Date.now() < parseInt(snoozedUntil, 10)) {
          return;
        }

        const status = getSmartApplyDocStatus(user);
        if (status.isExpired || status.isExpiringSoon) {
          setDocStatus(status);
          setShow(true);
        }
      } catch (e) {
        console.error("Error checking document expiration banner:", e);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 60000); // re-check every minute
    return () => clearInterval(interval);
  }, []);

  const handleRemindInOneHour = () => {
    const oneHourLater = Date.now() + 60 * 60 * 1000;
    localStorage.setItem("ti2a_smart_apply_snooze_until", oneHourLater.toString());
    setShow(false);
  };

  const handleClose = () => {
    setShow(false);
  };

  if (!show || !docStatus) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full p-4 rounded-3xl bg-white shadow-2xl border border-gray-200 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              docStatus.isExpired
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {docStatus.isExpired ? <AlertTriangle size={18} /> : <Clock size={18} />}
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-1.5">
              <span>TI2A Smart Apply</span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full uppercase ${
                  docStatus.isExpired
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-800"
                }`}
              >
                {docStatus.isExpired ? "Expired" : "Expiring Soon"}
              </span>
            </h4>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-black p-1 rounded-lg hover:bg-gray-100 transition"
        >
          <X size={16} />
        </button>
      </div>

      <p className="text-xs text-gray-600 mb-4 leading-relaxed">
        {docStatus.isExpired
          ? "Your 1-Click Smart Apply documents (Portfolio & Resume) have expired. Re-upload to keep applying in 1 click!"
          : `Your TI2A Smart Apply documents will expire in ${docStatus.hoursRemaining} hours. Re-upload or renew now to avoid application disruption.`}
      </p>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          onClick={() => setShow(false)}
          className="flex-1 bg-black hover:bg-gray-800 text-white text-xs font-bold py-2 px-3 rounded-xl text-center transition flex items-center justify-center gap-1.5 shadow-xs"
        >
          <span>Renew / Re-upload</span>
          <ChevronRight size={13} />
        </Link>

        {!docStatus.isExpired && (
          <button
            onClick={handleRemindInOneHour}
            className="text-xs font-semibold text-gray-600 hover:text-black px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
          >
            Remind in 1 hr
          </button>
        )}
      </div>
    </div>
  );
}
