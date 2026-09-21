"use client";

import { useState, useEffect } from "react";
import { Heart, Share } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CompanyActions({
  slug,
  companyName,
  initialFavorites = 0,
  variant = "card", // "card" or "page"
}: {
  slug: string;
  companyName: string;
  initialFavorites?: number;
  variant?: "card" | "page";
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(initialFavorites);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setIsFavorite(user.favoriteCompanies?.includes(slug));
      }
      
      // Load global counts from localStorage as mock since we can't change DB
      const counts = JSON.parse(localStorage.getItem("companyFavoritesCounts") || "{}");
      if (counts[slug]) {
        setFavoriteCount(counts[slug]);
      }
    }
  }, [slug]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      alert("Please login first to favorite companies");
      return;
    }

    const favs = currentUser.favoriteCompanies || [];
    let newFavs;
    let newCount = favoriteCount;

    if (favs.includes(slug)) {
      newFavs = favs.filter((s: string) => s !== slug);
      newCount = Math.max(0, newCount - 1);
      setIsFavorite(false);
    } else {
      newFavs = [...favs, slug];
      newCount = newCount + 1;
      setIsFavorite(true);
    }
    setFavoriteCount(newCount);

    currentUser.favoriteCompanies = newFavs;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = users.map((u: any) =>
      u.username === currentUser.username ? currentUser : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    const counts = JSON.parse(localStorage.getItem("companyFavoritesCounts") || "{}");
    counts[slug] = newCount;
    localStorage.setItem("companyFavoritesCounts", JSON.stringify(counts));
  };

  const shareCompany = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/companies/${slug}`;
    const text = `Check out ${companyName} on Trapped Into Architecture!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: companyName,
          text: text,
          url: url,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  if (variant === "page") {
    return (
      <div className="flex items-center gap-4">
        <button
          onClick={toggleFavorite}
          className="flex flex-col items-center justify-center p-3 rounded-full hover:bg-gray-100 transition group"
          title="Favorite"
        >
          <Heart
            className={`w-8 h-8 transition ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-red-500"}`}
          />
          <span className="text-xs font-semibold mt-1 text-gray-500">{favoriteCount}</span>
        </button>

        <button
          onClick={shareCompany}
          className="flex flex-col items-center justify-center p-3 rounded-full hover:bg-gray-100 transition group"
          title="Share"
        >
          <Share className="w-8 h-8 text-gray-400 group-hover:text-black transition" />
          <span className="text-xs font-semibold mt-1 text-gray-500">Share</span>
        </button>
      </div>
    );
  }

  // Card variant
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggleFavorite}
        className="flex flex-col items-center group"
      >
        <Heart
          size={20}
          className={`transition ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-red-500"}`}
        />
        <span className="text-[10px] font-medium text-gray-500">{favoriteCount}</span>
      </button>

      <button
        onClick={shareCompany}
        className="flex flex-col items-center group"
      >
        <Share size={20} className="text-gray-400 group-hover:text-black transition" />
        <span className="text-[10px] font-medium text-gray-500">Share</span>
      </button>
    </div>
  );
}
