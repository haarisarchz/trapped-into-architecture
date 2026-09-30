"use client";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function FavoriteCompanyButton({
  companySlug,
  initialFavorites = 0,
  variant = "icon"
}: {
  companySlug: string;
  initialFavorites?: number;
  variant?: "icon" | "button" | "statistic";
}) {
  const [favoriteCount, setFavoriteCount] = useState(initialFavorites);
  const [isFavorited, setIsFavorited] = useState(false);
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
            .eq("company_slug", companySlug)
            .maybeSingle();
            
          if (error) {
              if (error.code === '42P01') {
                  setTableExists(false); // relation does not exist
              }
              return;
          }
          setIsFavorited(!!data);
        }
      } catch (err) {
        console.error("Error checking favorited state", err);
      }
    };
    checkFavorited();
  }, [companySlug]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!tableExists) {
        alert("The favorite companies feature is currently being set up. Please try again later.");
        return;
    }

    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      alert("Please login first to favorite companies");
      return;
    }

    let user;
    try {
      user = JSON.parse(userStr);
    } catch {
      alert("Please login first to favorite companies");
      return;
    }

    let userId = user?.id;
    if (!userId && (user?.username || user?.email)) {
       const { data: pData } = await supabase.from('profiles').select('id').eq(user.username ? 'username' : 'email', user.username || user.email).maybeSingle();
       if (pData) userId = pData.id;
    }
    
    if (!userId) {
      alert("Please login first to favorite companies");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (isFavorited) {
        setIsFavorited(false);
        setFavoriteCount(prev => Math.max(0, prev - 1));
        const { error } = await supabase.from("favorite_companies").delete().eq("user_id", userId).eq("company_slug", companySlug);
        if (error) throw error;
      } else {
        setIsFavorited(true);
        setFavoriteCount(prev => prev + 1);
        const { error } = await supabase.from("favorite_companies").insert({ user_id: userId, company_slug: companySlug });
        if (error) throw error;
      }
    } catch (err: any) {
      console.error("Error toggling favorite", err);
      if (err.code === '42P01') setTableExists(false);
      setIsFavorited(!isFavorited);
      setFavoriteCount(prev => isFavorited ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setLoading(false);
    }
  };

  if (variant === "statistic") {
    return (
      <div className="flex items-center gap-1.5 text-gray-700 font-semibold text-lg px-2 py-1.5" aria-label="Favorite count">
        <Heart size={18} className="text-gray-500" /> {favoriteCount}
      </div>
    );
  }

  if (variant === "button") {
    return (
      <button
        onClick={toggleFavorite}
        disabled={loading}
        className={`flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-xl text-base font-semibold transition border-2 ${
          isFavorited 
            ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" 
            : "bg-white text-black border-gray-200 hover:bg-gray-50"
        }`}
      >
        <Heart size={20} className={isFavorited ? "fill-red-600" : ""} /> 
        {isFavorited ? "Favorited" : "Favorite"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 relative z-10">
      <button
        onClick={toggleFavorite}
        disabled={loading}
        className={`p-2 rounded-full transition border ${isFavorited ? "bg-red-50 border-red-100 text-red-600" : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-black"}`}
      >
        <Heart size={16} className={isFavorited ? "fill-red-600" : ""} />
      </button>
      <span className="text-sm font-semibold text-gray-700">{favoriteCount}</span>
    </div>
  );
}