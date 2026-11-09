"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { 
  Trophy, Play, Clock, HelpCircle, ArrowRight, ArrowLeft, 
  CheckCircle2, XCircle, Share2, MessageCircle, Copy, 
  RotateCcw, Sparkles, Award, ShieldAlert, Flame, Zap,
  ChevronRight, Building2, Briefcase, BookOpen, GraduationCap
} from "lucide-react";
import { 
  getQuestionsForGameDifficulty, 
  getQuestionDifficulty 
} from "@/lib/quizDifficulty";

interface Question {
  id: string;
  order_index: number;
  question_type: "choose" | "fill_up" | "missing_letters";
  question_text: string;
  media_type: "none" | "image";
  media_url: string;
  options: string[];
  correct_answer: string;
  accepted_aliases: string[];
  explanation_clue: string;
}

type Difficulty = "easy" | "medium" | "hard";
type FeedbackMode = "instant" | "end";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateMissingLettersMask(text: string): string {
  if (!text) return "";
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === " " || char === "-" || char === "'" || char === ".") {
      result += "   ";
    } else if (i % 2 === 0 || i === text.length - 1) {
      result += char.toUpperCase() + " ";
    } else {
      result += "_ ";
    }
  }
  return result.trim();
}

export default function QuizPlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params?.slug as string;

  // Challenge URL parameters
  const challengerName = searchParams.get("challenger");
  const challengerScore = searchParams.get("score");
  const challengerDiff = searchParams.get("difficulty");

  const [quiz, setQuiz] = useState<any>(null);
  const [allQuestionsPool, setAllQuestionsPool] = useState<Question[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionCountChoice, setQuestionCountChoice] = useState<number>(10);
  const [loading, setLoading] = useState(true);

  // Sidebar: Leaderboard & other quizzes
  const [leaderboardScope, setLeaderboardScope] = useState<"quiz" | "overall">("quiz");
  const [leaderboardTab, setLeaderboardTab] = useState<"weekly" | "monthly" | "all">("weekly");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [otherQuizzes, setOtherQuizzes] = useState<any[]>([]);

  // Pre-game config states
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>("instant");

  // Game active states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [fillInput, setFillInput] = useState("");
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // User state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [guestId, setGuestId] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Timer refs: dual timers for overall live session & question rapid fire
  const liveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let gid = localStorage.getItem("quiz_guest_id");
    if (!gid) {
      gid = "anon_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("quiz_guest_id", gid);
    }
    setGuestId(gid);

    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)); } catch (e) {}
    }

    fetchQuizData();
  }, [slug]);

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardTab, leaderboardScope, quiz?.id]);

  const fetchQuizData = async () => {
    try {
      const [
        { data: qData, error: qErr },
        { data: oqData }
      ] = await Promise.all([
        supabase
          .from("quizzes")
          .select("*")
          .eq("slug", slug)
          .single(),
        supabase
          .from("quizzes")
          .select("id, title, slug, category, cover_image, quiz_questions(count)")
          .eq("is_published", true)
          .neq("slug", slug)
          .limit(4)
      ]);

      if (qErr || !qData) throw new Error("Quiz not found");
      setQuiz(qData);
      if (oqData) setOtherQuizzes(oqData);

      const { data: quesData, error: quesErr } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", qData.id)
        .order("order_index", { ascending: true });

      if (quesData) {
        const formatted = quesData.map(q => ({
          ...q,
          question_type: (q.question_type as any) || "choose",
          options: Array.isArray(q.options) ? q.options : [],
          accepted_aliases: Array.isArray(q.accepted_aliases) ? q.accepted_aliases : []
        }));
        setAllQuestionsPool(formatted);
        setQuestions(formatted);
      }
    } catch (err) {
      console.warn("Error fetching quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      let query = supabase
        .from("quiz_scores")
        .select("display_name, points, score, total_questions, difficulty, created_at, user_id, quiz_id")
        .order("points", { ascending: false })
        .limit(10);

      if (leaderboardScope === "quiz" && quiz?.id) {
        query = query.eq("quiz_id", quiz.id);
      }

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

  // 1. Overall Live Session Stopwatch: ticks second-by-second while game is in progress
  useEffect(() => {
    if (!gameStarted || isGameOver) {
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
      return;
    }

    liveTimerRef.current = setInterval(() => {
      setTotalTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
    };
  }, [gameStarted, isGameOver]);

  // 2. Per-Question Countdown Timer for Medium & Hard speed bonuses
  useEffect(() => {
    if (!gameStarted || isGameOver || isAnswerSubmitted || difficulty === "easy") {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      return;
    }

    questionTimerRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [gameStarted, isGameOver, isAnswerSubmitted, currentIndex, difficulty]);

  const handleStartGame = () => {
    const pool = allQuestionsPool.length > 0 ? allQuestionsPool : questions;
    const targeted = getQuestionsForGameDifficulty(pool, difficulty, questionCountChoice);
    const sampled = shuffleArray(targeted).map(q => ({
      ...q,
      options: shuffleArray(q.options || [])
    }));
    setQuestions(sampled);
    setGameStarted(true);
    setCurrentIndex(0);
    setUserAnswers({});
    setTotalPoints(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalTimeElapsed(0);
    setIsGameOver(false);
    setIsAnswerSubmitted(false);
    setFillInput("");
    resetTimerForDifficulty(difficulty);
  };

  const resetTimerForDifficulty = (diff: Difficulty) => {
    if (diff === "easy") setTimerSeconds(999);
    else if (diff === "medium") setTimerSeconds(25);
    else if (diff === "hard") setTimerSeconds(12);
  };

  const handleTimeExpired = () => {
    handleSelectAnswer("__TIMEOUT__");
  };

  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

  const isAnswerCorrect = (question: Question, selected: string) => {
    if (!selected || selected === "__TIMEOUT__") return false;
    const target = normalize(question.correct_answer);
    if (normalize(selected) === target) return true;

    if (question.accepted_aliases && question.accepted_aliases.length > 0) {
      return question.accepted_aliases.some(a => normalize(a) === normalize(selected));
    }
    return false;
  };

  const calculatePointsForQuestion = (isCorrect: boolean, qDiff: Difficulty) => {
    if (!isCorrect) return 0;
    if (qDiff === "easy") return 1;
    if (qDiff === "medium") return 2;
    if (qDiff === "hard") return 5;
    return 1;
  };

  const handleSelectAnswer = (selected: string) => {
    if (isAnswerSubmitted) return;

    const currentQ = questions[currentIndex];
    const correct = isAnswerCorrect(currentQ, selected);

    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    if (newStreak > maxStreak) setMaxStreak(newStreak);

    const currentQuestionDiff = (getQuestionDifficulty(currentQ.correct_answer || currentQ.question_text || "") || difficulty) as Difficulty;
    const pts = calculatePointsForQuestion(correct, currentQuestionDiff);
    setTotalPoints(prev => prev + pts);

    setUserAnswers(prev => ({ ...prev, [currentIndex]: selected }));
    setIsAnswerSubmitted(true);

    if (feedbackMode === "end") {
      setTimeout(() => {
        advanceNextQuestion();
      }, 350);
    }
  };

  const advanceNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswerSubmitted(false);
      setFillInput("");
      resetTimerForDifficulty(difficulty);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setIsGameOver(true);
    if (liveTimerRef.current) clearInterval(liveTimerRef.current);
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (isAnswerCorrect(q, userAnswers[idx])) correctCount++;
    });

    try {
      const displayName = currentUser?.name || currentUser?.username || `Architect_#${guestId.slice(-4)}`;
      await supabase.from("quiz_scores").insert([{
        quiz_id: quiz.id,
        user_id: currentUser?.id || null,
        guest_session_id: guestId,
        display_name: displayName,
        score: correctCount,
        total_questions: questions.length,
        points: totalPoints,
        difficulty,
        time_taken_seconds: totalTimeElapsed
      }]);
      fetchLeaderboard();
    } catch (e) {
      console.warn("Failed saving score:", e);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    const name = encodeURIComponent(currentUser?.username || currentUser?.name || "Architect");
    return `${window.location.origin}/quizzes/${slug}?challenger=${name}&score=${totalPoints}&difficulty=${difficulty}`;
  };

  const getWhatsAppShareLink = () => {
    const url = getShareUrl();
    const correctCount = questions.filter((q, idx) => isAnswerCorrect(q, userAnswers[idx])).length;
    const text = `🏛️ I scored *${totalPoints} Points* (${correctCount}/${questions.length} correct in ${formatTime(totalTimeElapsed)}) in the *${quiz?.title || "Architecture Quiz"}* on ${difficulty.toUpperCase()} mode! ⚡\n\nCan you beat my score? Accept my challenge here:\n${url}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const copyChallengeLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-[80px]">
          <p className="text-gray-500 font-bold">Loading Architecture Quiz...</p>
        </div>
      </>
    );
  }

  if (!quiz) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-[80px] p-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
          <p className="text-xs text-gray-500 mb-4">This quiz may be unlisted or draft.</p>
          <Link href="/quizzes" className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl">
            Browse Quizzes
          </Link>
        </div>
      </>
    );
  }

  const currentQ = questions[currentIndex];
  const qDiff = currentQ ? getQuestionDifficulty(currentQ.correct_answer || currentQ.question_text || "") : "medium";
  const correctCount = questions.filter((q, idx) => isAnswerCorrect(q, userAnswers[idx])).length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50/70 pt-[80px] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* BREADCRUMB & GLOBAL NAVIGATION HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <Link href="/quizzes" className="hover:text-black flex items-center gap-1 font-bold text-gray-800 transition">
                <ArrowLeft size={14} /> Quizzes Hub
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-bold truncate max-w-xs sm:max-w-md">
                {quiz.title}
              </span>
            </div>

            {/* QUICK LINKS TO KEY WEBSITE PORTALS */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <Link 
                href="/jobs" 
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-full border border-gray-200 shadow-2xs transition flex items-center gap-1.5"
              >
                <span>💼</span> Architecture Jobs
              </Link>
              <Link 
                href="/companies" 
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-full border border-gray-200 shadow-2xs transition flex items-center gap-1.5"
              >
                <span>🏢</span> Design Firms
              </Link>
              <Link 
                href="/internships" 
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-full border border-gray-200 shadow-2xs transition flex items-center gap-1.5"
              >
                <span>🎓</span> Internships
              </Link>
              <Link 
                href="/practice-exams" 
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-full border border-gray-200 shadow-2xs transition flex items-center gap-1.5"
              >
                <span>📝</span> Practice Exams
              </Link>
            </div>
          </div>

          {/* 2-COLUMN MAIN CONTENT GRID (8 cols main, 4 cols sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT / MAIN COLUMN (8 cols): Quiz container + Portals */}
            <div className="lg:col-span-8 flex flex-col gap-8">

              {/* 1. PRE-GAME SETUP SCREEN */}
              {!gameStarted ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm text-center">
                  
                  {challengerName && challengerScore && (
                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-2 border-amber-400 text-left flex items-center gap-3.5">
                      <span className="text-3xl">⚔️</span>
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
                          Challenge Received!
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          <span className="text-blue-600 underline font-black">{challengerName}</span> scored{" "}
                          <span className="font-mono text-amber-700 font-extrabold">{challengerScore} Points</span> on {challengerDiff || "medium"} mode!
                        </p>
                        <p className="text-xs text-gray-500">Can you outscore them and win this challenge?</p>
                      </div>
                    </div>
                  )}

                  {quiz.cover_image && (
                    <img referrerPolicy="no-referrer"
                      src={quiz.cover_image} 
                      alt={quiz.title} 
                      className="w-full h-48 sm:h-64 object-cover rounded-2xl mb-6 shadow-xs border border-gray-100"
                      onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                    />
                  )}

                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    {quiz.category}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 mb-2">
                    {quiz.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed mb-8">
                    {quiz.description || "Test your architectural knowledge, beat the live timer, and see where you rank on the weekly leaderboard."}
                  </p>

                  {/* Step 1: Select Difficulty Mode */}
                  <div className="text-left mb-6">
                    <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-2">
                      1. Select Difficulty Mode:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => setDifficulty("easy")}
                        className={`p-3.5 rounded-2xl border text-left transition ${
                          difficulty === "easy" 
                            ? "bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-500" 
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                          🟢 Easy Mode
                        </p>
                        <p className="text-[11px] font-bold text-gray-800 mt-1">Famous & Viral Landmarks</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Recognizable icons from reels, social media & foundational history (Sydney Opera, Fallingwater, Louvre Pyramid). 1 Point per question.</p>
                      </button>

                      <button
                        onClick={() => setDifficulty("medium")}
                        className={`p-3.5 rounded-2xl border text-left transition ${
                          difficulty === "medium" 
                            ? "bg-amber-50 border-amber-500 shadow-xs ring-1 ring-amber-500" 
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                          🟡 Medium Mode
                        </p>
                        <p className="text-[11px] font-bold text-gray-800 mt-1">Syllabus Classics & Milestones</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Core architecture degree syllabus icons (Salk Institute, Capitol Complex, Church of the Light). 25s timer. 2 Points per question.</p>
                      </button>

                      <button
                        onClick={() => setDifficulty("hard")}
                        className={`p-3.5 rounded-2xl border text-left transition ${
                          difficulty === "hard" 
                            ? "bg-red-50 border-red-500 shadow-xs ring-1 ring-red-500" 
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                          🔴 Hard Mode
                        </p>
                        <p className="text-[11px] font-bold text-gray-800 mt-1">Advanced Tectonic Masterpieces</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Challenging structural feats, monographs & niche Pritzker works (Braga Quarry, UTEC Lima, Ningbo). 12s blitz. 5 Points per question.</p>
                      </button>
                    </div>
                  </div>

                  {/* Step 1.5: Select Number of Questions */}
                  {allQuestionsPool.length > 10 && (
                    <div className="text-left mb-6">
                      <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-2">
                        2. Round Length:
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { count: 10, label: "10 Questions", sub: "Quick 2 min blitz" },
                          { count: 20, label: "20 Questions", sub: "Standard challenge" },
                          { count: 999, label: "All Questions", sub: `Full ${allQuestionsPool.length} marathon` }
                        ].map(opt => (
                          <button
                            key={opt.count}
                            type="button"
                            onClick={() => setQuestionCountChoice(opt.count)}
                            className={`p-3 rounded-2xl border text-left transition ${
                              questionCountChoice === opt.count
                                ? "bg-purple-50 border-purple-500 shadow-xs"
                                : "bg-white border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <p className="text-xs font-bold text-gray-900">{opt.label}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{opt.sub}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Answer Review Style */}
                  <div className="text-left mb-8">
                    <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-2">
                      3. Answer Review Style:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => setFeedbackMode("instant")}
                        className={`p-3 rounded-2xl border text-left transition ${
                          feedbackMode === "instant" 
                            ? "bg-blue-50/60 border-blue-500 shadow-xs" 
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className="text-xs font-bold text-gray-900">Show Answers on the Spot</p>
                        <p className="text-[11px] text-gray-500">Learn trivia immediately after each question.</p>
                      </button>

                      <button
                        onClick={() => setFeedbackMode("end")}
                        className={`p-3 rounded-2xl border text-left transition ${
                          feedbackMode === "end" 
                            ? "bg-blue-50/60 border-blue-500 shadow-xs" 
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className="text-xs font-bold text-gray-900">Exam Mode (Answers at the End)</p>
                        <p className="text-[11px] text-gray-500">Fast competitive flow; full review at the end.</p>
                      </button>
                    </div>
                  </div>

                  {/* Start Button */}
                  <button
                    onClick={handleStartGame}
                    className="w-full py-4 bg-black hover:bg-gray-800 text-white font-extrabold rounded-2xl text-sm transition shadow-md flex items-center justify-center gap-2"
                  >
                    <Play size={18} fill="white" /> Start Quiz Challenge
                  </button>
                </div>
              ) : isGameOver ? (

                /* 2. POST-GAME SUMMARY SCREEN */
                <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 text-3xl">
                    🏆
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                    Challenge Complete!
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Here is your performance breakdown</p>

                  {/* Score Display */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
                    <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Points</p>
                      <p className="text-2xl font-black text-blue-600 mt-1">{totalPoints} PTS</p>
                    </div>
                    <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Score</p>
                      <p className="text-2xl font-black text-gray-900 mt-1">{correctCount} / {questions.length}</p>
                    </div>
                    <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Max Streak</p>
                      <p className="text-2xl font-black text-amber-500 mt-1 flex items-center justify-center gap-1">
                        <Flame size={18} /> {maxStreak}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Time</p>
                      <p className="text-2xl font-black text-gray-900 mt-1 font-mono">{formatTime(totalTimeElapsed)}</p>
                    </div>
                  </div>

                  {/* GUEST XP HOOK */}
                  {!currentUser && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 text-left mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-blue-900 flex items-center gap-1">
                          <Sparkles size={14} className="text-amber-500" /> Playing as Anonymous Guest
                        </p>
                        <p className="text-[11px] text-blue-700 mt-0.5">
                          Create a free account or log in now to claim your <strong>{totalPoints} Points</strong> to your official profile and lock your rank on the leaderboard!
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          const btn = document.querySelector('[data-auth-trigger="login"]') as HTMLButtonElement;
                          if (btn) btn.click();
                          else window.location.href = "/login?redirect=quizzes";
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition whitespace-nowrap shadow-xs shrink-0"
                      >
                        Claim Points & Login
                      </button>
                    </div>
                  )}

                  {/* VIRAL SHARE BUTTONS */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-8">
                    <p className="text-xs font-extrabold text-gray-900 mb-3 flex items-center justify-center gap-1.5">
                      <Share2 size={14} /> Challenge Your Friends:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                      <a
                        href={getWhatsAppShareLink()}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <MessageCircle size={14} /> Share on WhatsApp
                      </a>
                      <button
                        onClick={copyChallengeLink}
                        className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                      >
                        <Copy size={14} /> {copiedLink ? "Link Copied! ✓" : "Copy Challenge Link"}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={handleStartGame}
                      className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <RotateCcw size={14} /> Play Again
                    </button>
                    <Link
                      href="/quizzes"
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition border border-gray-300"
                    >
                      Browse Other Quizzes
                    </Link>
                  </div>
                </div>
              ) : (

                /* 3. ACTIVE QUESTION CARD */
                <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                  <div>
                    {/* QUESTION HEADER WITH LIVE STOPWATCH & BONUS COUNTDOWN */}
                    <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-500">
                          Question {currentIndex + 1} of {questions.length}
                        </span>
                        {qDiff === "easy" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                            🟢 Famous Landmark
                          </span>
                        ) : qDiff === "hard" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 flex items-center gap-1 border border-red-200">
                            🔴 Advanced Tectonic
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-200">
                            🟡 Syllabus Classic
                          </span>
                        )}
                        {streak >= 2 && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                            <Flame size={12} className="text-amber-500" /> {streak} Streak!
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* 🔴 LIVE RUNNING STOPWATCH TIMER (TICKS CONTINUOUSLY) */}
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-mono font-bold shadow-xs">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <Clock size={12} className="text-emerald-400" />
                          <span>{formatTime(totalTimeElapsed)}</span>
                        </div>

                        {/* Question Rapid-Fire Countdown (Medium / Hard speed bonus) */}
                        {difficulty !== "easy" && (
                          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold transition ${
                            timerSeconds <= 5 
                              ? "bg-red-100 text-red-700 animate-pulse border border-red-300" 
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}>
                            <Zap size={12} className="text-amber-500" />
                            <span>{timerSeconds}s</span>
                          </div>
                        )}

                        <div className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                          {totalPoints} PTS
                        </div>
                      </div>
                    </div>

                    {/* Question Image Clue */}
                    {currentQ.media_url && (
                      <div className="mb-4 rounded-2xl overflow-hidden max-h-72 bg-gray-900 border border-gray-200 flex items-center justify-center shadow-xs">
                        <img referrerPolicy="no-referrer"
                          src={currentQ.media_url} 
                          alt="Question photo" 
                          className="w-full h-full object-contain max-h-72"
                        />
                      </div>
                    )}

                    {/* Question Prompt */}
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 leading-snug">
                      {currentQ.question_text}
                    </h2>

                    {/* MISSING LETTERS HANGMAN MASK DISPLAY */}
                    {currentQ.question_type === "missing_letters" && (
                      <div className="mb-5 p-4 bg-amber-50/70 rounded-2xl border-2 border-amber-300 text-center shadow-xs">
                        <p className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest mb-1.5">
                          Fill the Missing Letters:
                        </p>
                        <p className="font-mono text-xl sm:text-2xl font-black text-amber-950 tracking-[0.25em] select-none">
                          {generateMissingLettersMask(currentQ.correct_answer)}
                        </p>
                      </div>
                    )}

                    {/* MULTIPLE CHOICE OPTIONS */}
                    {currentQ.question_type === "choose" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {currentQ.options.map((opt, optIdx) => {
                          const isSelected = userAnswers[currentIndex] === opt;
                          const isCorrectAnswer = opt === currentQ.correct_answer;
                          
                          let btnStyle = "bg-white border-gray-200 hover:border-black hover:bg-gray-50 text-gray-800";
                          
                          if (isAnswerSubmitted && feedbackMode === "instant") {
                            if (isCorrectAnswer) {
                              btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                            } else if (isSelected && !isCorrectAnswer) {
                              btnStyle = "bg-red-50 border-red-500 text-red-900 font-bold";
                            } else {
                              btnStyle = "opacity-40 border-gray-200 text-gray-400";
                            }
                          } else if (isSelected) {
                            btnStyle = "bg-black text-white border-black font-bold";
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectAnswer(opt)}
                              disabled={isAnswerSubmitted}
                              className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition duration-150 flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isAnswerSubmitted && feedbackMode === "instant" && isCorrectAnswer && (
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 ml-2" />
                              )}
                              {isAnswerSubmitted && feedbackMode === "instant" && isSelected && !isCorrectAnswer && (
                                <XCircle size={16} className="text-red-600 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* FILL-IN-THE-BLANKS / MISSING LETTERS INPUT */
                      <div className="mb-6">
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (fillInput.trim()) handleSelectAnswer(fillInput.trim());
                          }}
                          className="flex items-center gap-2"
                        >
                          <input 
                            type="text"
                            placeholder={currentQ.question_type === "missing_letters" ? "Type the full word here..." : "Type your answer here..."}
                            value={fillInput}
                            onChange={e => setFillInput(e.target.value)}
                            disabled={isAnswerSubmitted}
                            className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black font-medium"
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={isAnswerSubmitted || !fillInput.trim()}
                            className="px-5 py-3 bg-black hover:bg-gray-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition"
                          >
                            Submit
                          </button>
                        </form>
                      </div>
                    )}

                    {/* INSTANT FEEDBACK TRIVIA REVEAL */}
                    {isAnswerSubmitted && feedbackMode === "instant" && (
                      <div className={`p-4 rounded-2xl border mb-6 text-xs transition ${
                        isAnswerCorrect(currentQ, userAnswers[currentIndex]) 
                          ? "bg-emerald-50/70 border-emerald-300 text-emerald-900" 
                          : "bg-red-50/70 border-red-300 text-red-900"
                      }`}>
                        <p className="font-bold flex items-center gap-1.5 mb-1">
                          {isAnswerCorrect(currentQ, userAnswers[currentIndex]) ? (
                            <>🎉 Correct! (+{qDiff === "easy" ? 1 : qDiff === "medium" ? 2 : 5} {qDiff === "easy" ? "Point" : "Points"})</>
                          ) : (
                            <>❌ Incorrect. The answer is: <strong>{currentQ.correct_answer}</strong></>
                          )}
                        </p>
                        {currentQ.explanation_clue && (
                          <p className="text-[11px] text-gray-700 italic mt-1 leading-relaxed">
                            💡 {currentQ.explanation_clue}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* NEXT QUESTION BUTTON */}
                  {isAnswerSubmitted && feedbackMode === "instant" && (
                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={advanceNextQuestion}
                        className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        {currentIndex + 1 < questions.length ? (
                          <>Next Question <ArrowRight size={14} /></>
                        ) : (
                          <>Finish Quiz <Trophy size={14} /></>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 4. EXPLORE MORE ARCHITECTURE PORTALS (Matching Main Page) */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" /> Explore More Architecture Portals
                  </h3>
                  <span className="text-xs text-gray-400 font-medium">Careers & Portals</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
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

            {/* RIGHT SIDEBAR (4 cols): Other Quizzes + Live Leaderboard */}
            <div className="lg:col-span-4 flex flex-col gap-6 sticky top-[96px]">

              {/* OTHER FEATURED QUIZZES */}
              {otherQuizzes.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <span>🎯</span> Other Quizzes
                    </h3>
                    <Link href="/quizzes" className="text-[11px] font-bold text-blue-600 hover:underline">
                      View All
                    </Link>
                  </div>
                  <div className="flex flex-col gap-3">
                    {otherQuizzes.map(oq => (
                      <Link
                        key={oq.id}
                        href={`/quizzes/${oq.slug}`}
                        className="p-3 rounded-2xl border border-gray-200 hover:border-black hover:bg-gray-50/60 transition group flex items-center gap-3"
                      >
                        {oq.cover_image && (
                          <img
                            src={oq.cover_image}
                            alt={oq.title}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                            {oq.category}
                          </span>
                          <h4 className="text-xs font-bold text-gray-900 truncate mt-1 group-hover:text-blue-600 transition">
                            {oq.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {oq.quiz_questions?.[0]?.count || 45} Questions
                          </p>
                        </div>
                        <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* LIVE POINTS LEADERBOARD */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Trophy size={18} className="text-amber-500" /> Leaderboard
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                    Live Points
                  </span>
                </div>

                {/* Scope selector: This Quiz vs Overall Quizzes */}
                <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl mb-3">
                  <button
                    onClick={() => setLeaderboardScope("quiz")}
                    className={`py-1.5 text-xs font-bold rounded-lg transition ${
                      leaderboardScope === "quiz" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    🎯 This Quiz
                  </button>
                  <button
                    onClick={() => setLeaderboardScope("overall")}
                    className={`py-1.5 text-xs font-bold rounded-lg transition ${
                      leaderboardScope === "overall" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    🌐 Overall Quizzes
                  </button>
                </div>

                {/* Tabs */}
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

                {loadingLeaderboard ? (
                  <div className="p-8 text-center text-xs text-gray-400 font-medium">
                    Updating ranks...
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">
                    No scores recorded yet this cycle. Be the first!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.slice(0, 5).map((entry, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            idx === 0 ? "bg-amber-400 text-amber-950 shadow-2xs" :
                            idx === 1 ? "bg-gray-300 text-gray-800" :
                            idx === 2 ? "bg-amber-700 text-white" :
                            "text-gray-400"
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {entry.display_name}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase font-mono">
                              {entry.difficulty} • {entry.score}/{entry.total_questions}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-extrabold text-blue-600 shrink-0">
                          {entry.points} PTS
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 pt-3 border-t border-gray-100 text-center">
                  <Link href="/quizzes" className="text-xs font-bold text-gray-600 hover:text-black flex items-center justify-center gap-1 transition">
                    View All Quizzes & High Scores →
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </>
  );
}
