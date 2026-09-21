"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      // Could open auth popup but it's not directly accessible from Footer without context passing.
      // Easiest is to redirect to home or login page if one exists. For now, alert is safe, but 
      // let's push them to a safe place. Wait, I should make sure it actually opens login.
      // But there is no /login route. The app uses a popup in Navbar. 
      // I'll emit a custom event to trigger the auth popup if possible, or just push to /?auth=login
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
          <h2 className="text-xl md:text-2xl font-bold mb-3">Trapped Into Architecture</h2>
          <p className="text-gray-400 leading-6 text-sm md:text-base">
            Careers, knowledge, opportunities and growth for architecture students and professionals.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-400 text-sm md:text-base">
            <li><Link href="/" className="hover:text-white transition block p-1 -m-1">Home</Link></li>
            <li><Link href="/jobs" className="hover:text-white transition block p-1 -m-1">Jobs</Link></li>
            <li><Link href="/companies" className="hover:text-white transition block p-1 -m-1">Companies</Link></li>
            <li><Link href="/practice-exams" className="hover:text-white transition block p-1 -m-1">Practice Exams</Link></li>
            <li><Link href="/resources" className="hover:text-white transition block p-1 -m-1">Resources</Link></li>
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
            <li><a href="mailto:admin.ti2a@gmail.com" className="hover:text-white transition block p-1 -m-1">admin.ti2a@gmail.com</a></li>
            <li><a href="https://wa.me/918608609661" target="_blank" rel="noopener noreferrer" className="hover:text-white transition block p-1 -m-1">+91 8608609661</a></li>
            <li className="p-1 -m-1">Madurai, India</li>
          </ul>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-800 py-4 text-center text-gray-500 text-xs md:text-sm">
        © 2026 Trapped Into Architecture. All rights reserved.
      </div>
    </footer>
  );
}