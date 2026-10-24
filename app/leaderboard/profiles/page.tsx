// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Heart,
  Sparkles,
  ShieldCheck,
  Briefcase,
  ArrowRight,
  Search,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { getBadgeDetails, BadgeTier } from "@/utils/profileCompletion";

const CATEGORIES = [
  { id: "all", label: "All Profiles" },
  { id: "architect", label: "Practising Architects" },
  { id: "academician", label: "Academicians" },
  { id: "student", label: "Students" },
  { id: "scholar", label: "Research Scholars" },
];

export default function ProfilesLeaderboardPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedCategory]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select(
          "id, username, full_name, display_name, tagline, profession, avatar_url, likes_count, badge_tier, is_vip, user_track, coa_number, coa_is_active"
        )
        .order("likes_count", { ascending: false })
        .limit(60);

      if (selectedCategory === "architect") {
        query = query.ilike("profession", "%Practising Architect%");
      } else if (selectedCategory === "academician") {
        query = query.ilike("profession", "%Academician%");
      } else if (selectedCategory === "student") {
        query = query.ilike("profession", "%Student%");
      } else if (selectedCategory === "scholar") {
        query = query.ilike("profession", "%Scholar%");
      }

      const { data, error } = await query;
      if (!error && data) {
        setProfiles(data);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.full_name && p.full_name.toLowerCase().includes(q)) ||
      (p.display_name && p.display_name.toLowerCase().includes(q)) ||
      (p.username && p.username.toLowerCase().includes(q)) ||
      (p.tagline && p.tagline.toLowerCase().includes(q))
    );
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { label: "1st", bg: "bg-amber-400 text-black border-amber-500", icon: "🥇" };
    if (rank === 2) return { label: "2nd", bg: "bg-slate-300 text-black border-slate-400", icon: "🥈" };
    if (rank === 3) return { label: "3rd", bg: "bg-amber-600 text-white border-amber-700", icon: "🥉" };
    return { label: `#${rank}`, bg: "bg-gray-100 text-gray-700 border-gray-200", icon: null };
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <section className="flex-1 py-10 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          {/* HEADER */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full mb-3">
              <Trophy size={14} />
              <span>Community Spotlight</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
              Profiles Leaderboard
            </h1>
            <p className="text-gray-600 mt-3 text-sm md:text-base">
              Discover the most appreciated architects, academicians, and design innovators on Trapped Into Architecture.
            </p>
          </div>

          {/* CONTROLS: CATEGORIES & SEARCH */}
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition ${
                      selectedCategory === cat.id
                        ? "bg-black text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:text-black hover:bg-gray-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or title..."
                  className="w-full pl-9 pr-4 py-2 text-xs md:text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* LEADERBOARD LIST */}
          {loading ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 text-gray-500 text-sm font-semibold">
              Loading top profiles...
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
              <Trophy size={44} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-800">No profiles found</h3>
              <p className="text-sm text-gray-500 mt-1">
                Try selecting another category or clearing your search query.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProfiles.map((p, index) => {
                const rank = index + 1;
                const rankBadge = getRankBadge(rank);
                const badgeInfo = getBadgeDetails((p.badge_tier as BadgeTier) || "bronze", p.is_vip);

                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-2xl p-4 md:p-5 border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md ${
                      rank <= 3 ? "border-amber-200/80 bg-amber-50/20" : "border-gray-200"
                    }`}
                  >
                    {/* Left: Rank & Avatar & Details */}
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm border shrink-0 ${rankBadge.bg}`}
                      >
                        {rankBadge.icon || rankBadge.label}
                      </div>

                      {/* Avatar */}
                      <Link href={`/profile/${p.username}`} className="shrink-0 group">
                        <div
                          className={`w-14 h-14 rounded-full overflow-hidden border-2 bg-gray-100 flex items-center justify-center transition group-hover:scale-105 ${
                            p.is_vip ? "border-amber-400 ring-2 ring-amber-200" : "border-gray-200"
                          }`}
                        >
                          {p.avatar_url ? (
                            <img
                              src={p.avatar_url}
                              alt={p.full_name || p.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">👤</span>
                          )}
                        </div>
                      </Link>

                      {/* User Info */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Link
                            href={`/profile/${p.username}`}
                            className="font-bold text-gray-900 text-base hover:underline truncate"
                          >
                            {p.full_name || p.display_name || p.username}
                          </Link>

                          {p.coa_number && p.coa_is_active && (
                            <span
                              className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200"
                              title={`COA Registered: ${p.coa_number}`}
                            >
                              <ShieldCheck size={11} className="text-blue-600" />
                              COA
                            </span>
                          )}

                          {p.is_vip && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                              <Sparkles size={11} />
                              VIP
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500">@{p.username}</p>

                        {p.tagline ? (
                          <p className="text-xs text-gray-700 mt-1 line-clamp-1 max-w-lg">
                            {p.tagline}
                          </p>
                        ) : null}

                        {/* Badges / Track row */}
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                          {p.profession && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                              {p.profession}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold border ${badgeInfo.bg} ${badgeInfo.color} ${badgeInfo.border}`}
                          >
                            {badgeInfo.icon} {badgeInfo.title}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Likes & View Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      {/* Likes Counter */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-100 text-red-600 font-bold text-sm">
                        <Heart size={16} className="fill-red-500 text-red-500" />
                        <span>{p.likes_count || 0}</span>
                      </div>

                      {/* View Profile Link */}
                      <Link
                        href={`/profile/${p.username}`}
                        className="flex items-center gap-1 bg-black hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm"
                      >
                        <span>View</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
