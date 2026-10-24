"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      const stored = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
      if (stored) {
        try {
          const user = JSON.parse(stored);
          if (user?.username) {
            router.replace(`/profile/${user.username}`);
            return;
          }
        } catch (e) {}
      }

      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profile?.username) {
          router.replace(`/profile/${profile.username}`);
          return;
        }
      }

      router.replace("/");
    };

    redirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
      Loading profile...
    </div>
  );
}
