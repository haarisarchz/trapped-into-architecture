"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { WhatsAppBrandIcon, FacebookBrandIcon, LinkedInBrandIcon, TelegramBrandIcon, XBrandIcon } from "@/components/icons/BrandIcons";


export default function Footer() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [settings, setSettings] = useState<any>(null);
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { supabase } = require('@/lib/supabase');
        const { data } = await supabase.from('site_settings').select('*').eq('id', 'global').maybeSingle();
        if(data) setSettings(data);
      } catch(e) {}
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.username) {
            setIsLoggedIn(true);
            setUsername(user.username);
          }
        } catch (e) {}
      }
    }
  }, []);

  const handleSavedJobs = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn && username) {
      router.push(`/profile/${username}?tab=saved-jobs`);
    } else {
      alert("Please login to view saved jobs");
      window.dispatchEvent(new CustomEvent('openAuth', { detail: 'login' }));
    }
  };

  const handleCreateProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn && username) {
      router.push(`/profile/${username}`);
    } else {
      window.dispatchEvent(new CustomEvent('openAuth', { detail: 'register' }));
    }
  };

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 md:py-14 grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-10">
        
        {/* BRAND */}
        <div>
          <div className="mb-4 flex items-center">
            {settings?.logo_url ? (
               <img src={settings.logo_url} alt="Site Logo" className="h-10 object-contain" />
            ) : (
               <h2 className="text-xl md:text-2xl font-bold">Trapped Into Architecture</h2>
            )}
          </div>
          <p className="text-gray-400 leading-6 text-sm md:text-base">
            Careers, knowledge, opportunities and growth for architecture students and professionals.
          </p>
          
          <div className="mt-6 flex flex-wrap items-center gap-4 text-gray-400">
            {settings?.whatsapp_channel_url && (
              <a href={settings.whatsapp_channel_url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition hover:scale-110 transform" title="WhatsApp Channel">
                <WhatsAppBrandIcon size={28} />
              </a>
            )}
            {settings?.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition hover:scale-110 transform" title="Facebook">
                <FacebookBrandIcon size={28} />
              </a>
            )}
            {settings?.linkedin && (
              <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition hover:scale-110 transform" title="LinkedIn">
                <LinkedInBrandIcon size={28} />
              </a>
            )}
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition hover:scale-110 transform" title="Telegram">
                <TelegramBrandIcon size={28} />
              </a>
            )}
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-400 text-sm md:text-base">
            <li><Link href="/" className="hover:text-white transition block p-1 -m-1">Home</Link></li>
            <li><Link href="/jobs" className="hover:text-white transition block p-1 -m-1">Jobs</Link></li>
            <li><Link href="/companies" className="hover:text-white transition block p-1 -m-1">Companies</Link></li>
            </ul>
        </div>

        {/* JOB SEEKERS */}
        <div>
          <h3 className="text-lg font-semibold mb-3">For Job Seekers</h3>
          <ul className="space-y-2 text-gray-400 text-sm md:text-base">
            <li><Link href="/jobs" className="hover:text-white transition block p-1 -m-1">Browse Jobs</Link></li>
            <li><a href="#" onClick={handleCreateProfile} className="hover:text-white transition block p-1 -m-1">Create Profile</a></li>
            <li><a href="#" onClick={handleSavedJobs} className="hover:text-white transition block p-1 -m-1">Saved Jobs</a></li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-gray-400 text-sm md:text-base">
            <li>
              <a href={`mailto:${settings?.email || 'admin.ti2a@gmail.com'}`} className="hover:text-white transition block p-1 -m-1">
                {settings?.email || 'admin.ti2a@gmail.com'}
              </a>
            </li>
            <li>
              <a href={settings?.phone ? `tel:${settings.phone}` : 'tel:+918608609661'} className="hover:text-white transition block p-1 -m-1">
                {settings?.phone || '+91 8608609661'}
              </a>
            </li>
            {settings?.whatsapp && (
              <li>
                <a href={`https://web.whatsapp.com/send?phone=${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition block p-1 -m-1">
                  Message on WhatsApp
                </a>
              </li>
            )}
            <li className="p-1 -m-1 mt-2">
              {settings?.contact_address || 'Madurai, India'}
            </li>
          </ul>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-800 py-4 text-center text-gray-500 text-xs md:text-sm">
        © {new Date().getFullYear()} Trapped Into Architecture. All rights reserved.
      </div>
    </footer>
  );
}