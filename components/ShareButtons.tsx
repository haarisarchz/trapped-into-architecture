"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Share, Copy, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatWhatsAppPost } from "@/utils/socialFormats";

export default function ShareButtons({ 
  url, 
  jobId, 
  companyName, 
  position, 
  organizationType,
  area,
  city,
  state,
  experience,
  employmentType,
  initialShares = 0,
  variant = "icon"
}: { 
  url: string, 
  jobId: string, 
  companyName: string,
  position: string,
  organizationType?: string,
  area?: string,
  city?: string,
  state?: string,
  experience?: any,
  employmentType?: string,
  initialShares?: number,
  variant?: "icon" | "button" | "statistic"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [shareCount, setShareCount] = useState(initialShares);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    async function fetchBatchJobs() {
      if (!companyName) return;
      try {
        if (jobId) {
          const { data: currentJob } = await supabase
            .from("jobs")
            .select("firm_name, posted_date, image")
            .eq("id", jobId)
            .maybeSingle();

          if (currentJob) {
            let query = supabase
              .from("jobs")
              .select("id, position, experience, employment_type")
              .eq("firm_name", currentJob.firm_name || companyName)
              .eq("status", "published");

            if (currentJob.posted_date) {
              query = query.eq("posted_date", currentJob.posted_date);
            } else {
              query = query.is("posted_date", null);
            }

            if (currentJob.image) {
              query = query.eq("image", currentJob.image);
            }

            const { data: siblings } = await query;
            if (siblings && siblings.length > 0) {
              setActiveJobs(siblings);
              return;
            }
          }
        }

        const { data } = await supabase
          .from("jobs")
          .select("id, position, experience, employment_type")
          .eq("firm_name", companyName)
          .eq("status", "published");
        if (data) {
          setActiveJobs(data);
        }
      } catch (err) {
        console.error("Error fetching batch jobs", err);
      }
    }
    fetchBatchJobs();
  }, [companyName, jobId]);

  useEffect(() => {
    setShareCount(initialShares);
  }, [initialShares]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    function updatePosition() {
      if (isOpen && buttonRef.current && !isMobile) {
        const rect = buttonRef.current.getBoundingClientRect();
        // check if it would go off bottom
        const goesOffBottom = rect.bottom + 300 > window.innerHeight;
        
        setMenuStyle({
          position: "fixed",
          top: goesOffBottom ? 'auto' : rect.bottom + 8,
          bottom: goesOffBottom ? window.innerHeight - rect.top + 8 : 'auto',
          left: rect.right - 224 > 0 ? rect.right - 224 : rect.left,
          width: "224px",
          zIndex: 999999
        });
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      updatePosition();
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, isMobile]);

  const trackShare = async (platform: string = "whatsapp") => {
    let userId = null;
    let userName = null;
    let userEmail = null;
    let userRole = "guest";

    try {
      const stored = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("currentUser") || "null") : null;
      if (stored) {
        userId = stored.id || null;
        userName = stored.full_name || stored.display_name || stored.username || stored.email || null;
        userEmail = stored.email || null;
        userRole = (stored.role || "user").toLowerCase().trim();
      }
    } catch (e) {}

    // Check if the current user is an admin: CEO, Super Admin, Job Admin, Admin
    const normRole = userRole.toLowerCase().replace(/[\s_-]+/g, "");
    const isAdmin = ["superadmin", "admin", "jobadmin", "ceo"].includes(normRole) || normRole.includes("admin") || normRole === "ceo";

    // Admin shares are NOT recorded in analytics or job share counts
    if (isAdmin) {
      return;
    }

    setShareCount(prev => prev + 1);
    try {
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "share_click", { job_id: jobId, firm_name: companyName, position, platform });
      }
    } catch (e) {}

    try {
      if (jobId) {
        await fetch("/api/jobs/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId,
            userId,
            userName,
            userEmail,
            userRole: userId ? (userRole || "user") : "unregistered",
            platform,
          })
        });
      }
    } catch (err) {
      console.warn("Share track error", err);
    }
  };

  const getShareText = () => {
    const jobsToFormat = activeJobs && activeJobs.length > 0
      ? activeJobs.map(j => ({ ...j, firm_name: companyName, city, state, area }))
      : [{ firm_name: companyName, position, experience, employment_type: employmentType, city, state, area }];
    return formatWhatsAppPost(jobsToFormat, url);
  };

  const copyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      trackShare("copy_link");
      setTimeout(() => { setCopied(false); setIsOpen(false); }, 1500);
    } catch (err) {
      console.warn("Copy link failed", err);
    }
  };

  const copyText = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const textToCopy = getShareText();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedText(true);
      trackShare("copy_text");
      setTimeout(() => { setCopiedText(false); setIsOpen(false); }, 1500);
    } catch (err) {
      console.warn("Copy post failed", err);
    }
  };

  const shareText = encodeURIComponent(getShareText());
  const encodedUrl = encodeURIComponent(url);
  
  const addUtm = (targetUrl: string, source: string) => {
    if (!targetUrl) return "";
    return targetUrl.includes("?") 
      ? `${targetUrl}&utm_source=${source}&utm_medium=social` 
      : `${targetUrl}?utm_source=${source}&utm_medium=social`;
  };

  const shareLinks = [
    { name: "WhatsApp", href: `https://api.whatsapp.com/send?text=${shareText}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(addUtm(url, "facebook"))}` },
    { name: "X", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(addUtm(url, "twitter"))}&text=${encodeURIComponent((activeJobs.length > 1 ? activeJobs.map(j => j.position).join(', ') : position) + ' at ' + companyName + '\n')}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(addUtm(url, "linkedin"))}` },
    { name: "Telegram", href: `https://t.me/share/url?url=${encodeURIComponent(addUtm(url, "telegram"))}&text=${shareText}` }
  ];

  if (variant === "statistic") {
    return (
      <div className="flex items-center gap-1.5 text-gray-700 font-semibold text-lg px-2 py-1.5" aria-label="Share count">
        <Share size={18} className="text-gray-500" /> {shareCount}
      </div>
    );
  }

  const renderMenu = () => {
    if (!isOpen || typeof document === 'undefined') return null;
    
    const menuContent = (
      <div 
        ref={menuRef}
        className={isMobile ? "fixed left-0 bottom-0 w-full bg-white border-t border-gray-100 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-[999999] p-4 text-left pb-10" : "bg-white border border-gray-100 rounded-xl shadow-2xl p-2 text-left"}
        style={isMobile ? {} : menuStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {isMobile && (
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="font-bold text-lg">Share Job</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 text-xl font-bold p-2">&times;</button>
          </div>
        )}
        <button
          onClick={copyLink}
          className={`w-full flex items-center justify-between px-3 ${isMobile ? 'py-4 text-base' : 'py-2 text-sm'} text-gray-700 hover:bg-gray-50 rounded-lg transition font-medium`}
        >
          <span className="flex items-center gap-3">
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            {copied ? "Copied Link!" : "Copy Link"}
          </span>
        </button>
        <button
          onClick={copyText}
          className={`w-full flex items-center justify-between px-3 ${isMobile ? 'py-4 text-base' : 'py-2 text-sm'} text-gray-700 hover:bg-gray-50 rounded-lg transition font-medium`}
        >
          <span className="flex items-center gap-3">
            {copiedText ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            {copiedText ? "Copied with Formatting!" : "Copy with Formatting"}
          </span>
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
              trackShare(link.name.toLowerCase());
              setIsOpen(false);
            }}
            className={`flex items-center gap-3 px-3 ${isMobile ? 'py-4 text-base' : 'py-2 text-sm'} text-gray-700 hover:bg-gray-50 rounded-lg transition`}
          >
            <span className="font-semibold">{link.name}</span>
          </a>
        ))}
      </div>
    );
    
    // On mobile, render fixed at root. On desktop, render fixed at root (menuStyle has coordinates)
    return createPortal(menuContent, document.body);
  };

  return (
    <>
      {variant === "icon" ? (
        <div className="flex items-center gap-1">
          <button
            ref={buttonRef}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
            aria-label={`Share ${position} job`}
            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition"
          >
            <Share size={18} />
          </button>
          <span className="text-sm font-semibold text-gray-700">{shareCount}</span>
        </div>
      ) : (
        <button
          ref={buttonRef}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
          aria-label={`Share ${position} job`}
          className="flex items-center justify-center gap-2 w-full md:w-auto bg-white border-2 border-gray-200 text-black px-6 py-3 rounded-xl text-base font-semibold hover:bg-gray-50 transition"
        >
          <Share size={20} /> Share ({shareCount})
        </button>
      )}
      {renderMenu()}
    </>
  );
}
