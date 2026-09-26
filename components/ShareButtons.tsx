"use client";
import { useState, useRef, useEffect } from "react";
import { Share, Copy, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ShareButtons({ 
  url, 
  jobId, 
  companyName, 
  position, 
  organizationType,
  city,
  state,
  initialShares = 0,
  variant = "icon"
}: { 
  url: string, 
  jobId: string, 
  companyName: string,
  position: string,
  organizationType?: string,
  city?: string,
  state?: string,
  initialShares?: number,
  variant?: "icon" | "button" | "statistic"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(initialShares);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync share count if initialShares changes from parent/polling
  useEffect(() => {
    setShareCount(initialShares);
  }, [initialShares]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trackShare = async () => {
    setShareCount(prev => prev + 1);
    try {
      await supabase.rpc('increment_share_count', { job_id: jobId });
    } catch (err) {
      console.error("Error tracking share", err);
    }
  };

  const getShareText = () => {
    let orgTypeLabel = organizationType 
      ? organizationType.charAt(0).toUpperCase() + organizationType.slice(1) 
      : "Firm";
    
    let text = `${orgTypeLabel} Name: ${companyName}\n`;
    
    // Format Location: City, State
    const locParts = [];
    if (city) locParts.push(city);
    if (state) locParts.push(state);
    if (locParts.length > 0) {
      text += `Location: ${locParts.join(", ")}\n`;
    }
    
    text += `Position: ${position}\n\n`;
    text += `For more details, visit:\n${url}`;
    return text;
  };

  const copyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackShare();
    setIsOpen(false);
  };

  const nativeShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${position} - ${companyName}`,
          text: getShareText(),
        });
        trackShare();
      } catch (err) {
        console.error("Native share failed", err);
      }
    }
    setIsOpen(false);
  };

  const shareText = encodeURIComponent(getShareText());
  const encodedUrl = encodeURIComponent(url);
  
  const shareLinks = [
    { name: "WhatsApp App", href: `https://api.whatsapp.com/send?text=${shareText}` },
      { name: "WhatsApp Web", href: `https://web.whatsapp.com/send?text=${shareText}` },
    { name: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${shareText}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: "Instagram", href: `https://www.instagram.com/` }, // IG doesn't support prefilled URL shares, link to app
    { name: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(position + ' at ' + companyName + '\n')}` },
    { name: "Email", href: `mailto:?subject=${encodeURIComponent(`${position} — ${companyName}`)}&body=${shareText}` },
  ];

  if (variant === "statistic") {
    return (
      <div className="flex items-center gap-1.5 text-gray-700 font-semibold text-lg px-2 py-1.5" aria-label="Share count">
        <Share size={18} className="text-gray-500" /> {shareCount}
      </div>
    );
  }

  return (
    <div className="relative inline-block" ref={menuRef}>
      {variant === "icon" ? (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            aria-label={`Share ${position} job`}
            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition"
          >
            <Share size={18} />
          </button>
          <span className="text-sm font-semibold text-gray-700">{shareCount}</span>
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          aria-label={`Share ${position} job`}
          className="flex items-center justify-center gap-2 w-full md:w-auto bg-white border-2 border-gray-200 text-black px-6 py-3 rounded-xl text-base font-semibold hover:bg-gray-50 transition"
        >
          <Share size={20} /> Share
        </button>
      )}

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 p-2 text-left">
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition font-medium"
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
              onClick={(e) => {
                e.stopPropagation();
                if(link.name === "Instagram") {
                  // Wait, no good way to prefill Instagram, just tracking share.
                }
                trackShare();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
            >
              <span className="font-semibold">{link.name}</span>
            </a>
          ))}
          
          {typeof navigator !== "undefined" && navigator.share && (
            <>
              <div className="h-px bg-gray-100 my-1 mx-2" />
              <button
                onClick={nativeShare}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition font-medium"
              >
                Native Share
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
