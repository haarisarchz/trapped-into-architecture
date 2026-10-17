"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Building2 } from "lucide-react";
import ClaimCompanyModal from "./ClaimCompanyModal";

interface ClaimCompanyButtonProps {
  company: {
    id: string;
    firm_name: string;
    city?: string;
    state?: string;
    logo_url?: string;
    is_claimed?: boolean;
    verification_badge?: string;
  };
}

export default function ClaimCompanyButton({ company }: ClaimCompanyButtonProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.warn("Error parsing currentUser", e);
      }
    }
  }, []);

  // If already gold verified, don't show the claim button
  if (company.is_claimed || company.verification_badge === "gold_verified") {
    return null;
  }

  const handleClaimClick = () => {
    if (!currentUser) {
      // Trigger login popup from Navbar
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "login" }));
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClaimClick}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-gray-900 text-white hover:bg-black transition shadow-xs cursor-pointer group"
        title="Are you an authorized representative of this studio? Claim this profile."
      >
        <ShieldCheck size={15} className="text-gray-300 group-hover:text-amber-400 transition" />
        <span>Claim this Firm</span>
      </button>

      {isModalOpen && (
        <ClaimCompanyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          company={company}
          currentUser={currentUser}
          onSuccess={() => {
            // Give user feedback
          }}
        />
      )}
    </>
  );
}
