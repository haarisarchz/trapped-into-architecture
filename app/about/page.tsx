import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Trapped Into Architecture",
  description: "Learn more about Trapped Into Architecture's history and mission.",
};

export default async function AboutPage() {
  const { data: settings } = await supabase
    .from("site_settings")
    .select("about_us, about_history, about_mission")
    .eq("id", "global")
    .maybeSingle();

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-16 px-6">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">About Us</h1>
        
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 space-y-12">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Our Description</h2>
            <div className="prose prose-gray max-w-none">
              {settings?.about_us ? (
                <p className="whitespace-pre-wrap leading-relaxed text-gray-600">{settings.about_us}</p>
              ) : (
                <p className="text-gray-400 italic">Content coming soon...</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Our History</h2>
            <div className="prose prose-gray max-w-none">
              {settings?.about_history ? (
                <p className="whitespace-pre-wrap leading-relaxed text-gray-600">{settings.about_history}</p>
              ) : (
                <p className="text-gray-400 italic">Content coming soon...</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Our Mission</h2>
            <div className="prose prose-gray max-w-none">
              {settings?.about_mission ? (
                <p className="whitespace-pre-wrap leading-relaxed text-gray-600">{settings.about_mission}</p>
              ) : (
                <p className="text-gray-400 italic">Content coming soon...</p>
              )}
            </div>
          </section>

        </div>
      </div>
      
      <Footer />
    </main>
  );
}


