import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobAlertsSubscribeCard from "@/components/JobAlertsSubscribeCard";
import ArchitectureChannelsCard from "@/components/ArchitectureChannelsCard";
import NewsFeedClientView from "@/components/NewsFeedClientView";
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
  Compass,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  Radio
} from "lucide-react";
import { FeedItem } from "@/components/NewsFeedCard";

export const metadata: Metadata = {
  title: "Feed | Trapped Into Architecture",
  description:
    "Official Feed. Fresh platform features, studio spotlights, and architectural opportunities curated daily.",
};

export const revalidate = 60;

const DEFAULT_ANNOUNCEMENTS: FeedItem[] = [
  {
    id: "announcement-coa-directory",
    category: "National Milestone",
    badge_color: "bg-blue-100 text-blue-800 border-blue-300",
    title: "Official Council of Architecture (COA) Directory 2026–27 Live",
    author: "Trapped Into Architecture Desk",
    summary:
      "Explore India's most comprehensive statutory architecture directory. Access 583 COA-recognized colleges, 3,014 verified intake records, 38+ M.Arch specializations, polytechnic diplomas, and session-by-session leadership history.",
    feature_highlights: [
      {
        feature: "UG, PG & Diploma Explorer",
        desc: "Interactive tabs covering B.Arch (473 colleges), M.Arch specializations (115 colleges), and polytechnic diplomas (180 colleges).",
      },
      {
        feature: "Advance Statutory Accolades",
        desc: "Discover institutions awarded multi-year advance approvals through 2028–2030 by the Council.",
      },
      {
        feature: "Historical Leadership Tracking",
        desc: "Inspect session-specific Heads of Department and Principals across approval years.",
      },
    ],
    link_url: "/institutions",
    link_text: "Explore Institutions",
    published_at: new Date().toISOString(),
    status: "published",
  },
  {
    id: "default-1",
    category: "Feature Drop",
    badge_color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    title: "Discover 50+ Top Architecture Studios Across India",
    author: "Ti2A Studio Desk",
    summary:
      "Browse verified design practices, explore their portfolios, and find open roles in one place on Ti2A.",
    feature_highlights: [
      {
        feature: "Typology Filters",
        desc: "Find firms specializing in residential, commercial, interior, and landscape design.",
      },
      {
        feature: "Multi-City Explorer",
        desc: "Discover practices across Mumbai, Bengaluru, Delhi NCR, and 12+ creative design hubs.",
      },
      {
        feature: "Direct Careers",
        desc: "View studio principals, team culture, and active vacancies on their profile.",
      },
    ],
    link_url: "/companies",
    link_text: "Explore Studios",
    published_at: new Date().toISOString(),
    status: "published",
  },
  {
    id: "default-2",
    category: "New Feature",
    badge_color: "bg-amber-100 text-amber-800 border-amber-300",
    title: "Get Architecture Job Alerts Sent Directly to Your WhatsApp",
    author: "Ti2A Careers Hub",
    summary:
      "Set your city, role, and salary preferences on Ti2A to receive verified vacancies the moment they drop.",
    feature_highlights: [
      {
        feature: "Targeted Roles",
        desc: "Pick alerts for Junior Architects, BIM Specialists, Interior Designers, or Interns.",
      },
      {
        feature: "Priority Delivery",
        desc: "Receive instant notifications on WhatsApp and Email before public syndication.",
      },
      {
        feature: "Zero Noise",
        desc: "Strictly filtered to match your chosen criteria and preferred frequency.",
      },
    ],
    link_url: "/subscriptions",
    link_text: "Set Up Alerts",
    published_at: new Date(Date.now() - 86400000).toISOString(),
    status: "published",
  },
  {
    id: "default-3",
    category: "Hiring Radar",
    badge_color: "bg-blue-100 text-blue-800 border-blue-200",
    title: "18 New Architect & BIM Openings Just Added Across Leading Studios",
    author: "Ti2A Careers Hub",
    summary:
      "Design practices in Mumbai, Bengaluru, and Delhi NCR are actively shortlisting candidates this week on Ti2A.",
    feature_highlights: [
      {
        feature: "Curated Roles",
        desc: "Full-time, contract, and internship vacancies with transparent criteria.",
      },
      {
        feature: "Direct Applications",
        desc: "Submit your pre-linked portfolio directly to hiring design directors.",
      },
      {
        feature: "Fast Shortlisting",
        desc: "Studios currently reviewing applications for immediate joining.",
      },
    ],
    link_url: "/jobs",
    link_text: "Browse Openings",
    published_at: new Date(Date.now() - 172800000).toISOString(),
    status: "published",
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
      announcements = data as FeedItem[];
    }
  } catch {
    // Fallback to default clean posts
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-black flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-7xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
          {/* Top Hero Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white rounded-3xl p-8 sm:p-10 md:p-12 shadow-xl mb-8 sm:mb-10 border border-gray-800">
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10 backdrop-blur-xs">
                <Radio size={13} className="text-amber-400 animate-pulse" /> Official Feed
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-white">
                Feed
              </h1>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Fresh feature drops, verified studio directories, and architectural vacancies.
                Simple, actionable updates designed for modern architects and practices.
              </p>
            </div>

            {/* Subtle aesthetic glow */}
            <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Main 2-Column Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT / CENTER COLUMN: Feed Stream (8 Columns) */}
            <div className="lg:col-span-8">
              <NewsFeedClientView initialAnnouncements={announcements} />
            </div>

            {/* RIGHT COLUMN: Sidebar (4 Columns) */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
              {/* Widget 1: Quick Navigation / Directory Bar */}
              <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Compass size={17} className="text-amber-600" />
                    <h3 className="font-bold text-sm text-gray-900">Explore Platform</h3>
                  </div>
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Quick Link</span>
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
                      desc: "Discover practice profiles & portfolios",
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
                      desc: "Browse individual designers & peers",
                      icon: UserCheck,
                      href: "/individuals",
                    },
                  ].map((menuItem) => {
                    const IconComponent = menuItem.icon;
                    return (
                      <Link
                        key={menuItem.href}
                        href={menuItem.href}
                        className="group flex items-center justify-between p-3 rounded-2xl hover:bg-amber-50/70 border border-transparent hover:border-amber-200/80 transition duration-150"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-amber-500 group-hover:text-white text-gray-700 flex items-center justify-center transition">
                            <IconComponent size={15} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900 group-hover:text-amber-950">
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

              {/* Widget 2: Custom Filter Job Alerts Subscription */}
              <JobAlertsSubscribeCard />

              {/* Widget 3: Follow & Connect - WhatsApp & Telegram Architecture Channels */}
              <ArchitectureChannelsCard />

              {/* Widget 4: Register Your Profile (For Professionals & Students) */}
              <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl p-6 shadow-sm border border-gray-800">
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

              {/* Widget 5: Register Your Studio (For Design Practices & Firms) */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
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
                  className="w-full inline-flex items-center justify-center gap-2 bg-gray-950 hover:bg-black text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition shadow-xs"
                >
                  <span>Register Studio & Post Roles</span>
                  <ExternalLink size={13} />
                </Link>
              </div>

              {/* Widget 6: Contact & Support */}
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
