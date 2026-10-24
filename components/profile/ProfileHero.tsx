"use client";

import React, { useState, useEffect } from "react";
import { Heart, Sparkles, ShieldCheck, Briefcase, Camera } from "lucide-react";
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

  // Sync likesCount when user changes
  useEffect(() => {
    setLikesCount(user.likes_count || 0);
  }, [user.likes_count]);

  // Check if current visitor has liked this profile
  useEffect(() => {
    const checkUserLike = async () => {
      try {
        const storedUser = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
        let loggedInUserId = storedUser ? JSON.parse(storedUser)?.id : null;

        if (!loggedInUserId) {
          const { data } = await supabase.auth.getUser();
          loggedInUserId = data?.user?.id;
        }

        if (!loggedInUserId || !user?.id) return;

        const { data: likeRecord } = await supabase
          .from("profile_likes")
          .select("id")
          .eq("profile_id", user.id)
          .eq("user_id", loggedInUserId)
          .maybeSingle();

        if (likeRecord) {
          setHasLiked(true);
        }
      } catch (err) {
        console.error("Error checking profile like status:", err);
      }
    };

    checkUserLike();
  }, [user?.id]);

  const handleToggleLike = async () => {
    if (likeLoading) return;

    const storedUser = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
    let loggedInUserId = storedUser ? JSON.parse(storedUser)?.id : null;

    if (!loggedInUserId) {
      const { data } = await supabase.auth.getUser();
      loggedInUserId = data?.user?.id;
    }

    if (!loggedInUserId) {
      alert("Please log in to like this profile.");
      return;
    }

    setLikeLoading(true);

    try {
      if (hasLiked) {
        // Unlike
        const { error } = await supabase
          .from("profile_likes")
          .delete()
          .eq("profile_id", user.id)
          .eq("user_id", loggedInUserId);

        if (!error) {
          setHasLiked(false);
          setLikesCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        // Like
        const { error } = await supabase
          .from("profile_likes")
          .insert({ profile_id: user.id, user_id: loggedInUserId });

        if (!error) {
          setHasLiked(true);
          setLikesCount((prev) => prev + 1);
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
      // 1. Try ImageKit upload endpoint if available
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
        console.warn("ImageKit upload error, falling back to base64 / Supabase:", e);
      }

      // 2. Fallback to Supabase Storage or FileReader
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

              {/* Tier Badge */}
              <span
                className={`px-3 py-1 rounded-full font-semibold border flex items-center gap-1 ${badge.bg} ${badge.color} ${badge.border}`}
              >
                <span>{badge.icon}</span>
                <span>{badge.title}</span>
              </span>

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
  );
}
