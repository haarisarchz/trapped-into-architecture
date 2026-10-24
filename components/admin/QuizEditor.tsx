"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Save, Sparkles, UploadCloud, 
  Loader2, CheckCircle2, ArrowLeft, Image as ImageIcon, HelpCircle, Eye, RefreshCw
} from "lucide-react";

interface Question {
  id?: string;
  order_index: number;
  question_type: "choose" | "fill_up";
  question_text: string;
  media_type: "none" | "image";
  media_url: string;
  options: string[];
  correct_answer: string;
  accepted_aliases: string[];
  explanation_clue: string;
}

interface QuizEditorProps {
  quizId?: string; // If editing an existing quiz
  onBack?: () => void;
}

export default function QuizEditor({ quizId, onBack }: QuizEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!quizId);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Quiz Meta
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Architects");
  const [coverImage, setCoverImage] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Questions
  const [questions, setQuestions] = useState<Question[]>([
    {
      order_index: 1,
      question_type: "choose",
      question_text: "",
      media_type: "none",
      media_url: "",
      options: ["", "", "", ""],
      correct_answer: "",
      accepted_aliases: [],
      explanation_clue: ""
    }
  ]);

  // Catalog Drawer State
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogRows, setCatalogRows] = useState<any[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");

  useEffect(() => {
    if (quizId) {
      loadQuizData();
    }
  }, [quizId]);

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
      setCategory(qData.category || "Architects");
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
          options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
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

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        order_index: questions.length + 1,
        question_type: "choose",
        question_text: "",
        media_type: "none",
        media_url: "",
        options: ["", "", "", ""],
        correct_answer: "",
        accepted_aliases: [],
        explanation_clue: ""
      }
    ]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) {
      alert("A quiz must have at least one question.");
      return;
    }
    const updated = questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order_index: i + 1 }));
    setQuestions(updated);
  };

  const moveQuestion = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const copy = [...questions];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setQuestions(copy.map((q, i) => ({ ...q, order_index: i + 1 })));
  };

  const updateQuestion = (idx: number, updates: Partial<Question>) => {
    const copy = [...questions];
    copy[idx] = { ...copy[idx], ...updates };
    setQuestions(copy);
  };

  const updateOption = (qIdx: number, optIdx: number, val: string) => {
    const copy = [...questions];
    const opts = [...copy[qIdx].options];
    opts[optIdx] = val;
    copy[qIdx].options = opts;
    setQuestions(copy);
  };

  // Image upload via /api/upload (ImageKit)
  const handleImageUpload = async (file: File, callback: (url: string) => void) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "/quiz-media");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image upload failed");
      const data = await res.json();
      if (data.url) callback(data.url);
    } catch (err: any) {
      alert("Error uploading image: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Open Catalog Importer
  const openCatalogImporter = async () => {
    setShowCatalogModal(true);
    if (catalogRows.length === 0) {
      setCatalogLoading(true);
      const { data, error } = await supabase.from("architecture_catalog").select("*").limit(100);
      if (data) setCatalogRows(data);
      setCatalogLoading(false);
    }
  };

  // 1-Click Import from Architecture Catalog
  const importFromCatalog = (row: any, presetType: "architect" | "building") => {
    const d = row.data || {};
    const buildingName = d.building_name || "Historic Building";
    const architect = d.architect || "Master Architect";
    const photo = d.building_photo || d.architect_photo || "";
    const city = d.city ? ` in ${d.city}` : "";

    // Gather 3 other random architects or building names from other catalog rows for multiple choice options
    let otherOptions: string[] = [];
    if (presetType === "architect") {
      otherOptions = catalogRows
        .map(r => r.data?.architect)
        .filter(a => a && a !== architect)
        .slice(0, 3);
      if (otherOptions.length < 3) otherOptions.push("Charles Correa", "B.V. Doshi", "Raj Rewal");
    } else {
      otherOptions = catalogRows
        .map(r => r.data?.building_name)
        .filter(b => b && b !== buildingName)
        .slice(0, 3);
      if (otherOptions.length < 3) otherOptions.push("Lotus Temple", "IIM Ahmedabad", "Matrimandir");
    }

    const allOpts = presetType === "architect" 
      ? [architect, ...otherOptions.slice(0, 3)].sort(() => Math.random() - 0.5)
      : [buildingName, ...otherOptions.slice(0, 3)].sort(() => Math.random() - 0.5);

    const newQ: Question = {
      order_index: questions.length + 1,
      question_type: "choose",
      question_text: presetType === "architect"
        ? `Who is the architect of ${buildingName}${city}?`
        : `Identify this iconic project designed by ${architect}:`,
      media_type: photo ? "image" : "none",
      media_url: photo,
      options: allOpts,
      correct_answer: presetType === "architect" ? architect : buildingName,
      accepted_aliases: presetType === "architect" ? [architect.split(" ").pop() || architect, architect] : [buildingName],
      explanation_clue: d.puzzle_clues || (d.opened_year ? `Opened in ${d.opened_year} in ${d.city || "India"}.` : "")
    };

    setQuestions([...questions, newQ]);
    setShowCatalogModal(false);
    setToastMsg({ text: `Imported "${buildingName}" into questions!`, type: "success" });
    setTimeout(() => setToastMsg(null), 3000);
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

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        alert(`Question #${i + 1} has no question text.`);
        return;
      }
      if (!q.correct_answer.trim()) {
        alert(`Question #${i + 1} has no correct answer set.`);
        return;
      }
      if (q.question_type === "choose" && (!q.options || q.options.some(o => !o.trim()))) {
        alert(`Question #${i + 1} is Multiple Choice and needs all 4 options filled out.`);
        return;
      }
    }

    setSaving(true);
    try {
      const pub = publishState !== undefined ? publishState : isPublished;
      const quizPayload = {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        category,
        cover_image: coverImage.trim(),
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

      // Sync Questions: delete old questions and insert fresh set
      if (activeQuizId) {
        await supabase.from("quiz_questions").delete().eq("quiz_id", activeQuizId);

        const questionsToInsert = questions.map((q, idx) => ({
          quiz_id: activeQuizId,
          order_index: idx + 1,
          question_type: q.question_type,
          question_text: q.question_text.trim(),
          media_type: q.media_url ? "image" : "none",
          media_url: q.media_url.trim(),
          options: q.options.map(o => o.trim()),
          correct_answer: q.correct_answer.trim(),
          accepted_aliases: q.accepted_aliases,
          explanation_clue: q.explanation_clue.trim()
        }));

        const { error: qInsertErr } = await supabase
          .from("quiz_questions")
          .insert(questionsToInsert);
        if (qInsertErr) throw qInsertErr;
      }

      setToastMsg({ text: `Quiz saved successfully! (${pub ? "Published" : "Saved as Draft"})`, type: "success" });
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

  const filteredCatalog = catalogRows.filter(r => {
    const text = `${r.data?.building_name || ""} ${r.data?.architect || ""} ${r.data?.city || ""}`.toLowerCase();
    return text.includes(catalogSearch.toLowerCase());
  });

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Top Action Bar */}
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

      {/* QUIZ META CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          ⚙️ 1. Quiz Settings & Meta
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Quiz Title *
            </label>
            <input 
              type="text"
              placeholder="e.g. Master Architects: Can you identify India's iconic landmarks?"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              URL Slug *
            </label>
            <div className="flex items-center">
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-l-lg border border-r-0 border-gray-300">
                /quizzes/
              </span>
              <input 
                type="text"
                placeholder="guess-the-architect"
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-r-lg focus:outline-none focus:border-black font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
            >
              <option value="Architects">Architects & Firms</option>
              <option value="Contemporary">Contemporary Architecture</option>
              <option value="History">Heritage & History</option>
              <option value="Pritzker">Pritzker Prize Laureates</option>
              <option value="Software">Software & CAD Shortcuts</option>
              <option value="Exam Prep">GATE / NATA Prep</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Description / Instructions
            </label>
            <textarea 
              rows={2}
              placeholder="Brief description shown to players before starting the quiz..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Cover Image URL (Optional)
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="text"
                placeholder="https://ik.imagekit.io/... or upload"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
              <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg cursor-pointer transition shrink-0 flex items-center gap-1 border border-gray-300">
                <UploadCloud size={14} /> Upload
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], url => setCoverImage(url))}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* QUESTION BUILDER HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            📝 2. Questions ({questions.length})
          </h2>
          <p className="text-xs text-gray-500">Create multiple choice or fill-in-the-blank questions.</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={openCatalogImporter}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 text-xs font-bold rounded-lg transition"
            title="Import photo and details directly from Architecture Catalog"
          >
            <Sparkles size={14} className="text-blue-600" /> ⚡ Quick Import from Catalog
          </button>
          <button 
            onClick={addQuestion}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition shadow-xs"
          >
            <Plus size={14} /> Add Question
          </button>
        </div>
      </div>

      {/* QUESTIONS LIST */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs relative group">
            {/* Question Top Header */}
            <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                  {qIdx + 1}
                </span>

                {/* Question Type Selector */}
                <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                  <button 
                    onClick={() => updateQuestion(qIdx, { question_type: "choose" })}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                      q.question_type === "choose" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    Choose (Options)
                  </button>
                  <button 
                    onClick={() => updateQuestion(qIdx, { question_type: "fill_up" })}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                      q.question_type === "fill_up" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    Fill-up (Text Typing)
                  </button>
                </div>
              </div>

              {/* Move up / down / delete */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => moveQuestion(qIdx, "up")} 
                  disabled={qIdx === 0}
                  className="p-1 text-gray-400 hover:text-black disabled:opacity-30 rounded hover:bg-gray-100"
                  title="Move Up"
                >
                  <ArrowUp size={14} />
                </button>
                <button 
                  onClick={() => moveQuestion(qIdx, "down")} 
                  disabled={qIdx === questions.length - 1}
                  className="p-1 text-gray-400 hover:text-black disabled:opacity-30 rounded hover:bg-gray-100"
                  title="Move Down"
                >
                  <ArrowDown size={14} />
                </button>
                <button 
                  onClick={() => removeQuestion(qIdx)} 
                  className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50 ml-1"
                  title="Delete Question"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Question Prompt *
              </label>
              <input 
                type="text"
                placeholder="e.g. Which architect designed this building?"
                value={q.question_text}
                onChange={e => updateQuestion(qIdx, { question_text: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium"
              />
            </div>

            {/* Media Attachment (Photo) */}
            <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <ImageIcon size={13} /> Photo Attachment (Optional)
                </label>
                {q.media_url && (
                  <button 
                    onClick={() => updateQuestion(qIdx, { media_url: "" })}
                    className="text-[11px] text-red-600 hover:underline"
                  >
                    Remove Image
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {q.media_url ? (
                  <img src={q.media_url} alt="question preview" className="w-12 h-12 object-cover rounded-lg border border-gray-300 shrink-0 shadow-xs" />
                ) : null}
                <input 
                  type="text"
                  placeholder="Paste image URL or click Upload..."
                  value={q.media_url}
                  onChange={e => updateQuestion(qIdx, { media_url: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
                />
                <label className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-lg cursor-pointer transition shrink-0 flex items-center gap-1 border border-gray-300 shadow-xs">
                  <UploadCloud size={13} /> Upload
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], url => updateQuestion(qIdx, { media_url: url }))}
                  />
                </label>
              </div>
            </div>

            {/* MULTIPLE CHOICE OPTIONS */}
            {q.question_type === "choose" ? (
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Options (Select radio for correct answer) *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = q.correct_answer === opt && opt.trim() !== "";
                    return (
                      <div 
                        key={optIdx} 
                        className={`flex items-center gap-2 p-2 rounded-xl border transition ${
                          isCorrect ? "bg-emerald-50/60 border-emerald-500" : "bg-white border-gray-200"
                        }`}
                      >
                        <input 
                          type="radio" 
                          name={`correct-${qIdx}`}
                          checked={isCorrect}
                          onChange={() => updateQuestion(qIdx, { correct_answer: opt })}
                          className="accent-emerald-600 w-4 h-4 cursor-pointer"
                          title="Mark as correct answer"
                        />
                        <input 
                          type="text"
                          placeholder={`Option ${optIdx + 1}...`}
                          value={opt}
                          onChange={e => {
                            const val = e.target.value;
                            updateOption(qIdx, optIdx, val);
                            if (isCorrect) updateQuestion(qIdx, { correct_answer: val });
                          }}
                          className="w-full px-2 py-1 text-xs border-0 focus:outline-none bg-transparent font-medium"
                        />
                        {isCorrect && (
                          <span className="text-[10px] font-bold text-emerald-700 uppercase px-1.5 py-0.5 bg-emerald-100 rounded shrink-0">
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* FILL-UP TEXT TYPING */
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Correct Answer *
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Charles Correa"
                    value={q.correct_answer}
                    onChange={e => updateQuestion(qIdx, { correct_answer: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black font-bold text-emerald-800 bg-emerald-50/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Accepted Alternate Spellings (Comma separated)
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Correa, C Correa, Charles"
                    value={q.accepted_aliases.join(", ")}
                    onChange={e => updateQuestion(qIdx, { 
                      accepted_aliases: e.target.value.split(",").map(s => s.trim()).filter(Boolean) 
                    })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            )}

            {/* EXPLANATION / TRIVIA CLUE */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <HelpCircle size={12} /> Post-Answer Trivia / Explanation (Optional)
              </label>
              <input 
                type="text"
                placeholder="e.g. Kanchanjunga is a 28-storey residential tower in Mumbai, completed in 1983."
                value={q.explanation_clue}
                onChange={e => updateQuestion(qIdx, { explanation_clue: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black text-gray-600 bg-gray-50/50"
              />
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM BUTTON */}
      <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between">
        <button 
          onClick={addQuestion}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold rounded-xl transition border border-gray-300"
        >
          <Plus size={14} /> Add Another Question
        </button>

        <button 
          onClick={() => handleSaveQuiz(true)}
          disabled={saving}
          className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-2"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save & Publish Quiz
        </button>
      </div>

      {/* CATALOG IMPORTER MODAL */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-blue-600" /> Quick Import from Architecture Catalog
                </h3>
                <p className="text-xs text-gray-500">Pick any project to automatically generate a visual question.</p>
              </div>
              <button onClick={() => setShowCatalogModal(false)} className="text-gray-400 hover:text-black font-bold p-1">
                ✕
              </button>
            </div>

            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <input 
                type="text" 
                placeholder="Search catalog by building, architect, or city..."
                value={catalogSearch}
                onChange={e => setCatalogSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {catalogLoading ? (
                <div className="p-8 text-center text-gray-400 flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" /> Loading Catalog Projects...
                </div>
              ) : filteredCatalog.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No projects found.
                </div>
              ) : (
                filteredCatalog.map((row) => {
                  const d = row.data || {};
                  return (
                    <div 
                      key={row.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-black hover:bg-gray-50 transition gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {d.building_photo ? (
                          <img src={d.building_photo} alt="thumb" className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-xs shrink-0">
                            🏛️
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{d.building_name || "Untitled Building"}</p>
                          <p className="text-[11px] text-gray-500 truncate">Architect: {d.architect || "Unknown"} • {d.city || ""}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button 
                          onClick={() => importFromCatalog(row, "architect")}
                          className="px-2.5 py-1.5 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition"
                        >
                          + "Guess Architect"
                        </button>
                        <button 
                          onClick={() => importFromCatalog(row, "building")}
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition border border-gray-300"
                        >
                          + "Guess Building"
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
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
