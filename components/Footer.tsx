"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  WhatsAppBrandIcon,
  FacebookBrandIcon,
  LinkedInBrandIcon,
  TelegramBrandIcon,
  InstagramBrandIcon,
} from "@/components/icons/BrandIcons";

export default function Footer() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { supabase } = require("@/lib/supabase");
        const { data } = await supabase.from("site_settings").select("*").eq("id", "global").maybeSingle();
        if (data) setSettings(data);
      } catch (e) {}
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user) {
            if (user.username) {
              setIsLoggedIn(true);
              setUsername(user.username);
            }
            const role = (user.role || "").toLowerCase().replace(/[\s_]+/g, "");
            setUserRole(role);
          }
        } catch (e) {}
      }
    }
  }, []);

  const handleCreateProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn && username) {
      router.push(`/profile/${username}`);
    } else {
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "register" }));
    }
  };

  const handleManageProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn && username) {
      router.push(`/profile/${username}`);
    } else {
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "login" }));
    }
  };

  const handleJobAlerts = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Job Alerts feature is coming soon! Stay tuned.");
  };

  const handleManageCompany = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn && username) {
      router.push(`/profile/${username}?tab=companies`);
    } else {
      alert("Please log in to manage your studio / firm profile.");
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "login" }));
    }
  };

  const handlePostJob = (e: React.MouseEvent) => {
    e.preventDefault();
    const isAdmin = ["ceo", "superadmin", "admin", "jobadmin"].includes(userRole);
    if (isAdmin) {
      router.push("/admin/add-job");
    } else {
      alert(
        "Job posting access is currently restricted to verified administrators. Please contact admin at admin.ti2a@gmail.com to publish your opening."
      );
    }
  };

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* BRAND */}
        <div className="lg:col-span-1">
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-3">
              {settings?.logo_url && (
                <img src={settings.logo_url} alt="Site Logo" className="h-10 w-auto md:h-12 object-contain shrink-0" />
              )}
              <h2 className="text-lg md:text-xl font-bold leading-tight">Trapped Into Architecture</h2>
            </div>
            <p className="text-gray-400 leading-relaxed text-xs sm:text-sm">
              Careers, knowledge, opportunities and growth for architecture students and professionals.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3.5 text-gray-400">
            {settings?.whatsapp_channel_url && (
              <a
                href={settings.whatsapp_channel_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition hover:scale-110 transform"
                title="WhatsApp Channel"
              >
                <WhatsAppBrandIcon size={24} />
              </a>
            )}
            {settings?.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition hover:scale-110 transform"
                title="Facebook"
              >
                <FacebookBrandIcon size={24} />
              </a>
            )}
            {settings?.linkedin && (
              <a
                href={settings.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition hover:scale-110 transform"
                title="LinkedIn"
              >
                <LinkedInBrandIcon size={24} />
              </a>
            )}
            {settings?.website_url && (
              <a
                href={settings.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition hover:scale-110 transform"
                title="Telegram"
              >
                <TelegramBrandIcon size={24} />
              </a>
            )}
            {settings?.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition hover:scale-110 transform"
                title="Instagram"
              >
                <InstagramBrandIcon size={24} />
              </a>
            )}
          </div>
        </div>

        {/* 1. QUICK LINKS */}
        <div>
          <h3 className="text-sm md:text-base font-extrabold uppercase tracking-wider mb-4 text-white">
            Quick Links
          </h3>
          <ul className="space-y-2.5 text-gray-400 text-xs sm:text-sm">
            <li>
              <Link href="/" className="hover:text-white transition block">
                Home
              </Link>
            </li>
            <li>
              <Link href="/jobs" className="hover:text-white transition block">
                Browse Jobs
              </Link>
            </li>
            <li>
              <Link href="/internships" className="hover:text-white transition block">
                Browse Internships
              </Link>
            </li>
            <li>
              <Link href="/companies" className="hover:text-white transition block">
                Companies Directory
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition block">
                Contact Page
              </Link>
            </li>
          </ul>
        </div>

        {/* 2. FOR JOB SEEKERS */}
        <div>
          <h3 className="text-sm md:text-base font-extrabold uppercase tracking-wider mb-4 text-white">
            For Job Seekers
          </h3>
          <ul className="space-y-2.5 text-gray-400 text-xs sm:text-sm">
            {!isLoggedIn ? (
              <li>
                <a href="#" onClick={handleCreateProfile} className="hover:text-white transition block">
                  Create Profile
                </a>
              </li>
            ) : (
              <li>
                <a href="#" onClick={handleManageProfile} className="hover:text-white transition block">
                  Manage Profile
                </a>
              </li>
            )}
            <li>
              <a href="#" onClick={handleJobAlerts} className="hover:text-white transition block">
                Get Job Alerts
              </a>
            </li>
          </ul>
        </div>

        {/* 3. FOR RECRUITERS */}
        <div>
          <h3 className="text-sm md:text-base font-extrabold uppercase tracking-wider mb-4 text-white">
            For Recruiters
          </h3>
          <ul className="space-y-2.5 text-gray-400 text-xs sm:text-sm">
            <li>
              <Link href="/companies/new" className="hover:text-white transition block">
                Create Company Profile
              </Link>
            </li>
            <li>
              <a href="#" onClick={handleManageCompany} className="hover:text-white transition block">
                Manage Company Profile
              </a>
            </li>
            <li>
              <a href="#" onClick={handlePostJob} className="hover:text-white transition block">
                Post a Job Opening
              </a>
            </li>
          </ul>
        </div>

        {/* 4. CONTACT */}
        <div>
          <h3 className="text-sm md:text-base font-extrabold uppercase tracking-wider mb-4 text-white">
            Contact
          </h3>
          <ul className="space-y-2.5 text-gray-400 text-xs sm:text-sm">
            <li>
              <a href={`mailto:${settings?.email || "admin.ti2a@gmail.com"}`} className="hover:text-white transition block">
                {settings?.email || "admin.ti2a@gmail.com"}
              </a>
            </li>
            <li>
              <a href={settings?.phone ? `tel:${settings.phone}` : "tel:+918608609661"} className="hover:text-white transition block">
                {settings?.phone || "+91 8608609661"}
              </a>
            </li>
            {settings?.whatsapp && (
              <li>
                <a
                  href={`https://web.whatsapp.com/send?phone=${settings.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition inline-flex items-center gap-1.5"
                >
                  <WhatsAppBrandIcon size={16} />
                  <span>WhatsApp</span>
                </a>
              </li>
            )}
            <li className="pt-1 text-gray-500">
              {settings?.contact_address || "Madurai, India"}
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-900 py-4 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-gray-500 text-xs">
        <div>© {new Date().getFullYear()} Trapped Into Architecture. All rights reserved.</div>
        <div>
          <Link href="/privacy-policy" className="hover:text-gray-300 transition underline underline-offset-4">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
