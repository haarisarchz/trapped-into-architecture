"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { 
  Trophy, Play, Clock, HelpCircle, Users, Sparkles, 
  ArrowRight, Filter, ChevronRight, Award, Flame, Search
} from "lucide-react";

export default function QuizzesHubPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Leaderboard state
  const [leaderboardTab, setLeaderboardTab] = useState<"weekly" | "monthly" | "all">("weekly");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardTab]);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*, quiz_questions(count), quiz_scores(count)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (data) setQuizzes(data);
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
        .select("display_name, points, score, total_questions, difficulty, created_at, user_id")
        .order("points", { ascending: false })
        .limit(10);

      const now = new Date();
      if (leaderboardTab === "weekly") {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte("created_at", lastWeek);
      } else if (leaderboardTab === "monthly") {
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte("created_at", lastMonth);
      }

      const { data } = await query;
      if (data) setLeaderboard(data);
    } catch (err) {
      console.warn("Error fetching leaderboard:", err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const filteredQuizzes = quizzes.filter(q => {
    const matchesCat = activeCategory === "all" || (q.category || "").toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = !searchQuery.trim() || 
      (q.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
      (q.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = [
    { id: "all", label: "All Quizzes" },
    { id: "architects", label: "🏛️ Architects & Firms" },
    { id: "contemporary", label: "🏢 Contemporary" },
    { id: "history", label: "🏺 History & Heritage" },
    { id: "pritzker", label: "🏆 Pritzker Prize" },
    { id: "software", label: "💻 CAD / Software" }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50/70 pt-[80px] pb-20">
        
        {/* HERO BANNER */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
                <Sparkles size={13} className="text-amber-400" /> Architecture Quiz Zone
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                Test your knowledge. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Climb the architecture leaderboard.
                </span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
                Fast-paced quizzes on Indian and global architecture, master designers, structural trivia, and software speedruns. Play free, earn points, and challenge your friends.
              </p>

              {/* Search & Category Chips */}
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                      activeCategory === c.id 
                        ? "bg-black text-white shadow-xs" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN BODY: 2-COLUMN LAYOUT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT / CENTER: QUIZ CARDS FEED (8 Columns) */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Featured Quizzes
                  <span className="text-xs bg-gray-200 text-gray-700 font-mono px-2 py-0.5 rounded-full">
                    {filteredQuizzes.length}
                  </span>
                </h2>

                <div className="relative w-48 sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search quizzes..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
                  />
                </div>
              </div>

              {loading ? (
                <div className="p-16 text-center text-gray-400 font-medium">
                  Loading Quizzes...
                </div>
              ) : filteredQuizzes.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center">
                  <span className="text-4xl block mb-2">🏛️</span>
                  <h3 className="text-base font-bold text-gray-900 mb-1">No quizzes available in this category</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    New challenges are being crafted by architects every week.
                  </p>
                  <button 
                    onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}
                    className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl"
                  >
                    View All Quizzes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredQuizzes.map(quiz => {
                    const questionCount = quiz.quiz_questions?.[0]?.count || 0;
                    const playsCount = quiz.quiz_scores?.[0]?.count || 0;

                    return (
                      <Link 
                        key={quiz.id}
                        href={`/quizzes/${quiz.slug}`}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-black/50 transition duration-200 flex flex-col group"
                      >
                        {/* Cover Image */}
                        <div className="h-44 bg-gray-900 relative overflow-hidden">
                          {quiz.cover_image ? (
                            <img 
                              src={quiz.cover_image} 
                              alt={quiz.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90 group-hover:opacity-100" 
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
                              <span className="text-4xl mb-1">🏛️</span>
                              <span className="text-xs font-semibold uppercase tracking-wider">Architecture Quiz</span>
                            </div>
                          )}

                          <div className="absolute top-3 right-3">
                            <span className="bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                              {quiz.category}
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-1 mb-1">
                              {quiz.title}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                              {quiz.description || "Test your architectural identification skills."}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                              <span className="flex items-center gap-1">
                                <HelpCircle size={12} className="text-blue-600" /> {questionCount} Qs
                              </span>
                              <span className="flex items-center gap-1">
                                <Flame size={12} className="text-amber-500" /> {playsCount} Plays
                              </span>
                            </div>

                            <span className="text-xs font-bold text-black flex items-center gap-1 group-hover:translate-x-1 transition">
                              Play <ArrowRight size={13} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR: LEADERBOARD WIDGET (4 Columns) */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs sticky top-[100px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Trophy size={18} className="text-amber-500" /> Leaderboard
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                    Live XP
                  </span>
                </div>

                {/* Tabs: Weekly / Monthly / All-Time */}
                <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl mb-4">
                  <button
                    onClick={() => setLeaderboardTab("weekly")}
                    className={`py-1 text-xs font-bold rounded-lg transition ${
                      leaderboardTab === "weekly" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setLeaderboardTab("monthly")}
                    className={`py-1 text-xs font-bold rounded-lg transition ${
                      leaderboardTab === "monthly" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setLeaderboardTab("all")}
                    className={`py-1 text-xs font-bold rounded-lg transition ${
                      leaderboardTab === "all" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    All-Time
                  </button>
                </div>

                {/* Leaderboard Rows */}
                {loadingLeaderboard ? (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    Updating scores...
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    No scores recorded yet this period.<br />
                    Be the first to claim #1 on the leaderboard!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((item, idx) => {
                      const rank = idx + 1;
                      const isTop3 = rank <= 3;
                      const badgeColors = [
                        "bg-amber-400 text-amber-950", // #1 Gold
                        "bg-slate-300 text-slate-900", // #2 Silver
                        "bg-amber-700 text-amber-50"   // #3 Bronze
                      ];

                      return (
                        <div 
                          key={idx}
                          className={`flex items-center justify-between p-2.5 rounded-xl transition ${
                            isTop3 ? "bg-gray-50 border border-gray-100" : "hover:bg-gray-50/50"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`w-6 h-6 rounded-full text-[11px] font-extrabold flex items-center justify-center shrink-0 ${
                              isTop3 ? badgeColors[idx] : "text-gray-400 font-mono"
                            }`}>
                              {rank}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">
                                {item.display_name || "Architect"}
                              </p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                                {item.difficulty} mode • {item.score}/{item.total_questions} correct
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-blue-600 font-mono">
                              {item.points || 0}
                            </span>
                            <span className="text-[10px] text-gray-400 block font-bold">XP</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Score Registration Incentive Notice */}
                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Play any quiz to earn XP. Your high scores are calculated using accuracy, speed, and streaks.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
