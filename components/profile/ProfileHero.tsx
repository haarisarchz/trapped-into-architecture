"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Camera,
  Building2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getBadgeDetails, BadgeTier } from "@/utils/profileCompletion";

interface ProfileHeroProps {
  user: any;
  isOwner: boolean;
  totalExpFormatted: string;
  badgeTier: BadgeTier;
  isVip: boolean;
  ownedCompanies?: any[];
  onAvatarUpdate: (newUrl: string) => void;
}

export default function ProfileHero({
  user,
  isOwner,
  totalExpFormatted,
  badgeTier,
  isVip,
  ownedCompanies = [],
  onAvatarUpdate,
}: ProfileHeroProps) {
  const [likesCount, setLikesCount] = useState<number>(user.likes_count || 0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/profile/${user.username}` : "";
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/profile/${user.username}` : "";
    const title = `${user.fullName || user.username}'s Architecture Profile`;
    const text = `Explore ${user.fullName || user.username}'s architectural profile, portfolio, and experience on Trapped Into Architecture!`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (e) {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

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

      const loggedInUserId = await getLoggedInUserId();

      // If user is on their own profile: Self-likes are strictly forbidden
      if (isOwner || (loggedInUserId && loggedInUserId === user.id)) {
        setHasLiked(false);

        // Clean up any historical self-like in database and local cache
        try {
          const localLiked = JSON.parse(localStorage.getItem("liked_profiles") || "[]");
          if (localLiked.includes(user.id)) {
            localStorage.setItem(
              "liked_profiles",
              JSON.stringify(localLiked.filter((id: string) => id !== user.id))
            );
          }

          await supabase
            .from("profile_likes")
            .delete()
            .eq("profile_id", user.id)
            .eq("user_id", user.id);

          // Get accurate non-self count
          const { count } = await supabase
            .from("profile_likes")
            .select("id", { count: "exact", head: true })
            .eq("profile_id", user.id);

          if (typeof count === "number" && count !== likesCount) {
            setLikesCount(count);
          }
        } catch (e) {}

        return;
      }

      // Check local cache for instant feedback
      try {
        const localLiked = JSON.parse(localStorage.getItem("liked_profiles") || "[]");
        if (Array.isArray(localLiked) && localLiked.includes(user.id)) {
          setHasLiked(true);
        }
      } catch (e) {}

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
  }, [user?.id, isOwner]);

  const handleToggleLike = async () => {
    if (likeLoading) return;

    const loggedInUserId = await getLoggedInUserId();
    if (!loggedInUserId) {
      alert("Please log in first to like this profile.");
      return;
    }

    // DISALLOW SELF-LIKE
    if (isOwner || loggedInUserId === user.id) {
      alert("You cannot like your own profile.");
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
              {/* Verified Recruiter Badge (Company Admin) */}
              {((ownedCompanies && ownedCompanies.length > 0) || user.is_recruiter) && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-full shadow-xs"
                  title={ownedCompanies && ownedCompanies.length > 0 ? `Verified Recruiter for ${ownedCompanies.map((c: any) => c.firm_name).join(', ')}` : "Verified Recruiter"}
                >
                  <Building2 size={12} className="text-indigo-600" />
                  <span>
                    Recruiter {ownedCompanies && ownedCompanies.length > 0 ? `• ${ownedCompanies[0].firm_name}` : ""}
                  </span>
                </span>
              )}

              {/* User Track: Job Seeker, Student, Recruiter, Academician, Freelancer, Explorer */}
              {(() => {
                const getTrackBadge = (track: string) => {
                  switch (track) {
                    case "student":
                      return { label: "🎓 Architecture Student", style: "bg-blue-50 text-blue-700 border-blue-200" };
                    case "recruiter":
                      return { label: "🏢 Recruiter / Firm", style: "bg-purple-50 text-purple-700 border-purple-200" };
                    case "academician":
                      return { label: "🏛️ Academician / Educator", style: "bg-amber-50 text-amber-800 border-amber-200" };
                    case "freelancer":
                      return { label: "💼 Freelancer / Consultant", style: "bg-teal-50 text-teal-700 border-teal-200" };
                    case "explorer":
                      return { label: "☕ Architecture Enthusiast", style: "bg-orange-50 text-orange-700 border-orange-200" };
                    case "job_seeker":
                    default:
                      return { label: "🎯 Job Seeker", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
                  }
                };
                const trackInfo = getTrackBadge(user.user_track);
                return (
                  <span className={`px-3 py-1 rounded-full font-semibold border ${trackInfo.style}`}>
                    {trackInfo.label}
                  </span>
                );
              })()}

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
              isOwner
                ? "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 cursor-pointer"
                : hasLiked
                ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 cursor-pointer"
                : "bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:text-red-600 cursor-pointer"
            }`}
            title={isOwner ? "You cannot like your own profile" : hasLiked ? "Unlike profile" : "Like profile"}
          >
            <Heart
              size={18}
              className={`transition transform ${
                isOwner
                  ? "text-gray-400"
                  : hasLiked
                  ? "fill-red-600 text-red-600 scale-110"
                  : "text-gray-400 group-hover:text-red-500"
              }`}
            />
            <span>{isOwner ? "Likes Received" : hasLiked ? "Liked" : "Like Profile"}</span>
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
