import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Megaphone, Bell, Calendar, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "News Feed | Trapped Into Architecture",
  description: "Official updates, industry insights, and architecture community announcements.",
};

export default function NewsFeedPage() {
  const announcements = [
    {
      id: 1,
      tag: "Platform Update",
      tagColor: "bg-amber-100 text-amber-800 border-amber-200",
      title: "Welcome to the Trapped Into Architecture News Feed!",
      date: "October 31, 2026",
      author: "TIA Editorial Team",
      summary:
        "Stay tuned for the latest design opportunities, firm spotlights, curriculum updates, and hiring announcements curated directly for architecture professionals and studios.",
      details:
        "In our initial rollout, the News Feed brings official updates directly to you. In upcoming phases, posting privileges will open up for Gold Tier and verified community contributors to share their own updates and thought leadership."
    },
    {
      id: 2,
      tag: "Hiring & Careers",
      tagColor: "bg-blue-100 text-blue-800 border-blue-200",
      title: "New Architectural & Internship Roles Added Across Studios",
      date: "October 30, 2026",
      author: "Careers Desk",
      summary:
        "Top design studios and firms are actively recruiting for junior architects, landscape designers, and project managers. Explore the latest vacancies now.",
      link: "/jobs",
      linkText: "Explore Job Listings"
    },
    {
      id: 3,
      tag: "Community",
      tagColor: "bg-purple-100 text-purple-800 border-purple-200",
      title: "Verified Studio & Professional Profiles Are Now Live",
      date: "October 28, 2026",
      author: "Platform Operations",
      summary:
        "Browse leading architecture practices, explore their project portfolios, and connect with peer professionals across India.",
      link: "/companies",
      linkText: "Browse Companies"
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-4xl mx-auto py-12 px-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-gray-900 to-black text-white rounded-3xl p-8 md:p-10 shadow-lg mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/10">
              <Sparkles size={14} /> Official Feed & Updates
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              News Feed
            </h1>
            <p className="text-gray-300 text-base md:text-lg max-w-2xl leading-relaxed">
              Curated news, studio spotlights, and official platform announcements. High-tier and verified studio posting capabilities will unlock soon.
            </p>
          </div>

          {/* Feed List */}
          <div className="space-y-6">
            {announcements.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition duration-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${item.tagColor}`}
                  >
                    {item.tag}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar size={13} />
                    <span>{item.date}</span>
                    <span>•</span>
                    <span className="font-medium text-gray-500">{item.author}</span>
                  </div>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h2>

                <p className="text-gray-600 leading-relaxed mb-4 text-sm md:text-base">
                  {item.summary}
                </p>

                {item.details && (
                  <p className="text-gray-500 text-xs md:text-sm bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                    {item.details}
                  </p>
                )}

                {item.link && (
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-black hover:text-amber-600 transition"
                  >
                    <span>{item.linkText}</span>
                    <ArrowRight size={14} />
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
