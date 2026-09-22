"use client";
import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SaveButton({
  jobId,
  initialSaves = 0,
  variant = "icon"
}: {
  jobId: string;
  initialSaves?: number;
  variant?: "icon" | "button" | "statistic";
}) {
  const [saveCount, setSaveCount] = useState(initialSaves);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync initial saves if updated from parent
  useEffect(() => {
    setSaveCount(initialSaves);
  }, [initialSaves]);

  // Check saved state on mount
  useEffect(() => {
    const checkSaved = async () => {
      const userStr = localStorage.getItem("currentUser");
      if (!userStr) return;
      try {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          const { data } = await supabase
            .from("saved_jobs")
            .select("id")
            .eq("user_id", user.id)
            .eq("job_id", jobId)
            .maybeSingle();
          setIsSaved(!!data);
        }
      } catch (err) {
        console.error("Error checking saved state", err);
      }
    };
    checkSaved();
  }, [jobId]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      alert("Please login first to save jobs");
      return;
    }

    let user;
    try {
      user = JSON.parse(userStr);
    } catch {
      alert("Please login first to save jobs");
      return;
    }

    if (!user || !user.id) {
      alert("Please login first to save jobs");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (isSaved) {
        // Optimistic UI update
        setIsSaved(false);
        setSaveCount(prev => Math.max(0, prev - 1));

        // Delete from saved_jobs
        await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", jobId);
        
        // Decrement atomically
        await supabase.rpc("decrement_save_count", { job_id: jobId });
      } else {
        // Optimistic UI update
        setIsSaved(true);
        setSaveCount(prev => prev + 1);

        // Insert into saved_jobs
        await supabase.from("saved_jobs").insert({ user_id: user.id, job_id: jobId });
        
        // Increment atomically
        await supabase.rpc("increment_save_count", { job_id: jobId });
      }
    } catch (err) {
      console.error("Error toggling save", err);
      // Revert optimistic on error (simple version)
      setIsSaved(!isSaved);
      setSaveCount(prev => isSaved ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setLoading(false);
    }
  };

  if (variant === "statistic") {
    return (
      <div className="flex items-center gap-1.5 text-gray-700 font-semibold text-lg px-2 py-1.5" aria-label="Save count">
        <Bookmark size={18} className="text-gray-500" /> {saveCount}
      </div>
    );
  }

  if (variant === "button") {
    return (
      <button
        onClick={toggleSave}
        disabled={loading}
        aria-label={`Save job`}
        className={`flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-xl text-base font-semibold transition border-2 ${
          isSaved 
            ? "bg-black text-white border-black hover:bg-gray-900" 
            : "bg-white text-black border-gray-200 hover:bg-gray-50"
        }`}
      >
        {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />} 
        {isSaved ? "Saved" : "Save"}
      </button>
    );
  }

  // default icon mode
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={toggleSave}
        disabled={loading}
        aria-label={`Save job`}
        className={`p-2 rounded-full transition ${isSaved ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
      >
        {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
      </button>
      <span className="text-sm font-semibold text-gray-700">{saveCount}</span>
    </div>
  );
}
