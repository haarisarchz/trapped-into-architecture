"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { trackEvent } from "@/utils/analytics";
import { 
  Trophy, Play, Clock, HelpCircle, ArrowRight, ArrowLeft, 
  CheckCircle2, XCircle, Share2, MessageCircle, Copy, 
  RotateCcw, Sparkles, Award, ShieldAlert, Flame, Zap,
  ChevronRight, Building2, Briefcase, BookOpen, GraduationCap,
  Download, Eye, SkipForward, Check, Lock, ChevronDown, ChevronUp, SlidersHorizontal, Crown, X, ZoomIn
} from "lucide-react";
import { 
  getQuestionsForGameDifficulty, 
  getQuestionDifficulty,
  getGameDifficultyPoints,
  getGameDifficultyClueDeduction
} from "@/lib/quizDifficulty";
import QuizRulesModal from "@/components/QuizRulesModal";

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
type Difficulty = "popular" | "master" | "easy" | "medium" | "hard";

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
  const [questionCountChoice, setQuestionCountChoice] = useState<number>(20);
  const [loading, setLoading] = useState(true);

  // Pre-game config states
  const [gameMode, setGameMode] = useState<GameMode>("challenge");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [gameStarted, setGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isQuestionReady, setIsQuestionReady] = useState(false);
  const isQuestionReadyRef = useRef(false);
  const fallbackWatchdogRef = useRef<NodeJS.Timeout | null>(null);
  const [isGoldTier, setIsGoldTier] = useState<boolean>(false);
  const [showGoldModal, setShowGoldModal] = useState<boolean>(false);
  const [isTimerDisabled, setIsTimerDisabled] = useState<boolean>(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<{ url: string; title: string } | null>(null);

  // Continuous Total Timer & Duration State
  const [totalAllottedTime, setTotalAllottedTime] = useState<number>(180); // in seconds
  const [timerSeconds, setTimerSeconds] = useState<number>(180);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState<number>(0);

  // Clues & Catalog Metadata for progressive hints
  const [unlockedClues, setUnlockedClues] = useState<Record<number, { location?: boolean; architect?: boolean }>>({});
  const [catalogMap, setCatalogMap] = useState<Record<string, { city?: string; country?: string; architect?: string; opened_year?: any; architectural_style?: string; puzzle_clues?: string }>>({});

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
    cluesUsed?: number;
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
        const tier = (parsedUser.tier || parsedUser.user_metadata?.tier || "").toLowerCase();
        const completion = typeof parsedUser.completion === "number" ? parsedUser.completion : 0;
        const isGold = ["gold", "platinum", "diamond"].includes(tier) || completion >= 66 || parsedUser.role === "admin" || parsedUser.is_gold === true;
        setIsGoldTier(isGold);
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
        { data: oqData },
        { data: catData }
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
          .limit(4),
        supabase
          .from("architecture_catalog")
          .select("data")
      ]);

      if (qErr || !qData) throw new Error("Quiz not found");
      setQuiz(qData);
      if (oqData) setOtherQuizzes(oqData);

      if (catData) {
        const cmap: Record<string, any> = {};
        catData.forEach((row: any) => {
          const d = row.data || {};
          const name = (d.building_name || d.display_name || d.base_building_name || "").toLowerCase().trim();
          const photo = (d.building_photo || "").toLowerCase().trim();
          const entry = {
            building_name: d.building_name || d.display_name || d.base_building_name,
            city: d.city,
            country: d.country,
            architect: d.architect,
            opened_year: d.opened_year,
            architectural_style: d.architectural_style,
            puzzle_clues: d.puzzle_clues,
            building_photo: d.building_photo
          };
          if (name) {
            cmap[name] = entry;
          }
          if (photo) {
            cmap[photo] = entry;
          }
        });
        setCatalogMap(cmap);
      }

      const { data: quesData } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", qData.id)
        .order("order_index", { ascending: true });

      if (quesData) {
        // Exclude removed/archived questions from active gameplay
        const activeOnly = quesData.filter(q => {
          const aliases = Array.isArray(q.accepted_aliases) ? q.accepted_aliases : [];
          const isRemoved = (q as any).is_removed === true || aliases.some((a: string) => typeof a === "string" && (a === "status:removed" || a === "archived:true"));
          return !isRemoved;
        });

        const formatted = activeOnly.map(q => ({
          ...q,
          question_type: (q.question_type as any) || "choose",
          options: Array.isArray(q.options) ? q.options : [],
          accepted_aliases: Array.isArray(q.accepted_aliases) ? q.accepted_aliases : []
        }));
        setAllQuestionsPool(formatted);
        setQuestions(formatted);

        // Immediate background preloading of initial questions
        if (typeof window !== "undefined") {
          formatted.slice(0, 8).forEach(q => {
            if (q.media_url) {
              const preload = new Image();
              preload.src = q.media_url;
            }
          });
        }
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
      let diffValues = ["medium"];
      if (leaderboardDifficulty === "easy" || leaderboardDifficulty === "popular") {
        diffValues = ["easy", "popular"];
      } else if (leaderboardDifficulty === "hard" || leaderboardDifficulty === "master") {
        diffValues = ["hard", "master"];
      } else {
        diffValues = ["medium"];
      }

      let query = supabase
        .from("quiz_scores")
        .select("id, display_name, points, score, total_questions, difficulty, time_taken_seconds, created_at, user_id, guest_session_id, quiz_id")
        .in("difficulty", diffValues);

      if (leaderboardScope === "quiz" && quiz?.id) {
        query = query.eq("quiz_id", quiz.id);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      if (data) {
        // Distinguish real participants from namesake/seed entries
        // Namesake rows have user_id === null AND guest_session_id === null
        const realParticipants = data.filter(e => e.user_id !== null || (e.guest_session_id !== null && !e.display_name?.startsWith("Architect_#anon")));
        const seedParticipants = data.filter(e => e.user_id === null && e.guest_session_id === null);

        // RULE: Once every category/difficulty has 5 or more real participants, the pre-loaded namesake entries completely disappear!
        let activeBoard: any[] = [];
        if (realParticipants.length >= 5) {
          activeBoard = realParticipants;
        } else {
          // If fewer than 5 real participants, show all real participants first, then fill remaining spots with seed entries up to 5 total
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
          // If equal accuracy, real users rank higher than seed
          const aIsReal = a.user_id !== null || a.guest_session_id !== null;
          const bIsReal = b.user_id !== null || b.guest_session_id !== null;
          if (aIsReal !== bIsReal) return aIsReal ? -1 : 1;
          if ((b.points || 0) !== (a.points || 0)) {
            return (b.points || 0) - (a.points || 0); // Higher points
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

  // Continuous Total Countdown Timer (Challenge Mode) & Elapsed Stopwatch
  useEffect(() => {
    if (!gameStarted || isGameOver) {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      if (sessionStopwatchRef.current) clearInterval(sessionStopwatchRef.current);
      return;
    }

    // Session stopwatch (runs across both Practice and Challenge modes)
    // ONLY increments when question is ready (photo loaded) and timer is not disabled
    sessionStopwatchRef.current = setInterval(() => {
      if (!isQuestionReadyRef.current || isTimerDisabled) return;
      setTotalTimeElapsed(prev => prev + 1);
    }, 1000);

    // Continuous Countdown Timer (Challenge Mode Only)
    // ONLY decrements when question is ready (photo loaded)
    if (gameMode === "challenge") {
      totalTimerRef.current = setInterval(() => {
        if (!isQuestionReadyRef.current) return;
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
  }, [gameStarted, isGameOver, gameMode, isTimerDisabled]);

  // Start game handler: prepares question pool and computes continuous allotted time
  const handleStartGame = (overrideDiff?: Difficulty, overrideCount?: number, overrideMode?: GameMode) => {
    const activeDiff = overrideDiff || difficulty;
    const activeCount = overrideCount || questionCountChoice;
    const activeMode = overrideMode || gameMode;

    const pool = allQuestionsPool.length > 0 ? allQuestionsPool : questions;
    const targeted = getQuestionsForGameDifficulty(pool, activeDiff, activeCount);
    const shouldShuffleChoices = (activeDiff || "").toLowerCase() !== "easy" && (activeDiff || "").toLowerCase() !== "popular";
    const sampled = targeted.map(q => ({
      ...q,
      options: shouldShuffleChoices ? shuffleArray(q.options || []) : (q.options || [])
    }));

    setQuestions(sampled);
    setGameStarted(true);
    setGameMode(activeMode);
    setDifficulty(activeDiff);
    setQuestionCountChoice(activeCount);
    trackEvent("quiz_start_click", {
      quiz_slug: slug,
      quiz_title: quiz?.title,
      difficulty: activeDiff,
      game_mode: activeMode,
      question_count: sampled.length,
    });
    setIsGameOver(false);
    setCurrentIndex(0);
    setUserAnswers({});
    setSkippedQuestions({});
    setVisitedQuestions({ 0: true });
    setPracticeFeedback({});
    setFillInput("");
    setResultsSummary(null);
    setShowQuestionReview(false);

    // Preload ALL questions in this round immediately so all question transitions are instant
    if (typeof window !== "undefined") {
      sampled.forEach(q => {
        if (q.media_url) {
          const img = new Image();
          img.src = q.media_url;
        }
      });
    }

    // Set initial question readiness for Question 0
    const isArchitectOeuvre = slug === "architects-oeuvre-pair-the-masterpieces";
    const firstQHasImage = !isArchitectOeuvre && Boolean(sampled[0]?.media_url);
    if (!firstQHasImage) {
      setImageLoaded(true);
      setIsQuestionReady(true);
      isQuestionReadyRef.current = true;
    } else {
      setImageLoaded(false);
      setIsQuestionReady(false);
      isQuestionReadyRef.current = false;
    }

    // Allotted time per question by Game Difficulty:
    // Easy Mode: 15s/Q (100% Popular questions)
    // Medium Mode: 10s/Q (50% Popular + 50% Architecture Master)
    // Hard Mode: 5s/Q (75% Master + 25% Popular) • Lightning instinct pace!
    let perQuestionSeconds = 10;
    const diffKey = (activeDiff || "medium").toLowerCase();
    if (diffKey === "easy" || diffKey === "popular") perQuestionSeconds = 15;
    else if (diffKey === "hard" || diffKey === "master") perQuestionSeconds = 5;
    else perQuestionSeconds = 10;

    const totalAllotted = sampled.length * perQuestionSeconds;
    setTotalAllottedTime(totalAllotted);
    setTimerSeconds(totalAllotted);
    setTotalTimeElapsed(0);
  };

  // Immediate Autostart if requested in query params (e.g. ?autostart=1)
  useEffect(() => {
    const autostart = searchParams.get("autostart");
    if ((autostart === "1" || autostart === "true") && allQuestionsPool.length > 0 && !gameStarted && !isGameOver) {
      const qMode = (searchParams.get("mode") as GameMode) || gameMode;
      const qDiff = (searchParams.get("difficulty") as Difficulty) || difficulty;
      const qCount = parseInt(searchParams.get("count") || "", 10) || questionCountChoice;
      handleStartGame(qDiff, qCount, qMode);
    }
  }, [allQuestionsPool, searchParams]);

  // Synchronized question readiness, image loading, and aggressive queue preloading
  useEffect(() => {
    if (!gameStarted || isGameOver) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    if (fallbackWatchdogRef.current) {
      clearTimeout(fallbackWatchdogRef.current);
    }

    if (slug === "architects-oeuvre-pair-the-masterpieces" || !currentQ.media_url) {
      setImageLoaded(true);
      setIsQuestionReady(true);
      isQuestionReadyRef.current = true;
    } else {
      setImageLoaded(false);
      setIsQuestionReady(false);
      isQuestionReadyRef.current = false;

      // Safety fallback: if an image takes > 2.8s (e.g. slow/failed network), 
      // automatically unpause the timer and allow interaction so user is never stuck
      fallbackWatchdogRef.current = setTimeout(() => {
        setImageLoaded(true);
        setIsQuestionReady(true);
        isQuestionReadyRef.current = true;
      }, 2800);

      // Preload next 3 questions ahead in queue
      for (let i = 1; i <= 3; i++) {
        const nextQ = questions[currentIndex + i];
        if (nextQ?.media_url) {
          const img = new Image();
          img.src = nextQ.media_url;
        }
      }
    }

    return () => {
      if (fallbackWatchdogRef.current) {
        clearTimeout(fallbackWatchdogRef.current);
      }
    };
  }, [currentIndex, questions, gameStarted, isGameOver]);

  const handleImageLoaded = () => {
    if (fallbackWatchdogRef.current) {
      clearTimeout(fallbackWatchdogRef.current);
    }
    setImageLoaded(true);
    setIsQuestionReady(true);
    isQuestionReadyRef.current = true;
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

  // Base Points formula: Strictly based on Game Difficulty (Easy = 150 pts, Medium = 300 pts, Hard = 450 pts)
  const getQuestionBasePoints = (_q?: Question) => {
    return getGameDifficultyPoints(difficulty);
  };

  // Option building photo resolver for Architect's Portfolio Quiz
  const getBuildingPhotoForOption = (optName: string): string | null => {
    if (!optName) return null;
    const clean = optName.toLowerCase().trim();
    if (catalogMap[clean]?.building_photo) return catalogMap[clean].building_photo || null;
    for (const [key, val] of Object.entries(catalogMap)) {
      if (val?.building_photo && (clean.includes(key) || key.includes(clean))) {
        return val.building_photo;
      }
    }
    return null;
  };

  // Dynamic Clue Resolver from Catalog & Question Metadata (Context-Aware per Quiz Type)
  const getQuestionClues = (q: Question) => {
    const defaultClue1 = {
      label: "Location Clue",
      revealedLabel: "Location Revealed",
      bannerTitle: "Location Hint:",
      icon: "📍",
      text: "International Architectural Landmark",
      badgeColor: "blue"
    };
    const defaultClue2 = {
      label: "Architect Clue",
      revealedLabel: "Architect Revealed",
      bannerTitle: "Architect / Era Hint:",
      icon: "👤",
      text: "Celebrated Master Architect",
      badgeColor: "purple"
    };

    if (!q) {
      return {
        clue1: defaultClue1,
        clue2: defaultClue2,
        location: defaultClue1.text,
        architect: defaultClue2.text
      };
    }

    // 1. Primary lookup by media_url (100% exact match across all 65 catalog buildings)
    let match = q.media_url ? catalogMap[q.media_url.toLowerCase().trim()] : null;

    // 2. Secondary fallback lookup by answer or text
    if (!match) {
      const targetKey = normalize(q.correct_answer || "");
      const qTextNorm = normalize(q.question_text || "");
      match = Object.entries(catalogMap).find(([k]) => {
        const kNorm = normalize(k);
        return kNorm === targetKey || targetKey.includes(kNorm) || kNorm.includes(targetKey) || qTextNorm.includes(kNorm);
      })?.[1];
    }

    const bName = match?.building_name || match?.display_name || "Iconic Architectural Landmark";
    const loc = (match?.city || match?.country) 
      ? [match.city, match.country].filter(Boolean).join(", ") 
      : (q.explanation_clue || "Global Landmark");
    const arch = match?.architect
      ? `${match.architect}${match.opened_year ? ' (Opened ' + match.opened_year + ')' : ''}${match.architectural_style ? ' • ' + match.architectural_style : ''}`
      : (q.explanation_clue || "Celebrated Master Architect");

    let clue1 = {
      label: "Location Clue",
      revealedLabel: "Location Revealed",
      bannerTitle: "Location Hint:",
      icon: "📍",
      text: loc,
      badgeColor: "blue"
    };

    let clue2 = {
      label: "Architect & Era Clue",
      revealedLabel: "Architect Revealed",
      bannerTitle: "Architect & Era Hint:",
      icon: "👤",
      text: arch,
      badgeColor: "purple"
    };

    // Quiz-specific clue customization (Zero spoilers!)
    if (slug === "master-architects-who-designed-it") {
      // In Master Architects: Architect is the TARGET ANSWER. Clues must be Location & Building Name!
      clue1 = {
        label: "Location Clue",
        revealedLabel: "Location Revealed",
        bannerTitle: "Location Hint:",
        icon: "📍",
        text: loc,
        badgeColor: "blue"
      };
      clue2 = {
        label: "Building Name Clue",
        revealedLabel: "Building Name Revealed",
        bannerTitle: "Building Name Hint:",
        icon: "🏛️",
        text: bName,
        badgeColor: "purple"
      };
    } else if (slug === "where-in-the-world-guess-the-city-country") {
      // In Where in the World: Location is the TARGET ANSWER. Clues are Building Name & Architect!
      clue1 = {
        label: "Building Name Clue",
        revealedLabel: "Building Name Revealed",
        bannerTitle: "Building Name Hint:",
        icon: "🏛️",
        text: bName,
        badgeColor: "blue"
      };
      clue2 = {
        label: "Architect & Era Clue",
        revealedLabel: "Architect Revealed",
        bannerTitle: "Architect & Era Hint:",
        icon: "👤",
        text: arch,
        badgeColor: "purple"
      };
    } else if (slug === "timeline-challenge-when-was-it-built") {
      // In Timeline: Year is the TARGET ANSWER.
      clue1 = {
        label: "Location Clue",
        revealedLabel: "Location Revealed",
        bannerTitle: "Location Hint:",
        icon: "📍",
        text: loc,
        badgeColor: "blue"
      };
      clue2 = {
        label: "Building & Architect Clue",
        revealedLabel: "Building & Architect Revealed",
        bannerTitle: "Building & Architect Hint:",
        icon: "🏛️",
        text: `${bName}${match?.architect ? ' by ' + match.architect : ''}`,
        badgeColor: "purple"
      };
    } else if (slug === "architectural-styles-and-movements") {
      // In Styles: Style is the TARGET ANSWER.
      clue1 = {
        label: "Landmark & Location Clue",
        revealedLabel: "Landmark & Location Revealed",
        bannerTitle: "Landmark & Location Hint:",
        icon: "🏛️",
        text: `${bName}${loc ? ', ' + loc : ''}`,
        badgeColor: "blue"
      };
      clue2 = {
        label: "Architect & Era Clue",
        revealedLabel: "Architect Revealed",
        bannerTitle: "Architect & Era Hint:",
        icon: "👤",
        text: arch,
        badgeColor: "purple"
      };
    }

    return {
      clue1,
      clue2,
      location: clue1.text,
      architect: clue2.text
    };
  };

  const handleUnlockClue = (type: "location" | "architect") => {
    setUnlockedClues(prev => ({
      ...prev,
      [currentIndex]: {
        ...(prev[currentIndex] || {}),
        [type]: true
      }
    }));
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
    let totalCluesUsed = 0;

    questions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      const clues = unlockedClues[idx] || {};
      const cluesCount = (clues.location ? 1 : 0) + (clues.architect ? 1 : 0);
      totalCluesUsed += cluesCount;

      if (isAnswerCorrect(q, ans)) {
        correctCount++;
        const base = getGameDifficultyPoints(difficulty);
        const deductionPerClue = getGameDifficultyClueDeduction(difficulty);
        const earned = Math.max(0, base - (cluesCount * deductionPerClue));
        baseScore += earned;
      } else if (skippedQuestions[idx]) {
        skippedCount++;
      } else if (!ans) {
        unansweredCount++;
      }
    });

    const incorrectCount = questions.length - correctCount - skippedCount - unansweredCount;
    const accuracyPercentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 1000) / 10 : 0;

    // Proportional speed bonus (Challenge Mode only, not timed out, and at least 1 correct)
    // Up to +250 for Easy, +350 for Medium, +500 for Hard based on time remaining
    let timeBonus = 0;
    if (gameMode === "challenge" && !timedOut && correctCount > 0) {
      let maxBonus = 350;
      if (difficulty === "hard" || difficulty === "master") maxBonus = 500;
      else if (difficulty === "easy" || difficulty === "popular") maxBonus = 250;
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
      timedOut,
      cluesUsed: totalCluesUsed
    });

    trackEvent("quiz_complete", {
      quiz_slug: slug,
      quiz_title: quiz?.title,
      difficulty,
      total_points: totalPoints,
      accuracy: accuracyPercentage,
      correct_count: correctCount,
      total_questions: questions.length,
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

  // Client-side HTML5 Canvas Scorecard Generator (9:16 WhatsApp Status & Stories - 1080x1920)
  const downloadScorecardImage = async () => {
    setGeneratingScorecard(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const roundRect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string, lineWidth: number = 1.5) => {
        c.beginPath();
        c.roundRect(x, y, w, h, r);
        if (fill) {
          c.fillStyle = fill;
          c.fill();
        }
        if (stroke) {
          c.strokeStyle = stroke;
          c.lineWidth = lineWidth;
          c.stroke();
        }
      };

      // 1. Blueprint Deep Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGrad.addColorStop(0, "#040915");
      bgGrad.addColorStop(0.25, "#061327");
      bgGrad.addColorStop(0.65, "#081730");
      bgGrad.addColorStop(1, "#03060E");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Technical Blueprint Grid
      ctx.strokeStyle = "rgba(56, 189, 248, 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= 1080; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1920);
        ctx.stroke();
      }
      for (let y = 0; y <= 1920; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1080, y);
        ctx.stroke();
      }

      // 3. Top Wireframe Accent Lines
      ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(40, 120);
      ctx.lineTo(160, 40);
      ctx.lineTo(260, 40);
      ctx.lineTo(340, 120);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(740, 120);
      ctx.lineTo(820, 40);
      ctx.lineTo(920, 40);
      ctx.lineTo(1040, 120);
      ctx.stroke();

      // 4. Isometric 3D Monogram Logo (Red 'A' & Green 'T')
      const cx = 540;
      // Green 'T'
      ctx.fillStyle = "#10B981";
      ctx.beginPath();
      ctx.moveTo(cx - 38, 48);
      ctx.lineTo(cx - 6, 32);
      ctx.lineTo(cx - 6, 75);
      ctx.lineTo(cx - 38, 90);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#059669";
      ctx.beginPath();
      ctx.moveTo(cx - 6, 32);
      ctx.lineTo(cx + 6, 38);
      ctx.lineTo(cx + 6, 82);
      ctx.lineTo(cx - 6, 75);
      ctx.closePath();
      ctx.fill();

      // Red 'A'
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      ctx.moveTo(cx + 8, 38);
      ctx.lineTo(cx + 42, 55);
      ctx.lineTo(cx + 42, 98);
      ctx.lineTo(cx + 8, 82);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#DC2626";
      ctx.beginPath();
      ctx.moveTo(cx + 42, 55);
      ctx.lineTo(cx + 28, 48);
      ctx.lineTo(cx - 6, 32);
      ctx.lineTo(cx + 8, 38);
      ctx.closePath();
      ctx.fill();

      // 5. Brand Header
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("TRAPPED INTO ARCHITECTURE", 540, 142);

      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("— India's Complete Architecture Career & Learning Ecosystem —", 540, 175);

      // 6. Viral Challenge Heading
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "800 36px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Think you know architecture?", 540, 245);

      const titleGrad = ctx.createLinearGradient(300, 0, 780, 0);
      titleGrad.addColorStop(0, "#F59E0B");
      titleGrad.addColorStop(1, "#EA580C");
      ctx.fillStyle = titleGrad;
      ctx.font = "italic 900 70px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("BEAT MY SCORE!", 540, 318);

      // Active Quiz Title Pill
      const displayTitle = quiz?.title || "Famous Buildings & Architects Quiz";
      roundRect(ctx, 200, 355, 680, 50, 25, "rgba(245, 158, 11, 0.12)", "rgba(245, 158, 11, 0.6)", 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 21px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(displayTitle.slice(0, 48), 540, 388);

      // 7. Hero Centerpiece (Flanked Cards + Fiery Sunburst Circle)
      // Left Flanked Card (Time)
      roundRect(ctx, 75, 510, 245, 165, 22, "rgba(15, 23, 42, 0.9)", "rgba(56, 189, 248, 0.35)", 2);
      ctx.fillStyle = "#94A3B8";
      ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Completed in", 197, 565);

      ctx.fillStyle = "#F59E0B";
      ctx.font = "900 30px 'JetBrains Mono', monospace";
      ctx.fillText(`${formatTime(resultsSummary?.totalTimeElapsed || 0)} mins`, 197, 615);

      // Right Flanked Card (Points & Mode)
      roundRect(ctx, 760, 510, 245, 165, 22, "rgba(15, 23, 42, 0.9)", "rgba(56, 189, 248, 0.35)", 2);
      ctx.fillStyle = "#94A3B8";
      ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Score Earned:", 882, 555);

      ctx.fillStyle = "#38BDF8";
      ctx.font = "900 28px 'JetBrains Mono', monospace";
      ctx.fillText(`${resultsSummary?.totalPoints || 0} PTS`, 882, 600);

      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      const displayTier = (difficulty === "hard" || difficulty === "master") ? "HARD" : (difficulty === "easy" || difficulty === "popular") ? "EASY" : "MEDIUM";
      ctx.fillText(`${displayTier} MODE`, 882, 635);

      // Central Fiery Sunburst Portal (Radius 135 at x=540, y=592)
      const sunburstGlow = ctx.createRadialGradient(540, 592, 40, 540, 592, 210);
      sunburstGlow.addColorStop(0, "rgba(245, 158, 11, 0.55)");
      sunburstGlow.addColorStop(0.65, "rgba(234, 88, 12, 0.25)");
      sunburstGlow.addColorStop(1, "transparent");
      ctx.fillStyle = sunburstGlow;
      ctx.beginPath();
      ctx.arc(540, 592, 210, 0, Math.PI * 2);
      ctx.fill();

      // Outer Gold Double Rings
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(540, 592, 135, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(254, 243, 199, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(540, 592, 126, 0, Math.PI * 2);
      ctx.stroke();

      // Dark Inner Disc
      ctx.fillStyle = "#060E1C";
      ctx.beginPath();
      ctx.arc(540, 592, 123, 0, Math.PI * 2);
      ctx.fill();

      // Circle Content
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 76px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`${resultsSummary?.correctCount || 0} / ${resultsSummary?.totalQuestions || 10}`, 540, 572);

      ctx.fillStyle = "#F59E0B";
      ctx.font = "900 50px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`${resultsSummary?.accuracyPercentage || 0}%`, 540, 630);

      ctx.fillStyle = "#CBD5E1";
      ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Accuracy", 540, 665);

      // 8. Angled Golden-Orange Speech Ribbon Banner
      const ribY = 755;
      const ribGrad = ctx.createLinearGradient(80, ribY, 1000, ribY);
      ribGrad.addColorStop(0, "#D97706");
      ribGrad.addColorStop(0.5, "#F59E0B");
      ribGrad.addColorStop(1, "#EA580C");

      ctx.fillStyle = ribGrad;
      ctx.beginPath();
      ctx.moveTo(85, ribY + 12);
      ctx.lineTo(995, ribY);
      ctx.lineTo(1015, ribY + 80);
      ctx.lineTo(65, ribY + 92);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 23px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`I named ${resultsSummary?.correctCount || 0} out of ${resultsSummary?.totalQuestions || 10} iconic buildings before time ran out!`, 540, ribY + 42);

      ctx.fillStyle = "#FEF3C7";
      ctx.font = "900 23px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Can your Arch IQ beat mine?", 540, ribY + 74);

      // 9. Architectural Metric Scale Ruler Divider
      const ruleY = 880;
      ctx.strokeStyle = "rgba(100, 116, 139, 0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(75, ruleY);
      ctx.lineTo(1005, ruleY);
      ctx.stroke();

      const step = (1005 - 75) / 10;
      for (let i = 0; i <= 10; i++) {
        const tx = 75 + i * step;
        ctx.beginPath();
        ctx.moveTo(tx, ruleY - 14);
        ctx.lineTo(tx, ruleY + 14);
        ctx.stroke();

        if (i < 10) {
          ctx.beginPath();
          ctx.moveTo(tx + step / 2, ruleY - 7);
          ctx.lineTo(tx + step / 2, ruleY + 7);
          ctx.stroke();
        }

        ctx.fillStyle = "#64748B";
        ctx.font = "bold 15px 'JetBrains Mono', monospace";
        ctx.fillText(i === 10 ? "10m" : `${i}`, tx, ruleY + 34);
      }

      // 10. Ecosystem Directory Header
      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("— Explore Everything on —", 540, 955);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Trapped Into Architecture", 540, 995);

      // 11. 6 Platform Ecosystem Cards (2 Columns x 3 Rows)
      const ecoCards = [
        {
          title: "Jobs & Internships",
          tag: "Smart Apply",
          desc: "(1-Click Portfolio Submission & Studio Hiring)",
          x: 75,
          y: 1040
        },
        {
          title: "Compare & Search Colleges",
          tag: "Verified",
          desc: "(Side-by-Side CoA Approved Intake & Fees)",
          x: 555,
          y: 1040
        },
        {
          title: "Architecture Studios & Firms",
          tag: "Directory",
          desc: "(Verified Firm Culture & Recruiter Profiles)",
          x: 75,
          y: 1190
        },
        {
          title: "Daily Architecture Quizzes",
          tag: "Arena",
          desc: "(Visual Recall, Arena Rankings & GATE Prep)",
          x: 555,
          y: 1190
        },
        {
          title: "Architect & Student Profiles",
          tag: "Network",
          desc: "(Showcase Portfolios & Get Discovered)",
          x: 75,
          y: 1340
        },
        {
          title: "Post Jobs & Discover Talent",
          tag: "Recruit",
          desc: "(Studio Outreach & Recruiter Dashboard)",
          x: 555,
          y: 1340
        }
      ];

      ecoCards.forEach((c) => {
        roundRect(ctx, c.x, c.y, 450, 120, 20, "rgba(15, 23, 42, 0.8)", "rgba(56, 189, 248, 0.22)", 1.5);
        ctx.textAlign = "left";

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(c.title, c.x + 24, c.y + 44);

        // Small Gold Tag
        roundRect(ctx, c.x + 24, c.y + 54, 90, 24, 6, "rgba(245, 158, 11, 0.15)", "rgba(245, 158, 11, 0.5)", 1);
        ctx.fillStyle = "#F59E0B";
        ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(c.tag, c.x + 36, c.y + 70);

        ctx.fillStyle = "#94A3B8";
        ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(c.desc, c.x + 24, c.y + 98);
      });

      // 12. Bottom CTA & QR Code Footer
      const footY = 1550;
      // Left: QR Code Box
      roundRect(ctx, 75, footY, 230, 230, 20, "#FFFFFF", "#F59E0B", 3);
      
      // Load dynamic QR code from public API
      const challengeUrl = getChallengeShareUrl();
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(challengeUrl)}`;

      await new Promise<void>((resolve) => {
        const qr = new Image();
        qr.crossOrigin = "anonymous";
        qr.onload = () => {
          ctx.drawImage(qr, 95, footY + 20, 190, 190);
          resolve();
        };
        qr.onerror = () => {
          // Fallback stylized architectural QR pattern
          ctx.fillStyle = "#0F172A";
          ctx.fillRect(100, footY + 25, 180, 180);
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(115, footY + 40, 50, 50);
          ctx.fillRect(215, footY + 40, 50, 50);
          ctx.fillRect(115, footY + 140, 50, 50);
          ctx.fillStyle = "#0F172A";
          ctx.fillRect(125, footY + 50, 30, 30);
          ctx.fillRect(225, footY + 50, 30, 30);
          ctx.fillRect(125, footY + 150, 30, 30);
          resolve();
        };
        qr.src = qrApiUrl;
        setTimeout(resolve, 800); // 800ms safety timeout
      });

      ctx.textAlign = "center";
      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("SCAN TO PLAY & BEAT SCORE", 190, footY + 260);

      // Right: CTA Buttons & WhatsApp Badge
      ctx.textAlign = "left";
      const btnX = 345;

      // Play Quiz Now Button Pill
      const btnGrad = ctx.createLinearGradient(btnX, 0, btnX + 400, 0);
      btnGrad.addColorStop(0, "#F59E0B");
      btnGrad.addColorStop(1, "#EA580C");
      roundRect(ctx, btnX, footY + 10, 420, 66, 33, btnGrad);

      ctx.fillStyle = "#050B14";
      ctx.font = "900 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("PLAY QUIZ NOW →", btnX + 75, footY + 52);

      // Web URL
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 23px 'JetBrains Mono', monospace";
      ctx.fillText("www.trappedintoarchitecture.com/quizzes", btnX, footY + 120);

      // WhatsApp Community Badge
      roundRect(ctx, btnX, footY + 145, 590, 56, 28, "#059669");
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("🟢 Join 15,000+ Architects & Students on WhatsApp", btnX + 35, footY + 180);

      // 13. Bottom City Skyline Silhouette
      ctx.fillStyle = "#02050B";
      ctx.beginPath();
      ctx.moveTo(0, 1920);
      ctx.lineTo(0, 1880);
      ctx.lineTo(80, 1880);
      ctx.lineTo(80, 1850);
      ctx.lineTo(130, 1850);
      ctx.lineTo(130, 1890);
      ctx.lineTo(240, 1890);
      ctx.lineTo(240, 1835);
      ctx.lineTo(310, 1835);
      ctx.lineTo(310, 1875);
      ctx.lineTo(440, 1875);
      ctx.lineTo(440, 1820);
      ctx.lineTo(500, 1795); // Tower spire
      ctx.lineTo(560, 1820);
      ctx.lineTo(560, 1870);
      ctx.lineTo(700, 1870);
      ctx.lineTo(700, 1845);
      ctx.lineTo(770, 1845);
      ctx.lineTo(770, 1890);
      ctx.lineTo(900, 1890);
      ctx.lineTo(900, 1855);
      ctx.lineTo(970, 1855);
      ctx.lineTo(970, 1880);
      ctx.lineTo(1080, 1880);
      ctx.lineTo(1080, 1920);
      ctx.closePath();
      ctx.fill();

      // 14. Export High-Res PNG
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `ti2a-architecture-scorecard-story-${difficulty}.png`;
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

            {/* Platform Cross-Links & Rules Button */}
            <div className="flex flex-wrap items-center gap-2 font-bold text-[11px]">
              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-full border border-amber-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer font-black"
                title="View How to Play & Scoring Rules"
              >
                <BookOpen size={13} className="text-amber-600" />
                <span>How to Play &amp; Rules</span>
              </button>
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

                  <div className="relative w-full h-48 sm:h-64 rounded-2xl mb-6 overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-gray-200 shadow-xs flex items-center justify-center">
                    <img referrerPolicy="no-referrer"
                      src={quiz.cover_image || "/quizzes/fallingwater-kaufmann-residence.jpg"} 
                      alt={quiz.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => { 
                        const target = e.target as HTMLImageElement;
                        target.src = "/quizzes/fallingwater-kaufmann-residence.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                      <span className="px-3 py-1 bg-black/75 backdrop-blur-md text-amber-300 text-xs font-black rounded-full border border-amber-400/30">
                        ⚡ Tournament Ready
                      </span>
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-black text-xs font-bold rounded-full">
                        {allQuestionsPool.length || 65} Questions
                      </span>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    {quiz.category}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 mb-2">
                    {quiz.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed mb-6">
                    {quiz.description || "Test your architectural visual recall, beat the continuous countdown timer, and claim your spot on the official leaderboard."}
                  </p>

                  {/* PROMINENT QUICK START SECTION */}
                  <div className="bg-gradient-to-b from-amber-50/90 to-orange-50/40 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 mb-6 text-center shadow-xs">
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                      <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 bg-black text-white rounded-full">
                        ⚡ Quick Start Recommended
                      </span>
                      <span className="text-xs font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-3 py-1 rounded-full">
                        20 Questions &bull; Challenge Mode &bull; Medium (10s/Q &bull; 3m 20s &bull; 300 Pts/Q)
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-5 max-w-md mx-auto">
                      Jump straight into the quiz challenge with standard tournament settings and earn your spot on the leaderboard.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => handleStartGame("medium", 20, "challenge")}
                        className="w-full sm:w-auto px-10 py-4 bg-black hover:bg-gray-800 text-white text-base font-extrabold rounded-2xl transition shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
                      >
                        <Play size={18} fill="currentColor" />
                        <span>Quick Start Quiz</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRulesModal(true)}
                        className="w-full sm:w-auto px-5 py-4 bg-white hover:bg-gray-50 text-gray-900 text-xs font-bold rounded-2xl transition border border-gray-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <BookOpen size={15} className="text-amber-500" />
                        <span>How to Play &amp; Rules</span>
                      </button>
                    </div>
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

                        {/* Step 2: Select Difficulty Mode (3 Tiers: Easy, Medium, Hard) */}
                        <div>
                          <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-2">
                            2. Select Difficulty Mode:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setDifficulty("easy");
                                if (questionCountChoice > 20) setQuestionCountChoice(10);
                              }}
                              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                                difficulty === "easy" || difficulty === "popular"
                                  ? "bg-emerald-50/90 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20" 
                                  : "bg-white border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                                  🟢 Easy Mode
                                </p>
                                <span className="text-[10px] font-black bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                                  150 PTS/Q
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-gray-800 mt-1">100% Popular Landmarks</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                                15s/Q • No Choice Shuffle • Clue deduction: -50 pts
                              </p>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDifficulty("medium");
                                if (questionCountChoice < 20) setQuestionCountChoice(20);
                              }}
                              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                                difficulty === "medium"
                                  ? "bg-amber-50/90 border-amber-500 shadow-xs ring-2 ring-amber-500/20" 
                                  : "bg-white border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-black text-amber-950 uppercase tracking-wider">
                                  🟡 Medium Mode
                                </p>
                                <span className="text-[10px] font-black bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                                  300 PTS/Q
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-gray-800 mt-1">50-50 + Balanced Mix</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                                10s/Q • Shuffled Choices • Clue deduction: -100 pts
                              </p>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDifficulty("hard")}
                              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                                difficulty === "hard" || difficulty === "master"
                                  ? "bg-purple-50/90 border-purple-600 shadow-xs ring-2 ring-purple-500/20" 
                                  : "bg-white border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-black text-purple-950 uppercase tracking-wider">
                                  🔴 Hard Mode
                                </p>
                                <span className="text-[10px] font-black bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full">
                                  450 PTS/Q
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-gray-800 mt-1">Architecture Master Pool</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                                5s/Q • Sequential Clue Lock 🔒 • Clue deduction: -150 pts
                              </p>
                            </button>
                          </div>
                        </div>

                        {/* Step 3: Select Round Length (Strictly dynamically conditioned on selected difficulty) */}
                        <div>
                          <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-2">
                            3. Round Length (Questions):
                          </label>
                          <div className={`grid gap-3 ${
                            difficulty === "easy" || difficulty === "popular" ? "grid-cols-2" :
                            difficulty === "medium" ? "grid-cols-2" : "grid-cols-3"
                          }`}>
                            {(() => {
                              const isEasy = difficulty === "easy" || difficulty === "popular";
                              const isMedium = difficulty === "medium";
                              const countOptions = isEasy ? [
                                { count: 10, label: "10 Questions", time: "2m 30s", desc: "100% Popular" },
                                { count: 20, label: "20 Questions", time: "5m 00s", desc: "Popular + 50-50" }
                              ] : isMedium ? [
                                { count: 20, label: "20 Questions", time: "3m 20s", desc: "All 50-50 + Split" },
                                { count: 50, label: "50 Questions", time: "8m 20s", desc: "Full Balanced Marathon" }
                              ] : [
                                { count: 10, label: "10 Questions", time: "50s", desc: "100% Master" },
                                { count: 20, label: "20 Questions", time: "1m 40s", desc: "100% Master" },
                                { count: 50, label: "50 Questions", time: "4m 10s", desc: "75% Master • 15% 50-50 • 10% Pop" }
                              ];

                              return countOptions.map(item => (
                                <button
                                  key={item.count}
                                  type="button"
                                  onClick={() => setQuestionCountChoice(item.count)}
                                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                                    questionCountChoice === item.count
                                      ? "bg-black text-white border-black shadow-xs font-bold"
                                      : "bg-white text-gray-800 border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  <p className="text-xs font-bold">{item.label}</p>
                                  <p className={`text-[10px] mt-0.5 ${questionCountChoice === item.count ? "text-gray-300" : "text-gray-400"}`}>
                                    {gameMode === "challenge" ? `Time: ${item.time}` : "Untimed"}
                                  </p>
                                  <p className={`text-[9px] mt-0.5 font-medium ${questionCountChoice === item.count ? "text-amber-300" : "text-gray-500"}`}>
                                    {item.desc}
                                  </p>
                                </button>
                              ));
                            })()}
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

                  {/* 5 Score Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-6">
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

                    <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Clues Used</p>
                      <p className="text-2xl font-black text-purple-700 mt-1">{resultsSummary.cluesUsed || 0}</p>
                      <p className="text-[10px] text-purple-600 font-medium mt-0.5">{(resultsSummary.cluesUsed || 0) === 0 ? "Pure Run ✨" : "Assisted"}</p>
                    </div>

                    <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Speed Bonus</p>
                      <p className="text-2xl font-black text-amber-600 mt-1">+{resultsSummary.timeBonus} PTS</p>
                      <p className="text-[10px] text-amber-600 font-medium mt-0.5">Based on pace</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 col-span-2 sm:col-span-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Time</p>
                      <p className="text-2xl font-black text-gray-900 mt-1 font-mono">{formatTime(resultsSummary.totalTimeElapsed)}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                        {resultsSummary.timedOut ? "Time Expired" : `${Math.round(resultsSummary.totalTimeElapsed / resultsSummary.totalQuestions)}s / question`}
                      </p>
                    </div>
                  </div>

                  {/* REGISTERED USER: AUTOMATIC SCORECARD UPDATE CONFIRMATION */}
                  {currentUser && (
                    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-2 border-emerald-300 rounded-3xl p-5 sm:p-6 text-left mb-8 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                            ✓
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-950 border border-emerald-300">
                                🌟 Official Scoreboard Updated
                              </span>
                              <span className="text-xs font-bold text-emerald-800">
                                {difficulty.toUpperCase()} MODE
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-black text-gray-950 mt-1">
                              Recorded under @{currentUser.username || currentUser.name || currentUser.displayName || "Architect"}
                            </h3>
                            <p className="text-xs text-emerald-800 mt-0.5">
                              Your {resultsSummary.totalPoints} PTS and {resultsSummary.accuracyPercentage}% Accuracy have been posted to the live leaderboard.
                            </p>
                          </div>
                        </div>

                        <a 
                          href="#leaderboard-section" 
                          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl transition shadow-xs text-center shrink-0"
                        >
                          View Your Rank in Leaderboard →
                        </a>
                      </div>
                    </div>
                  )}

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
                      {/* 1. Download High-Res Canvas Scorecard (9:16 WhatsApp Status) */}
                      <button
                        onClick={downloadScorecardImage}
                        disabled={generatingScorecard}
                        className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold rounded-xl text-xs transition flex items-center gap-2 shadow-xs cursor-pointer"
                        title="Download 9:16 vertical scorecard formatted for WhatsApp Status and Instagram Stories"
                      >
                        <Download size={15} /> 
                        <span>{generatingScorecard ? "Generating Status Scorecard..." : "📱 Download Scorecard (WhatsApp Status & Stories)"}</span>
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

                  {/* ANSWERS & PHOTO REVIEW SECTION */}
                  <div className="mb-8 text-left">
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
                      {/* Accordion Header */}
                      <button
                        onClick={() => setShowQuestionReview(!showQuestionReview)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-white hover:bg-gray-100/80 transition text-xs font-black text-gray-900 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {currentUser ? <BookOpen size={16} /> : <Lock size={15} className="text-amber-400" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black">Answers ({questions.length} Questions)</span>
                              {currentUser ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                                  ✓ Member Access
                                </span>
                              ) : (
                                <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                                  <Lock size={10} /> Members Only
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                              {currentUser 
                                ? "Click to view full photo comparisons, correct answers, and architectural tectonic clues."
                                : "Register or log in to view detailed photo solutions and correct answers."}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 shrink-0">
                          <span className="text-[11px] font-bold hidden sm:inline">
                            {showQuestionReview ? "Hide Answers" : "View Answers"}
                          </span>
                          {showQuestionReview ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>

                      {showQuestionReview && (
                        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50/50">
                          {/* If user is NOT logged in: Show Registration / Login Paywall Card */}
                          {!currentUser ? (
                            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-6 sm:p-8 text-center max-w-xl mx-auto shadow-sm">
                              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
                                <Lock size={26} />
                              </div>
                              
                              <h4 className="text-base sm:text-lg font-black text-gray-900 mb-1">
                                Unlock Detailed Answers & Building Photo Solutions
                              </h4>
                              <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto mb-5">
                                Full question-by-question architectural answers, high-resolution building photos, and tectonic clues are reserved for registered Trapped Into Architecture members.
                              </p>

                              {/* Perks */}
                              <div className="bg-gray-50 rounded-xl p-3.5 mb-5 text-left text-xs space-y-1.5 border border-gray-100">
                                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                  <span>Side-by-side photo comparison for every landmark & masterwork</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                  <span>Curated tectonic clues, architect studio facts, and design years</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                  <span>Save your official score and claim your place on the verified leaderboard</span>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => window.dispatchEvent(new CustomEvent('openAuth', { detail: 'register' }))}
                                  className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
                                >
                                  Create Free Account
                                </button>
                                <button
                                  type="button"
                                  onClick={() => window.dispatchEvent(new CustomEvent('openAuth', { detail: 'login' }))}
                                  className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-xl text-xs font-bold transition cursor-pointer"
                                >
                                  Log In
                                </button>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-3">
                                100% Free for architecture students, graduates, and professionals.
                              </p>
                            </div>
                          ) : (
                            /* Registered Member: Full Question-by-Question Photo & Answer Review */
                            <div className="space-y-4">
                              {questions.map((q, idx) => {
                                const userAns = userAnswers[idx];
                                const correct = isAnswerCorrect(q, userAns);
                                const wasSkipped = skippedQuestions[idx];

                                return (
                                  <div 
                                    key={idx} 
                                    className={`bg-white rounded-2xl border p-4 sm:p-5 transition shadow-2xs ${
                                      correct ? "border-emerald-200 ring-1 ring-emerald-100" :
                                      wasSkipped ? "border-amber-200 ring-1 ring-amber-100" :
                                      "border-red-200 ring-1 ring-red-100"
                                    }`}
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                      
                                      {/* Building Image Thumbnail */}
                                      {q.media_url ? (
                                        <div 
                                          onClick={() => setZoomImageUrl({ url: q.media_url, title: q.correct_answer || "Building photo" })}
                                          className="md:col-span-4 rounded-xl overflow-hidden bg-slate-950 border border-gray-200 relative aspect-video sm:aspect-4/3 max-h-48 group cursor-pointer flex items-center justify-center shadow-2xs"
                                          title="Click to view full photo"
                                        >
                                          <img 
                                            referrerPolicy="no-referrer"
                                            src={q.media_url} 
                                            alt={q.question_text || "Building image"} 
                                            className="w-full h-full object-contain p-1 group-hover:scale-105 transition duration-300"
                                            onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                                          />
                                          <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-md">
                                            Q{idx + 1}
                                          </div>
                                        </div>
                                      ) : null}

                                      {/* Question Details & Answers */}
                                      <div className={q.media_url ? "md:col-span-8" : "md:col-span-12"}>
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                                              Question {idx + 1} of {questions.length}
                                            </span>
                                            {getQuestionDifficulty(q.correct_answer || q.question_text || "", q.accepted_aliases) === "master" ? (
                                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-900 border border-blue-200 uppercase tracking-wide">
                                                Architecture Master • 300 pts
                                              </span>
                                            ) : (
                                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-wide">
                                                Popular • 100 pts
                                              </span>
                                            )}
                                          </div>
                                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                                            correct ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                                            wasSkipped ? "bg-amber-100 text-amber-800 border border-amber-300" :
                                            "bg-red-100 text-red-800 border border-red-300"
                                          }`}>
                                            {correct ? "✓ Correct" : wasSkipped ? "⏭ Skipped" : "✗ Incorrect"}
                                          </span>
                                        </div>

                                        <h5 className="text-xs sm:text-sm font-bold text-gray-900 mb-3">
                                          {q.question_text}
                                        </h5>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                                          {/* User Answer */}
                                          <div className={`p-2.5 rounded-xl border ${
                                            correct 
                                              ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" 
                                              : "bg-red-50/70 border-red-200 text-red-900"
                                          }`}>
                                            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                                              Your Selection:
                                            </span>
                                            <strong className="font-black text-xs">
                                              {userAns || (wasSkipped ? "(Skipped)" : "(Unanswered)")}
                                            </strong>
                                          </div>

                                          {/* Correct Answer */}
                                          <div className="p-2.5 rounded-xl border bg-gray-50 border-gray-200 text-gray-900">
                                            <span className="text-[10px] font-bold uppercase tracking-wider block text-gray-500">
                                              Correct Answer:
                                            </span>
                                            <strong className="font-black text-xs text-emerald-700">
                                              {q.correct_answer}
                                            </strong>
                                          </div>
                                        </div>

                                        {/* Explanation / Clue */}
                                        {q.explanation_clue && (
                                          <div className="text-[11px] text-gray-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 flex items-start gap-1.5">
                                            <span className="text-amber-600 shrink-0">💡</span>
                                            <span><strong>Tectonic Fact:</strong> {q.explanation_clue}</span>
                                          </div>
                                        )}
                                      </div>

                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
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

                /* 3. ACTIVE QUESTION CARD WITH QUESTION PALETTE */
                <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                  <div>
                    
                    {/* CONTINUOUS COUNTDOWN TIMER & HEADER */}
                    <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-500">
                          Question {currentIndex + 1} of {questions.length}
                        </span>

                        {qDiff === "master" || qDiff === "hard" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 flex items-center gap-1 border border-blue-200 uppercase tracking-wide">
                            Architecture Master • 300 pts
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 flex items-center gap-1 border border-amber-200 uppercase tracking-wide">
                            Popular • 100 pts
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
                            !isQuestionReady
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : timerSeconds <= 30
                              ? "bg-red-600 text-white animate-pulse"
                              : timerSeconds <= 60
                              ? "bg-amber-500 text-black"
                              : "bg-gray-900 text-white"
                          }`}>
                            <Clock size={12} className={!isQuestionReady ? "text-amber-600 animate-spin" : timerSeconds <= 30 ? "text-white" : "text-emerald-400"} />
                            <span>{formatTime(timerSeconds)}</span>
                            {!isQuestionReady && (
                              <span className="text-[10px] font-sans font-black bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded-full uppercase ml-0.5">
                                Paused • Photo Loading
                              </span>
                            )}
                          </div>
                        ) : isTimerDisabled ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold shadow-2xs">
                            <Crown size={12} className="text-amber-600" />
                            <span>♾️ Untimed Study Mode</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-mono font-bold">
                              <Clock size={12} className={!isQuestionReady ? "text-amber-600 animate-spin" : "text-gray-400"} />
                              <span>{formatTime(totalTimeElapsed)}</span>
                              {!isQuestionReady && (
                                <span className="text-[10px] font-sans font-bold text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded-full ml-1">
                                  Paused
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (isGoldTier) {
                                  setIsTimerDisabled(true);
                                } else {
                                  setShowGoldModal(true);
                                }
                              }}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-amber-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-400/50 text-amber-900 text-[10px] font-bold transition cursor-pointer shadow-2xs animate-pulse"
                              title="Click to remove timer for untimed practice"
                            >
                              <Crown size={12} className="text-amber-600 shrink-0" />
                              <span className="font-extrabold hover:underline">Want untimed study? Remove Timer</span>
                              <span className="px-1.5 py-0.2 bg-amber-300 text-amber-950 rounded font-black text-[9px] uppercase">Gold</span>
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => finishGame(false)}
                          className="text-[11px] font-extrabold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 transition cursor-pointer"
                        >
                          Finish Quiz
                        </button>
                      </div>
                    </div>

                    {/* QUESTION NAVIGATION PALETTE (Answered, Skipped, Unvisited, Current) */}
                    <div className="mb-5 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                      <div className="flex items-center justify-between text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-2.5">
                        <span className="flex items-center gap-1.5 text-gray-700">
                          <span>📋</span> Question Palette ({currentIndex + 1}/{questions.length})
                        </span>
                        <div className="flex items-center gap-3 font-semibold text-[10px]">
                          <span className="flex items-center gap-1.5 text-gray-800">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" /> Answered
                          </span>
                          <span className="flex items-center gap-1.5 text-amber-800">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Skipped
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-500">
                            <span className="w-2.5 h-2.5 rounded-full bg-white border border-gray-300 inline-block" /> Unvisited
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {questions.map((q, idx) => {
                          const isCurrent = currentIndex === idx;
                          const hasAnswer = !!userAnswers[idx];
                          const isSkipped = skippedQuestions[idx];

                          let btnClass = "bg-white text-gray-700 border-gray-300 hover:border-gray-500 font-semibold";
                          if (hasAnswer) {
                            btnClass = "bg-slate-900 text-white border-slate-900 font-black shadow-xs";
                          } else if (isSkipped) {
                            btnClass = "bg-amber-100 text-amber-900 border-amber-400 font-bold";
                          }

                          if (isCurrent) {
                            btnClass += " ring-2 ring-blue-600 ring-offset-1 scale-105 z-10 font-black";
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => jumpToQuestion(idx)}
                              className={`w-7 h-7 rounded-lg text-[11px] border flex items-center justify-center transition shrink-0 cursor-pointer ${btnClass}`}
                              title={`Question ${idx + 1}: ${hasAnswer ? "Answered" : isSkipped ? "Skipped" : "Unvisited"}`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Question Prompt & Pinned Header Clue Ribbon (Option C) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <h2 className="text-base sm:text-lg font-black text-gray-900 leading-snug flex-1">
                        {currentQ.question_text}
                      </h2>

                      {/* CLUE RIBBON BUTTONS (Option C: Pinned Header Ribbon - Dynamic Context-Aware & Strict Hard Lock) */}
                      {(() => {
                        const cluesInfo = getQuestionClues(currentQ);
                        const isHard = difficulty === "hard" || difficulty === "master";
                        const clue1Revealed = Boolean(unlockedClues[currentIndex]?.location);
                        const clue2Revealed = Boolean(unlockedClues[currentIndex]?.architect);
                        const clue2Locked = isHard && !clue1Revealed;
                        const deduction = getGameDifficultyClueDeduction(difficulty);

                        return (
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Clue 1: Location */}
                            <button
                              type="button"
                              onClick={() => handleUnlockClue("location")}
                              disabled={clue1Revealed}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                                clue1Revealed
                                  ? "bg-blue-100 text-blue-900 border border-blue-300 font-extrabold cursor-default"
                                  : "bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200 cursor-pointer"
                              }`}
                              title={`Reveal ${cluesInfo.clue1.label} (-${deduction} pts)`}
                            >
                              <span>{cluesInfo.clue1.icon}</span>
                              <span>{clue1Revealed ? cluesInfo.clue1.revealedLabel : cluesInfo.clue1.label}</span>
                              {!clue1Revealed && (
                                <span className="text-[10px] text-blue-700 font-extrabold bg-blue-100 px-1.5 py-0.2 rounded-md">
                                  -{deduction} pts
                                </span>
                              )}
                            </button>

                            {/* Clue 2: Architect (Strict Lock on Hard Mode) */}
                            <button
                              type="button"
                              onClick={() => {
                                if (clue2Locked) return;
                                handleUnlockClue("architect");
                              }}
                              disabled={clue2Revealed || clue2Locked}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                                clue2Revealed
                                  ? "bg-purple-100 text-purple-900 border border-purple-300 font-extrabold cursor-default"
                                  : clue2Locked
                                  ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-75"
                                  : "bg-purple-50 hover:bg-purple-100 text-purple-950 border border-purple-200 cursor-pointer"
                              }`}
                              title={
                                clue2Locked 
                                  ? "🔒 Locked: On Hard Mode, reveal Clue 1 (Location) first!" 
                                  : `Reveal ${cluesInfo.clue2.label} (-${deduction} pts)`
                              }
                            >
                              <span>{clue2Locked ? "🔒" : cluesInfo.clue2.icon}</span>
                              <span>{clue2Revealed ? cluesInfo.clue2.revealedLabel : clue2Locked ? "Clue 2 (Locked)" : cluesInfo.clue2.label}</span>
                              {!clue2Revealed && (
                                <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                                  clue2Locked ? "text-gray-500 bg-gray-200" : "text-purple-700 bg-purple-100"
                                }`}>
                                  -{deduction} pts
                                </span>
                              )}
                            </button>
                          </div>
                        );
                      })()}
                    </div>

                    {/* REVEALED CLUES DISPLAY (Positioned above photo, 100% visible, zero photo obstruction!) */}
                    {(() => {
                      const cluesInfo = getQuestionClues(currentQ);
                      const showClue1 = Boolean(unlockedClues[currentIndex]?.location);
                      const showClue2 = Boolean(unlockedClues[currentIndex]?.architect);
                      if (!showClue1 && !showClue2) return null;

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 animate-in fade-in slide-in-from-top-1 duration-150">
                          {showClue1 && (
                            <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-xl flex items-center gap-2 text-xs font-bold text-blue-950 shadow-2xs">
                              <span className="text-base">{cluesInfo.clue1.icon}</span>
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">{cluesInfo.clue1.bannerTitle}</span>
                                <span>{cluesInfo.clue1.text}</span>
                              </div>
                            </div>
                          )}
                          {showClue2 && (
                            <div className="p-3 bg-purple-50/90 border border-purple-200 rounded-xl flex items-center gap-2 text-xs font-bold text-purple-950 shadow-2xs">
                              <span className="text-base">{cluesInfo.clue2.icon}</span>
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 block">{cluesInfo.clue2.bannerTitle}</span>
                                <span>{cluesInfo.clue2.text}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Active Question Content: Distinct Photo Card layout for Architect's Oeuvre / Portfolio Quiz */}
                    {(() => {
                      const isArchitectOeuvre = slug === "architects-oeuvre-pair-the-masterpieces";

                      if (isArchitectOeuvre && currentQ.question_type === "choose" && currentQ.options) {
                        return (
                          <div className="mb-6">
                            <p className="text-xs font-extrabold text-gray-700 mb-3 flex items-center gap-1.5">
                              <span>🏛️ Inspect the architectural portfolio and select the matching masterpiece:</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              {currentQ.options.map((opt, optIdx) => {
                                const isSelected = userAnswers[currentIndex] === opt;
                                const showPracticeCorrect = gameMode === "practice" && practiceFeedback[currentIndex]?.isSubmitted && opt === currentQ.correct_answer;
                                const showPracticeWrong = gameMode === "practice" && practiceFeedback[currentIndex]?.isSubmitted && isSelected && !practiceFeedback[currentIndex]?.isCorrect;
                                const optPhoto = getBuildingPhotoForOption(opt);

                                let cardClass = "border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50/50";
                                if (isSelected) {
                                  cardClass = "border-black ring-2 ring-black bg-gray-50/60 shadow-md";
                                }
                                if (showPracticeCorrect) {
                                  cardClass = "border-emerald-500 ring-2 ring-emerald-500 bg-emerald-50/60 shadow-sm";
                                } else if (showPracticeWrong) {
                                  cardClass = "border-red-500 ring-2 ring-red-500 bg-red-50/60 shadow-sm";
                                }

                                return (
                                  <div
                                    key={optIdx}
                                    onClick={() => handleSelectAnswer(opt)}
                                    className={`rounded-2xl border p-3 flex flex-col justify-between transition cursor-pointer shadow-2xs group ${cardClass}`}
                                  >
                                    {/* Option Photo Container */}
                                    <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden bg-slate-950 mb-2.5 flex items-center justify-center">
                                      {optPhoto ? (
                                        <>
                                          <img
                                            referrerPolicy="no-referrer"
                                            src={optPhoto}
                                            alt={opt}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                          />
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setZoomImageUrl({ url: optPhoto, title: opt });
                                            }}
                                            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/75 hover:bg-black text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                                            title="Click to view full photo"
                                          >
                                            <ZoomIn size={12} />
                                          </button>
                                        </>
                                      ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-500 p-4">
                                          <Building2 size={28} className="mb-1 text-gray-400" />
                                          <span className="text-[11px] font-medium text-gray-400">Architectural Masterpiece</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Option Label and Selected / Correct Icon */}
                                    <div className="flex items-center justify-between gap-2 pt-1">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <span className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center shrink-0 border ${
                                          isSelected ? "bg-black text-white border-black" : "bg-gray-100 text-gray-700 border-gray-200"
                                        }`}>
                                          {String.fromCharCode(65 + optIdx)}
                                        </span>
                                        <span className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                          {opt}
                                        </span>
                                      </div>
                                      {isSelected && <Check size={16} className="text-black shrink-0" />}
                                      {showPracticeCorrect && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                                      {showPracticeWrong && <XCircle size={16} className="text-red-600 shrink-0" />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      // Standard Quiz Layout: Left Question Image + Right Answer Options
                      return (
                        <div className={`grid grid-cols-1 ${currentQ.media_url ? 'md:grid-cols-12 gap-5' : 'gap-4'} mb-6 items-stretch`}>
                          
                          {/* Left: Question Architectural Photo (Matches height of answers, un-cropped natural aspect ratio) */}
                          {currentQ.media_url && (
                            <div className="md:col-span-5 flex flex-col">
                              <div 
                                onClick={() => setZoomImageUrl({ url: currentQ.media_url, title: currentQ.question_text || "Architectural Landmark" })}
                                className="relative rounded-2xl overflow-hidden border border-gray-200 bg-slate-950 flex items-center justify-center shadow-xs group cursor-pointer flex-1 min-h-[230px] max-h-[350px] md:max-h-[380px] p-2"
                                title="Click to inspect full photo"
                              >
                                {!imageLoaded && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 text-gray-300 z-10 p-4 text-center">
                                    <span className="w-8 h-8 rounded-full border-3 border-amber-400 border-t-transparent animate-spin mb-2.5"></span>
                                    <span className="text-xs font-bold text-white tracking-wide">Loading architectural photo...</span>
                                    <span className="text-[11px] font-mono text-amber-300 font-bold mt-1 bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                                      ⏱️ Timer is paused until photo appears
                                    </span>
                                  </div>
                                )}
                                <img 
                                  referrerPolicy="no-referrer"
                                  src={currentQ.media_url} 
                                  alt="Question photo" 
                                  className={`w-full h-full object-contain transition-all duration-200 group-hover:scale-[1.02] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                  onLoad={handleImageLoaded}
                                  onError={(e) => {
                                    handleImageLoaded();
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[10px] text-gray-300 font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                                  <ZoomIn size={11} /> Click to enlarge
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Right: Answer Choices (Height-matched alongside photo) */}
                          <div className={`${currentQ.media_url ? 'md:col-span-7' : 'w-full'} flex flex-col justify-center`}>
                            {currentQ.question_type === "choose" && currentQ.options && (
                              <div className={`grid grid-cols-1 ${currentQ.media_url ? 'gap-2.5' : 'sm:grid-cols-2 gap-3'} transition-opacity duration-200 ${!isQuestionReady ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
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
                                      disabled={!isQuestionReady}
                                      className={`p-3.5 sm:p-4 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center justify-between cursor-pointer shadow-2xs ${optionClass}`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <span className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center shrink-0 border ${
                                          isSelected ? "bg-white text-black border-white" : "bg-gray-100 text-gray-600 border-gray-200"
                                        }`}>
                                          {String.fromCharCode(65 + optIdx)}
                                        </span>
                                        <span className="font-semibold truncate">{opt}</span>
                                      </div>
                                      {isSelected && <Check size={16} className="shrink-0" />}
                                      {showPracticeCorrect && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                                      {showPracticeWrong && <XCircle size={16} className="text-red-600 shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Fill Up / Missing Letters */}
                            {currentQ.question_type !== "choose" && (
                              <div className={`transition-opacity duration-200 ${!isQuestionReady ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
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
                                disabled={!isQuestionReady}
                                onChange={(e) => setFillInput(e.target.value)}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-black bg-white"
                              />
                              <button
                                type="submit"
                                disabled={!fillInput.trim() || !isQuestionReady}
                                className="px-5 py-3 bg-black hover:bg-gray-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                              >
                                Save
                              </button>
                            </form>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })()}

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
              <div id="leaderboard-section" className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs scroll-mt-28">
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

                {/* 3-Tier Tabs: Easy / Medium / Hard */}
                <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl mb-4">
                  <button
                    type="button"
                    onClick={() => setLeaderboardDifficulty("easy")}
                    className={`py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
                      leaderboardDifficulty === "easy" || leaderboardDifficulty === "popular"
                        ? "bg-white text-emerald-900 shadow-xs" 
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    Easy
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaderboardDifficulty("medium")}
                    className={`py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
                      leaderboardDifficulty === "medium"
                        ? "bg-white text-amber-900 shadow-xs" 
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaderboardDifficulty("hard")}
                    className={`py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
                      leaderboardDifficulty === "hard" || leaderboardDifficulty === "master"
                        ? "bg-white text-blue-900 shadow-xs" 
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    Hard
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
                    {leaderboard.slice(0, 10).map((entry, idx) => {
                      const acc = entry.total_questions > 0 
                        ? Math.round((entry.score / entry.total_questions) * 100) 
                        : 0;

                      const isCurrentUserEntry = currentUser && (
                        entry.user_id === currentUser.id || 
                        (currentUser.username && entry.display_name === currentUser.username) ||
                        (currentUser.name && entry.display_name === currentUser.name)
                      );

                      return (
                        <div 
                          key={idx}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                            isCurrentUserEntry 
                              ? "bg-blue-50/90 border-blue-400 ring-1 ring-blue-300 shadow-xs" 
                              : "border-gray-100 hover:bg-gray-50"
                          }`}
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
                              <p className="text-xs font-bold text-gray-900 truncate flex items-center gap-1.5">
                                <span className={isCurrentUserEntry ? "text-blue-900 font-black" : ""}>
                                  {entry.display_name}
                                </span>
                                {isCurrentUserEntry && (
                                  <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md">
                                    YOU
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-gray-400 uppercase font-mono">
                                {entry.total_questions || 10} Qs • <span className="text-emerald-700 font-bold">{acc}% Acc</span>
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

      {/* FULL-SIZE IMAGE ZOOM LIGHTBOX MODAL */}
      {zoomImageUrl && (
        <div 
          onClick={() => setZoomImageUrl(null)}
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150"
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="relative bg-gray-950 border border-white/20 rounded-3xl overflow-hidden max-w-4xl max-h-[85vh] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/60">
              <p className="text-sm font-bold text-white truncate pr-4">
                {zoomImageUrl.title || "Full Resolution Architectural Photograph"}
              </p>
              <button 
                onClick={() => setZoomImageUrl(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-3 flex-1 flex items-center justify-center overflow-auto bg-black">
              <img 
                referrerPolicy="no-referrer"
                src={zoomImageUrl.url} 
                alt="Enlarged view" 
                className="max-h-[72vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="p-3 bg-gray-950/90 text-center text-xs text-gray-400 border-t border-white/10">
              High-resolution photograph for visual architecture identification &amp; analysis
            </div>
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
              Untimed Study Mode is a GOLD Tier Perk
            </h3>

            <p className="text-xs text-gray-600 leading-relaxed mb-6 px-1">
              Practice without any countdown or timer pressure! Relax and study architectural masterpieces at your own pace with untimed learning. Register or complete your profile to <strong>Gold Tier (66%+ completion)</strong> to unlock untimed study!
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

      {/* HOW TO PLAY & OFFICIAL SCORING RULES POPUP MODAL */}
      <QuizRulesModal 
        isOpen={showRulesModal} 
        onClose={() => setShowRulesModal(false)} 
      />
    </>
  );
}
