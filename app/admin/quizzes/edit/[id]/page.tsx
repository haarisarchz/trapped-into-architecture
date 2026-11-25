"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import QuizEditor from "@/components/admin/QuizEditor";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AdminEditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params?.id as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const stored = JSON.parse(localStorage.getItem("currentUser") || "null");
      if (!stored) {
        router.push("/admin");
        return;
      }
      const lookupField = stored.username ? "username" : "email";
      const lookupValue = stored.username || stored.email;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq(lookupField, lookupValue)
        .maybeSingle();

      const normalizedRole = (profile?.role || stored.role || "").toLowerCase().replace(/[\s_]+/g, "");
      if (normalizedRole !== "ceo") {
        router.push("/admin");
        return;
      }
      setLoading(false);
    };

    checkAccess();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-black" size={28} />
        <span className="text-xs font-bold text-gray-500">Loading Quiz Editor...</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-[80px] pb-16">
        <QuizEditor
          quizId={quizId}
          onBack={() => router.push("/admin/quizzes")}
        />
      </div>
    </>
  );
}
