"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { trackEvent } from "@/utils/analytics";
import { 
  Trophy, Play, Clock, HelpCircle, Users, Sparkles, 
  ArrowRight, ArrowDown, Filter, ChevronLeft, ChevronRight, Award, Flame, Search, Lock, 
  CheckCircle2, XCircle, SlidersHorizontal, Zap, BookOpen, ShieldCheck, X, Crown, AlertCircle
} from "lucide-react";

export default function QuizzesHubPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"most_played" | "newest" | "oldest">("most_played");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const QUIZZES_PER_PAGE = 10;
  const [demoSelected, setDemoSelected] = useState<string>("Frank Lloyd Wright");
  
  // Start Quiz Setup Modal state
  const [setupModalQuiz, setSetupModalQuiz] = useState<any | null>(null);
  const [modalMode, setModalMode] = useState<"challenge" | "practice">("challenge");
  const [modalDifficulty, setModalDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [modalCount, setModalCount] = useState<number>(10);
  const [showGoldModal, setShowGoldModal] = useState<boolean>(false);

  // Auth state & Gold Tier status
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isGoldTier, setIsGoldTier] = useState<boolean>(false);

  // Dynamic time estimate helper per question count & difficulty:
  // Hard: 10s/Q, Medium: 15s/Q, Easy: 20s/Q
  const getTimeEstimate = (count: number, diff: "easy" | "medium" | "hard") => {
    const perQ = diff === "easy" ? 20 : diff === "medium" ? 15 : 10;
    const totalSecs = count * perQ;
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    return secs === 0 ? `${mins} mins` : `${mins}m ${secs}s`;
  };

  // Leaderboard state
  const [leaderboardDifficulty, setLeaderboardDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [leaderboardQuizFilter, setLeaderboardQuizFilter] = useState<string>("all");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
        const tier = (parsed.tier || parsed.user_metadata?.tier || "").toLowerCase();
        const completion = typeof parsed.completion === "number" ? parsed.completion : 0;
        const isGold = ["gold", "platinum", "diamond"].includes(tier) || completion >= 66 || parsed.role === "admin" || parsed.is_gold === true;
        setIsGoldTier(isGold);
      } catch (e) {}
    }
    fetchQuizzes();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardDifficulty, leaderboardQuizFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, sortBy]);

  const fetchQuizzes = async () => {
    try {
      const { data: qData } = await supabase
        .from("quizzes")
        .select("*, quiz_questions(count), quiz_scores(count)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (qData) setQuizzes(qData);
    } catch (err) {
      console.warn("Error fetching quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      let query = supabase
        .from("quiz_scores")
        .select("id, display_name, points, score, total_questions, difficulty, time_taken_seconds, created_at, user_id, guest_session_id, quiz_id")
        .eq("difficulty", leaderboardDifficulty);

      if (leaderboardQuizFilter !== "all") {
        query = query.eq("quiz_id", leaderboardQuizFilter);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      if (data) {
        // Distinguish real participants from namesake/seed entries
        const realParticipants = data.filter(e => e.user_id !== null || (e.guest_session_id !== null && !e.display_name?.startsWith("Architect_#anon")));
        const seedParticipants = data.filter(e => e.user_id === null && e.guest_session_id === null);

        // RULE: Once every category/difficulty has 5 or more real participants, the pre-loaded namesake entries completely disappear!
        let activeBoard: any[] = [];
        if (realParticipants.length >= 5) {
          activeBoard = realParticipants;
        } else {
          const remainingSlots = Math.max(0, 5 - realParticipants.length);
          activeBoard = [...realParticipants, ...seedParticipants.slice(0, remainingSlots)];
        }

        const ranked = activeBoard.map(entry => {
          const acc = (entry.total_questions || 10) > 0 
            ? Math.round(((entry.score || 0) / (entry.total_questions || 10)) * 100) 
            : 0;
          return { ...entry, acc };
        }).sort((a, b) => {
          if (b.acc !== a.acc) return b.acc - a.acc; // Higher accuracy first
          const aIsReal = a.user_id !== null || a.guest_session_id !== null;
          const bIsReal = b.user_id !== null || b.guest_session_id !== null;
          if (aIsReal !== bIsReal) return aIsReal ? -1 : 1;
          if ((b.points || 0) !== (a.points || 0)) {
            return (b.points || 0) - (a.points || 0);
          }
          return (a.time_taken_seconds || 9999) - (b.time_taken_seconds || 9999);
        });

        setLeaderboard(ranked);
      }
    } catch (err) {
      console.warn("Error fetching leaderboard:", err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const getFeaturedQuizImage = (slug: string, fallbackCover?: string) => {
    switch (slug) {
      case "iconic-world-landmarks-guess-the-building":
        return "/quizzes/fallingwater-kaufmann-residence.jpg";
      case "master-architects-who-designed-it":
        return "/quizzes/chapelle-notre-dame-du-haut-ronchamp.jpg";
      case "where-in-the-world-guess-the-city-country":
        return fallbackCover || "/quizzes/sydney-opera-house.jpg";
      case "timeline-challenge-when-was-it-built":
        return "/quizzes/villa-savoye.jpg";
      case "architectural-styles-and-movements":
        return "/quizzes/centre-pompidou.jpg";
      case "architectural-detective-guess-the-clues":
        return "/quizzes/guggenheim-museum-bilbao.jpg";
      case "architects-oeuvre-pair-the-masterpieces":
        return "/quizzes/salk-institute.jpg";
      default:
        return fallbackCover || "/quizzes/fallingwater-kaufmann-residence.jpg";
    }
  };

  const getSimplifiedQuizDescription = (slug: string, rawDesc?: string) => {
    switch (slug) {
      case "iconic-world-landmarks-guess-the-building":
        return "Identify world-renowned masterworks from real photographs.";
      case "master-architects-who-designed-it":
        return "Match legendary structures with their master architects and studios.";
      case "where-in-the-world-guess-the-city-country":
        return "Pinpoint the cities and countries of iconic architectural marvels.";
      case "timeline-challenge-when-was-it-built":
        return "Order landmark constructions chronologically across history.";
      case "architectural-styles-and-movements":
        return "Classify Brutalism, Bauhaus, Deconstructivism, and modern forms.";
      case "architectural-detective-guess-the-clues":
        return "Deduce the building from structural details, materials, and plans.";
      case "architects-oeuvre-pair-the-masterpieces":
        return "Recognize the distinctive oeuvres and signatures of master architects.";
      default:
        return rawDesc || "Test your architectural visual recall across legendary world projects.";
    }
  };

  const categories = [
    { id: "all", label: "🌟 All Quizzes (7)" },
    { id: "Guess the Building", label: "🏛️ Guess the Building" },
    { id: "Architects & Firms", label: "📐 Architects & Firms" },
    { id: "World Geography", label: "🌍 World Geography" },
    { id: "History & Milestones", label: "⏳ History & Timeline" },
    { id: "History & Theory", label: "🎨 Styles & Theory" },
    { id: "Architecture Trivia", label: "🔍 Clues & Detective" },
    { id: "Architects & Portfolios", label: "👥 Master Portfolios" }
  ];

  // Filter & Sort
  const filteredAndSortedQuizzes = quizzes
    .filter(q => {
      const qCat = (q.category || "").toLowerCase();
      const active = activeCategory.toLowerCase();
      const matchesCat = active === "all" || qCat.includes(active) || active.includes(qCat);
      const matchesSearch = !searchQuery.trim() || 
        (q.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
        (q.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "most_played") {
        const playsA = a.quiz_scores?.[0]?.count || 0;
        const playsB = b.quiz_scores?.[0]?.count || 0;
        return playsB - playsA;
      } else if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedQuizzes.length / QUIZZES_PER_PAGE));
  const paginatedQuizzes = filteredAndSortedQuizzes.slice(
    (currentPage - 1) * QUIZZES_PER_PAGE,
    currentPage * QUIZZES_PER_PAGE
  );
  const startIndex = filteredAndSortedQuizzes.length === 0 ? 0 : (currentPage - 1) * QUIZZES_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * QUIZZES_PER_PAGE, filteredAndSortedQuizzes.length);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f3f5f8] text-slate-900 pt-[66px] pb-12">
        
        {/* COMPACT CLEAN HEADER (GAPS MINIMIZED, BOLD HEADING, FEATURE BUBBLES) */}
        <div className="bg-white border-b border-gray-200/80 shadow-xs">
          <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              
              {/* Title & Colorful Strength Bubbles */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-950 tracking-tight leading-tight">
                  Architecture Quizzes &amp; Knowledge Arena
                </h1>

                {/* Platform Strength Badges (Vibrant Bubbles, No Hash Tags) */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-bold">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span> Multiple Modes (Practice &amp; Challenge)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Live Rankings &amp; Leaderboards
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Shareable Verified Scorecards
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> 65+ Masterworks &amp; High-Res Photos
                  </span>
                </div>
              </div>

              {/* Balanced Catalog Stats Card (Proportionate Duo) */}
              <div className="flex items-center gap-2.5 shrink-0 bg-gray-50 border border-gray-200 p-1.5 sm:p-2 rounded-2xl shadow-2xs self-start lg:self-center">
                <div className="px-3.5 py-1.5 rounded-xl bg-black text-white text-center">
                  <span className="text-base sm:text-lg font-black block leading-none">7</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-300">Active Quizzes</span>
                </div>
                <div className="h-7 w-px bg-gray-200"></div>
                <div className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-amber-950 text-center">
                  <span className="text-base sm:text-lg font-black block leading-none">455</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900">Total Questions</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* TOOLBAR SECTION: TWO SEPARATE WHITE BOXES FOR SEARCH CONTROLS & CATEGORY FILTERS */}
        <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 space-y-2.5">
          
          {/* BOX 1: SEARCH BAR + SORT BY + VIEW BY (DEDICATED SEPARATE WHITE BOX) */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-3 sm:p-3.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* 1. Compact Sized Search Bar */}
            <div className="relative w-full md:w-80 lg:w-96">
              <div className="relative w-full flex items-center">
                <Search size={15} className="absolute left-3.5 text-gray-400 pointer-events-none" />
                <input 
                  type="text"
                  placeholder="Search quizzes, architects, buildings..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-20 py-2 text-xs font-semibold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white text-gray-900 shadow-2xs transition"
                />
                <button
                  type="button"
                  className="absolute right-1 px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-black shadow-xs transition cursor-pointer"
                >
                  Search
                </button>
              </div>
            </div>

            {/* 2. Controls Group: Sort By Dropdown with clear label */}
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-black bg-transparent border-none text-gray-900 focus:outline-none cursor-pointer pr-1"
              >
                <option value="most_played">🔥 Most Played</option>
                <option value="newest">✨ Newly Added</option>
                <option value="oldest">⏳ Oldest Quiz</option>
              </select>
            </div>
          </div>

          {/* BOX 2: CATEGORY FILTER PILLS (DEDICATED SEPARATE WHITE BOX) */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-2.5 sm:p-3 shadow-sm">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 mr-1 hidden sm:inline">Categories:</span>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition shadow-2xs cursor-pointer shrink-0 ${
                    activeCategory === c.id 
                      ? "bg-black text-white scale-102" 
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* MAIN BODY: 66% (Left / Center) vs 33% (Right Sidebar) - START AT SAME BASELINE */}
        <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT 66% (8 COLS): 2-COLUMN QUIZ CARDS */}
            <div className="lg:col-span-8">
              
              {/* PROMINENT HIGH-CONTRAST SECTION HEADING */}
              <div className="flex items-center justify-between mb-3.5 pb-2 border-b-2 border-gray-200/80 px-1">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight flex items-center gap-2">
                      <span>🏛️</span> Active Architecture Quizzes
                    </h2>
                    <span className="bg-gray-900 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                      {filteredAndSortedQuizzes.length} Available
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Select any visual quiz challenge or launch with your custom time rules
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-gray-500 hidden sm:inline bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-gray-400 font-medium bg-white rounded-3xl border border-gray-200">
                  Loading Quizzes...
                </div>
              ) : filteredAndSortedQuizzes.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center">
                  <span className="text-3xl block mb-2">🏛️</span>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">No quizzes match your filter</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Try searching for another topic or reset categories.
                  </p>
                  <button 
                    onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}
                    className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    View All Quizzes
                  </button>
                </div>
              ) : (
                /* BALANCED SPLIT VIEW (Permanent Default Architecture View) */
                <div className="space-y-4">
                  {paginatedQuizzes.map(quiz => {
                    const questionCount = quiz.quiz_questions?.[0]?.count || 65;
                    const playsCount = quiz.quiz_scores?.[0]?.count || 0;
                    const featuredImg = getFeaturedQuizImage(quiz.slug, quiz.cover_image);

                    return (
                      <div 
                        key={quiz.id}
                        className="bg-white rounded-3xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-black transition duration-200 flex flex-col sm:flex-row group"
                      >
                        {/* Left Docked Photo: Natural 4:3 Proportion, Zero Horizontal Stretching */}
                        <div className="w-full sm:w-60 md:w-72 h-52 sm:h-auto bg-gray-900 relative shrink-0 overflow-hidden">
                          <img 
                            referrerPolicy="no-referrer"
                            src={featuredImg} 
                            alt={quiz.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:hidden" />
                          
                          <div className="absolute top-3 left-3 z-10">
                            <span className="bg-black/85 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full border border-white/20 shadow-md">
                              {quiz.category}
                            </span>
                          </div>

                          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex sm:hidden items-center justify-between text-[10px] text-white/90 font-mono font-bold">
                            <span className="flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-white/10">
                              <HelpCircle size={11} className="text-amber-400" /> {questionCount} Qs
                            </span>
                            <span className="flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-white/10">
                              <Flame size={11} className="text-orange-400" /> {playsCount} Plays
                            </span>
                          </div>
                        </div>

                        {/* Right Content & Actions */}
                        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="hidden sm:flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                                {quiz.category}
                              </span>
                              <span className="text-[11px] font-mono text-gray-400 font-bold">
                                {questionCount} Questions &bull; {playsCount} Plays
                              </span>
                            </div>

                            <h3 className="text-base sm:text-lg font-black text-gray-950 group-hover:text-blue-600 transition mb-1.5 leading-snug">
                              {quiz.title}
                            </h3>
                            <p className="text-xs sm:text-sm font-medium text-gray-600 line-clamp-2 leading-relaxed">
                              {getSimplifiedQuizDescription(quiz.slug, quiz.description)}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-3.5 mt-3 border-t border-gray-100 flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => setSetupModalQuiz(quiz)}
                              className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                            >
                              <Play size={13} fill="currentColor" />
                              <span>Play (Different Modes)</span>
                            </button>

                            <Link 
                              href={`/quizzes/${quiz.slug}?autostart=1`}
                              onClick={() => trackEvent("quiz_start_click", { slug: quiz.slug, title: quiz.title, source: "quick_play" })}
                              className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-black flex items-center gap-1 transition shrink-0"
                              title="1-Click Instant Play (10 Questions)"
                            >
                              <Zap size={13} fill="currentColor" />
                              <span>Quick Play</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PAGINATION CONTROLS */}
              {filteredAndSortedQuizzes.length > 0 && (
                <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl border border-gray-200/90 p-3 sm:px-4 shadow-xs">
                  <div className="text-xs font-bold text-gray-500">
                    Showing <span className="text-gray-950 font-black">{startIndex}–{endIndex}</span> of{" "}
                    <span className="text-gray-950 font-black">{filteredAndSortedQuizzes.length}</span> quizzes
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        currentPage === 1 
                          ? "text-gray-300 border border-gray-200 cursor-not-allowed bg-gray-50" 
                          : "text-gray-700 bg-gray-100 hover:bg-black hover:text-white"
                      }`}
                    >
                      <ChevronLeft size={14} />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1 px-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 300, behavior: "smooth" });
                          }}
                          className={`w-8 h-8 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center ${
                            currentPage === page
                              ? "bg-black text-white shadow-xs"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        currentPage === totalPages 
                          ? "text-gray-300 border border-gray-200 cursor-not-allowed bg-gray-50" 
                          : "text-gray-700 bg-gray-100 hover:bg-black hover:text-white"
                      }`}
                    >
                      <span>Next</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT 33% (4 COLS): LIVE DEMO (BLACK BOX WRAPPER) + LEADERBOARD + RULES */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* PROMINENT HIGH-CONTRAST SECTION HEADING */}
              <div className="flex items-center justify-between mb-3.5 pb-2 border-b-2 border-gray-200/80 px-1">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight flex items-center gap-2">
                      <Sparkles size={20} className="text-amber-500" /> Interactive Arena Demo
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Live 1-minute question demo &amp; arena leaderboard
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                  Live Preview
                </span>
              </div>

              {/* 1. ARCHITECTURAL "BLACK BOX" CONTAINER FOR THE INTERACTIVE DEMO */}
              <div className="bg-gradient-to-br from-slate-950 via-[#0d121c] to-black p-5 rounded-3xl text-white shadow-xl border-2 border-emerald-500/40 relative overflow-hidden ring-1 ring-emerald-500/30">
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                      Try Me &bull; Live Question Demo
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                    Easy Sample
                  </span>
                </div>

                {/* Sample Photo */}
                <div className="relative rounded-xl overflow-hidden h-40 bg-gray-900 mb-3 border border-white/10 shadow-inner">
                  <img 
                    referrerPolicy="no-referrer" 
                    src="/quizzes/fallingwater-kaufmann-residence.jpg" 
                    alt="Fallingwater" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white border border-white/20">
                    📍 Mill Run, Pennsylvania
                  </div>
                </div>

                <p className="text-xs font-bold text-gray-200 mb-3 leading-snug">
                  Which master architect designed the cantilevered terraces of &quot;Fallingwater&quot;?
                </p>

                {/* Four Options: Green Pre-checked Answer */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setDemoSelected("Frank Lloyd Wright")}
                    className="p-2.5 rounded-xl border text-xs text-left transition flex items-center justify-between cursor-pointer bg-emerald-500/25 border-emerald-500 text-emerald-300 font-extrabold shadow-sm"
                  >
                    <span className="truncate">Frank Lloyd Wright</span>
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoSelected("Le Corbusier")}
                    className="p-2.5 rounded-xl border text-xs text-left transition flex items-center justify-between cursor-pointer bg-white/5 border-white/10 text-gray-400 opacity-60"
                  >
                    <span className="truncate">Le Corbusier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoSelected("Mies van der Rohe")}
                    className="p-2.5 rounded-xl border text-xs text-left transition flex items-center justify-between cursor-pointer bg-white/5 border-white/10 text-gray-400 opacity-60"
                  >
                    <span className="truncate">Mies van der Rohe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoSelected("Louis Kahn")}
                    className="p-2.5 rounded-xl border text-xs text-left transition flex items-center justify-between cursor-pointer bg-white/5 border-white/10 text-gray-400 opacity-60"
                  >
                    <span className="truncate">Louis Kahn</span>
                  </button>
                </div>

                <div className="p-2 rounded-xl mb-3 text-xs font-bold text-center bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ✓ Correct! Designed 1935 over a waterfall in Mill Run, PA.
                </div>

                <Link 
                  href="/quizzes/iconic-world-landmarks-guess-the-building?autostart=1"
                  className="w-full py-3 bg-white text-black hover:bg-gray-100 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-md"
                >
                  Play Full Quiz (65 Masterworks) <ArrowRight size={14} />
                </Link>
              </div>

              {/* 2. LEADERBOARD WIDGET */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
                    <Trophy size={15} className="text-amber-500" /> Live Leaderboard
                  </h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                    Live Points
                  </span>
                </div>

                {/* Difficulty Tabs: Easy / Medium / Hard */}
                <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl mb-2.5">
                  <button
                    onClick={() => setLeaderboardDifficulty("easy")}
                    className={`py-1 text-xs font-bold rounded-lg transition ${
                      leaderboardDifficulty === "easy" ? "bg-white text-emerald-800 shadow-xs" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    🟢 Easy
                  </button>
                  <button
                    onClick={() => setLeaderboardDifficulty("medium")}
                    className={`py-1 text-xs font-bold rounded-lg transition ${
                      leaderboardDifficulty === "medium" ? "bg-white text-amber-800 shadow-xs" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    🟡 Medium
                  </button>
                  <button
                    onClick={() => setLeaderboardDifficulty("hard")}
                    className={`py-1 text-xs font-bold rounded-lg transition ${
                      leaderboardDifficulty === "hard" ? "bg-white text-red-800 shadow-xs" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    🔴 Hard
                  </button>
                </div>

                {/* Leaderboard Rows */}
                {loadingLeaderboard ? (
                  <div className="p-5 text-center text-gray-400 text-xs">
                    Updating scores...
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="p-5 text-center text-gray-400 text-xs">
                    Be the first to enter the leaderboard!
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {leaderboard.slice(0, 6).map((entry, idx) => {
                      const isCurrentUserEntry = currentUser && (
                        entry.user_id === currentUser.id || 
                        (currentUser.username && entry.display_name === currentUser.username) ||
                        (currentUser.name && entry.display_name === currentUser.name)
                      );

                      const displayUsername = entry.display_name?.startsWith("@") 
                        ? entry.display_name 
                        : `@${entry.display_name || "Architect"}`;

                      return (
                        <div 
                          key={idx}
                          className={`flex items-center justify-between p-2 rounded-xl border transition ${
                            isCurrentUserEntry 
                              ? "bg-blue-50/90 border-blue-400 ring-1 ring-blue-300 shadow-xs" 
                              : "border-gray-100 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              idx === 0 ? "bg-amber-400 text-amber-950" :
                              idx === 1 ? "bg-gray-300 text-gray-800" :
                              idx === 2 ? "bg-amber-700 text-white" :
                              "text-gray-400 font-mono"
                            }`}>
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate flex items-center gap-1">
                                <span className={isCurrentUserEntry ? "text-blue-900 font-black" : ""}>
                                  {displayUsername}
                                </span>
                                {isCurrentUserEntry && (
                                  <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded">
                                    YOU
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-gray-400 uppercase font-mono">
                                {entry.total_questions || 10} Qs • <span className="text-emerald-700 font-bold">{entry.acc}% Acc</span>
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs font-mono font-extrabold shrink-0 ${
                            isCurrentUserEntry ? "text-blue-700" : "text-blue-600"
                          }`}>
                            {entry.points} PTS
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. RULES & SCORING MECHANICS */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs text-xs space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-blue-600" /> Rules &amp; Scoring Mechanics
                </h3>

                <div className="space-y-2 text-gray-600 leading-normal text-xs">
                  <div className="flex items-start gap-1.5">
                    <span className="font-black text-emerald-700 shrink-0">🟢 Easy (Beginner):</span>
                    <span>20s/Q &bull; 100 pts per correct answer &bull; Obvious iconic choices.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-black text-amber-700 shrink-0">🟡 Medium (Intermediate):</span>
                    <span>15s/Q &bull; 200 pts per correct answer &bull; Subtle architectural distractors.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-black text-rose-700 shrink-0">🔴 Hard (Advanced):</span>
                    <span>10s/Q &bull; 500 pts per correct answer &bull; Same studio / movement deep cuts.</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex items-start gap-1.5 text-blue-800 font-medium">
                    <span className="font-black">⚡ Modes:</span>
                    <span><strong>Practice (Gold Tier):</strong> Instant answers after each question &bull; <strong>Challenge:</strong> Countdown timer + points.</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* START QUIZ CUSTOMIZATION MODAL (MODES & DIFFICULTY) */}
        {setupModalQuiz && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-gray-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-8">
              
              <button
                type="button"
                onClick={() => {
                  setSetupModalQuiz(null);
                  setShowGoldModal(false);
                }}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
                aria-label="Close setup modal"
              >
                <X size={20} />
              </button>

              <div className="mb-5 pr-8">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {setupModalQuiz.category || "Quiz Arena"}
                  </span>
                  <span className="text-xs font-mono text-gray-400 font-bold">
                    {setupModalQuiz.quiz_questions?.[0]?.count || 65} Questions Available
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-gray-950 leading-tight">
                  {setupModalQuiz.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Customize your game mode, difficulty pace, and question round length.
                </p>
              </div>

              {/* 1. Game Mode Selection */}
              <div className="mb-5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 block mb-2 flex items-center justify-between">
                  <span>1. Game Mode</span>
                  <span className="text-[11px] font-normal text-gray-400 lowercase">select your play style</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Challenge Mode */}
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode("challenge");
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer relative ${
                      modalMode === "challenge" 
                        ? "bg-amber-500/10 border-amber-500 text-gray-950 ring-2 ring-amber-500/30 shadow-xs" 
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Zap size={11} className="text-amber-600 fill-amber-500" /> Competitive Play
                      </span>
                      {modalMode === "challenge" && (
                        <CheckCircle2 size={16} className="text-amber-600 shrink-0" />
                      )}
                    </div>
                    <h4 className="text-sm font-black text-gray-900 mb-1">
                      Challenge Mode
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Continuous timer, official leaderboard points, and performance scorecard.
                    </p>
                  </button>

                  {/* Practice Mode (Gold Tier Exclusive) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isGoldTier) {
                        setShowGoldModal(true);
                      } else {
                        setModalMode("practice");
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer relative ${
                      modalMode === "practice" 
                        ? "bg-purple-500/10 border-purple-500 text-gray-950 ring-2 ring-purple-500/30 shadow-xs" 
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1">
                        <Crown size={11} className="text-purple-700 fill-purple-600" /> Gold Tier Benefit
                      </span>
                      {modalMode === "practice" && (
                        <CheckCircle2 size={16} className="text-purple-600 shrink-0" />
                      )}
                    </div>
                    <h4 className="text-sm font-black text-gray-900 mb-1 flex items-center gap-1.5">
                      Practice Mode
                      {!isGoldTier && <Lock size={12} className="text-amber-600" />}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Instant answers after each question with relaxed, self-paced exploration.
                    </p>
                  </button>
                </div>
              </div>

              {/* 2. Difficulty Tier Selection */}
              <div className="mb-5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 block mb-2 flex items-center justify-between">
                  <span>2. Difficulty Tier</span>
                  <span className="text-[11px] font-normal text-gray-400 lowercase">adjusts allotted time per question</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "easy", icon: "🟢", label: "Easy", sub: "Beginner", time: "20s / question", activeClass: "border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20" },
                    { id: "medium", icon: "🟡", label: "Medium", sub: "Intermediate", time: "15s / question", activeClass: "border-amber-600 bg-amber-50/70 text-amber-950 ring-2 ring-amber-500/20" },
                    { id: "hard", icon: "🔴", label: "Hard", sub: "Advanced", time: "10s / question", activeClass: "border-rose-600 bg-rose-50/70 text-rose-950 ring-2 ring-rose-500/20" }
                  ].map(d => {
                    const isSelected = modalDifficulty === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setModalDifficulty(d.id as any)}
                        className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                          isSelected 
                            ? `${d.activeClass} font-black shadow-xs` 
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50/60"
                        }`}
                      >
                        <span className="text-xs font-black flex items-center gap-1 mb-0.5">
                          <span>{d.icon}</span> {d.label}
                        </span>
                        <span className={`text-[11px] font-bold ${isSelected ? "text-gray-900" : "text-gray-500"}`}>
                          {d.sub}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {d.time}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Round Length: Dynamic Time Estimate by Difficulty */}
              <div className="mb-6">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 block mb-2 flex items-center justify-between">
                  <span>3. Questions Count</span>
                  <span className="text-[11px] font-normal text-gray-400 lowercase">dynamic time for {modalDifficulty}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { count: 10, label: "10 Questions" },
                    { count: 20, label: "20 Questions" },
                    { count: setupModalQuiz.quiz_questions?.[0]?.count || 65, label: `All (${setupModalQuiz.quiz_questions?.[0]?.count || 65})` }
                  ].map(c => {
                    const isSelected = modalCount === c.count;
                    const dynamicTime = getTimeEstimate(c.count, modalDifficulty);
                    return (
                      <button
                        key={c.count}
                        type="button"
                        onClick={() => setModalCount(c.count)}
                        className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                          isSelected 
                            ? "bg-blue-600 text-white border-blue-600 font-black shadow-xs ring-2 ring-blue-500/20" 
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50/60 font-semibold"
                        }`}
                      >
                        <span className="text-xs block font-black">{c.label}</span>
                        <span className={`text-[11px] font-mono mt-0.5 ${isSelected ? "text-blue-100 font-bold" : "text-gray-500"}`}>
                          ⏱ {dynamicTime}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Launch Quiz Button */}
              <Link
                href={`/quizzes/${setupModalQuiz.slug}?mode=${modalMode}&difficulty=${modalDifficulty}&count=${modalCount}&autostart=1`}
                onClick={() => {
                  setSetupModalQuiz(null);
                  setShowGoldModal(false);
                }}
                className="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition cursor-pointer"
              >
                <span>Launch Quiz ({modalCount} Qs &bull; {getTimeEstimate(modalCount, modalDifficulty)})</span>
                <ArrowRight size={16} />
              </Link>

            </div>
          </div>
        )}

        {/* SEPARATE DEDICATED POPUP MODAL FOR GOLD TIER BENEFIT */}
        {showGoldModal && (
          <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-3xl border border-gray-200 max-w-sm sm:max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-center">
              
              {/* Close Button 'X' */}
              <button
                type="button"
                onClick={() => setShowGoldModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center mx-auto mb-3.5 shadow-md ring-4 ring-amber-100">
                <Crown size={24} className="fill-white" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full inline-block mb-2">
                👑 Gold Tier Exclusive
              </span>

              <h3 className="text-lg sm:text-xl font-black text-gray-950 mb-2 leading-snug">
                Practice Mode Available Only for GOLD Tier Members
              </h3>

              <p className="text-xs text-gray-600 leading-relaxed mb-6 px-1">
                Practice Mode provides <strong>instant answer reveals</strong> after each question with relaxed, self-paced architectural exploration. Register or complete your profile to <strong>Gold Tier (66%+ completion)</strong> to unlock this feature!
              </p>

              <div className="space-y-3">
                <Link
                  href="/profile"
                  onClick={() => setShowGoldModal(false)}
                  className="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition cursor-pointer"
                >
                  <span>Register / Login to Unlock</span>
                  <ArrowRight size={16} />
                </Link>

                <div>
                  <Link
                    href="/badges-and-perks"
                    onClick={() => setShowGoldModal(false)}
                    className="text-xs font-bold text-amber-900 hover:text-amber-950 underline underline-offset-2 transition"
                  >
                    Learn About GOLD Perks &rarr;
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}
