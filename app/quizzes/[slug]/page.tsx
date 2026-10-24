"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { 
  Trophy, Play, Clock, HelpCircle, ArrowRight, ArrowLeft, 
  CheckCircle2, XCircle, Share2, MessageCircle, Copy, 
  RotateCcw, Sparkles, Award, ShieldAlert, Flame, Zap
} from "lucide-react";

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

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

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const fetchQuizData = async () => {
    try {
      const { data: qData, error: qErr } = await supabase
        .from("quizzes")
        .select("*")
        .eq("slug", slug)
        .single();

      if (qErr || !qData) throw new Error("Quiz not found");
      setQuiz(qData);

      const { data: quesData, error: quesErr } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", qData.id)
        .order("order_index", { ascending: true });

      if (quesData) {
        setQuestions(quesData.map(q => ({
          ...q,
          question_type: (q.question_type as any) || "choose",
          options: Array.isArray(q.options) ? q.options : [],
          accepted_aliases: Array.isArray(q.accepted_aliases) ? q.accepted_aliases : []
        })));
      }
    } catch (err) {
      console.warn("Error fetching quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!gameStarted || isGameOver || isAnswerSubmitted || difficulty === "easy") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTotalTimeElapsed(prev => prev + 1);
      setTimerSeconds(prev => {
        if (prev <= 1) {
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, isGameOver, isAnswerSubmitted, currentIndex, difficulty]);

  const handleStartGame = () => {
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

  const calculatePointsForQuestion = (isCorrect: boolean, timeRemaining: number) => {
    if (!isCorrect) return 0;

    let base = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 30;
    
    let speedBonus = 0;
    if (difficulty === "medium" && timeRemaining > 15) speedBonus = 5;
    else if (difficulty === "hard" && timeRemaining > 7) speedBonus = 10;

    let multiplier = 1;
    if (streak >= 4) multiplier = 1.5;
    else if (streak >= 2) multiplier = 1.2;

    return Math.round((base + speedBonus) * multiplier);
  };

  const handleSelectAnswer = (selected: string) => {
    if (isAnswerSubmitted) return;

    const currentQ = questions[currentIndex];
    const correct = isAnswerCorrect(currentQ, selected);

    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    if (newStreak > maxStreak) setMaxStreak(newStreak);

    const pts = calculatePointsForQuestion(correct, timerSeconds);
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
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (isAnswerCorrect(q, userAnswers[idx])) correctCount++;
    });

    let finalXP = totalPoints;
    if (correctCount === questions.length) {
      finalXP += 50;
      setTotalPoints(finalXP);
    }

    try {
      const displayName = currentUser?.name || currentUser?.username || `Architect_#${guestId.slice(-4)}`;
      await supabase.from("quiz_scores").insert([{
        quiz_id: quiz.id,
        user_id: currentUser?.id || null,
        guest_session_id: guestId,
        display_name: displayName,
        score: correctCount,
        total_questions: questions.length,
        points: finalXP,
        difficulty,
        time_taken_seconds: totalTimeElapsed
      }]);
    } catch (e) {
      console.warn("Failed saving score:", e);
    }
  };

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    const name = encodeURIComponent(currentUser?.username || currentUser?.name || "Architect");
    return `${window.location.origin}/quizzes/${slug}?challenger=${name}&score=${totalPoints}&difficulty=${difficulty}`;
  };

  const getWhatsAppShareLink = () => {
    const url = getShareUrl();
    const correctCount = questions.filter((q, idx) => isAnswerCorrect(q, userAnswers[idx])).length;
    const text = `🏛️ I scored *${totalPoints} XP* (${correctCount}/${questions.length} correct) in the *${quiz?.title || "Architecture Quiz"}* on ${difficulty.toUpperCase()} mode! ⚡\n\nCan you beat my score? Accept my challenge here:\n${url}`;
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
  const correctCount = questions.filter((q, idx) => isAnswerCorrect(q, userAnswers[idx])).length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50/70 pt-[80px] pb-16 flex flex-col items-center">
        <div className="w-full max-w-3xl px-4 py-6 flex-1 flex flex-col">

          {/* PRE-GAME SCREEN */}
          {!gameStarted ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm my-auto text-center">
              
              {challengerName && challengerScore && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-2 border-amber-400 text-left flex items-center gap-3.5">
                  <span className="text-3xl">⚔️</span>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
                      Challenge Received!
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      <span className="text-blue-600 underline font-black">{challengerName}</span> scored{" "}
                      <span className="font-mono text-amber-700 font-extrabold">{challengerScore} XP</span> on {challengerDiff || "medium"} mode!
                    </p>
                    <p className="text-xs text-gray-500">Can you outscore them and win this challenge?</p>
                  </div>
                </div>
              )}

              {quiz.cover_image && (
                <img 
                  src={quiz.cover_image} 
                  alt={quiz.title} 
                  className="w-full h-44 object-cover rounded-2xl mb-6 shadow-xs border border-gray-100" 
                />
              )}

              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wider">
                {quiz.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 mb-2">
                {quiz.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed mb-8">
                {quiz.description || "Test your architectural knowledge and see where you rank on the weekly leaderboard."}
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
                        ? "bg-emerald-50 border-emerald-500 shadow-xs" 
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      🟢 Easy Mode
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">No timer. Relaxed pace. 1x XP.</p>
                  </button>

                  <button
                    onClick={() => setDifficulty("medium")}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      difficulty === "medium" 
                        ? "bg-amber-50 border-amber-500 shadow-xs" 
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                      🟡 Medium Mode
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">25s timer. Speed bonuses. 2x XP.</p>
                  </button>

                  <button
                    onClick={() => setDifficulty("hard")}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      difficulty === "hard" 
                        ? "bg-red-50 border-red-500 shadow-xs" 
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                      🔴 Hard Mode
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">12s rapid-fire timer. 3x XP.</p>
                  </button>
                </div>
              </div>

              {/* Step 2: Answer Review Style */}
              <div className="text-left mb-8">
                <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-2">
                  2. Answer Review Style:
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
                className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 mx-auto"
              >
                <Play size={16} /> Start Quiz ({questions.length} Questions)
              </button>
            </div>
          ) : isGameOver ? (

            /* GAME OVER: SCORECARD & CHALLENGE */
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm text-center">
              <span className="text-5xl block mb-2">🏆</span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                Quiz Completed!
              </h2>
              <p className="text-xs text-gray-500 mt-1">Here is your performance breakdown</p>

              {/* Score Display */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total XP</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">{totalPoints}</p>
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
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Time</p>
                  <p className="text-2xl font-black text-gray-900 mt-1 font-mono">{totalTimeElapsed}s</p>
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
                      Create a free account or log in now to claim your <strong>{totalPoints} XP</strong> to your official profile and lock your rank on the leaderboard!
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
                    className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Copy size={14} /> {copiedLink ? "Copied Link!" : "Copy Challenge Link"}
                  </button>
                </div>
              </div>

              {/* BREAKDOWN */}
              <div className="text-left mb-8">
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-3">
                  Question Breakdown & Answers:
                </h3>
                <div className="space-y-3">
                  {questions.map((q, idx) => {
                    const ans = userAnswers[idx];
                    const correct = isAnswerCorrect(q, ans);

                    return (
                      <div 
                        key={q.id || idx}
                        className={`p-3.5 rounded-2xl border transition ${
                          correct ? "bg-emerald-50/40 border-emerald-200" : "bg-red-50/40 border-red-200"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {correct ? (
                            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 mb-1">
                              {idx + 1}. {q.question_text}
                            </p>
                            <p className="text-[11px] text-gray-600">
                              Your answer: <span className={`font-bold ${correct ? "text-emerald-700" : "text-red-700"}`}>
                                {ans === "__TIMEOUT__" ? "Time Expired" : ans || "None"}
                              </span>
                            </p>
                            {!correct && (
                              <p className="text-[11px] text-emerald-800 font-bold mt-0.5">
                                Correct answer: {q.correct_answer}
                              </p>
                            )}
                            {q.explanation_clue && (
                              <p className="text-[10px] text-gray-500 italic mt-1 bg-white/70 p-2 rounded-lg border border-gray-200">
                                💡 {q.explanation_clue}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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

            /* ACTIVE QUESTION CARD */
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm flex-1 flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">
                      Question {currentIndex + 1} of {questions.length}
                    </span>
                    {streak >= 2 && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                        <Flame size={12} className="text-amber-500" /> {streak} Streak!
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {difficulty !== "easy" && (
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                        timerSeconds <= 5 ? "bg-red-100 text-red-700 animate-pulse" : "bg-gray-100 text-gray-700"
                      }`}>
                        <Clock size={12} /> {timerSeconds}s
                      </div>
                    )}

                    <div className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      {totalPoints} XP
                    </div>
                  </div>
                </div>

                {/* Question Image Clue */}
                {currentQ.media_url && (
                  <div className="mb-4 rounded-2xl overflow-hidden max-h-64 bg-gray-900 border border-gray-200 flex items-center justify-center shadow-xs">
                    <img 
                      src={currentQ.media_url} 
                      alt="Question photo" 
                      className="w-full h-full object-contain max-h-64"
                    />
                  </div>
                )}

                {/* Question Prompt */}
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">
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
                            <CheckCircle2 size={16} className="text-emerald-600" />
                          )}
                          {isAnswerSubmitted && feedbackMode === "instant" && isSelected && !isCorrectAnswer && (
                            <XCircle size={16} className="text-red-600" />
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
                        <>🎉 Correct!</>
                      ) : (
                        <>❌ Incorrect. The answer is: <strong>{currentQ.correct_answer}</strong></>
                      )}
                    </p>
                    {currentQ.explanation_clue && (
                      <p className="text-[11px] text-gray-700 italic mt-1">
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
        </div>
      </div>
    </>
  );
}
