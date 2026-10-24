"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Save, Sparkles, UploadCloud, 
  Loader2, CheckCircle2, ArrowLeft, Image as ImageIcon, HelpCircle, Eye, RefreshCw, Wand2
} from "lucide-react";

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

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);

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
        setQuestions(quesData.map(q => ({
          ...q,
          question_type: (q.question_type as any) || "choose",
          options: Array.isArray(q.options) ? q.options : [],
          accepted_aliases: Array.isArray(q.accepted_aliases) ? q.accepted_aliases : []
        })));
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

  // ⚡ 1-CLICK GENERATE QUIZ FROM ARCHITECTURE CATALOG
  const generateQuizFromDatabase = () => {
    if (catalogRows.length === 0) {
      alert("No rows found in architecture catalog. Please ensure rows are loaded.");
      return;
    }

    setGenerating(true);

    // Filter valid rows having the question and answer columns
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

    // Shuffle rows randomly
    const shuffled = [...validRows].sort(() => Math.random() - 0.5);
    const selectedRows = shuffled.slice(0, questionCount === 999 ? shuffled.length : questionCount);

    // Get all unique answer values for distractors
    const allAnswerValues = Array.from(new Set(catalogRows.map(r => r.data?.[answerCol]).filter(Boolean)));

    const generatedQuestions: Question[] = selectedRows.map((row, idx) => {
      const d = row.data || {};
      const targetAnswer = String(d[answerCol] || "").trim();

      // Determine Question Prompt Text
      let promptText = "";
      let mediaUrl = "";
      let mediaType: "none" | "image" = "none";

      if (questionCol === "building_photo" || questionCol === "architect_photo") {
        mediaUrl = d[questionCol] || "";
        mediaType = mediaUrl ? "image" : "none";
        
        if (answerCol === "building_name") {
          promptText = "Identify this iconic building from the photo:";
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

      // Generate Options for "choose" mode
      let optionsList: string[] = [];
      if (answerFormat === "choose") {
        const distractors = allAnswerValues
          .filter(v => v !== targetAnswer)
          .sort(() => Math.random() - 0.5)
          .slice(0, optionsCount - 1);
        optionsList = [targetAnswer, ...distractors].sort(() => Math.random() - 0.5);
      }

      // Aliases for fill-ups
      const aliases = [targetAnswer];
      if (answerCol === "architect" && targetAnswer.includes(" ")) {
        const lastName = targetAnswer.split(" ").pop();
        if (lastName) aliases.push(lastName);
      }

      // Explanation Trivia
      const explanation = d.puzzle_clues || 
        `${d.building_name || "Project"} was designed by ${d.architect || "Master Architect"} in ${d.city || "India"} (${d.opened_year || ""}).`;

      return {
        order_index: idx + 1,
        question_type: answerFormat,
        question_text: promptText,
        media_type: mediaType,
        media_url: mediaUrl,
        options: optionsList,
        correct_answer: targetAnswer,
        accepted_aliases: aliases,
        explanation_clue: explanation
      };
    });

    setQuestions(generatedQuestions);

    // Auto-suggest Title and Category if empty
    if (!title.trim()) {
      let suggestedTitle = "";
      let cat = "Guess the Building";
      if (answerCol === "architect") {
        suggestedTitle = "Guess the Architect from the Building Photo";
        cat = "Guess the Architect";
      } else if (answerCol === "building_name") {
        suggestedTitle = "Guess the Building: Can you identify these structures?";
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
    setToastMsg({ text: `Generated ${generatedQuestions.length} questions from your database!`, type: "success" });
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

      // Sync Questions
      if (activeQuizId) {
        await supabase.from("quiz_questions").delete().eq("quiz_id", activeQuizId);

        const questionsToInsert = questions.map((q, idx) => ({
          quiz_id: activeQuizId,
          order_index: idx + 1,
          question_type: q.question_type,
          question_text: q.question_text.trim(),
          media_type: q.media_url ? "image" : "none",
          media_url: q.media_url.trim(),
          options: q.options || [],
          correct_answer: q.correct_answer.trim(),
          accepted_aliases: q.accepted_aliases || [],
          explanation_clue: (q.explanation_clue || "").trim()
        }));

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

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 font-bold flex flex-col items-center gap-2">
        <Loader2 className="animate-spin text-black" size={24} />
        <span>Loading Quiz Data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <button 
          onClick={onBack ? onBack : () => router.push("/admin/quizzes")}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black transition"
        >
          <ArrowLeft size={16} /> Back to Quizzes
        </button>

        <div className="flex items-center gap-2">
          {quizId && slug && (
            <a 
              href={`/quizzes/${slug}`} 
              target="_blank" 
              rel="noreferrer"
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition flex items-center gap-1 border border-gray-300"
            >
              <Eye size={13} /> Test Quiz
            </a>
          )}
          <button 
            onClick={() => handleSaveQuiz(false)}
            disabled={saving}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition border border-gray-300 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button 
            onClick={() => handleSaveQuiz(true)}
            disabled={saving}
            className="px-5 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? "Saving..." : "Publish Quiz"}
          </button>
        </div>
      </div>

      {/* ⚡ STEP 1: 1-CLICK COLUMN-BASED QUIZ GENERATOR (Primary Feature) */}
      <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-white rounded-3xl border-2 border-blue-200 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            ⚡
          </span>
          <div>
            <h2 className="text-lg font-black text-gray-900">
              Auto-Generate Quiz from Database ({catalogRows.length} Projects Available)
            </h2>
            <p className="text-xs text-gray-500">
              Select what the question should show and what the answer should be. The system will build all questions automatically.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Question Clue Column */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              1. What is the Question?
            </label>
            <select
              value={questionCol}
              onChange={e => setQuestionCol(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-black bg-white shadow-xs"
            >
              <option value="building_photo">🖼️ Building Photo</option>
              <option value="architect_photo">👤 Architect's Photo</option>
              <option value="building_name">🏛️ Building Name</option>
              <option value="puzzle_clues">💡 Puzzle Clue / Description</option>
            </select>
          </div>

          {/* Answer Column */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              2. What is the Answer?
            </label>
            <select
              value={answerCol}
              onChange={e => setAnswerCol(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-black bg-white shadow-xs"
            >
              <option value="building_name">🏛️ Building Name</option>
              <option value="architect">👤 Architect / Firm</option>
              <option value="opened_year">📅 Opened Year</option>
              <option value="city">📍 City</option>
              <option value="architectural_style">🎨 Architectural Style</option>
            </select>
          </div>

          {/* Answer Type Format */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              3. Answer Format
            </label>
            <select
              value={answerFormat}
              onChange={e => setAnswerFormat(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-black bg-white shadow-xs"
            >
              <option value="choose">Choose (4 Options)</option>
              <option value="fill_up">Fill-ups (Full Text)</option>
              <option value="missing_letters">Fill Missing Letters (C _ A R _ E S)</option>
            </select>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              4. How Many Questions?
            </label>
            <select
              value={questionCount}
              onChange={e => setQuestionCount(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-black bg-white shadow-xs"
            >
              <option value={5}>5 Questions (Quick Test)</option>
              <option value={10}>10 Questions (Standard)</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions (Challenger)</option>
              <option value={999}>All {catalogRows.length} Projects</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-blue-200/60">
          <p className="text-[11px] text-gray-500 font-medium">
            💡 Wrong options will be automatically sampled from other database rows to make options challenging.
          </p>

          <button
            onClick={generateQuizFromDatabase}
            disabled={generating}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center gap-2"
          >
            {generating ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
            ⚡ Generate Quiz from Database
          </button>
        </div>
      </div>

      {/* STEP 2: QUIZ TITLE & INFO */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs mb-8">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
          🏷️ Quiz Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
              Quiz Title *
            </label>
            <input 
              type="text"
              placeholder="e.g. Guess the Building from the Photo"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
              Quiz Type / Category
            </label>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
            >
              <option value="Guess the Building">Guess the Building</option>
              <option value="Guess the Architect">Guess the Architect</option>
              <option value="Guess the Year">Guess the Year</option>
              <option value="Guess the Location">Guess the Location</option>
              <option value="Guess the Style">Guess the Style</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
              URL Slug *
            </label>
            <input 
              type="text"
              placeholder="guess-the-building"
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-mono"
            />
          </div>
        </div>
      </div>

      {/* STEP 3: PREVIEW & GENERATED QUESTIONS */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          📝 Generated Questions ({questions.length})
        </h3>
        {questions.length > 0 && (
          <button 
            onClick={() => setQuestions([])} 
            className="text-xs text-red-600 hover:underline font-bold"
          >
            Clear Questions
          </button>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center text-gray-400">
          <p className="text-sm font-bold text-gray-700 mb-1">No questions generated yet</p>
          <p className="text-xs text-gray-400">
            Click <strong>"⚡ Generate Quiz from Database"</strong> above to auto-create questions instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                {q.media_url ? (
                  <img src={q.media_url} alt="clue" className="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0 shadow-xs" />
                ) : null}

                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {q.question_text}
                  </p>
                  
                  {q.question_type === "choose" ? (
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {q.options.map((opt, oIdx) => (
                        <span 
                          key={oIdx} 
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            opt === q.correct_answer 
                              ? "bg-emerald-100 text-emerald-800 font-bold border border-emerald-300" 
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  ) : q.question_type === "missing_letters" ? (
                    <div className="mt-1">
                      <span className="text-[11px] font-mono font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                        Mask: {generateMissingLettersMask(q.correct_answer)}
                      </span>
                      <span className="text-[10px] text-gray-500 ml-2">
                        (Answer: {q.correct_answer})
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                      Target: {q.correct_answer}
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                  {q.question_type}
                </span>
                <button
                  onClick={() => removeQuestion(idx)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Remove this question"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Action Footer */}
      {questions.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {questions.length} questions ready. Click save to publish.
          </p>

          <button 
            onClick={() => handleSaveQuiz(true)}
            disabled={saving}
            className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Publish Quiz ({questions.length} Questions)
          </button>
        </div>
      )}

      {/* Floating Status Notification Toast */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold text-white transition-all transform animate-in fade-in slide-in-from-bottom-3 ${
          toastMsg.type === "success" ? "bg-emerald-600" : "bg-red-600"
        }`}>
          <CheckCircle2 size={16} />
          <span>{toastMsg.text}</span>
        </div>
      )}
    </div>
  );
}
