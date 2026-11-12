"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Save, Sparkles, UploadCloud, 
  Loader2, CheckCircle2, ArrowLeft, Image as ImageIcon, HelpCircle, Eye, RefreshCw, Wand2,
  ZoomIn, X, Check, Filter, AlertCircle
} from "lucide-react";
import { getQuestionDifficulty, QuestionDifficulty } from "@/lib/quizDifficulty";

interface Question {
  id?: string;
  order_index: number;
  question_type: "choose" | "fill_up" | "missing_letters";
  question_text: string;
  media_type: "none" | "image";
  media_url: string;
  options: string[];
  correct_answer: string;
  accepted_aliases: string[];
  explanation_clue: string;
  difficulty?: QuestionDifficulty;
}

interface QuizEditorProps {
  quizId?: string;
  onBack?: () => void;
}

// Generate missing letter mask like "C _ A R _ E S   C _ R R _ A"
export function generateMissingLettersMask(text: string): string {
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

export default function QuizEditor({ quizId, onBack }: QuizEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!quizId);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Quiz Meta
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Guess the Building");
  const [coverImage, setCoverImage] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Questions State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<"all" | QuestionDifficulty>("all");
  const [zoomImageUrl, setZoomImageUrl] = useState<{ url: string; title: string } | null>(null);

  // 1-Click Generator Configuration
  const [questionCol, setQuestionCol] = useState<"building_photo" | "architect_photo" | "building_name" | "puzzle_clues">("building_photo");
  const [answerCol, setAnswerCol] = useState<"building_name" | "architect" | "opened_year" | "city" | "architectural_style">("building_name");
  const [answerFormat, setAnswerFormat] = useState<"choose" | "fill_up" | "missing_letters">("choose");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [optionsCount, setOptionsCount] = useState<number>(4);

  // Available catalog rows
  const [catalogRows, setCatalogRows] = useState<any[]>([]);

  useEffect(() => {
    loadCatalogRows();
    if (quizId) {
      loadQuizData();
    }
  }, [quizId]);

  const loadCatalogRows = async () => {
    const { data } = await supabase.from("architecture_catalog").select("*").limit(100);
    if (data) setCatalogRows(data);
  };

  const loadQuizData = async () => {
    try {
      const { data: qData, error: qErr } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();
      if (qErr || !qData) throw new Error(qErr?.message || "Quiz not found");

      setTitle(qData.title || "");
      setSlug(qData.slug || "");
      setDescription(qData.description || "");
      setCategory(qData.category || "Guess the Building");
      setCoverImage(qData.cover_image || "");
      setIsPublished(qData.is_published || false);

      const { data: quesData, error: quesErr } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order_index", { ascending: true });

      if (quesData && quesData.length > 0) {
        setQuestions(quesData.map(q => {
          const explicitDiff = Array.isArray(q.accepted_aliases)
            ? q.accepted_aliases.find((a: string) => typeof a === "string" && a.startsWith("diff:"))?.split(":")[1]
            : null;
          const resolvedDiff = (explicitDiff as QuestionDifficulty) || getQuestionDifficulty(q.correct_answer || q.question_text || "", q.accepted_aliases);

          return {
            ...q,
            question_type: (q.question_type as any) || "choose",
            options: Array.isArray(q.options) ? q.options : [],
            accepted_aliases: Array.isArray(q.accepted_aliases) ? q.accepted_aliases : [],
            difficulty: resolvedDiff || "medium"
          };
        }));
      }
    } catch (err: any) {
      alert("Error loading quiz: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!quizId) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generated);
    }
  };

  // Update a question field
  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  };

  // Update difficulty for a specific question
  const updateQuestionDifficulty = (index: number, diff: QuestionDifficulty) => {
    updateQuestion(index, { difficulty: diff });
  };

  // Update option text
  const updateOptionText = (qIndex: number, optIndex: number, newText: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      const q = updated[qIndex];
      const newOptions = [...q.options];
      const oldText = newOptions[optIndex];
      newOptions[optIndex] = newText;
      
      // If this option was the correct answer, update correct_answer too
      let newCorrect = q.correct_answer;
      if (q.correct_answer === oldText) {
        newCorrect = newText;
      }
      updated[qIndex] = { ...q, options: newOptions, correct_answer: newCorrect };
      return updated;
    });
  };

  // Set option as correct answer
  const setCorrectOption = (qIndex: number, optionValue: string) => {
    updateQuestion(qIndex, { correct_answer: optionValue });
  };

  // Move Question Up
  const moveQuestionUp = (index: number) => {
    if (index === 0) return;
    setQuestions(prev => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated.map((q, i) => ({ ...q, order_index: i + 1 }));
    });
  };

  // Move Question Down
  const moveQuestionDown = (index: number) => {
    if (index >= questions.length - 1) return;
    setQuestions(prev => {
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated.map((q, i) => ({ ...q, order_index: i + 1 }));
    });
  };

  // Add a blank question manually
  const addBlankQuestion = () => {
    const newQ: Question = {
      order_index: questions.length + 1,
      question_type: "choose",
      question_text: "Identify this iconic architectural landmark from the photo:",
      media_type: "image",
      media_url: "",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct_answer: "Option A",
      accepted_aliases: ["Option A"],
      explanation_clue: "",
      difficulty: "medium"
    };
    setQuestions(prev => [...prev, newQ]);
  };

  // ⚡ 1-CLICK GENERATE QUIZ FROM ARCHITECTURE CATALOG
  const generateQuizFromDatabase = () => {
    if (catalogRows.length === 0) {
      alert("No rows found in architecture catalog. Please ensure rows are loaded.");
      return;
    }

    setGenerating(true);

    const validRows = catalogRows.filter(r => {
      const d = r.data || {};
      const qVal = d[questionCol];
      const aVal = d[answerCol];
      return qVal && String(qVal).trim() !== "" && aVal && String(aVal).trim() !== "";
    });

    if (validRows.length === 0) {
      alert(`No projects have both ${questionCol} and ${answerCol}.`);
      setGenerating(false);
      return;
    }

    const shuffled = [...validRows].sort(() => Math.random() - 0.5);
    const selectedRows = shuffled.slice(0, questionCount === 999 ? shuffled.length : questionCount);
    const allAnswerValues = Array.from(new Set(catalogRows.map(r => r.data?.[answerCol]).filter(Boolean)));

    const generatedQuestions: Question[] = selectedRows.map((row, idx) => {
      const d = row.data || {};
      const targetAnswer = String(d[answerCol] || "").trim();

      let promptText = "";
      let mediaUrl = "";
      let mediaType: "none" | "image" = "none";

      if (questionCol === "building_photo" || questionCol === "architect_photo") {
        mediaUrl = d[questionCol] || "";
        mediaType = mediaUrl ? "image" : "none";
        
        if (answerCol === "building_name") {
          promptText = "Identify this iconic architectural landmark from the photo:";
        } else if (answerCol === "architect") {
          promptText = `Who is the architect of this building${d.city ? ` in ${d.city}` : ""}?`;
        } else if (answerCol === "opened_year") {
          promptText = `In which year was ${d.building_name || "this building"} opened?`;
        } else if (answerCol === "city") {
          promptText = `In which city is ${d.building_name || "this project"} located?`;
        } else if (answerCol === "architectural_style") {
          promptText = `What is the architectural style of ${d.building_name || "this building"}?`;
        } else {
          promptText = "Identify the correct detail for this structure:";
        }
      } else {
        const qContent = d[questionCol] || "";
        if (answerCol === "architect") {
          promptText = `Who designed ${qContent}?`;
        } else if (answerCol === "building_name") {
          promptText = `Name the iconic project designed by ${qContent}:`;
        } else {
          promptText = `Regarding ${qContent}, what is the ${answerCol.replace(/_/g, " ")}?`;
        }
      }

      let optionsList: string[] = [];
      if (answerFormat === "choose") {
        const distractors = allAnswerValues
          .filter(v => v !== targetAnswer)
          .sort(() => Math.random() - 0.5)
          .slice(0, optionsCount - 1);
        optionsList = [targetAnswer, ...distractors].sort(() => Math.random() - 0.5);
      }

      const aliases = [targetAnswer];
      if (answerCol === "architect" && targetAnswer.includes(" ")) {
        const lastName = targetAnswer.split(" ").pop();
        if (lastName) aliases.push(lastName);
      }

      const explanation = d.puzzle_clues || 
        `${d.building_name || "Project"} was designed by ${d.architect || "Master Architect"} in ${d.city || "India"} (${d.opened_year || ""}).`;

      // Determine initial difficulty from catalog or mapping
      const catalogDiff = (d.difficulty as QuestionDifficulty) || getQuestionDifficulty(targetAnswer || promptText);

      return {
        order_index: idx + 1,
        question_type: answerFormat,
        question_text: promptText,
        media_type: mediaType,
        media_url: mediaUrl,
        options: optionsList,
        correct_answer: targetAnswer,
        accepted_aliases: aliases,
        explanation_clue: explanation,
        difficulty: catalogDiff || "medium"
      };
    });

    setQuestions(generatedQuestions);

    if (!title.trim()) {
      let suggestedTitle = "";
      let cat = "Guess the Building";
      if (answerCol === "architect") {
        suggestedTitle = "Guess the Architect from the Building Photo";
        cat = "Guess the Architect";
      } else if (answerCol === "building_name") {
        suggestedTitle = "Iconic World Landmarks: Guess the Building";
        cat = "Guess the Building";
      } else if (answerCol === "opened_year") {
        suggestedTitle = "Guess the Year: When were these iconic buildings opened?";
        cat = "Guess the Year";
      } else if (answerCol === "city") {
        suggestedTitle = "Guess the Location: Where are these buildings located?";
        cat = "Guess the Location";
      }
      handleTitleChange(suggestedTitle);
      setCategory(cat);
    }

    setGenerating(false);
    setToastMsg({ text: `Generated ${generatedQuestions.length} questions from database!`, type: "success" });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const removeQuestion = (idx: number) => {
    const updated = questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order_index: i + 1 }));
    setQuestions(updated);
  };

  const handleSaveQuiz = async (publishState?: boolean) => {
    if (!title.trim()) {
      alert("Please provide a Quiz Title.");
      return;
    }
    if (!slug.trim()) {
      alert("Please provide a URL slug.");
      return;
    }
    if (questions.length === 0) {
      alert("Please add or generate questions for the quiz.");
      return;
    }

    setSaving(true);
    try {
      const pub = publishState !== undefined ? publishState : isPublished;
      const quizPayload = {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        category,
        cover_image: coverImage.trim() || questions[0]?.media_url || "",
        is_published: pub,
        updated_at: new Date().toISOString()
      };

      let activeQuizId = quizId;

      if (quizId) {
        const { error: updateErr } = await supabase
          .from("quizzes")
          .update(quizPayload)
          .eq("id", quizId);
        if (updateErr) throw updateErr;
      } else {
        const { data: newQ, error: insertErr } = await supabase
          .from("quizzes")
          .insert([quizPayload])
          .select()
          .single();
        if (insertErr) throw insertErr;
        activeQuizId = newQ.id;
      }

      // Sync Questions with explicit difficulty tag in accepted_aliases
      if (activeQuizId) {
        await supabase.from("quiz_questions").delete().eq("quiz_id", activeQuizId);

        const questionsToInsert = questions.map((q, idx) => {
          const diffVal = q.difficulty || "medium";
          const cleanAliases = (q.accepted_aliases || []).filter(a => typeof a === "string" && !a.startsWith("diff:"));

          return {
            quiz_id: activeQuizId,
            order_index: idx + 1,
            question_type: q.question_type,
            question_text: q.question_text.trim(),
            media_type: q.media_url ? "image" : "none",
            media_url: q.media_url.trim(),
            options: q.options || [],
            correct_answer: q.correct_answer.trim(),
            accepted_aliases: [`diff:${diffVal}`, ...cleanAliases],
            explanation_clue: (q.explanation_clue || "").trim()
          };
        });

        const { error: qInsertErr } = await supabase
          .from("quiz_questions")
          .insert(questionsToInsert);
        if (qInsertErr) throw qInsertErr;
      }

      setToastMsg({ text: `Quiz saved successfully! (${pub ? "Published Live" : "Saved as Draft"})`, type: "success" });
      setTimeout(() => {
        if (onBack) onBack();
        else router.push("/admin/quizzes");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      alert("Error saving quiz: " + (err.message || String(err)));
    } finally {
      setSaving(false);
    }
  };

  // Difficulty counts
  const countEasy = questions.filter(q => q.difficulty === "easy").length;
  const countMedium = questions.filter(q => q.difficulty === "medium").length;
  const countHard = questions.filter(q => q.difficulty === "hard").length;

  const filteredQuestionsWithOriginalIndices = questions
    .map((q, idx) => ({ q, originalIndex: idx }))
    .filter(({ q }) => filterDifficulty === "all" || q.difficulty === filterDifficulty);

  if (loading) {
    return (
      <div className="p-16 text-center text-gray-500 font-bold flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-black" size={30} />
        <span className="text-sm">Loading Quiz & Questions Editor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      
      {/* FULL-SIZE IMAGE ZOOM LIGHTBOX MODAL */}
      {zoomImageUrl && (
        <div 
          onClick={() => setZoomImageUrl(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-pointer animate-in fade-in"
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="relative bg-gray-900 border border-white/20 rounded-3xl overflow-hidden max-w-4xl max-h-[85vh] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/60">
              <p className="text-sm font-bold text-white truncate">
                {zoomImageUrl.title || "Full Resolution Architectural Photograph"}
              </p>
              <button 
                onClick={() => setZoomImageUrl(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-2 flex-1 flex items-center justify-center overflow-auto bg-black">
              <img 
                referrerPolicy="no-referrer"
                src={zoomImageUrl.url} 
                alt="Enlarged view" 
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="p-3 bg-gray-900/90 text-center text-xs text-gray-400 border-t border-white/10">
              High-resolution photo used for question visual recall.
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <button 
          onClick={onBack ? onBack : () => router.push("/admin/quizzes")}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black transition"
        >
          <ArrowLeft size={16} /> Back to Quizzes Hub
        </button>

        <div className="flex items-center gap-2">
          {quizId && slug && (
            <a 
              href={`/quizzes/${slug}`} 
              target="_blank" 
              rel="noreferrer"
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-gray-300"
            >
              <Eye size={14} /> Test Live Quiz
            </a>
          )}
          <button 
            onClick={() => handleSaveQuiz(false)}
            disabled={saving}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition border border-gray-300 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button 
            onClick={() => handleSaveQuiz(true)}
            disabled={saving}
            className="px-6 py-2 bg-black hover:bg-gray-800 text-white text-xs font-extrabold rounded-xl transition shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Publishing..." : "Publish Quiz Live"}
          </button>
        </div>
      </div>

      {/* STEP 1: 1-CLICK COLUMN-BASED QUIZ GENERATOR (COLLAPSIBLE / ACCORDION) */}
      <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-white rounded-3xl border border-blue-200 p-6 shadow-xs mb-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              ⚡
            </span>
            <div>
              <h2 className="text-base font-black text-gray-900">
                Auto-Generate from Architectural Catalog ({catalogRows.length} Buildings)
              </h2>
              <p className="text-xs text-gray-500">
                Build or regenerate question sets automatically from building photos, architects, and metadata.
              </p>
            </div>
          </div>

          <button
            onClick={generateQuizFromDatabase}
            disabled={generating}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center gap-2 shrink-0"
          >
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
            Generate Questions
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5 pt-4 border-t border-blue-200/60">
          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              1. Clue / Question Source
            </label>
            <select
              value={questionCol}
              onChange={e => setQuestionCol(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-black bg-white"
            >
              <option value="building_photo">🖼️ Building Photo</option>
              <option value="architect_photo">👤 Architect's Photo</option>
              <option value="building_name">🏛️ Building Name</option>
              <option value="puzzle_clues">💡 Puzzle Clue / Description</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              2. Target Answer
            </label>
            <select
              value={answerCol}
              onChange={e => setAnswerCol(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-black bg-white"
            >
              <option value="building_name">🏛️ Building Name</option>
              <option value="architect">👤 Architect / Firm</option>
              <option value="opened_year">📅 Opened Year</option>
              <option value="city">📍 City</option>
              <option value="architectural_style">🎨 Architectural Style</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              3. Format
            </label>
            <select
              value={answerFormat}
              onChange={e => setAnswerFormat(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-black bg-white"
            >
              <option value="choose">Choose (4 Options)</option>
              <option value="fill_up">Fill-ups (Full Text)</option>
              <option value="missing_letters">Missing Letters Mask</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              4. Count
            </label>
            <select
              value={questionCount}
              onChange={e => setQuestionCount(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-black bg-white"
            >
              <option value={10}>10 Questions</option>
              <option value={20}>20 Questions</option>
              <option value={45}>45 Questions (Full Catalog)</option>
              <option value={999}>All {catalogRows.length} Projects</option>
            </select>
          </div>
        </div>
      </div>

      {/* STEP 2: QUIZ META DETAILS */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs mb-8">
        <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
          🏷️ Quiz Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Quiz Title *
            </label>
            <input 
              type="text"
              placeholder="e.g. Iconic World Landmarks: Guess the Building"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Quiz Category
            </label>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold border border-gray-300 rounded-xl focus:outline-none focus:border-black bg-white"
            >
              <option value="Guess the Building">Guess the Building</option>
              <option value="Guess the Architect">Guess the Architect</option>
              <option value="Guess the Year">Guess the Year</option>
              <option value="Guess the Location">Guess the Location</option>
              <option value="Guess the Style">Guess the Style</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              URL Slug *
            </label>
            <input 
              type="text"
              placeholder="iconic-world-landmarks-guess-the-building"
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              className="w-full px-3.5 py-2.5 text-xs font-mono border border-gray-300 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Short Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief description explaining what this quiz tests..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-black"
            />
          </div>
        </div>
      </div>

      {/* STEP 3: QUESTIONS LIST & INLINE DIFFICULTY / TEXT EDITOR */}
      <div className="mb-6">
        
        {/* Section Header with Difficulty Breakdown & Filters */}
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs mb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                📝 Questions Management ({questions.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Adjust difficulty (Easy 1 pt, Medium 2 pts, Hard 5 pts), enlarge photos, edit prompts, and reorder questions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={addBlankQuestion}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus size={14} /> Add Question
              </button>
              {questions.length > 0 && (
                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all questions?")) setQuestions([]);
                  }} 
                  className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-xl font-bold transition"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Difficulty Breakdown Badges & Filter Tabs */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-gray-700">Filter View:</span>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setFilterDifficulty("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    filterDifficulty === "all" ? "bg-white text-black shadow-xs font-extrabold" : "text-gray-600 hover:text-black"
                  }`}
                >
                  All ({questions.length})
                </button>
                <button
                  onClick={() => setFilterDifficulty("easy")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    filterDifficulty === "easy" ? "bg-emerald-600 text-white shadow-xs font-extrabold" : "text-gray-600 hover:text-emerald-700"
                  }`}
                >
                  🟢 Easy ({countEasy})
                </button>
                <button
                  onClick={() => setFilterDifficulty("medium")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    filterDifficulty === "medium" ? "bg-amber-500 text-black shadow-xs font-black" : "text-gray-600 hover:text-amber-700"
                  }`}
                >
                  🟡 Medium ({countMedium})
                </button>
                <button
                  onClick={() => setFilterDifficulty("hard")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    filterDifficulty === "hard" ? "bg-red-600 text-white shadow-xs font-extrabold" : "text-gray-600 hover:text-red-700"
                  }`}
                >
                  🔴 Hard ({countHard})
                </button>
              </div>
            </div>

            <div className="text-[11px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
              Scoring: Easy = 1 pt • Medium = 2 pts • Hard = 5 pts
            </div>
          </div>
        </div>

        {/* QUESTIONS LIST */}
        {filteredQuestionsWithOriginalIndices.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-300 p-12 text-center text-gray-400">
            <p className="text-base font-bold text-gray-700 mb-1">
              {questions.length === 0 ? "No questions in this quiz yet" : "No questions match the selected difficulty filter"}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {questions.length === 0 
                ? "Click 'Generate Questions' above or 'Add Question' to start." 
                : "Switch filter to 'All' to view your questions."}
            </p>
            {questions.length === 0 ? (
              <button
                onClick={generateQuizFromDatabase}
                className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Auto-Generate from Catalog
              </button>
            ) : (
              <button
                onClick={() => setFilterDifficulty("all")}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl"
              >
                Show All Questions
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredQuestionsWithOriginalIndices.map(({ q, originalIndex }) => {
              const currentDiff = q.difficulty || "medium";

              return (
                <div 
                  key={originalIndex} 
                  className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-xs transition duration-200 hover:shadow-md ${
                    currentDiff === "easy" ? "border-emerald-200/80 hover:border-emerald-400" :
                    currentDiff === "hard" ? "border-red-200/80 hover:border-red-400" :
                    "border-amber-200/80 hover:border-amber-400"
                  }`}
                >
                  
                  {/* TOP ROW: Question #, Interactive Difficulty Selector & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-black text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                        {originalIndex + 1}
                      </span>

                      {/* 🟢🟡🔴 MANUAL DIFFICULTY SELECTOR BUTTONS */}
                      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => updateQuestionDifficulty(originalIndex, "easy")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            currentDiff === "easy"
                              ? "bg-emerald-600 text-white shadow-xs font-extrabold"
                              : "text-gray-600 hover:text-black hover:bg-white/60"
                          }`}
                          title="Set as Easy (1 point for player)"
                        >
                          <span>🟢</span> Easy (1 pt)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateQuestionDifficulty(originalIndex, "medium")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            currentDiff === "medium"
                              ? "bg-amber-500 text-black shadow-xs font-black"
                              : "text-gray-600 hover:text-black hover:bg-white/60"
                          }`}
                          title="Set as Medium (2 points for player)"
                        >
                          <span>🟡</span> Medium (2 pts)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateQuestionDifficulty(originalIndex, "hard")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            currentDiff === "hard"
                              ? "bg-red-600 text-white shadow-xs font-extrabold"
                              : "text-gray-600 hover:text-black hover:bg-white/60"
                          }`}
                          title="Set as Hard (5 points for player)"
                        >
                          <span>🔴</span> Hard (5 pts)
                        </button>
                      </div>
                    </div>

                    {/* Order & Remove Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => moveQuestionUp(originalIndex)}
                        disabled={originalIndex === 0}
                        className="p-1.5 text-gray-500 hover:text-black disabled:opacity-20 hover:bg-gray-100 rounded-lg transition"
                        title="Move Question Up"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestionDown(originalIndex)}
                        disabled={originalIndex === questions.length - 1}
                        className="p-1.5 text-gray-500 hover:text-black disabled:opacity-20 hover:bg-gray-100 rounded-lg transition"
                        title="Move Question Down"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(originalIndex)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition ml-2"
                        title="Delete Question"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* BODY: IMAGE PREVIEW (LARGE) & EDITABLE FIELDS */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    
                    {/* LEFT (4 cols): LARGE CLUE IMAGE WITH ENLARGE CLICK */}
                    <div className="md:col-span-4 flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                        <span>Clue Photograph</span>
                        {q.media_url && (
                          <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5">
                            <ZoomIn size={11} /> Click to Enlarge
                          </span>
                        )}
                      </label>

                      {q.media_url ? (
                        <div 
                          onClick={() => setZoomImageUrl({ url: q.media_url, title: q.correct_answer || "Clue Photo" })}
                          className="relative h-44 sm:h-48 w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 group cursor-pointer shadow-xs hover:border-black transition"
                        >
                          <img 
                            referrerPolicy="no-referrer"
                            src={q.media_url} 
                            alt="Clue preview" 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[2px]">
                            <ZoomIn size={18} /> View Full Photo
                          </div>
                        </div>
                      ) : (
                        <div className="h-44 w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                          <ImageIcon size={28} className="mb-1 text-gray-300" />
                          <span className="text-xs font-medium">No Image URL Set</span>
                        </div>
                      )}

                      {/* Image URL input */}
                      <input 
                        type="text"
                        placeholder="https://ik.imagekit.io/..."
                        value={q.media_url}
                        onChange={e => updateQuestion(originalIndex, { media_url: e.target.value })}
                        className="w-full px-3 py-1.5 text-[11px] font-mono border border-gray-300 rounded-xl focus:outline-none focus:border-black bg-gray-50/50"
                        title="ImageKit or image URL"
                      />
                    </div>

                    {/* RIGHT (8 cols): EDITABLE PROMPT & OPTIONS */}
                    <div className="md:col-span-8 flex flex-col gap-4">
                      
                      {/* Question Prompt */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Question Prompt Text:
                        </label>
                        <input 
                          type="text"
                          value={q.question_text}
                          onChange={e => updateQuestion(originalIndex, { question_text: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm font-bold text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:border-black bg-white"
                          placeholder="e.g. Identify this iconic architectural landmark from the photo:"
                        />
                      </div>

                      {/* Multiple-Choice Options Editor */}
                      {q.question_type === "choose" && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                              Options (Click checkmark to set Correct Answer):
                            </label>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              ✓ Target: {q.correct_answer || "(None)"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {(q.options || []).map((opt, optIdx) => {
                              const isCorrect = opt === q.correct_answer;

                              return (
                                <div 
                                  key={optIdx} 
                                  className={`flex items-center gap-2 p-1.5 pr-2 rounded-xl border transition ${
                                    isCorrect 
                                      ? "bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-400" 
                                      : "bg-gray-50/80 border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => setCorrectOption(originalIndex, opt)}
                                    className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition shrink-0 ${
                                      isCorrect 
                                        ? "bg-emerald-600 text-white shadow-xs" 
                                        : "bg-white border border-gray-300 text-gray-400 hover:text-black"
                                    }`}
                                    title={isCorrect ? "Correct Answer" : "Click to set as Correct Answer"}
                                  >
                                    <Check size={14} />
                                  </button>

                                  <input 
                                    type="text"
                                    value={opt}
                                    onChange={e => updateOptionText(originalIndex, optIdx, e.target.value)}
                                    className={`flex-1 px-2.5 py-1 text-xs font-bold bg-transparent focus:outline-none ${
                                      isCorrect ? "text-emerald-950 font-black" : "text-gray-800"
                                    }`}
                                    placeholder={`Option ${optIdx + 1}`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Missing Letters / Fill Up Target */}
                      {q.question_type !== "choose" && (
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                            Correct Answer Target:
                          </label>
                          <input 
                            type="text"
                            value={q.correct_answer}
                            onChange={e => updateQuestion(originalIndex, { correct_answer: e.target.value })}
                            className="w-full px-4 py-2 text-xs font-bold border border-emerald-300 bg-emerald-50/50 text-emerald-950 rounded-xl focus:outline-none focus:border-black"
                          />
                        </div>
                      )}

                      {/* Explanation Trivia Clue */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          💡 Architectural Trivia / Facts (Revealed in Practice Mode & Review):
                        </label>
                        <textarea
                          rows={2}
                          value={q.explanation_clue || ""}
                          onChange={e => updateQuestion(originalIndex, { explanation_clue: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs text-gray-700 border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-gray-50/50"
                          placeholder="Architectural style, location trivia, design significance..."
                        />
                      </div>

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Save Action Footer */}
      {questions.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-xs">
          <div>
            <p className="text-sm font-bold text-gray-900">
              {questions.length} Questions Ready
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              🟢 {countEasy} Easy • 🟡 {countMedium} Medium • 🔴 {countHard} Hard
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleSaveQuiz(false)}
              disabled={saving}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition border border-gray-300"
            >
              Save as Draft
            </button>
            <button 
              onClick={() => handleSaveQuiz(true)}
              disabled={saving}
              className="px-8 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-extrabold rounded-xl transition shadow-md flex items-center gap-2"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Publish Quiz Live
            </button>
          </div>
        </div>
      )}

      {/* Floating Status Notification Toast */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold text-white transition-all transform animate-in fade-in slide-in-from-bottom-3 ${
          toastMsg.type === "success" ? "bg-emerald-600" : "bg-red-600"
        }`}>
          <CheckCircle2 size={16} />
          <span>{toastMsg.text}</span>
        </div>
      )}
    </div>
  );
}
