"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ShareButtons({ url, jobId, initialShares = 0 }: { url: string, jobId: string, initialShares?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(initialShares);

  const trackShare = async () => {
    // Optimistic UI update
    setShareCount(prev => prev + 1);
    
    try {
      const { data } = await supabase.from('jobs').select('share_count').eq('id', jobId).single();
      if (data) {
        await supabase.from('jobs').update({ share_count: (data.share_count || 0) + 1 }).eq('id', jobId);
      }
    } catch (err) {
      console.error("Error tracking share", err);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackShare();
    setIsOpen(false);
  };

  const shareLinks = [
    { name: "WhatsApp", icon: <span className="font-bold">💬</span>, href: `https://wa.me/?text=${encodeURIComponent(url)}` },
    { name: "Facebook", icon: <span className="font-bold text-blue-600">f</span>, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: "X (Twitter)", icon: <span className="font-bold text-[14px]">X</span>, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}` },
    { name: "Email", icon: <span>✉️</span>, href: `mailto:?subject=Check out this job&body=${encodeURIComponent(url)}` },
  ];

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          <Share2 size={16} /> Share
        </button>
        <span className="text-sm text-gray-500">↗ {shareCount} shares</span>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 p-2 animate-in fade-in zoom-in duration-200">
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          
          <div className="h-px bg-gray-100 my-1 mx-2" />
          
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackShare();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
            >
              {link.icon}
              {link.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
