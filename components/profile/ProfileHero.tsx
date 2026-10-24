"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Camera,
  HelpCircle,
  X,
  Award,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getBadgeDetails, BadgeTier } from "@/utils/profileCompletion";

interface ProfileHeroProps {
  user: any;
  isOwner: boolean;
  totalExpFormatted: string;
  badgeTier: BadgeTier;
  isVip: boolean;
  onAvatarUpdate: (newUrl: string) => void;
}

export default function ProfileHero({
  user,
  isOwner,
  totalExpFormatted,
  badgeTier,
  isVip,
  onAvatarUpdate,
}: ProfileHeroProps) {
  const [likesCount, setLikesCount] = useState<number>(user.likes_count || 0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [showBadgeModal, setShowBadgeModal] = useState<boolean>(false);

  // Helper to safely get the current logged in user's profile ID
  const getLoggedInUserId = async (): Promise<string | null> => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.id) return u.id;
        if (u?.username || u?.email) {
          const { data } = await supabase
            .from("profiles")
            .select("id")
            .eq(u.username ? "username" : "email", u.username || u.email)
            .maybeSingle();
          if (data?.id) {
            localStorage.setItem("currentUser", JSON.stringify({ ...u, id: data.id }));
            return data.id;
          }
        }
      }
      const { data: authData } = await supabase.auth.getUser();
      return authData?.user?.id || null;
    } catch (e) {
      console.error("Error resolving logged in user ID:", e);
      return null;
    }
  };

  // Sync likesCount when user changes
  useEffect(() => {
    setLikesCount(user.likes_count || 0);
  }, [user.likes_count]);

  // Check if current visitor has liked this profile (localStorage cache + Supabase DB)
  useEffect(() => {
    const checkUserLike = async () => {
      if (!user?.id) return;

      try {
        const localLiked = JSON.parse(localStorage.getItem("liked_profiles") || "[]");
        if (Array.isArray(localLiked) && localLiked.includes(user.id)) {
          setHasLiked(true);
        }
      } catch (e) {}

      const loggedInUserId = await getLoggedInUserId();
      if (!loggedInUserId) return;

      try {
        const { data: likeRecord } = await supabase
          .from("profile_likes")
          .select("id")
          .eq("profile_id", user.id)
          .eq("user_id", loggedInUserId)
          .maybeSingle();

        if (likeRecord) {
          setHasLiked(true);
          const localLiked = JSON.parse(localStorage.getItem("liked_profiles") || "[]");
          if (!localLiked.includes(user.id)) {
            localStorage.setItem("liked_profiles", JSON.stringify([...localLiked, user.id]));
          }
        } else {
          const localLiked = JSON.parse(localStorage.getItem("liked_profiles") || "[]");
          if (localLiked.includes(user.id)) {
            localStorage.setItem(
              "liked_profiles",
              JSON.stringify(localLiked.filter((id: string) => id !== user.id))
            );
            setHasLiked(false);
          }
        }
      } catch (err) {
        console.error("Error checking profile like status:", err);
      }
    };

    checkUserLike();
  }, [user?.id]);

  const handleToggleLike = async () => {
    if (likeLoading) return;

    const loggedInUserId = await getLoggedInUserId();
    if (!loggedInUserId) {
      alert("Please log in first to like this profile.");
      return;
    }

    setLikeLoading(true);

    try {
      if (hasLiked) {
        const { error } = await supabase
          .from("profile_likes")
          .delete()
          .eq("profile_id", user.id)
          .eq("user_id", loggedInUserId);

        if (!error) {
          setHasLiked(false);
          setLikesCount((prev) => Math.max(0, prev - 1));

          const localLiked = JSON.parse(localStorage.getItem("liked_profiles") || "[]");
          localStorage.setItem(
            "liked_profiles",
            JSON.stringify(localLiked.filter((id: string) => id !== user.id))
          );

          await supabase
            .from("profiles")
            .update({ likes_count: Math.max(0, (user.likes_count || likesCount) - 1) })
            .eq("id", user.id);
        }
      } else {
        const { error } = await supabase
          .from("profile_likes")
          .insert({ profile_id: user.id, user_id: loggedInUserId });

        if (!error) {
          setHasLiked(true);
          setLikesCount((prev) => prev + 1);

          const localLiked = JSON.parse(localStorage.getItem("liked_profiles") || "[]");
          if (!localLiked.includes(user.id)) {
            localStorage.setItem("liked_profiles", JSON.stringify([...localLiked, user.id]));
          }

          await supabase
            .from("profiles")
            .update({ likes_count: (user.likes_count || likesCount) + 1 })
            .eq("id", user.id);
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      let uploadedUrl = "";
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "/profiles");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          if (data.url) uploadedUrl = data.url;
        }
      } catch (e) {
        console.warn("Upload fallback:", e);
      }

      if (!uploadedUrl) {
        uploadedUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      onAvatarUpdate(uploadedUrl);
    } catch (err) {
      console.error("Error uploading photo:", err);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const badge = getBadgeDetails(badgeTier, isVip);
  const avatarSrc = user.profileImage || user.avatar_url;

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start justify-between">
          {/* Left: Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar with optional VIP ring */}
            <div className="relative group shrink-0">
              <div
                className={`w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 bg-gray-50 flex items-center justify-center shadow-inner ${
                  isVip
                    ? "border-amber-400 ring-4 ring-amber-200"
                    : "border-gray-200"
                }`}
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={user.fullName || user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl md:text-5xl">👤</span>
                )}
              </div>

              {isOwner && (
                <label
                  className="absolute bottom-1 right-1 bg-black hover:bg-gray-800 text-white p-2.5 rounded-full cursor-pointer shadow-md transition transform hover:scale-105"
                  title="Change Profile Photo"
                >
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              )}

              {uploadingImage && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  Uploading...
                </div>
              )}
            </div>

            {/* User Details */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                  {user.fullName || user.displayName || user.username}
                </h1>

                {/* COA Verified Badge */}
                {user.coa_number && user.coa_is_active && (
                  <span
                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    title={`Registered COA: ${user.coa_number}`}
                  >
                    <ShieldCheck size={13} className="text-blue-600" />
                    COA Verified
                  </span>
                )}

                {/* VIP Status */}
                {isVip && (
                  <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    <Sparkles size={12} />
                    VIP Member
                  </span>
                )}
              </div>

              <p className="text-gray-500 text-sm font-medium mb-3">
                @{user.username}
              </p>

              {/* LinkedIn-style Tagline */}
              {user.tagline ? (
                <p className="text-base text-gray-700 font-medium mb-4 max-w-2xl leading-relaxed">
                  {user.tagline}
                </p>
              ) : isOwner ? (
                <p className="text-sm italic text-gray-400 mb-4">
                  Add a headline / tagline to stand out on the platform
                </p>
              ) : null}

              {/* Badges / Track / Experience Row */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* User Track: Job Seeker / Recruiter */}
                <span
                  className={`px-3 py-1 rounded-full font-semibold border ${
                    user.user_track === "recruiter"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {user.user_track === "recruiter" ? "🏢 Recruiter / Firm" : "🎯 Job Seeker"}
                </span>

                {/* Tier Badge with interactive Question Mark (?) button */}
                <div className="inline-flex items-center gap-1">
                  <span
                    className={`px-3 py-1 rounded-full font-semibold border flex items-center gap-1 ${badge.bg} ${badge.color} ${badge.border}`}
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.title}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowBadgeModal(true)}
                    className="w-5 h-5 rounded-full bg-gray-100 hover:bg-black hover:text-white text-gray-600 flex items-center justify-center text-[11px] font-bold transition shadow-xs cursor-pointer"
                    title="Click to view badge tiers & percentage scoring chart"
                  >
                    ?
                  </button>
                </div>

                {/* Profession */}
                {user.profession && (
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">
                    {user.profession}
                  </span>
                )}

                {/* Experience Duration */}
                {totalExpFormatted && totalExpFormatted !== "Fresher / No experience added" && (
                  <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1 rounded-full font-medium">
                    <Briefcase size={12} className="text-gray-500" />
                    {totalExpFormatted}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Likes Action Button */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 gap-3">
            <button
              onClick={handleToggleLike}
              disabled={likeLoading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition border shadow-sm ${
                hasLiked
                  ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                  : "bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:text-red-600"
              }`}
            >
              <Heart
                size={18}
                className={`transition transform ${
                  hasLiked
                    ? "fill-red-600 text-red-600 scale-110"
                    : "text-gray-400 group-hover:text-red-500"
                }`}
              />
              <span>{hasLiked ? "Liked" : "Like Profile"}</span>
              <span
                className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                  hasLiked
                    ? "bg-red-200 text-red-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {likesCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* BADGE TIERS & SCORING BREAKDOWN MODAL */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-gray-100 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Award size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    Profile Badges & Scoring System
                  </h3>
                  <p className="text-xs text-gray-500">
                    How levels are calculated and points distributed
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowBadgeModal(false)}
                className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* SECTION 1: BADGE TIERS & PERCENTAGE RANGES */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                1. Member Levels & Required Scores
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl border border-amber-200 bg-amber-50/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥉</span>
                    <div>
                      <p className="font-bold text-amber-900">Bronze Member</p>
                      <p className="text-[11px] text-amber-700">Basic identification & profile start</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-amber-200 text-amber-800">
                    20% – 49%
                  </span>
                </div>

                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥈</span>
                    <div>
                      <p className="font-bold text-slate-800">Silver Member</p>
                      <p className="text-[11px] text-slate-600">Core details & education added</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-800">
                    50% – 69%
                  </span>
                </div>

                <div className="p-3 rounded-2xl border border-yellow-300 bg-yellow-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥇</span>
                    <div>
                      <p className="font-bold text-yellow-900">Gold Member</p>
                      <p className="text-[11px] text-yellow-700">Detailed degrees, bio & experience</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-yellow-300 text-yellow-900">
                    70% – 84%
                  </span>
                </div>

                <div className="p-3 rounded-2xl border border-cyan-200 bg-cyan-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💎</span>
                    <div>
                      <p className="font-bold text-cyan-900">Platinum Member</p>
                      <p className="text-[11px] text-cyan-700">Comprehensive professional portfolio</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-cyan-200 text-cyan-900">
                    85% – 94%
                  </span>
                </div>

                <div className="p-3 rounded-2xl border border-purple-200 bg-purple-50/80 flex items-center justify-between sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👑</span>
                    <div>
                      <p className="font-bold text-purple-900">Diamond Member</p>
                      <p className="text-[11px] text-purple-700">Complete architectural dossier across all fields</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-white border border-purple-200 text-purple-900">
                    95% – 100%
                  </span>
                </div>

                <div className="p-3 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 flex items-center justify-between sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <div>
                      <p className="font-bold text-amber-950">VIP User Status</p>
                      <p className="text-[11px] text-amber-800">Special privilege for 95%+ completion + Active COA Architect or Vetted Recruiter</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-xs px-2 py-1 rounded-lg bg-amber-400 text-black">
                    Elite
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 2: FIELD DISTRIBUTION TABLE */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                2. Field Distribution & Points Chart (Total: 100%)
              </h4>

              <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Field / Requirement</th>
                      <th className="py-2.5 px-3 text-center">Type</th>
                      <th className="py-2.5 px-3 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* Basic Identity */}
                    <tr className="hover:bg-gray-50">
                      <td className="py-2 px-3 font-semibold text-gray-900" rowSpan={6}>
                        Basic Identity<br/>
                        <span className="text-[10px] text-gray-500 font-normal">(40% total)</span>
                      </td>
                      <td className="py-2 px-3 text-gray-700">Full Name & Username</td>
                      <td className="py-2 px-3 text-center"><span className="text-red-500 font-bold">Required</span></td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-700">Profile Picture / Avatar</td>
                      <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">10%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-700">Professional Tagline (Headline)</td>
                      <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-700">About Me / Professional Bio</td>
                      <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">10%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-700">Date of Birth & Gender</td>
                      <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-700">Phone Number & Email</td>
                      <td className="py-2 px-3 text-center"><span className="text-red-500 font-bold">Required</span></td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                    </tr>

                    {/* Professional Credentials */}
                    <tr className="hover:bg-gray-50 bg-gray-50/50">
                      <td className="py-2 px-3 font-semibold text-gray-900" rowSpan={2}>
                        Credentials<br/>
                        <span className="text-[10px] text-gray-500 font-normal">(20% total)</span>
                      </td>
                      <td className="py-2 px-3 text-gray-700">Profession Selection</td>
                      <td className="py-2 px-3 text-center"><span className="text-red-500 font-bold">Required</span></td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">10%</td>
                    </tr>
                    <tr className="hover:bg-gray-50 bg-gray-50/50">
                      <td className="py-2 px-3 text-gray-700">COA Registration (or Highest Qual for Students)</td>
                      <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">10%</td>
                    </tr>

                    {/* Education */}
                    <tr className="hover:bg-gray-50">
                      <td className="py-2 px-3 font-semibold text-gray-900" rowSpan={2}>
                        Education<br/>
                        <span className="text-[10px] text-gray-500 font-normal">(20% total)</span>
                      </td>
                      <td className="py-2 px-3 text-gray-700">At least 1 Education entry (UG / PG / PhD / School)</td>
                      <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">15%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-700">Separation of University & College (or Board & School)</td>
                      <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                    </tr>

                    {/* Experience */}
                    <tr className="hover:bg-gray-50 bg-gray-50/50">
                      <td className="py-2 px-3 font-semibold text-gray-900" rowSpan={2}>
                        Experience<br/>
                        <span className="text-[10px] text-gray-500 font-normal">(20% total)</span>
                      </td>
                      <td className="py-2 px-3 text-gray-700">At least 1 Work Experience or Internship entry</td>
                      <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">15%</td>
                    </tr>
                    <tr className="hover:bg-gray-50 bg-gray-50/50">
                      <td className="py-2 px-3 text-gray-700">Organization Type & Responsibilities filled</td>
                      <td className="py-2 px-3 text-center text-gray-500">Optional</td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">5%</td>
                    </tr>

                    {/* Total Row */}
                    <tr className="bg-black text-white font-bold">
                      <td className="py-2.5 px-3" colSpan={3}>Total Profile Score</td>
                      <td className="py-2.5 px-3 text-right text-sm">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowBadgeModal(false)}
                className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
