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
  const [loading, setLoading] = useState(false);
  const [tableExists, setTableExists] = useState(true);

  useEffect(() => {
    setFavoriteCount(initialFavorites);
  }, [initialFavorites]);

  useEffect(() => {
    const checkFavorited = async () => {
      const userStr = localStorage.getItem("currentUser");
      if (!userStr) return;
      try {
        const user = JSON.parse(userStr);
        let userId = user?.id;
        if (!userId && (user?.username || user?.email)) {
           const { data: pData } = await supabase.from('profiles').select('id').eq(user.username ? 'username' : 'email', user.username || user.email).maybeSingle();
           if (pData) userId = pData.id;
        }
        if (userId) {
          const { data, error } = await supabase
            .from("favorite_companies")
            .select("id")
            .eq("user_id", userId)
            .eq("company_slug", slug)
            .maybeSingle();
            
          if (error) {
              if (error.code === '42P01') setTableExists(false);
              return;
          }
          setIsFavorite(!!data);
        }
      } catch (err) {
        console.error("Error checking favorited state", err);
      }
    };
    checkFavorited();
  }, [slug]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!tableExists) {
        alert("The favorite companies feature is currently being set up. Please try again later.");
        return;
    }

    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      alert("Please register or log in first to favorite companies.");
      return;
    }

    let user;
    try {
      user = JSON.parse(userStr);
    } catch {
      alert("Please register or log in first to favorite companies.");
      return;
    }

    let userId = user?.id;
    if (!userId && (user?.username || user?.email)) {
       const { data: pData } = await supabase.from('profiles').select('id').eq(user.username ? 'username' : 'email', user.username || user.email).maybeSingle();
       if (pData) userId = pData.id;
    }
    
    if (!userId) {
      alert("Please register or log in first to favorite companies.");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (isFavorite) {
        setIsFavorite(false);
        setFavoriteCount(prev => Math.max(0, prev - 1));
        const { error } = await supabase.from("favorite_companies").delete().eq("user_id", userId).eq("company_slug", slug);
        if (error) throw error;
      } else {
        setIsFavorite(true);
        setFavoriteCount(prev => prev + 1);
        const { error } = await supabase.from("favorite_companies").insert({ user_id: userId, company_slug: slug });
        if (error) throw error;
      }
    } catch (err: any) {
      console.error("Error toggling favorite", err);
      if (err.code === '42P01') setTableExists(false);
      setIsFavorite(!isFavorite);
      setFavoriteCount(prev => isFavorite ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
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
        disabled={loading}
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