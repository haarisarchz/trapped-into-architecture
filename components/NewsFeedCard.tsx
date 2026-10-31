"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
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
  X,
  MessageCircle,
  ExternalLink,
  ChevronRight
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
  { emoji: "👍", label: "Like", icon: "thumbs" },
  { emoji: "🔥", label: "Fire", icon: "fire" },
  { emoji: "🚀", label: "Launch", icon: "rocket" },
  { emoji: "❤️", label: "Love", icon: "heart" },
  { emoji: "👏", label: "Clap", icon: "clap" },
  { emoji: "💡", label: "Insightful", icon: "bulb" },
];

export default function NewsFeedCard({
  item,
  isPrivilegedAdmin,
  onEdit,
  onDelete,
}: NewsFeedCardProps) {
  // Reaction states
  const [reactions, setReactions] = useState<{ [emoji: string]: number }>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Initialize reactions from localStorage + deterministic seed
  useEffect(() => {
    try {
      const storageKey = `tia_reactions_${item.id}`;
      const savedUserKey = `tia_my_reaction_${item.id}`;

      const savedCounts = localStorage.getItem(storageKey);
      const savedReaction = localStorage.getItem(savedUserKey);

      if (savedCounts) {
        setReactions(JSON.parse(savedCounts));
      } else {
        // Base seed so posts feel lively and vibrant
        const seedCounts: { [emoji: string]: number } = {
          "🔥": 12,
          "🚀": 8,
          "👍": 15,
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

  // Click outside listener for popovers
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
      // Unreact
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

  const shareText = `Explore "${item.title}" on Trapped Into Architecture:`;
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
        year: "numeric",
      })
    : "Recently";

  return (
    <article
      id={item.id}
      className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-gray-200/80 hover:shadow-md hover:border-gray-300 transition duration-200 relative group"
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              item.badge_color || "bg-amber-100 text-amber-800 border-amber-300"
            }`}
          >
            {item.category}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar size={13} />
            <span>{dateStr}</span>
            <span>•</span>
            <span className="font-semibold text-gray-600">
              {item.author || "Platform Editorial"}
            </span>
          </div>

          {/* ADMIN ONLY CONTROLS (CEO / SuperAdmin) */}
          {isPrivilegedAdmin && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200">
              <button
                onClick={() => onEdit(item)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition"
                title="Edit Announcement"
              >
                <Edit2 size={12} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="text-gray-400 hover:text-red-600 p-1 rounded-lg transition"
                title="Delete Announcement"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl md:text-2xl font-bold text-gray-950 mb-3 hover:text-amber-600 transition">
        {item.title}
      </h2>

      {/* Summary */}
      <p className="text-gray-600 leading-relaxed mb-5 text-sm md:text-base">
        {item.summary}
      </p>

      {/* Feature Highlights Breakdown */}
      {item.feature_highlights && item.feature_highlights.length > 0 && (
        <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 mb-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Layers size={13} className="text-amber-600" />
            <span>Feature Breakdown</span>
          </div>
          {item.feature_highlights.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700">
              <CheckCircle2 size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 font-semibold">{feat.feature}: </strong>
                <span>{feat.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Action Bar: CTA + Emoji Reactions + Share */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-100">
        {/* Left: Action CTA Button */}
        <div>
          {item.link_url && (
            <Link
              href={item.link_url}
              className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold bg-gray-100 hover:bg-black hover:text-white text-gray-900 px-4 py-2 rounded-xl transition duration-150"
            >
              <span>{item.link_text || "Explore Section"}</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Right: Reactions & Share */}
        <div className="flex items-center gap-2">
          {/* Reaction Chips */}
          <div className="flex items-center gap-1.5">
            {Object.entries(reactions)
              .filter(([_, count]) => count > 0)
              .map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                    userReaction === emoji
                      ? "bg-amber-50 text-amber-900 border-amber-300 shadow-xs"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="text-[11px] text-gray-600 font-bold">{count}</span>
                </button>
              ))}

            {/* Emoji Reaction Picker Button */}
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 rounded-xl border transition flex items-center justify-center ${
                  userReaction
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600"
                }`}
                title="React with emoji"
              >
                <ThumbsUp size={15} />
              </button>

              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 flex items-center gap-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                  {AVAILABLE_EMOJIS.map((e) => (
                    <button
                      key={e.emoji}
                      onClick={() => handleReact(e.emoji)}
                      className={`text-lg hover:scale-125 transition-transform p-1.5 rounded-xl hover:bg-gray-100 ${
                        userReaction === e.emoji ? "bg-amber-100" : ""
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

          {/* Share Button & Popover */}
          <div className="relative" ref={shareRef}>
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl border border-gray-200 transition"
              title="Share Announcement"
            >
              <Share2 size={14} className="text-gray-500" />
              <span>Share</span>
            </button>

            {/* Share Dropdown */}
            {showShareMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-30 animate-in fade-in duration-100 space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Share Update
                </div>

                {/* WhatsApp */}
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-800 transition"
                >
                  <MessageCircle size={15} className="text-emerald-600" />
                  <span>WhatsApp Community</span>
                </a>

                {/* Telegram */}
                <a
                  href={shareLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-800 hover:bg-blue-50 hover:text-blue-800 transition"
                >
                  <ExternalLink size={15} className="text-blue-500" />
                  <span>Telegram Channel</span>
                </a>

                {/* LinkedIn */}
                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-800 hover:bg-indigo-50 hover:text-indigo-800 transition"
                >
                  <ExternalLink size={15} className="text-indigo-600" />
                  <span>LinkedIn Post</span>
                </a>

                {/* Twitter / X */}
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-800 hover:bg-gray-100 hover:text-black transition"
                >
                  <ExternalLink size={15} className="text-gray-700" />
                  <span>X (Twitter)</span>
                </a>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-800 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-2.5">
                    {copied ? (
                      <Check size={15} className="text-emerald-600" />
                    ) : (
                      <Copy size={15} className="text-gray-500" />
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
