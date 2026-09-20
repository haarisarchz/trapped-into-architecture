import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Trapped Into Architecture",
};

export default async function AboutPage() {
  const { data } = await supabase.from("site_settings").select("about_us").eq("id", "global").maybeSingle();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto py-20 px-6 min-h-[60vh]">
        <h1 className="text-4xl font-bold mb-8">About Us</h1>
        <div className="prose lg:prose-xl text-gray-700 whitespace-pre-wrap">
          {data?.about_us || "Welcome to Trapped Into Architecture. We are dedicated to providing the best opportunities and resources for architects worldwide."}
        </div>
      </div>
      <Footer />
    </main>
  );
}
