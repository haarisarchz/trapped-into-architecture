import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobAlertsSubscribeCard from "@/components/JobAlertsSubscribeCard";
import { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Sparkles,
  Building2,
  Briefcase,
  UserCheck,
  GraduationCap,
  ArrowRight,
  Calendar,
  Compass,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";

export const metadata: Metadata = {
  title: "News Feed & Platform Updates | Trapped Into Architecture",
  description:
    "Official architectural updates, studio announcements, job listings, and platform releases published automatically as changes roll out.",
};

// Revalidate every 60 seconds for near-instant updates
export const revalidate = 60;

interface FeedItem {
  id: string | number;
  category: string;
  badge_color?: string;
  title: string;
  author?: string;
  summary: string;
  feature_highlights?: Array<{ feature: string; desc: string }>;
  link_url?: string;
  link_text?: string;
  published_at?: string;
}

const DEFAULT_ANNOUNCEMENTS: FeedItem[] = [
  {
    id: "default-1",
    category: "Platform Update",
    badge_color: "bg-amber-100 text-amber-800 border-amber-300",
    title: "Platform Update: 2-Column News Feed & Live Studio Directory",
    author: "Platform Engineering",
    summary:
      "We have updated the News Feed with a dedicated quick-access sidebar, interactive architecture job alerts, and real-time studio registration capabilities.",
    feature_highlights: [
      {
        feature: "Sidebar Directory",
        desc: "One-click access to Jobs, Studio Directory, Internships, and Individual Profiles.",
      },
      {
        feature: "Interactive Job Alerts",
        desc: "Subscribe directly to daily architectural vacancy digests tailored to your role.",
      },
      {
        feature: "Studio & Profile Registration",
        desc: "Instant CTAs for practitioners and studios to showcase their portfolios.",
      },
    ],
    link_url: "/jobs",
    link_text: "Explore Job Listings",
    published_at: new Date().toISOString(),
  },
  {
    id: "default-2",
    category: "Hiring & Careers",
    badge_color: "bg-blue-100 text-blue-800 border-blue-200",
    title: "New Architectural & Internship Roles Added Across Studios",
    author: "Careers Desk",
    summary:
      "Top design studios and firms are actively recruiting for junior architects, landscape designers, and project managers.",
    feature_highlights: [
      {
        feature: "Direct Studio Applications",
        desc: "Registered candidates can apply directly with pre-filled portfolio links.",
      },
    ],
    link_url: "/jobs",
    link_text: "Explore Job Listings",
    published_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "default-3",
    category: "Studio Spotlight",
    badge_color: "bg-purple-100 text-purple-800 border-purple-200",
    title: "Verified Studio & Professional Profiles Are Live",
    author: "Community Editorial",
    summary:
      "Browse leading architecture practices, explore their project portfolios, and connect with peer professionals across India.",
    feature_highlights: [
      {
        feature: "Studio Directory Live",
        desc: "Firms can claim their practice listing and post vacancy notices.",
      },
    ],
    link_url: "/companies",
    link_text: "Browse Companies",
    published_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default async function NewsFeedPage() {
  let announcements: FeedItem[] = DEFAULT_ANNOUNCEMENTS;

  try {
    const { data, error } = await supabase
      .from("news_feed_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (!error && data && data.length > 0) {
      announcements = data;
    }
  } catch {
    // Graceful fallback to default announcements
  }

  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          {/* Top Hero Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white rounded-3xl p-8 md:p-12 shadow-xl mb-10 border border-gray-800">
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/10 backdrop-blur-xs">
                <Sparkles size={14} /> Official Feed • Real-Time Platform Updates
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-white">
                Platform News & Updates
              </h1>
              <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                Stay informed with platform enhancements, newly added architectural vacancies,
                featured studio spotlights, and community announcements as they roll out.
              </p>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Main 2-Column Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT / CENTER COLUMN: Feed List (8 Columns) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Automated Publishing Status Pill */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Live Feature Updates</h4>
                    <p className="text-[11px] text-gray-500">
                      Summaries are posted automatically whenever new features and improvements roll out.
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>

              {/* Feed Items */}
              <div className="space-y-6">
                {announcements.map((item) => {
                  const dateStr = item.published_at
                    ? new Date(item.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recently";

                  return (
                    <article
                      key={item.id}
                      className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-gray-200/80 hover:shadow-md hover:border-gray-300 transition duration-200"
                    >
                      {/* Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full border ${
                              item.badge_color || "bg-amber-100 text-amber-800 border-amber-300"
                            }`}
                          >
                            {item.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar size={13} />
                          <span>{dateStr}</span>
                          <span>•</span>
                          <span className="font-semibold text-gray-600">
                            {item.author || "Platform Engineering"}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl md:text-2xl font-bold text-gray-950 mb-3 hover:text-amber-600 transition">
                        {item.title}
                      </h2>

                      {/* Summary */}
                      <p className="text-gray-600 leading-relaxed mb-5 text-sm md:text-base">
                        {item.summary}
                      </p>

                      {/* Feature Highlights Grouping */}
                      {item.feature_highlights && item.feature_highlights.length > 0 && (
                        <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 mb-5 space-y-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                            <Layers size={13} className="text-amber-600" />
                            <span>Feature Breakdown</span>
                          </div>
                          {item.feature_highlights.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700">
                              <CheckCircle2 size={15} className="text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-gray-900 font-semibold">
                                  {feat.feature}:{" "}
                                </strong>
                                <span>{feat.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CTA Link */}
                      {item.link_url && (
                        <div className="pt-2">
                          <Link
                            href={item.link_url}
                            className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold bg-gray-100 hover:bg-black hover:text-white text-gray-900 px-4 py-2.5 rounded-xl transition duration-150"
                          >
                            <span>{item.link_text || "Learn More"}</span>
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Sidebar Navigation & Action Widgets (4 Columns) */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
              {/* Widget 1: Quick Navigation / Directory Bar */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Compass size={17} className="text-amber-600" />
                    <h3 className="font-bold text-sm text-gray-900">Explore Platform</h3>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">Quick Access</span>
                </div>

                <div className="space-y-1.5">
                  {[
                    {
                      label: "Architectural Jobs",
                      desc: "Explore full-time, contract & remote roles",
                      icon: Briefcase,
                      href: "/jobs",
                    },
                    {
                      label: "Firms & Studios",
                      desc: "Discover practice profiles & project portfolios",
                      icon: Building2,
                      href: "/companies",
                    },
                    {
                      label: "Student Internships",
                      desc: "Semester & summer training calls",
                      icon: GraduationCap,
                      href: "/internships",
                    },
                    {
                      label: "Architect Profiles",
                      desc: "Browse individual designers & peer talent",
                      icon: UserCheck,
                      href: "/individuals",
                    },
                  ].map((menuItem) => {
                    const IconComponent = menuItem.icon;
                    return (
                      <Link
                        key={menuItem.href}
                        href={menuItem.href}
                        className="group flex items-center justify-between p-3 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-200/80 transition duration-150"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-amber-500 group-hover:text-white text-gray-700 flex items-center justify-center transition">
                            <IconComponent size={15} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900 group-hover:text-amber-900">
                              {menuItem.label}
                            </p>
                            <p className="text-[11px] text-gray-500 leading-tight">
                              {menuItem.desc}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-gray-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition"
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Widget 2: Register Your Profile (For Professionals & Students) */}
              <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-5 shadow-sm border border-gray-800">
                <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Award size={14} />
                  <span>For Architects & Designers</span>
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">
                  Register Your Profile
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Showcase your portfolio, earn verified community badges (Silver, Gold, Diamond), and let leading architectural studios reach out to you directly.
                </p>
                <Link
                  href="/profile"
                  className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-xs"
                >
                  <span>Build Your Profile</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Widget 3: Register Your Studio (For Design Practices & Firms) */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                  <Building2 size={14} />
                  <span>For Studios & Practices</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">
                  Register Your Studio
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Create a verified company profile, showcase your award-winning projects, and post job openings to hire vetted architectural talent.
                </p>
                <Link
                  href="/post-job"
                  className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition shadow-xs"
                >
                  <span>Register Studio & Post Roles</span>
                  <ExternalLink size={13} />
                </Link>
              </div>

              {/* Widget 4: Subscribe for Job Alerts */}
              <JobAlertsSubscribeCard />

              {/* Widget 5: Trending Community Activity */}
              <div className="bg-gray-100/80 rounded-2xl p-4 border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <TrendingUp size={16} className="text-amber-600" />
                  <div>
                    <span className="font-bold text-gray-900">Need Custom Hiring?</span>
                    <p className="text-[11px] text-gray-500">Reach out to the editorial team</p>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="text-xs font-semibold text-black hover:text-amber-600 underline underline-offset-2"
                >
                  Contact
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
