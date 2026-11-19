"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { trackEvent } from "@/utils/analytics";
import { 
  Trophy, Play, Clock, HelpCircle, Users, Sparkles, 
  ArrowRight, ArrowDown, Filter, ChevronRight, Award, Flame, Search, Lock, 
  CheckCircle2, XCircle, SlidersHorizontal, LayoutGrid, List, Zap, BookOpen, ShieldCheck, X
} from "lucide-react";

export default function QuizzesHubPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"most_played" | "newest" | "oldest">("most_played");
  const [viewMode, setViewMode] = useState<"image" | "text">("image");
  const [demoSelected, setDemoSelected] = useState<string>("Frank Lloyd Wright");
  
  // Start Quiz Setup Modal state
  const [setupModalQuiz, setSetupModalQuiz] = useState<any | null>(null);
  const [modalMode, setModalMode] = useState<"challenge" | "practice">("challenge");
  const [modalDifficulty, setModalDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [modalCount, setModalCount] = useState<number>(10);

  // Auth state
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Leaderboard state
  const [leaderboardDifficulty, setLeaderboardDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [leaderboardQuizFilter, setLeaderboardQuizFilter] = useState<string>("all");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)); } catch (e) {}
    }
    fetchQuizzes();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardDifficulty, leaderboardQuizFilter]);

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
        return "/quizzes/the-shard.jpg";
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50/70 pt-[72px] pb-12">
        
        {/* COMPACT CLEAN HEADER (GAPS MINIMIZED) */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-4.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Title & Hashtag Pills */}
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-950 tracking-tight leading-tight">
                  Architecture Quizzes &amp; Knowledge Arena
                </h1>

                {/* Hashtag Pills */}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-gray-600">
                  <span className="bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-md text-gray-700 transition">
                    #65+ Masterworks
                  </span>
                  <span className="bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-md text-gray-700 transition">
                    #100+ Master Architects
                  </span>
                  <span className="bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-md text-gray-700 transition">
                    #High-Res Architectural Photos
                  </span>
                  <span className="bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-md text-gray-700 transition">
                    #Floor Plans &amp; Tectonic Clues
                  </span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-black border border-blue-200">
                    #Instant Practice &amp; Challenge Modes
                  </span>
                </div>
              </div>

              {/* Crowd & Catalog Stats */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="px-3 py-1.5 rounded-xl bg-black text-white text-center shadow-xs">
                  <span className="text-sm sm:text-base font-black block leading-none">7</span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-300">Active Quizzes</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-400 text-amber-950 text-center shadow-xs">
                  <span className="text-sm sm:text-base font-black block leading-none">455</span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-900">Questions Available</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* MAIN BODY: 66% (Left / Center) vs 33% (Right Sidebar) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT 66% (8 COLS): CONTROLS & QUIZ CARDS */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Toolbar: Prominent Search + Search Button + Sort + View + Categories */}
              <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-xs space-y-3">
                
                {/* Top Row: High-Contrast Search Bar with Dedicated Search Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="relative flex-1">
                    <div className="relative w-full flex items-center">
                      <Search size={15} className="absolute left-3.5 text-gray-500 pointer-events-none" />
                      <input 
                        type="text"
                        placeholder="Search architecture quizzes, architects, or buildings..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-22 py-2 text-xs font-medium border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black bg-white text-gray-900 shadow-2xs transition"
                      />
                      <button
                        type="button"
                        className="absolute right-1 px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-black shadow-xs transition cursor-pointer"
                      >
                        Search
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Sort By Dropdown */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 font-bold">
                      <span className="hidden sm:inline text-[11px] uppercase tracking-wider">Sort:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="text-xs font-bold bg-gray-100 hover:bg-gray-200 border-none rounded-xl px-2.5 py-2 text-gray-800 focus:outline-none cursor-pointer transition"
                      >
                        <option value="most_played">🔥 Most Played</option>
                        <option value="newest">✨ Newly Added</option>
                        <option value="oldest">⏳ Oldest Quiz</option>
                      </select>
                    </div>

                    {/* View By Toggle: Image View vs Text View */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                      <button
                        onClick={() => setViewMode("image")}
                        className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          viewMode === "image" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"
                        }`}
                        title="Image View"
                      >
                        <LayoutGrid size={13} />
                        <span className="text-[11px] hidden sm:inline">Image</span>
                      </button>
                      <button
                        onClick={() => setViewMode("text")}
                        className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          viewMode === "text" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"
                        }`}
                        title="Text View"
                      >
                        <List size={13} />
                        <span className="text-[11px] hidden sm:inline">Text</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category Pills (Tournaments renamed to Quizzes) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCategory(c.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer ${
                        activeCategory === c.id 
                          ? "bg-black text-white scale-102" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

              </div>

              {/* Quiz Cards Feed */}
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
              ) : viewMode === "image" ? (
                /* 1. IMAGE VIEW (Compact Image Height, Rows Visible Above Fold) */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredAndSortedQuizzes.map(quiz => {
                    const questionCount = quiz.quiz_questions?.[0]?.count || 65;
                    const playsCount = quiz.quiz_scores?.[0]?.count || 0;
                    const featuredImg = getFeaturedQuizImage(quiz.slug, quiz.cover_image);

                    return (
                      <div 
                        key={quiz.id}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-black transition duration-300 flex flex-col group"
                      >
                        {/* COMPACT SINGLE HIGH-RES IMAGE (h-40 sm:h-44) */}
                        <div className="h-40 sm:h-44 bg-gray-900 relative overflow-hidden">
                          <img 
                            referrerPolicy="no-referrer"
                            src={featuredImg} 
                            alt={quiz.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <span className="bg-black/85 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-white/20 shadow-md">
                              {quiz.category}
                            </span>
                          </div>

                          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between text-[10px] text-white/90 font-mono font-bold">
                            <span className="flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-white/10">
                              <HelpCircle size={11} className="text-amber-400" /> {questionCount} Qs
                            </span>
                            <span className="flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-white/10">
                              <Flame size={11} className="text-orange-400" /> {playsCount} Plays
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-sm sm:text-base font-black text-gray-900 group-hover:text-blue-600 transition mb-1 leading-snug">
                              {quiz.title}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                              {quiz.description || "Test your architectural visual recall across legendary world projects and master architects."}
                            </p>
                          </div>

                          {/* REFINED BUTTONS: Large "Play (Different Modes)" + Small "Quick Play" */}
                          <div className="pt-2.5 border-t border-gray-100 flex items-center gap-2">
                            {/* 1. Large Primary Button: Play (Different Modes) */}
                            <button
                              type="button"
                              onClick={() => setSetupModalQuiz(quiz)}
                              className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                            >
                              <Play size={13} fill="currentColor" />
                              <span>Play (Different Modes)</span>
                            </button>

                            {/* 2. Small Secondary Button: Quick Play */}
                            <Link 
                              href={`/quizzes/${quiz.slug}?autostart=1`}
                              onClick={() => trackEvent("quiz_start_click", { slug: quiz.slug, title: quiz.title, source: "quick_play" })}
                              className="px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-black flex items-center gap-1 transition shrink-0"
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
              ) : (
                /* 2. TEXT VIEW (Clean Rows with Play (Different Modes) & Quick Play) */
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 shadow-xs">
                  {filteredAndSortedQuizzes.map(quiz => {
                    const questionCount = quiz.quiz_questions?.[0]?.count || 65;
                    const playsCount = quiz.quiz_scores?.[0]?.count || 0;
                    const featuredImg = getFeaturedQuizImage(quiz.slug, quiz.cover_image);

                    return (
                      <div key={quiz.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60 transition group">
                        <div className="flex items-start gap-3 min-w-0">
                          <img 
                            referrerPolicy="no-referrer"
                            src={featuredImg} 
                            alt={quiz.title} 
                            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-200 group-hover:scale-105 transition"
                            onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                          />
                          <div className="min-w-0">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-600 block">
                              {quiz.category}
                            </span>
                            <h3 className="text-xs sm:text-sm font-black text-gray-900 truncate group-hover:text-blue-600 transition">
                              {quiz.title}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {quiz.description || "Visual quiz challenge."}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                              <span>{questionCount} Qs</span>
                              <span>•</span>
                              <span>{playsCount} plays</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSetupModalQuiz(quiz)}
                            className="px-3.5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                          >
                            <Play size={12} fill="currentColor" /> Play (Different Modes)
                          </button>
                          <Link 
                            href={`/quizzes/${quiz.slug}?autostart=1`}
                            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-black flex items-center gap-1 transition"
                          >
                            <Zap size={12} fill="currentColor" /> Quick Play
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* RIGHT 33% (4 COLS): LIVE DEMO + LEADERBOARD + RULES */}
            <div className="lg:col-span-4 space-y-4 sticky top-[88px]">
              
              {/* 1. COMPACT LIVE DEMO (Pre-checked Green Option) */}
              <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4 sm:p-5 rounded-2xl text-white shadow-xl border border-gray-800 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2.5 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-300">
                      Live Sample Demo
                    </span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Easy Question
                  </span>
                </div>

                {/* Sample Photo */}
                <div className="relative rounded-xl overflow-hidden h-32 bg-gray-800 mb-2.5 border border-white/10">
                  <img 
                    referrerPolicy="no-referrer" 
                    src="/quizzes/fallingwater-kaufmann-residence.jpg" 
                    alt="Fallingwater" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-bold text-white border border-white/20">
                    📍 Mill Run, Pennsylvania
                  </div>
                </div>

                <p className="text-xs font-bold text-gray-200 mb-2.5">
                  Which master architect designed the cantilevered terraces of &quot;Fallingwater&quot;?
                </p>

                {/* Four Options: Green Pre-checked Answer */}
                <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                  <button
                    type="button"
                    onClick={() => setDemoSelected("Frank Lloyd Wright")}
                    className="p-2 rounded-xl border text-[11px] text-left transition flex items-center justify-between cursor-pointer bg-emerald-500/25 border-emerald-500 text-emerald-300 font-extrabold"
                  >
                    <span className="truncate">Frank Lloyd Wright</span>
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoSelected("Le Corbusier")}
                    className="p-2 rounded-xl border text-[11px] text-left transition flex items-center justify-between cursor-pointer bg-white/5 border-white/10 text-gray-400 opacity-60"
                  >
                    <span className="truncate">Le Corbusier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoSelected("Mies van der Rohe")}
                    className="p-2 rounded-xl border text-[11px] text-left transition flex items-center justify-between cursor-pointer bg-white/5 border-white/10 text-gray-400 opacity-60"
                  >
                    <span className="truncate">Mies van der Rohe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoSelected("Louis Kahn")}
                    className="p-2 rounded-xl border text-[11px] text-left transition flex items-center justify-between cursor-pointer bg-white/5 border-white/10 text-gray-400 opacity-60"
                  >
                    <span className="truncate">Louis Kahn</span>
                  </button>
                </div>

                <div className="p-1.5 rounded-lg mb-2.5 text-[10px] font-bold text-center bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ✓ Correct! Designed 1935 over a waterfall in Mill Run, PA.
                </div>

                <Link 
                  href="/quizzes/iconic-world-landmarks-guess-the-building?autostart=1"
                  className="w-full py-2 bg-white text-black hover:bg-gray-100 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  Play Full Quiz (65 Masterworks) <ArrowRight size={13} />
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
                                <span>{entry.display_name}</span>
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
                          <span className="text-xs font-mono font-extrabold text-blue-600 shrink-0">
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

                <div className="space-y-1.5 text-gray-600 leading-normal text-[11px]">
                  <div className="flex items-start gap-1.5">
                    <span className="font-black text-gray-900">🟢 Easy:</span>
                    <span>10s/Q &bull; 1 pt per correct answer &bull; Obvious iconic choices.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-black text-gray-900">🟡 Medium:</span>
                    <span>15s/Q &bull; 2 pts per correct answer &bull; Subtle architectural distractors.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-black text-gray-900">🔴 Hard:</span>
                    <span>20s/Q &bull; 5 pts per correct answer &bull; Same studio / movement deep cuts.</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex items-start gap-1.5 text-blue-700 font-semibold">
                    <span>⚡ Modes:</span>
                    <span><strong>Practice:</strong> Instant answer clues &bull; <strong>Challenge:</strong> Countdown timer + points.</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* START QUIZ CUSTOMIZATION MODAL (MODES & DIFFICULTY) */}
        {setupModalQuiz && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-gray-200 max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              
              <button
                type="button"
                onClick={() => setSetupModalQuiz(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Quiz Setup
                </span>
                <h3 className="text-base sm:text-lg font-black text-gray-900 mt-1">
                  {setupModalQuiz.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choose your preferred game mode, difficulty, and question round length.
                </p>
              </div>

              {/* 1. Mode Selection: Practice vs Challenge */}
              <div className="mb-4">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-600 block mb-1.5">
                  1. Game Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalMode("challenge")}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      modalMode === "challenge" 
                        ? "bg-black text-white border-black shadow-xs" 
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <Zap size={13} className={modalMode === "challenge" ? "text-amber-400" : "text-amber-600"} />
                      <span>Challenge Mode</span>
                    </div>
                    <p className={`text-[10px] mt-1 ${modalMode === "challenge" ? "text-gray-300" : "text-gray-500"}`}>
                      Continuous timer, official points, and scorecard.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalMode("practice")}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      modalMode === "practice" 
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs" 
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <BookOpen size={13} className={modalMode === "practice" ? "text-white" : "text-blue-600"} />
                      <span>Practice Mode</span>
                    </div>
                    <p className={`text-[10px] mt-1 ${modalMode === "practice" ? "text-blue-100" : "text-gray-500"}`}>
                      Instant answer reveal and tectonic architectural clues.
                    </p>
                  </button>
                </div>
              </div>

              {/* 2. Difficulty Selection: Easy / Medium / Hard */}
              <div className="mb-4">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-600 block mb-1.5">
                  2. Difficulty Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "easy", label: "🟢 Easy", desc: "Classic" },
                    { id: "medium", label: "🟡 Medium", desc: "Confusing" },
                    { id: "hard", label: "🔴 Hard", desc: "Advanced" }
                  ].map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setModalDifficulty(d.id as any)}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        modalDifficulty === d.id 
                          ? "bg-gray-900 text-white border-gray-900 font-black shadow-xs" 
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 font-bold"
                      }`}
                    >
                      <span className="text-xs block">{d.label}</span>
                      <span className="text-[9px] opacity-75">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Round Length: 10 Qs / 20 Qs / All Qs */}
              <div className="mb-6">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-600 block mb-1.5">
                  3. Questions Count
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { count: 10, label: "10 Questions", time: "~3 mins" },
                    { count: 20, label: "20 Questions", time: "~6 mins" },
                    { count: setupModalQuiz.quiz_questions?.[0]?.count || 65, label: `All (${setupModalQuiz.quiz_questions?.[0]?.count || 65})`, time: "Full Round" }
                  ].map(c => (
                    <button
                      key={c.count}
                      type="button"
                      onClick={() => setModalCount(c.count)}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        modalCount === c.count 
                          ? "bg-blue-600 text-white border-blue-600 font-black shadow-xs" 
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 font-bold"
                      }`}
                    >
                      <span className="text-xs block">{c.label}</span>
                      <span className="text-[9px] opacity-75">{c.time}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Quiz Button (Tournament removed) */}
              <Link
                href={`/quizzes/${setupModalQuiz.slug}?mode=${modalMode}&difficulty=${modalDifficulty}&count=${modalCount}&autostart=1`}
                onClick={() => setSetupModalQuiz(null)}
                className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <span>Start Quiz</span>
                <ArrowRight size={14} />
              </Link>

            </div>
          </div>
        )}

      </div>
    </>
  );
}
