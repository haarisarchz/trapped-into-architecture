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
  ChevronRight, Building2, Briefcase, BookOpen, GraduationCap,
  Download, Eye, SkipForward, Check, Lock, ChevronDown, ChevronUp, SlidersHorizontal
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

type GameMode = "challenge" | "practice";
type Difficulty = "easy" | "medium" | "hard";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
  const challengerAccuracy = searchParams.get("accuracy");

  const [quiz, setQuiz] = useState<any>(null);
  const [allQuestionsPool, setAllQuestionsPool] = useState<Question[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionCountChoice, setQuestionCountChoice] = useState<number>(10);
  const [loading, setLoading] = useState(true);

  // Pre-game config states
  const [gameMode, setGameMode] = useState<GameMode>("challenge");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [gameStarted, setGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showCustomOptions, setShowCustomOptions] = useState(false);

  // Sidebar: Leaderboard & other quizzes
  const [leaderboardScope, setLeaderboardScope] = useState<"quiz" | "overall">("quiz");
  const [leaderboardDifficulty, setLeaderboardDifficulty] = useState<Difficulty>("medium");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [otherQuizzes, setOtherQuizzes] = useState<any[]>([]);

  // Active Game State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [skippedQuestions, setSkippedQuestions] = useState<Record<number, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<number, boolean>>({ 0: true });
  const [fillInput, setFillInput] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState<Record<number, { isSubmitted: boolean; isCorrect: boolean }>>({});

  // Continuous Total Timer & Duration State
  const [totalAllottedTime, setTotalAllottedTime] = useState<number>(180); // in seconds
  const [timerSeconds, setTimerSeconds] = useState<number>(180);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState<number>(0);

  // Results State
  const [resultsSummary, setResultsSummary] = useState<{
    attemptId: string | null;
    baseScore: number;
    timeBonus: number;
    totalPoints: number;
    accuracyPercentage: number;
    correctCount: number;
    incorrectCount: number;
    skippedCount: number;
    unansweredCount: number;
    totalQuestions: number;
    totalTimeElapsed: number;
    totalAllottedTime: number;
    timedOut: boolean;
  } | null>(null);

  const [showQuestionReview, setShowQuestionReview] = useState(false);
  const [generatingScorecard, setGeneratingScorecard] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [pendingClaimNotice, setPendingClaimNotice] = useState<string | null>(null);

  // User state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [guestId, setGuestId] = useState("");

  // Refs for timers
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStopwatchRef = useRef<NodeJS.Timeout | null>(null);
  const scorecardCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize user & guest session
  useEffect(() => {
    let gid = localStorage.getItem("quiz_guest_id");
    if (!gid) {
      gid = "anon_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("quiz_guest_id", gid);
    }
    setGuestId(gid);

    const stored = localStorage.getItem("currentUser");
    let parsedUser: any = null;
    if (stored) {
      try { 
        parsedUser = JSON.parse(stored);
        setCurrentUser(parsedUser);
      } catch (e) {}
    }

    // Check if there is a pending guest attempt to claim on login
    checkAndClaimPendingAttempt(parsedUser);

    fetchQuizData();
  }, [slug]);

  // Sync leaderboard when scope, difficulty tab, or quiz changes
  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardScope, leaderboardDifficulty, quiz?.id]);

  // Claim pending attempt if user just logged in
  const checkAndClaimPendingAttempt = async (user: any) => {
    if (!user) return;
    try {
      const pendingStr = localStorage.getItem("pending_quiz_attempt");
      if (!pendingStr) return;
      const pending = JSON.parse(pendingStr);

      if (pending && pending.attemptId && pending.guestSessionId) {
        const displayName = user.displayName || user.fullName || user.username || "Architect";
        const { error } = await supabase
          .from("quiz_scores")
          .update({
            user_id: user.id,
            display_name: displayName
          })
          .eq("id", pending.attemptId)
          .eq("guest_session_id", pending.guestSessionId)
          .is("user_id", null);

        if (!error) {
          localStorage.removeItem("pending_quiz_attempt");
          setPendingClaimNotice(
            `🎉 Welcome ${displayName}! Your quiz score of ${pending.totalPoints || pending.points || 0} PTS was successfully linked to your account and entered onto the official leaderboard!`
          );
          fetchLeaderboard();
        }
      }
    } catch (e) {
      console.warn("Failed claiming pending quiz attempt:", e);
    }
  };

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

      const { data: quesData } = await supabase
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

  // Leaderboard fetch: 3 tiers (Easy, Medium, Hard), ranked by Accuracy %
  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      let query = supabase
        .from("quiz_scores")
        .select("id, display_name, points, score, total_questions, difficulty, time_taken_seconds, created_at, user_id, quiz_id")
        .eq("difficulty", leaderboardDifficulty);

      if (leaderboardScope === "quiz" && quiz?.id) {
        query = query.eq("quiz_id", quiz.id);
      }

      // Fetch top 30 to sort accurately in memory by Accuracy %, then questions, then time
      const { data, error } = await query.limit(40);
      if (error) throw error;

      if (data) {
        const ranked = [...data].sort((a, b) => {
          const accA = (a.score / (a.total_questions || 10)) * 100;
          const accB = (b.score / (b.total_questions || 10)) * 100;
          if (accB !== accA) return accB - accA; // Higher accuracy first
          if ((b.total_questions || 0) !== (a.total_questions || 0)) {
            return (b.total_questions || 0) - (a.total_questions || 0); // More questions completed
          }
          return (a.time_taken_seconds || 9999) - (b.time_taken_seconds || 9999); // Faster time
        });
        setLeaderboard(ranked);
      }
    } catch (err) {
      console.warn("Error fetching leaderboard:", err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Continuous Total Countdown Timer (Challenge Mode) & Elapsed Stopwatch
  useEffect(() => {
    if (!gameStarted || isGameOver) {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      if (sessionStopwatchRef.current) clearInterval(sessionStopwatchRef.current);
      return;
    }

    // Session stopwatch (runs across both Practice and Challenge modes)
    sessionStopwatchRef.current = setInterval(() => {
      setTotalTimeElapsed(prev => prev + 1);
    }, 1000);

    // Continuous Countdown Timer (Challenge Mode Only)
    if (gameMode === "challenge") {
      totalTimerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      if (sessionStopwatchRef.current) clearInterval(sessionStopwatchRef.current);
    };
  }, [gameStarted, isGameOver, gameMode]);

  // Start game handler: prepares question pool and computes continuous allotted time
  const handleStartGame = () => {
    const pool = allQuestionsPool.length > 0 ? allQuestionsPool : questions;
    const targeted = getQuestionsForGameDifficulty(pool, difficulty, questionCountChoice);
    const sampled = shuffleArray(targeted).map(q => ({
      ...q,
      options: shuffleArray(q.options || [])
    }));

    setQuestions(sampled);
    setGameStarted(true);
    setIsGameOver(false);
    setCurrentIndex(0);
    setUserAnswers({});
    setSkippedQuestions({});
    setVisitedQuestions({ 0: true });
    setPracticeFeedback({});
    setFillInput("");
    setResultsSummary(null);
    setShowQuestionReview(false);

    // Allotted time per question:
    // Easy: 30s per question (10Q = 5m, 20Q = 10m, 40Q = 20m)
    // Medium: 18s per question (10Q = 3m, 20Q = 6m, 40Q = 12m)
    // Hard: 12s per question (10Q = 2m, 20Q = 4m, 40Q = 8m)
    const perQuestionSeconds = difficulty === "easy" ? 30 : difficulty === "medium" ? 18 : 12;
    const totalAllotted = sampled.length * perQuestionSeconds;
    setTotalAllottedTime(totalAllotted);
    setTimerSeconds(totalAllotted);
    setTotalTimeElapsed(0);
  };

  const handleTimeExpired = () => {
    finishGame(true);
  };

  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

  const isAnswerCorrect = (question: Question, selected: string) => {
    if (!selected || selected === "__TIMEOUT__" || selected === "__SKIPPED__") return false;
    const target = normalize(question.correct_answer);
    if (normalize(selected) === target) return true;

    if (question.accepted_aliases && question.accepted_aliases.length > 0) {
      return question.accepted_aliases.some(a => normalize(a) === normalize(selected));
    }
    return false;
  };

  // Base Points formula: Easy = 1 pt, Medium = 2 pts, Hard = 5 pts
  const getQuestionBasePoints = (q: Question) => {
    const qDiff = (getQuestionDifficulty(q.correct_answer || q.question_text || "", q.accepted_aliases) || difficulty) as Difficulty;
    if (qDiff === "easy") return 1;
    if (qDiff === "medium") return 2;
    if (qDiff === "hard") return 5;
    return 1;
  };

  // Select or change answer
  const handleSelectAnswer = (selected: string) => {
    const currentQ = questions[currentIndex];
    setUserAnswers(prev => ({ ...prev, [currentIndex]: selected }));
    setSkippedQuestions(prev => ({ ...prev, [currentIndex]: false }));

    // In Practice Mode: reveal immediate answer feedback
    if (gameMode === "practice") {
      const correct = isAnswerCorrect(currentQ, selected);
      setPracticeFeedback(prev => ({
        ...prev,
        [currentIndex]: { isSubmitted: true, isCorrect: correct }
      }));
    }
  };

  // Skip question action
  const handleSkipQuestion = () => {
    setSkippedQuestions(prev => ({ ...prev, [currentIndex]: true }));
    if (!userAnswers[currentIndex]) {
      setUserAnswers(prev => ({ ...prev, [currentIndex]: "" }));
    }
    // Move to next question or stay
    if (currentIndex + 1 < questions.length) {
      jumpToQuestion(currentIndex + 1);
    }
  };

  // Jump to specific question via Question Navigation Palette
  const jumpToQuestion = (idx: number) => {
    if (idx < 0 || idx >= questions.length) return;
    setCurrentIndex(idx);
    setVisitedQuestions(prev => ({ ...prev, [idx]: true }));
    setFillInput(userAnswers[idx] || "");
  };

  // Finish quiz and calculate final scores
  const finishGame = async (timedOut: boolean = false) => {
    setIsGameOver(true);
    if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    if (sessionStopwatchRef.current) clearInterval(sessionStopwatchRef.current);

    let correctCount = 0;
    let baseScore = 0;
    let skippedCount = 0;
    let unansweredCount = 0;

    questions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (isAnswerCorrect(q, ans)) {
        correctCount++;
        baseScore += getQuestionBasePoints(q);
      } else if (skippedQuestions[idx]) {
        skippedCount++;
      } else if (!ans) {
        unansweredCount++;
      }
    });

    const incorrectCount = questions.length - correctCount - skippedCount - unansweredCount;
    const accuracyPercentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 1000) / 10 : 0;

    // Proportional speed bonus (Challenge Mode only, not timed out, and at least 50% accuracy)
    let timeBonus = 0;
    if (gameMode === "challenge" && !timedOut && correctCount > 0) {
      const maxBonus = difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20;
      timeBonus = Math.max(0, Math.floor(maxBonus * (timerSeconds / totalAllottedTime)));
    }

    const totalPoints = baseScore + timeBonus;
    let savedAttemptId: string | null = null;

    // Save to official database if Challenge Mode
    if (gameMode === "challenge") {
      try {
        const displayName = currentUser?.name || currentUser?.username || `Architect_#${guestId.slice(-4)}`;
        const { data: scoreRow, error: scoreErr } = await supabase
          .from("quiz_scores")
          .insert([{
            quiz_id: quiz.id,
            user_id: currentUser?.id || null,
            guest_session_id: guestId,
            display_name: displayName,
            score: correctCount,
            total_questions: questions.length,
            points: totalPoints,
            difficulty,
            time_taken_seconds: totalTimeElapsed
          }])
          .select("id")
          .single();

        if (scoreRow?.id) {
          savedAttemptId = scoreRow.id;
        }

        // If guest, preserve pending attempt in localStorage so they can claim it upon registration
        if (!currentUser && savedAttemptId) {
          localStorage.setItem("pending_quiz_attempt", JSON.stringify({
            attemptId: savedAttemptId,
            guestSessionId: guestId,
            quizId: quiz.id,
            quizTitle: quiz.title,
            slug,
            difficulty,
            totalPoints,
            baseScore,
            timeBonus,
            accuracy: accuracyPercentage,
            correctCount,
            totalQuestions: questions.length
          }));
        }

        fetchLeaderboard();
      } catch (e) {
        console.warn("Failed saving quiz score:", e);
      }
    }

    setResultsSummary({
      attemptId: savedAttemptId,
      baseScore,
      timeBonus,
      totalPoints,
      accuracyPercentage,
      correctCount,
      incorrectCount,
      skippedCount,
      unansweredCount,
      totalQuestions: questions.length,
      totalTimeElapsed,
      totalAllottedTime,
      timedOut
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Generate shareable challenge URL
  const getChallengeShareUrl = () => {
    if (typeof window === "undefined") return "";
    const name = encodeURIComponent(currentUser?.username || currentUser?.name || "Architect");
    const scoreVal = resultsSummary?.totalPoints || 0;
    const accVal = resultsSummary?.accuracyPercentage || 0;
    return `${window.location.origin}/quizzes/${slug}?challenger=${name}&score=${scoreVal}&difficulty=${difficulty}&accuracy=${accVal}`;
  };

  const getWhatsAppShareLink = () => {
    const url = getChallengeShareUrl();
    const pts = resultsSummary?.totalPoints || 0;
    const acc = resultsSummary?.accuracyPercentage || 0;
    const text = `🏛️ I scored *${pts} Points (${acc}% Accuracy)* in the TI2A Architecture Challenge: *${quiz?.title || "Guess the Building"}* on ${difficulty.toUpperCase()} mode! 🏆\n\nThink you know architecture better? Accept my challenge and beat my score:\n${url}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const getLinkedInShareLink = () => {
    const url = encodeURIComponent(getChallengeShareUrl());
    return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  };

  const getTwitterShareLink = () => {
    const url = encodeURIComponent(getChallengeShareUrl());
    const text = encodeURIComponent(`🏛️ I scored ${resultsSummary?.totalPoints || 0} Points (${resultsSummary?.accuracyPercentage || 0}% Accuracy) in the TI2A Architecture Challenge! Can you beat my score?`);
    return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  };

  const getFacebookShareLink = () => {
    const url = encodeURIComponent(getChallengeShareUrl());
    return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  };

  const copyChallengeLink = () => {
    navigator.clipboard.writeText(getChallengeShareUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Client-side HTML5 Canvas Scorecard Generator (Instant high-res PNG download)
  const downloadScorecardImage = () => {
    setGeneratingScorecard(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dark Architectural Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
      bgGrad.addColorStop(0, "#090D16");
      bgGrad.addColorStop(0.5, "#0F172A");
      bgGrad.addColorStop(1, "#030712");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 630);

      // Gold Accent Outer Border
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, 1140, 570);

      // Top Brand Header
      ctx.fillStyle = "#F3F4F6";
      ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("TRAPPED INTO ARCHITECTURE", 60, 85);

      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("TI2A ARCHITECTURE CHALLENGE ARENA", 60, 115);

      // Quiz Title
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 42px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      const displayTitle = quiz?.title || "Iconic World Landmarks";
      ctx.fillText(displayTitle.slice(0, 42), 60, 185);

      // Player Name
      const playerName = currentUser?.displayName || currentUser?.fullName || currentUser?.username || `Architect #${guestId.slice(-4)}`;
      ctx.fillStyle = "#93C5FD";
      ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`Player: ${playerName} • Mode: ${difficulty.toUpperCase()}`, 60, 225);

      // 4 Metric Score Boxes
      const boxes = [
        { label: "ACCURACY", val: `${resultsSummary?.accuracyPercentage || 0}%`, col: "#10B981" },
        { label: "BASE SCORE", val: `${resultsSummary?.correctCount || 0} / ${resultsSummary?.totalQuestions || 10}`, col: "#60A5FA" },
        { label: "TIME BONUS", val: `+${resultsSummary?.timeBonus || 0} PTS`, col: "#F59E0B" },
        { label: "TOTAL POINTS", val: `${resultsSummary?.totalPoints || 0} PTS`, col: "#EC4899" }
      ];

      boxes.forEach((b, i) => {
        const x = 60 + i * 275;
        const y = 270;
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, 250, 130, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#9CA3AF";
        ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(b.label, x + 20, y + 40);

        ctx.fillStyle = b.col;
        ctx.font = "900 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(b.val, x + 20, y + 90);
      });

      // Bottom Challenge Banner
      ctx.fillStyle = "#FEF3C7";
      ctx.font = "900 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("CAN YOU BEAT MY SCORE?", 60, 480);

      ctx.fillStyle = "#D1D5DB";
      ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Take the live architecture challenge at trappedintoarchitecture.com/quizzes", 60, 515);

      ctx.fillStyle = "#6B7280";
      ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Discover Architecture Jobs • Student Internships • Top Studios • GATE Preparation", 60, 555);

      // Export as PNG
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `ti2a-architecture-scorecard-${difficulty}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Scorecard generation error:", err);
    } finally {
      setGeneratingScorecard(false);
    }
  };

  const currentQ = questions[currentIndex];
  const qDiff = currentQ ? (getQuestionDifficulty(currentQ.correct_answer || currentQ.question_text || "", currentQ.accepted_aliases) as Difficulty) : difficulty;

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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Quiz not found</h2>
          <Link href="/quizzes" className="text-sm font-bold text-blue-600 hover:underline">
            ← Return to Quizzes Hub
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50/70 pt-[80px] pb-20">
        
        {/* PENDING ATTEMPT CLAIM CONFIRMATION BANNER */}
        {pendingClaimNotice && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 text-center shadow-sm flex items-center justify-center gap-2">
            <span>{pendingClaimNotice}</span>
            <button onClick={() => setPendingClaimNotice(null)} className="underline ml-2 hover:opacity-80">
              Dismiss
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

          {/* TOP BREADCRUMB & TI2A CROSS-NAVIGATION PILLS */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 text-xs">
            <div className="flex items-center gap-2 text-gray-500">
              <Link href="/quizzes" className="hover:text-black font-semibold">
                Quizzes
              </Link>
              <span>/</span>
              <span className="font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                {quiz.title}
              </span>
            </div>

            {/* Platform Cross-Links */}
            <div className="flex flex-wrap items-center gap-2 font-bold text-[11px]">
              <Link 
                href="/jobs" 
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-full border border-gray-200 shadow-2xs transition flex items-center gap-1.5"
              >
                <span>💼</span> Architecture Jobs
              </Link>
              <Link 
                href="/internships" 
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-full border border-gray-200 shadow-2xs transition flex items-center gap-1.5"
              >
                <span>🎓</span> Internships
              </Link>
              <Link 
                href="/companies" 
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-full border border-gray-200 shadow-2xs transition flex items-center gap-1.5"
              >
                <span>🏢</span> Design Firms
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
                          <span className="font-mono text-amber-700 font-extrabold">{challengerScore} Points</span>
                          {challengerAccuracy ? ` (${challengerAccuracy}% Accuracy)` : ""} on {challengerDiff || "medium"} mode!
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
                  <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed mb-6">
                    {quiz.description || "Test your architectural visual recall, beat the continuous countdown timer, and claim your spot on the official leaderboard."}
                  </p>

                  {/* PROMINENT QUICK START SECTION (Item 12: Sensible Defaults: Challenge Mode, Medium, 10 Questions) */}
                  <div className="bg-gradient-to-b from-amber-50/90 to-orange-50/40 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 mb-6 text-center shadow-xs">
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                      <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 bg-black text-white rounded-full">
                        ⚡ Quick Start Recommended
                      </span>
                      <span className="text-xs font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-3 py-1 rounded-full">
                        10 Questions &bull; Challenge Mode &bull; Medium Difficulty &bull; 3 Min Timer
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-5 max-w-md mx-auto">
                      Jump straight into the quiz challenge with standard tournament settings and earn your spot on the leaderboard.
                    </p>
                    <button
                      onClick={handleStartGame}
                      className="w-full sm:w-auto px-10 py-4 bg-black hover:bg-gray-800 text-white text-base font-extrabold rounded-2xl transition shadow-lg flex items-center justify-center gap-2.5 mx-auto cursor-pointer"
                    >
                      <Play size={18} fill="currentColor" />
                      <span>Quick Start Quiz</span>
                    </button>
                  </div>

                  {/* ADVANCED CUSTOMIZATION TOGGLE */}
                  <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6 text-left">
                    <button
                      type="button"
                      onClick={() => setShowCustomOptions(!showCustomOptions)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition text-xs font-bold text-gray-700 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <SlidersHorizontal size={14} className="text-gray-500" />
                        <span>Customize Game Options (Mode, Difficulty, Question Count)</span>
                      </span>
                      <ChevronDown size={16} className={`transition-transform duration-200 ${showCustomOptions ? 'rotate-180' : ''}`} />
                    </button>

                    {showCustomOptions && (
                      <div className="p-5 border-t border-gray-200 bg-white space-y-6 animate-in fade-in duration-150">
                        {/* Step 1: Select Game Mode (Challenge vs Practice) */}
                        <div>
                          <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-2">
                            1. Select Gameplay Mode:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              onClick={() => setGameMode("challenge")}
                              className={`p-4 rounded-2xl border text-left transition ${
                                gameMode === "challenge" 
                                  ? "bg-amber-50/70 border-amber-500 shadow-xs ring-1 ring-amber-500" 
                                  : "bg-white border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                                  🏆 Challenge Mode
                                </p>
                                <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full uppercase">
                                  Official Leaderboard
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-gray-800 mt-1.5">Continuous Countdown & Speed Bonus</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                                Total session countdown timer, no answers revealed during gameplay. Full scorecard & speed bonuses awarded upon submission.
                              </p>
                            </button>

                            <button
                              onClick={() => setGameMode("practice")}
                              className={`p-4 rounded-2xl border text-left transition ${
                                gameMode === "practice" 
                                  ? "bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500" 
                                  : "bg-white border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                                  💡 Practice & Study Mode
                                </p>
                                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase">
                                  Untimed Learning
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-gray-800 mt-1.5">Immediate Trivia & Clues</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                                No timer pressure. Reveals correct answers and architectural clues immediately after each selection.
                              </p>
                            </button>
                          </div>
                        </div>

                        {/* Step 2: Select Difficulty Mode */}
                        <div>
                          <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-2">
                            2. Select Difficulty Mode:
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
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                                Recognizable icons (Sydney Opera, Fallingwater). 1 Pt/Q • 30s pace.
                              </p>
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
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                                Core architecture syllabus icons (Salk Institute). 2 Pts/Q • 18s pace.
                              </p>
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
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                                Challenging structural feats & niche works. 5 Pts/Q • 12s pace.
                              </p>
                            </button>
                          </div>
                        </div>

                        {/* Step 3: Select Round Length */}
                        <div>
                          <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-2">
                            3. Round Length (Questions):
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { count: 10, label: "10 Questions", time: difficulty === "easy" ? "5m" : difficulty === "medium" ? "3m" : "2m" },
                              { count: 20, label: "20 Questions", time: difficulty === "easy" ? "10m" : difficulty === "medium" ? "6m" : "4m" },
                              { count: 40, label: "40 Questions", time: difficulty === "easy" ? "20m" : difficulty === "medium" ? "12m" : "8m" }
                            ].map(item => (
                              <button
                                key={item.count}
                                onClick={() => setQuestionCountChoice(item.count)}
                                className={`p-3 rounded-2xl border text-center transition ${
                                  questionCountChoice === item.count
                                    ? "bg-black text-white border-black shadow-xs"
                                    : "bg-white text-gray-800 border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <p className="text-xs font-bold">{item.label}</p>
                                <p className={`text-[10px] mt-0.5 ${questionCountChoice === item.count ? "text-gray-300" : "text-gray-400"}`}>
                                  {gameMode === "challenge" ? `Time: ${item.time}` : "Untimed"}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 text-center">
                          <button
                            onClick={handleStartGame}
                            className="w-full sm:w-auto px-8 py-3 bg-black hover:bg-gray-800 text-white text-sm font-extrabold rounded-2xl transition shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
                          >
                            <Play size={15} fill="currentColor" />
                            <span>Start with Custom Settings</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : isGameOver && resultsSummary ? (

                /* 2. POST-GAME SUMMARY & SCORECARD SCREEN */
                <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 text-3xl">
                    🏆
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                    Challenge Complete!
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Here is your verified performance breakdown</p>

                  {/* 4 Score Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
                    <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Accuracy</p>
                      <p className="text-2xl font-black text-emerald-700 mt-1">{resultsSummary.accuracyPercentage}%</p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">{resultsSummary.correctCount}/{resultsSummary.totalQuestions} Correct</p>
                    </div>

                    <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Total Points</p>
                      <p className="text-2xl font-black text-blue-700 mt-1">{resultsSummary.totalPoints} PTS</p>
                      <p className="text-[10px] text-blue-600 font-medium mt-0.5">{resultsSummary.baseScore} Base + {resultsSummary.timeBonus} Bonus</p>
                    </div>

                    <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Speed Bonus</p>
                      <p className="text-2xl font-black text-amber-600 mt-1">+{resultsSummary.timeBonus} PTS</p>
                      <p className="text-[10px] text-amber-600 font-medium mt-0.5">Based on pace</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Time</p>
                      <p className="text-2xl font-black text-gray-900 mt-1 font-mono">{formatTime(resultsSummary.totalTimeElapsed)}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                        {resultsSummary.timedOut ? "Time Expired" : `${Math.round(resultsSummary.totalTimeElapsed / resultsSummary.totalQuestions)}s / question`}
                      </p>
                    </div>
                  </div>

                  {/* GUEST PARTICIPATION BRIDGE (Item 13: Full Results Visible + Clear Call to Action) */}
                  {!currentUser && (
                    <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-indigo-50/60 border-2 border-amber-300 rounded-3xl p-6 text-left mb-8 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                              ⚠️ Unverified Guest Score
                            </span>
                            <span className="text-xs font-bold text-gray-700">
                              Earned: {resultsSummary.totalPoints} PTS ({resultsSummary.accuracyPercentage}% Accuracy)
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-gray-950">
                            Your quiz is complete! Your score is ready. Register or log in to save your result and join the TI2A leaderboard.
                          </h3>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Your attempt has been securely saved in this browser session. Creating a free account or logging in will automatically transfer your score onto your permanent profile and rank you on the official All-India Leaderboard.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 self-stretch sm:self-center">
                          <button 
                            type="button"
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('openAuth', { detail: 'register' }));
                            }}
                            className="px-5 py-3 bg-black hover:bg-gray-800 text-white text-xs font-extrabold rounded-xl transition shadow-md text-center cursor-pointer"
                          >
                            Register and Save My Score
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('openAuth', { detail: 'login' }));
                            }}
                            className="px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 text-xs font-extrabold rounded-xl transition shadow-2xs text-center cursor-pointer"
                          >
                            Login and Save My Score
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCORECARD DOWNLOAD & VIRAL SOCIAL SHARING */}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 mb-8">
                    <p className="text-xs font-extrabold text-gray-900 mb-3 flex items-center justify-center gap-1.5">
                      <Share2 size={15} className="text-amber-500" /> Share Scorecard & Challenge Friends:
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                      {/* 1. Download High-Res Canvas Scorecard */}
                      <button
                        onClick={downloadScorecardImage}
                        disabled={generatingScorecard}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Download size={14} /> {generatingScorecard ? "Generating..." : "Download Scorecard (PNG)"}
                      </button>

                      {/* 2. WhatsApp Share */}
                      <a
                        href={getWhatsAppShareLink()}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>

                      {/* 3. LinkedIn Share */}
                      <a
                        href={getLinkedInShareLink()}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-[#0A66C2] hover:bg-[#084e96] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        LinkedIn
                      </a>

                      {/* 4. Twitter / X Share */}
                      <a
                        href={getTwitterShareLink()}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        X (Twitter)
                      </a>

                      {/* 5. Copy Link */}
                      <button
                        onClick={copyChallengeLink}
                        className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                      >
                        <Copy size={14} /> {copiedLink ? "Link Copied! ✓" : "Copy Challenge Link"}
                      </button>
                    </div>
                  </div>

                  {/* QUESTION-BY-QUESTION REVIEW ACCORDION */}
                  <div className="mb-8 text-left">
                    <button
                      onClick={() => setShowQuestionReview(!showQuestionReview)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200 transition text-xs font-extrabold text-gray-900"
                    >
                      <span className="flex items-center gap-2">
                        <Eye size={15} /> Question-by-Question Review ({questions.length} Questions)
                      </span>
                      {showQuestionReview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {showQuestionReview && (
                      <div className="mt-3 space-y-3">
                        {questions.map((q, idx) => {
                          const userAns = userAnswers[idx];
                          const correct = isAnswerCorrect(q, userAns);
                          const wasSkipped = skippedQuestions[idx];

                          return (
                            <div 
                              key={idx} 
                              className={`p-4 rounded-2xl border text-xs ${
                                correct ? "bg-emerald-50/50 border-emerald-200" :
                                wasSkipped ? "bg-amber-50/50 border-amber-200" :
                                "bg-red-50/50 border-red-200"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <span className="font-mono text-[10px] text-gray-400 block mb-1">
                                    Question {idx + 1} • {getQuestionDifficulty(q.correct_answer || q.question_text || "", q.accepted_aliases)} mode
                                  </span>
                                  <p className="font-bold text-gray-900">
                                    {q.question_text}
                                  </p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                                  correct ? "bg-emerald-100 text-emerald-800" :
                                  wasSkipped ? "bg-amber-100 text-amber-800" :
                                  "bg-red-100 text-red-800"
                                }`}>
                                  {correct ? "✓ Correct" : wasSkipped ? "⏭ Skipped" : "✗ Incorrect"}
                                </span>
                              </div>

                              <div className="mt-2 text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <p className="text-gray-600">
                                  Your Answer: <strong className={correct ? "text-emerald-700" : "text-red-700"}>
                                    {userAns || (wasSkipped ? "(Skipped)" : "(Unanswered)")}
                                  </strong>
                                </p>
                                <p className="text-gray-600">
                                  Correct Answer: <strong className="text-gray-900">{q.correct_answer}</strong>
                                </p>
                              </div>

                              {q.explanation_clue && (
                                <p className="mt-2 text-[11px] text-gray-600 bg-white/70 p-2 rounded-xl border border-gray-100 italic">
                                  💡 {q.explanation_clue}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
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

                /* 3. ACTIVE QUESTION CARD WITH QUESTION PALETTE */
                <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                  <div>
                    
                    {/* CONTINUOUS COUNTDOWN TIMER & HEADER */}
                    <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-500">
                          Question {currentIndex + 1} of {questions.length}
                        </span>

                        {qDiff === "easy" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                            🟢 Famous Landmark (1 pt)
                          </span>
                        ) : qDiff === "hard" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 flex items-center gap-1 border border-red-200">
                            🔴 Advanced Tectonic (5 pts)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-200">
                            🟡 Syllabus Classic (2 pts)
                          </span>
                        )}

                        {gameMode === "practice" && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-extrabold">
                            💡 Practice Mode
                          </span>
                        )}
                      </div>

                      {/* CONTINUOUS TOTAL TIMER CLOCK */}
                      <div className="flex items-center gap-2.5">
                        {gameMode === "challenge" ? (
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold shadow-xs transition ${
                            timerSeconds <= 30
                              ? "bg-red-600 text-white animate-pulse"
                              : timerSeconds <= 60
                              ? "bg-amber-500 text-black"
                              : "bg-gray-900 text-white"
                          }`}>
                            <Clock size={12} className={timerSeconds <= 30 ? "text-white" : "text-emerald-400"} />
                            <span>{formatTime(timerSeconds)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-mono font-bold">
                            <Clock size={12} className="text-gray-400" />
                            <span>{formatTime(totalTimeElapsed)}</span>
                          </div>
                        )}

                        <button
                          onClick={() => finishGame(false)}
                          className="text-[11px] font-extrabold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 transition"
                        >
                          Finish Quiz
                        </button>
                      </div>
                    </div>

                    {/* QUESTION NAVIGATION PALETTE (Answered, Skipped, Unvisited, Current) */}
                    <div className="mb-5 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center justify-between text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">
                        <span>Question Palette</span>
                        <div className="flex items-center gap-3 font-semibold text-[10px]">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Answered
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Skipped
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" /> Unvisited
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {questions.map((q, idx) => {
                          const isCurrent = currentIndex === idx;
                          const hasAnswer = !!userAnswers[idx];
                          const isSkipped = skippedQuestions[idx];

                          let btnClass = "bg-white text-gray-600 border-gray-200 hover:border-gray-400";
                          if (hasAnswer) {
                            btnClass = "bg-emerald-500 text-white border-emerald-600 font-extrabold";
                          } else if (isSkipped) {
                            btnClass = "bg-amber-100 text-amber-800 border-amber-400 font-bold";
                          }

                          if (isCurrent) {
                            btnClass += " ring-2 ring-black scale-105 z-10 font-black";
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => jumpToQuestion(idx)}
                              className={`w-7 h-7 rounded-lg text-[11px] border flex items-center justify-center transition shrink-0 ${btnClass}`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Question Image Photo */}
                    {currentQ.media_url && (
                      <div className="mb-4 rounded-2xl overflow-hidden max-h-72 bg-gray-900 border border-gray-200 flex items-center justify-center shadow-xs">
                        <img referrerPolicy="no-referrer"
                          src={currentQ.media_url} 
                          alt="Question photo" 
                          className="w-full h-full object-contain max-h-72"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    {/* Question Prompt */}
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 leading-snug">
                      {currentQ.question_text}
                    </h2>

                    {/* Multiple-Choice Answer Options */}
                    {currentQ.question_type === "choose" && currentQ.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {currentQ.options.map((opt, optIdx) => {
                          const isSelected = userAnswers[currentIndex] === opt;
                          const showPracticeCorrect = gameMode === "practice" && practiceFeedback[currentIndex]?.isSubmitted && opt === currentQ.correct_answer;
                          const showPracticeWrong = gameMode === "practice" && practiceFeedback[currentIndex]?.isSubmitted && isSelected && !practiceFeedback[currentIndex]?.isCorrect;

                          let optionClass = "bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50/60 text-gray-800";
                          if (isSelected) {
                            optionClass = "bg-black text-white border-black shadow-xs font-bold";
                          }
                          if (showPracticeCorrect) {
                            optionClass = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-500";
                          } else if (showPracticeWrong) {
                            optionClass = "bg-red-50 border-red-500 text-red-900 font-bold ring-1 ring-red-500";
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectAnswer(opt)}
                              className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center justify-between ${optionClass}`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check size={16} />}
                              {showPracticeCorrect && <CheckCircle2 size={16} className="text-emerald-600" />}
                              {showPracticeWrong && <XCircle size={16} className="text-red-600" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Fill Up / Missing Letters */}
                    {currentQ.question_type !== "choose" && (
                      <div className="mb-6">
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (fillInput.trim()) handleSelectAnswer(fillInput.trim());
                          }}
                          className="flex gap-2"
                        >
                          <input 
                            type="text"
                            placeholder="Type the exact name or architect..."
                            value={fillInput}
                            onChange={(e) => setFillInput(e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-black bg-white"
                          />
                          <button
                            type="submit"
                            disabled={!fillInput.trim()}
                            className="px-5 py-3 bg-black hover:bg-gray-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition"
                          >
                            Save
                          </button>
                        </form>
                      </div>
                    )}

                    {/* PRACTICE MODE IMMEDIATE TRIVIA FEEDBACK */}
                    {gameMode === "practice" && practiceFeedback[currentIndex]?.isSubmitted && (
                      <div className={`p-4 rounded-2xl border mb-6 text-xs transition ${
                        practiceFeedback[currentIndex].isCorrect
                          ? "bg-emerald-50/70 border-emerald-300 text-emerald-900" 
                          : "bg-red-50/70 border-red-300 text-red-900"
                      }`}>
                        <p className="font-bold flex items-center gap-1.5 mb-1">
                          {practiceFeedback[currentIndex].isCorrect ? (
                            <>🎉 Correct! (+{getQuestionBasePoints(currentQ)} Point{getQuestionBasePoints(currentQ) > 1 ? "s" : ""})</>
                          ) : (
                            <>❌ The correct answer is: <strong>{currentQ.correct_answer}</strong></>
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

                  {/* NAVIGATION CONTROLS: PREVIOUS, SKIP, NEXT & SUBMIT */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => jumpToQuestion(currentIndex - 1)}
                      disabled={currentIndex === 0}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-gray-200"
                    >
                      <ArrowLeft size={14} /> Previous
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSkipQuestion}
                        className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-amber-200"
                      >
                        <SkipForward size={14} /> Skip
                      </button>

                      {currentIndex + 1 < questions.length ? (
                        <button
                          onClick={() => jumpToQuestion(currentIndex + 1)}
                          className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                        >
                          Next <ArrowRight size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => finishGame(false)}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                        >
                          Submit Quiz <Trophy size={14} />
                        </button>
                      )}
                    </div>
                  </div>

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

            {/* RIGHT SIDEBAR (4 cols): 3-Tier Leaderboard + Other Quizzes */}
            <div className="lg:col-span-4 flex flex-col gap-6 sticky top-[96px]">

              {/* 3-TIER LIVE LEADERBOARD (EASY / MEDIUM / HARD) */}
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

                {loadingLeaderboard ? (
                  <div className="p-8 text-center text-xs text-gray-400 font-medium">
                    Updating ranks...
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">
                    Be among the first to enter the TI2A Quiz leaderboard!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.slice(0, 6).map((entry, idx) => {
                      const acc = entry.total_questions > 0 
                        ? Math.round((entry.score / entry.total_questions) * 100) 
                        : 0;

                      return (
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
                                {entry.total_questions || 10} Qs • <span className="text-emerald-700 font-bold">{acc}% Acc</span>
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

                <div className="mt-5 pt-3 border-t border-gray-100 text-center">
                  <Link href="/quizzes" className="text-xs font-bold text-gray-600 hover:text-black flex items-center justify-center gap-1 transition">
                    View All Quizzes & High Scores →
                  </Link>
                </div>
              </div>

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

                  <div className="space-y-3">
                    {otherQuizzes.map(oq => (
                      <Link 
                        key={oq.id} 
                        href={`/quizzes/${oq.slug}`}
                        className="p-3 rounded-2xl border border-gray-100 hover:border-black hover:bg-gray-50/50 transition flex items-center justify-between group"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
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

            </div>

          </div>

        </div>
      </div>
    </>
  );
}
