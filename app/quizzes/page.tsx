"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { 
  Trophy, Play, Clock, HelpCircle, Users, Sparkles, 
  ArrowRight, Filter, ChevronRight, Award, Flame, Search, Lock
} from "lucide-react";

export default function QuizzesHubPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
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

  const [catalogItems, setCatalogItems] = useState<any[]>([]);

  const fetchQuizzes = async () => {
    try {
      const [{ data: qData }, { data: catData }] = await Promise.all([
        supabase
          .from("quizzes")
          .select("*, quiz_questions(count), quiz_scores(count)")
          .eq("is_published", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("architecture_catalog")
          .select("data")
          .limit(65)
      ]);

      if (qData) setQuizzes(qData);
      if (catData) setCatalogItems(catData.map(c => c.data).filter(Boolean));
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
        .select("display_name, points, score, total_questions, difficulty, time_taken_seconds, created_at, user_id, quiz_id")
        .eq("difficulty", leaderboardDifficulty);

      if (leaderboardQuizFilter !== "all") {
        query = query.eq("quiz_id", leaderboardQuizFilter);
      }

      const { data, error } = await query.limit(40);
      if (error) throw error;

      if (data) {
        const ranked = [...data].sort((a, b) => {
          const accA = (a.score / (a.total_questions || 10)) * 100;
          const accB = (b.score / (b.total_questions || 10)) * 100;
          if (accB !== accA) return accB - accA;
          if ((b.total_questions || 0) !== (a.total_questions || 0)) {
            return (b.total_questions || 0) - (a.total_questions || 0);
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
        
        {/* WIDE DYNAMIC HERO WITH LIVE QUIZ PREVIEW */}
        <div className="bg-white border-b border-gray-200 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column (7 cols): Full-spread Heading & Value Props */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
                  <Sparkles size={13} className="text-amber-400" /> Architecture Arena
                </div>

                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                  Recognize the Masters. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                    Rule the Architecture Leaderboard.
                  </span>
                </h1>

                <p className="mt-3 text-base text-gray-600 leading-relaxed max-w-2xl">
                  45+ iconic world projects, legendary studios, and tectonic trivia. Challenge fellow architects, beat the clock in rapid fire, and claim your place in the rankings.
                </p>

                {/* Quick Feature Badges */}
                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-bold text-gray-700">
                  <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
                    <span className="text-base">📸</span> 45+ High-Res Photos
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
                    <span className="text-base">⚡</span> 12s Rapid Fire Mode
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
                    <span className="text-base">🏆</span> Weekly Leaderboard Points
                  </div>
                </div>

                {/* Categories */}
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCategory(c.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                        activeCategory === c.id 
                          ? "bg-black text-white shadow-md scale-105" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column (5 cols): Live Interactive Question Preview Card */}
              <div className="lg:col-span-5">
                <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black p-5 sm:p-6 rounded-3xl text-white shadow-2xl border border-gray-800 relative group overflow-hidden">
                  
                  {/* Glowing subtle background */}
                  <div className="absolute -top-16 -right-16 w-44 h-44 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />

                  {/* Top Bar of Preview */}
                  <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
                        Live Preview Demo
                      </span>
                    </div>
                    <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-mono font-bold text-amber-300">
                      Sample Question
                    </span>
                  </div>

                  {/* Sample Photo */}
                  <div className="relative rounded-2xl overflow-hidden h-40 bg-gray-800 mb-4 border border-white/10">
                    <img referrerPolicy="no-referrer" 
                      src="https://ik.imagekit.io/ti2a/quizzes/fallingwater-kaufmann-residence-building.jpg" 
                      alt="Sample Project" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white border border-white/20">
                      📍 Mill Run, Pennsylvania
                    </div>
                  </div>

                  {/* Sample Prompt */}
                  <p className="text-xs font-bold text-gray-200 mb-3">
                    Which master architect designed the cantilevered terraces of &quot;Fallingwater&quot;?
                  </p>

                  {/* Sample Options */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center justify-between">
                      <span>Frank Lloyd Wright</span>
                      <span>✓</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-medium">
                      Le Corbusier
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-medium">
                      Mies van der Rohe
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-medium">
                      Louis Kahn
                    </div>
                  </div>

                  <Link 
                    href="/quizzes/iconic-world-landmarks-guess-the-building"
                    className="w-full py-2.5 bg-white text-black hover:bg-gray-100 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    Play Full Quiz Now (45 Projects) <ArrowRight size={14} />
                  </Link>
                </div>
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
                    const slug = quiz.slug;

                    return (
                      <Link 
                        key={quiz.id}
                        href={`/quizzes/${quiz.slug}`}
                        className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-black transition duration-300 flex flex-col group"
                      >
                        {/* BESPOKE QUIZ HEADER TEMPLATES */}
                        {(() => {
                          // TEMPLATE 1: Guess the Building -> 4-Quadrant World Landmarks Collage
                          if (slug === "iconic-world-landmarks-guess-the-building") {
                            const items = [
                              { img: "/quizzes/sydney-opera-house.jpg", label: "Sydney Opera House" },
                              { img: "/quizzes/grand-louvre-pyramid.jpg", label: "Louvre Pyramid" },
                              { img: "/quizzes/sagrada-familia.jpg", label: "Sagrada Família" },
                              { img: "/quizzes/fallingwater-kaufmann-residence.jpg", label: "Fallingwater" },
                            ];
                            return (
                              <div className="h-52 bg-black relative overflow-hidden grid grid-cols-2 grid-rows-2 gap-1 p-1">
                                {items.map((c, i) => (
                                  <div key={i} className="relative overflow-hidden bg-gray-900 group">
                                    <img 
                                      referrerPolicy="no-referrer"
                                      src={c.img} 
                                      alt={c.label} 
                                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                                      onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-1">
                                      <p className="text-[9px] font-bold text-white truncate drop-shadow-xs">{c.label}</p>
                                    </div>
                                  </div>
                                ))}
                                <div className="absolute top-3 left-3 z-10">
                                  <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20 shadow-md">
                                    🏛️ {quiz.category}
                                  </span>
                                </div>
                                <div className="absolute top-3 right-3 z-10">
                                  <span className="bg-white text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md">
                                    Landmark Photos
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          // TEMPLATE 2: Master Architects: Who Designed It? -> Asymmetric 60/40 Hero + 2 Stacked
                          if (slug === "master-architects-who-designed-it") {
                            return (
                              <div className="h-52 bg-black relative overflow-hidden flex gap-1 p-1">
                                <div className="w-3/5 h-full relative overflow-hidden bg-gray-900">
                                  <img 
                                    referrerPolicy="no-referrer"
                                    src="/quizzes/chapelle-notre-dame-du-haut-ronchamp.jpg" 
                                    alt="Ronchamp" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                  />
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2">
                                    <span className="text-[8px] font-extrabold text-purple-300 uppercase tracking-wider block">Featured Masterwork</span>
                                    <p className="text-[11px] font-bold text-white truncate">Ronchamp (Le Corbusier)</p>
                                  </div>
                                </div>
                                <div className="w-2/5 h-full flex flex-col gap-1">
                                  <div className="h-1/2 relative overflow-hidden bg-gray-900">
                                    <img 
                                      referrerPolicy="no-referrer"
                                      src="/quizzes/barcelona-pavilion.jpg" 
                                      alt="Barcelona Pavilion" 
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-1">
                                      <p className="text-[8px] font-bold text-white truncate">Barcelona Pavilion</p>
                                    </div>
                                  </div>
                                  <div className="h-1/2 relative overflow-hidden bg-gray-900">
                                    <img 
                                      referrerPolicy="no-referrer"
                                      src="/quizzes/guggenheim-museum-bilbao.jpg" 
                                      alt="Bilbao" 
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-1">
                                      <p className="text-[8px] font-bold text-white truncate">Guggenheim Bilbao</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="absolute top-3 left-3 z-10">
                                  <span className="bg-purple-600/90 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20 shadow-md">
                                    📐 {quiz.category}
                                  </span>
                                </div>
                                <div className="absolute top-3 right-3 z-10">
                                  <span className="bg-white text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md">
                                    Architects + Works
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          // TEMPLATE 3: Where in the World? -> 3-Column Skyline Triptych with City Pins
                          if (slug === "where-in-the-world-guess-the-city-country") {
                            const skylines = [
                              { img: "/quizzes/the-shard.jpg", pin: "🇬🇧 London", city: "The Shard" },
                              { img: "/quizzes/cctv-headquarters.jpg", pin: "🇨🇳 Beijing", city: "CCTV Tower" },
                              { img: "/quizzes/lotus-temple.jpg", pin: "🇮🇳 New Delhi", city: "Lotus Temple" }
                            ];
                            return (
                              <div className="h-52 bg-black relative overflow-hidden grid grid-cols-3 gap-1 p-1">
                                {skylines.map((s, i) => (
                                  <div key={i} className="relative overflow-hidden bg-gray-900">
                                    <img 
                                      referrerPolicy="no-referrer"
                                      src={s.img} 
                                      alt={s.city} 
                                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                                    />
                                    <div className="absolute top-2 inset-x-1 flex justify-center">
                                      <span className="bg-black/85 backdrop-blur-sm text-amber-300 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border border-amber-400/30 shadow-xs">
                                        {s.pin}
                                      </span>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-1 text-center">
                                      <p className="text-[9px] font-bold text-white truncate">{s.city}</p>
                                    </div>
                                  </div>
                                ))}
                                <div className="absolute top-3 left-3 z-10">
                                  <span className="bg-amber-600/90 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20 shadow-md">
                                    🌍 {quiz.category}
                                  </span>
                                </div>
                                <div className="absolute top-3 right-3 z-10">
                                  <span className="bg-white text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md">
                                    Global Geography
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          // TEMPLATE 4: Architectural Detective -> Mystery Blueprint / Clues Dossier Card
                          if (slug === "architectural-detective-guess-the-clues") {
                            return (
                              <div className="h-52 bg-gradient-to-br from-[#0f172a] via-[#091122] to-[#020617] relative overflow-hidden p-4 flex flex-col justify-between border-b border-cyan-500/20">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:14px_14px]" />
                                
                                <div className="relative z-10 flex items-center justify-between">
                                  <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-cyan-400/30 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> DOSSIER // ARCHITECTURAL DETECTIVE
                                  </span>
                                  <span className="bg-white/10 text-white/90 text-[10px] font-mono px-2 py-0.5 rounded-md border border-white/10">
                                    NO PHOTOS
                                  </span>
                                </div>

                                <div className="relative z-10 my-auto bg-black/50 backdrop-blur-sm rounded-xl p-3 border border-cyan-500/30 shadow-inner">
                                  <p className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <span>🔍</span> FORENSIC TEASER:
                                  </p>
                                  <p className="text-xs text-gray-200 font-mono italic leading-snug line-clamp-2">
                                    "Features sunken barrel vaults covered in broken ceramic mosaic tiles that reflect solar heat..."
                                  </p>
                                </div>

                                <div className="relative z-10 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                                  <span>3 TECTONIC CLUES PER BUILDING</span>
                                  <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition">SOLVE →</span>
                                </div>
                              </div>
                            );
                          }

                          // TEMPLATE 5: Timeline Challenge -> Chronological Horizontal Filmstrip
                          if (slug === "timeline-challenge-when-was-it-built") {
                            const eras = [
                              { year: "1910", name: "Robie House", img: "/quizzes/robie-house-flw.jpg" },
                              { year: "1931", name: "Villa Savoye", img: "/quizzes/villa-savoye.jpg" },
                              { year: "1962", name: "TWA Center", img: "/quizzes/twa-flight-center-saarinen.jpg" },
                              { year: "2012", name: "The Shard", img: "/quizzes/the-shard.jpg" }
                            ];
                            return (
                              <div className="h-52 bg-[#091122] relative overflow-hidden flex flex-col justify-between p-2">
                                <div className="h-38 grid grid-cols-4 gap-1">
                                  {eras.map((e, idx) => (
                                    <div key={idx} className="relative overflow-hidden rounded-lg bg-gray-900 group">
                                      <img 
                                        referrerPolicy="no-referrer"
                                        src={e.img} 
                                        alt={e.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                                      />
                                      <div className="absolute top-1 inset-x-0 flex justify-center">
                                        <span className="bg-blue-600/90 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-blue-400/40 shadow-xs">
                                          {e.year}
                                        </span>
                                      </div>
                                      <div className="absolute inset-x-0 bottom-0 bg-black/85 p-1 text-center">
                                        <p className="text-[8px] font-bold text-white truncate">{e.name}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="h-7 bg-black/60 rounded-lg flex items-center justify-between px-3 text-[10px] text-blue-300 font-extrabold">
                                  <span>⏪ 1900s Early Modern</span>
                                  <span className="text-gray-400 font-mono text-[9px]">CHRONOLOGICAL SPRINT</span>
                                  <span>2020s Contemporary ⏩</span>
                                </div>

                                <div className="absolute top-3 left-3 z-10">
                                  <span className="bg-blue-700/90 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20 shadow-md">
                                    ⏳ {quiz.category}
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          // TEMPLATE 6: Architectural Styles & Movements -> 3 Contrasting Movements
                          if (slug === "architectural-styles-and-movements") {
                            const styles = [
                              { name: "Catalan Modernisme", img: "/quizzes/casa-batllo.jpg", badge: "Organic" },
                              { name: "Brutalism", img: "/quizzes/palace-of-assembly-chandigarh.jpg", badge: "Concrete" },
                              { name: "High-Tech", img: "/quizzes/centre-pompidou.jpg", badge: "Exposed" }
                            ];
                            return (
                              <div className="h-52 bg-black relative overflow-hidden grid grid-cols-3 gap-1 p-1">
                                {styles.map((s, idx) => (
                                  <div key={idx} className="relative overflow-hidden bg-gray-900">
                                    <img 
                                      referrerPolicy="no-referrer"
                                      src={s.img} 
                                      alt={s.name} 
                                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                                    />
                                    <div className="absolute top-2 inset-x-1 flex justify-center">
                                      <span className="bg-pink-600/90 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border border-pink-400/30">
                                        {s.badge}
                                      </span>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 text-center">
                                      <p className="text-[9px] font-extrabold text-white leading-tight">{s.name}</p>
                                    </div>
                                  </div>
                                ))}
                                <div className="absolute top-3 left-3 z-10">
                                  <span className="bg-pink-600/90 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20 shadow-md">
                                    🎨 {quiz.category}
                                  </span>
                                </div>
                                <div className="absolute top-3 right-3 z-10">
                                  <span className="bg-white text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md">
                                    Styles & Theory
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          // TEMPLATE 7: Architect's Portfolio: Pair the Masterpieces -> 50/50 Dual Diptych
                          if (slug === "architects-oeuvre-pair-the-masterpieces") {
                            return (
                              <div className="h-52 bg-black relative overflow-hidden flex gap-1 p-1">
                                <div className="w-1/2 h-full relative overflow-hidden bg-gray-900">
                                  <img 
                                    referrerPolicy="no-referrer"
                                    src="/quizzes/salk-institute.jpg" 
                                    alt="Salk Institute" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                  />
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 text-center">
                                    <span className="text-[8px] font-bold text-teal-300 block">Work A</span>
                                    <p className="text-[10px] font-bold text-white truncate">Salk Institute</p>
                                  </div>
                                </div>
                                
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-black/90 border border-teal-400/50 text-teal-300 px-2.5 py-1 rounded-full shadow-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur-md">
                                  <span>⇄</span> Match Pair
                                </div>

                                <div className="w-1/2 h-full relative overflow-hidden bg-gray-900">
                                  <img 
                                    referrerPolicy="no-referrer"
                                    src="/quizzes/iim-ahmedabad-louis-kahn.jpg" 
                                    alt="IIM Ahmedabad" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                  />
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 text-center">
                                    <span className="text-[8px] font-bold text-teal-300 block">Work B</span>
                                    <p className="text-[10px] font-bold text-white truncate">IIM Ahmedabad</p>
                                  </div>
                                </div>

                                <div className="absolute top-3 left-3 z-10">
                                  <span className="bg-teal-600/90 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20 shadow-md">
                                    👥 {quiz.category}
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          // Fallback Template: Single Cinematic Cover
                          return (
                            <div className="h-52 bg-gray-900 relative overflow-hidden">
                              {quiz.cover_image && (
                                <img 
                                  referrerPolicy="no-referrer"
                                  src={quiz.cover_image} 
                                  alt={quiz.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                              <div className="absolute top-3 left-3 z-10">
                                <span className="bg-black/85 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20 shadow-md">
                                  {quiz.category}
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Card Content */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition mb-1 leading-snug">
                              {quiz.title}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                              {quiz.description || "Test your architectural knowledge."}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
                              <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                                <HelpCircle size={13} className="text-blue-600" /> {questionCount} Questions
                              </span>
                              <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                                <Flame size={13} className="text-amber-500" /> {playsCount} Plays
                              </span>
                            </div>

                            <span className="px-4 py-2 bg-black group-hover:bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs">
                              Start <ArrowRight size={13} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* UPCOMING QUIZZES (COMING SOON) */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span>✨</span> Upcoming Quizzes & Challenges
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                    In Development
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/80 rounded-3xl border border-dashed border-gray-300 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">🏛️</span>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                          Coming Soon
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">
                        Guess the Architect
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                        Identify visionary Pritzker laureates, master sketches, and distinctive design philosophies.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-bold">
                      <span>40 Questions</span>
                      <span className="text-gray-400">Launching Soon</span>
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-3xl border border-dashed border-gray-300 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">📍</span>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                          Coming Soon
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">
                        Guess the Building Location
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                        Recognize world architectural capitals, skylines, and climatic contextual responses.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-bold">
                      <span>40 Questions</span>
                      <span className="text-gray-400">Launching Soon</span>
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-3xl border border-dashed border-gray-300 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">🏺</span>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                          Coming Soon
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">
                        Architecture History & Theory
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                        From Classical Orders and Bauhaus to Metabolism, Postmodernism & Deconstructivism.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-bold">
                      <span>40 Questions</span>
                      <span className="text-gray-400">Launching Soon</span>
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-3xl border border-dashed border-gray-300 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">🎓</span>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                          Coming Soon
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">
                        GATE Architecture & NATA Mock Prep
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                        Structures, planning norms, building codes, and architectural aptitude exam drill.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-bold">
                      <span>50 Questions</span>
                      <span className="text-gray-400">Launching Soon</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* EXPLORE THE PLATFORM: ECOSYSTEM LINKS */}
              <div className="mt-10 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                      Explore Trapped Into Architecture
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Beyond quizzes — discover architecture jobs, internship openings, and top design studios.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
                  <Link 
                    href="/jobs" 
                    className="p-4 rounded-2xl border border-gray-200 hover:border-black hover:bg-gray-50/70 transition group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold mb-2">
                        💼
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition">
                        Architecture Jobs
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                        Browse active openings for Junior, Senior & Project Architects across India.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-black mt-3 flex items-center gap-1 group-hover:translate-x-1 transition">
                      Explore Jobs →
                    </span>
                  </Link>

                  <Link 
                    href="/internships" 
                    className="p-4 rounded-2xl border border-gray-200 hover:border-black hover:bg-gray-50/70 transition group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold mb-2">
                        🎓
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-600 transition">
                        Architecture Internships
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                        Find verified architecture student internships, traineeships & practical training.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-black mt-3 flex items-center gap-1 group-hover:translate-x-1 transition">
                      View Internships →
                    </span>
                  </Link>

                  <Link 
                    href="/companies" 
                    className="p-4 rounded-2xl border border-gray-200 hover:border-black hover:bg-gray-50/70 transition group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold mb-2">
                        🏢
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-purple-600 transition">
                        Design Firms & Studios
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                        Discover top architectural practices, verified studios, and office cultures.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-black mt-3 flex items-center gap-1 group-hover:translate-x-1 transition">
                      View Firms →
                    </span>
                  </Link>

                  <Link 
                    href="/practice-exams" 
                    className="p-4 rounded-2xl border border-gray-200 hover:border-black hover:bg-gray-50/70 transition group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold mb-2">
                        📝
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-amber-600 transition">
                        Practice Exams & More
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                        GATE Architecture mock tests, study materials, and many new portals to come.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-black mt-3 flex items-center gap-1 group-hover:translate-x-1 transition">
                      Start Prep →
                    </span>
                  </Link>
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR: LEADERBOARD WIDGET WITH BLURRED GUEST LOCK */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs sticky top-[100px] relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Trophy size={18} className="text-amber-500" /> Leaderboard
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                    Live Points
                  </span>
                </div>

                {/* Quiz Selector: Overall Quizzes vs Particular Quiz */}
                <div className="mb-3">
                  <select
                    value={leaderboardQuizFilter}
                    onChange={(e) => setLeaderboardQuizFilter(e.target.value)}
                    className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-black transition"
                  >
                    <option value="all">🌐 Overall Quizzes (All Challenges)</option>
                    {quizzes.map(q => (
                      <option key={q.id} value={q.id}>
                        🎯 {q.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3 Difficulty Tabs: Easy / Medium / Hard */}
                <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl mb-4">
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
                  <div className="p-8 text-center text-gray-400 text-xs">
                    Updating scores...
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    Be among the first to enter the TI2A Quiz leaderboard!
                  </div>
                ) : (
                  <div className="relative">
                    <div className="space-y-2">
                      {leaderboard.map((item, idx) => {
                        const rank = idx + 1;
                        const isTop3 = rank <= 3;
                        const badgeColors = [
                          "bg-amber-400 text-amber-950", // #1 Gold
                          "bg-slate-300 text-slate-900", // #2 Silver
                          "bg-amber-700 text-amber-50"   // #3 Bronze
                        ];

                        const acc = (item.total_questions || 10) > 0 
                          ? Math.round((item.score / (item.total_questions || 10)) * 100) 
                          : 0;

                        // If user is guest, blur rows 2+
                        const shouldBlur = !currentUser && rank > 1;
                        const displayName = shouldBlur
                          ? (item.display_name ? item.display_name.slice(0, 3) + "***" : "Architect")
                          : (!currentUser && rank === 1 ? (item.display_name ? item.display_name.slice(0, 4) + "***" : "Ar. Top Scorer") : item.display_name || "Architect");

                        return (
                          <div 
                            key={idx}
                            className={`flex items-center justify-between p-2.5 rounded-xl transition ${
                              isTop3 ? "bg-gray-50 border border-gray-100" : "hover:bg-gray-50/50"
                            } ${shouldBlur ? "filter blur-[3px] opacity-40 select-none pointer-events-none" : ""}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`w-6 h-6 rounded-full text-[11px] font-extrabold flex items-center justify-center shrink-0 ${
                                isTop3 ? badgeColors[idx] : "text-gray-400 font-mono"
                              }`}>
                                {rank}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">
                                  {displayName}
                                </p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                                  {item.total_questions || 10} Qs • <span className="text-emerald-700 font-bold">{acc}% Acc</span>
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-blue-600 font-mono">
                                {shouldBlur ? "•••" : (item.points || 0)}
                              </span>
                              <span className="text-[10px] text-gray-400 block font-bold">PTS</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* FROSTED GLASS OVERLAY LOCK FOR GUESTS */}
                    {!currentUser && leaderboard.length > 1 && (
                      <div className="absolute inset-x-0 bottom-0 top-16 bg-white/75 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center p-5 text-center z-10 border border-gray-100/80 shadow-md">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-2 shadow-xs">
                          <Lock size={18} />
                        </div>
                        <h4 className="text-xs font-extrabold text-gray-900 mb-1">
                          Full Leaderboard Locked
                        </h4>
                        <p className="text-[11px] text-gray-500 mb-3 max-w-[200px] leading-relaxed">
                          Register a free account or log in to view full architect rankings and see where you place.
                        </p>
                        <button 
                          onClick={() => {
                            const btn = document.querySelector('[data-auth-trigger="login"]') as HTMLButtonElement;
                            if (btn) btn.click();
                            else window.location.href = "/login?redirect=quizzes";
                          }}
                          className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                        >
                          Unlock Leaderboard
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Notice */}
                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                  <p className="text-[11px] text-gray-500 leading-normal">
                    {currentUser 
                      ? "Play quizzes in Hard Mode to maximize your points (5 pts/question) and climb into the Top 3!"
                      : "Scores are updated live. Register to compete for the #1 spot."}
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
