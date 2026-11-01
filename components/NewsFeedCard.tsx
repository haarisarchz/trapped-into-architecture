"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Layers,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Edit2,
  Trash2,
  ThumbsUp,
  MessageCircle,
  ExternalLink,
  Zap,
  Flame,
  Rocket,
  ShieldCheck,
  Clock
} from "lucide-react";

export interface FeedItem {
  id: string;
  category: string;
  badge_color?: string;
  title: string;
  author?: string;
  summary: string;
  feature_highlights?: Array<{ feature: string; desc: string }>;
  link_url?: string;
  link_text?: string;
  published_at?: string;
  status?: string;
}

interface NewsFeedCardProps {
  item: FeedItem;
  isPrivilegedAdmin: boolean;
  onEdit: (item: FeedItem) => void;
  onDelete: (id: string) => void;
}

const AVAILABLE_EMOJIS = [
  { emoji: "🔥", label: "Fire" },
  { emoji: "🚀", label: "Launch" },
  { emoji: "❤️", label: "Love" },
  { emoji: "👍", label: "Thumbs Up" },
  { emoji: "👏", label: "Clap" },
  { emoji: "💡", label: "Insightful" },
];

export default function NewsFeedCard({
  item,
  isPrivilegedAdmin,
  onEdit,
  onDelete,
}: NewsFeedCardProps) {
  const [reactions, setReactions] = useState<{ [emoji: string]: number }>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Initialize lively reactions from localStorage or seed
  useEffect(() => {
    try {
      const storageKey = `tia_reactions_${item.id}`;
      const savedUserKey = `tia_my_reaction_${item.id}`;

      const savedCounts = localStorage.getItem(storageKey);
      const savedReaction = localStorage.getItem(savedUserKey);

      if (savedCounts) {
        setReactions(JSON.parse(savedCounts));
      } else {
        // High-engagement baseline
        const seedCounts: { [emoji: string]: number } = {
          "🔥": 18,
          "🚀": 14,
          "❤️": 9,
        };
        setReactions(seedCounts);
      }

      if (savedReaction) {
        setUserReaction(savedReaction);
      }
    } catch {
      // Fallback
    }
  }, [item.id]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showShareMenu || showEmojiPicker) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showShareMenu, showEmojiPicker]);

  const handleReact = (emoji: string) => {
    const newReactions = { ...reactions };
    let newSelected: string | null = emoji;

    if (userReaction === emoji) {
      newReactions[emoji] = Math.max(0, (newReactions[emoji] || 1) - 1);
      newSelected = null;
    } else {
      if (userReaction && newReactions[userReaction]) {
        newReactions[userReaction] = Math.max(0, newReactions[userReaction] - 1);
      }
      newReactions[emoji] = (newReactions[emoji] || 0) + 1;
    }

    setReactions(newReactions);
    setUserReaction(newSelected);
    setShowEmojiPicker(false);

    try {
      localStorage.setItem(`tia_reactions_${item.id}`, JSON.stringify(newReactions));
      if (newSelected) {
        localStorage.setItem(`tia_my_reaction_${item.id}`, newSelected);
      } else {
        localStorage.removeItem(`tia_my_reaction_${item.id}`);
      }
    } catch {
      // Ignore
    }
  };

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/news-feed#${item.id}`;
    }
    return `https://www.trappedintoarchitecture.com/news-feed#${item.id}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Check out: "${item.title}" on Trapped Into Architecture:`;
  const shareUrl = getShareUrl();

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
  };

  const dateStr = item.published_at
    ? new Date(item.published_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Today";

  // Category chip style helper
  const getCategoryBadge = (cat: string) => {
    const lower = (cat || "").toLowerCase();
    if (lower.includes("feature")) {
      return {
        pill: "bg-emerald-500/10 text-emerald-700 border-emerald-300/80",
        label: "⚡ Feature Drop",
      };
    }
    if (lower.includes("hiring") || lower.includes("job") || lower.includes("career")) {
      return {
        pill: "bg-blue-500/10 text-blue-700 border-blue-300/80",
        label: "🔥 Job Radar",
      };
    }
    if (lower.includes("studio") || lower.includes("company")) {
      return {
        pill: "bg-purple-500/10 text-purple-700 border-purple-300/80",
        label: "🏛️ Studio Spotlight",
      };
    }
    return {
      pill: "bg-amber-500/10 text-amber-700 border-amber-300/80",
      label: `✨ ${cat}`,
    };
  };

  const catBadge = getCategoryBadge(item.category);

  return (
    <article
      id={item.id}
      className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-200/90 hover:border-gray-300 hover:shadow-md transition-all duration-200 relative group overflow-hidden"
    >
      {/* Top Header: Channel Avatar + Metadata + Admin Tools */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Brand Icon Avatar */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-black text-white flex items-center justify-center font-black text-xs shadow-xs tracking-wider shrink-0">
            TIA
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-gray-950">
                {item.author || "TIA Studio Desk"}
              </span>
              <CheckCircle2 size={14} className="text-amber-500 fill-amber-500/20" />
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 font-medium">{dateStr}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catBadge.pill}`}
              >
                {catBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* CEO / SuperAdmin Quick Edit Tools */}
        {isPrivilegedAdmin && (
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => onEdit(item)}
              className="text-gray-600 hover:text-black hover:bg-white p-1.5 rounded-lg transition"
              title="Edit Announcement"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="text-gray-400 hover:text-red-600 hover:bg-white p-1.5 rounded-lg transition"
              title="Delete Announcement"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Catchy Main Headline */}
      <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight mb-2.5 leading-snug hover:text-amber-600 transition">
        {item.title}
      </h2>

      {/* Snappy Hook / Summary */}
      <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4 font-normal">
        {item.summary}
      </p>

      {/* Clean, Simple Bullet Highlights (No Newspaper Wall-of-Text) */}
      {item.feature_highlights && item.feature_highlights.length > 0 && (
        <div className="bg-gray-50/90 rounded-2xl p-4 sm:p-5 border border-gray-100 mb-5 space-y-2.5">
          {item.feature_highlights.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
              <div className="leading-snug">
                <strong className="text-gray-950 font-bold">{feat.feature}: </strong>
                <span className="text-gray-600">{feat.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Action Bar: High-Impact CTA + Reactions + Share */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
        {/* Left: Punchy CTA Button */}
        <div>
          {item.link_url && (
            <Link
              href={item.link_url}
              className="inline-flex items-center gap-2 bg-gray-950 hover:bg-black text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition duration-150 shadow-xs group/btn"
            >
              <span>{item.link_text || "Explore"}</span>
              <ArrowRight
                size={14}
                className="group-hover/btn:translate-x-1 transition-transform"
              />
            </Link>
          )}
        </div>

        {/* Right: Tactile Emoji Reactions & Share */}
        <div className="flex items-center gap-2">
          {/* Reaction Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.entries(reactions)
              .filter(([_, count]) => count > 0)
              .map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition transform active:scale-90 ${
                    userReaction === emoji
                      ? "bg-amber-100 text-amber-950 border-amber-300 shadow-xs scale-105"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  <span className="text-sm">{emoji}</span>
                  <span className="text-[11px] font-extrabold">{count}</span>
                </button>
              ))}

            {/* Quick React Button */}
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 rounded-xl border transition flex items-center justify-center ${
                  userReaction
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-500 hover:text-black"
                }`}
                title="React"
              >
                <ThumbsUp size={14} />
              </button>

              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 flex items-center gap-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                  {AVAILABLE_EMOJIS.map((e) => (
                    <button
                      key={e.emoji}
                      onClick={() => handleReact(e.emoji)}
                      className={`text-lg hover:scale-125 transition-transform p-1.5 rounded-xl hover:bg-gray-100 ${
                        userReaction === e.emoji ? "bg-amber-100 scale-110" : ""
                      }`}
                      title={e.label}
                    >
                      {e.emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Share Button */}
          <div className="relative" ref={shareRef}>
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-black px-3 py-1.5 rounded-xl border border-gray-200 transition"
              title="Share Announcement"
            >
              <Share2 size={13} className="text-gray-500" />
              <span>Share</span>
            </button>

            {/* Share Popover */}
            {showShareMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-30 animate-in fade-in duration-100 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  Broadcast Update
                </div>

                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-800 transition"
                >
                  <MessageCircle size={15} className="text-emerald-600" />
                  <span>WhatsApp Community</span>
                </a>

                <a
                  href={shareLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-800 hover:bg-blue-50 hover:text-blue-800 transition"
                >
                  <ExternalLink size={15} className="text-blue-500" />
                  <span>Telegram Hub</span>
                </a>

                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-800 hover:bg-indigo-50 hover:text-indigo-800 transition"
                >
                  <ExternalLink size={15} className="text-indigo-600" />
                  <span>LinkedIn Post</span>
                </a>

                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-800 hover:bg-gray-100 hover:text-black transition"
                >
                  <ExternalLink size={15} className="text-gray-700" />
                  <span>X (Twitter)</span>
                </a>

                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-800 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-2.5">
                    {copied ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} className="text-gray-400" />
                    )}
                    <span>{copied ? "Link Copied!" : "Copy Link"}</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
