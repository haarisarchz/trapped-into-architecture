"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Save, Sparkles, UploadCloud, 
  Loader2, CheckCircle2, ArrowLeft, Image as ImageIcon, HelpCircle, Eye, RefreshCw, Wand2,
  ZoomIn, X, Check, Filter, AlertCircle, CheckSquare, Square, LayoutList, Grid, Layers,
  ChevronDown, ChevronUp, Search
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
  
  // Staged difficulty changes & retained items in active filter
  const [pendingDiff, setPendingDiff] = useState<Record<number, QuestionDifficulty>>({});
  const [retainedInFilter, setRetainedInFilter] = useState<Record<number, boolean>>({});

  // Bulk Selection & View Mode
  const [selectedIndices, setSelectedIndices] = useState<Record<number, boolean>>({});
  const [questionViewMode, setQuestionViewMode] = useState<"detailed" | "compact">("detailed");
  const [showGeneratorAccordion, setShowGeneratorAccordion] = useState<boolean>(false);
  const [syncingDatabase, setSyncingDatabase] = useState<boolean>(false);
  const [questionSearchQuery, setQuestionSearchQuery] = useState<string>("");

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

  // Update difficulty for a specific question immediately
  const updateQuestionDifficulty = (index: number, diff: QuestionDifficulty) => {
    updateQuestion(index, { difficulty: diff });
  };

  // Stage pending difficulty selection (requires tick mark confirmation)
  const handleSelectDifficulty = (originalIndex: number, diff: QuestionDifficulty) => {
    const current = questions[originalIndex]?.difficulty || "medium";
    if (current === diff) {
      setPendingDiff(prev => {
        const next = { ...prev };
        delete next[originalIndex];
        return next;
      });
      return;
    }
    setPendingDiff(prev => ({ ...prev, [originalIndex]: diff }));
  };

  // Confirm and apply staged difficulty change via tick mark
  const confirmDifficultyChange = (originalIndex: number) => {
    const targetDiff = pendingDiff[originalIndex];
    if (!targetDiff) return;

    updateQuestion(originalIndex, { difficulty: targetDiff });
    setRetainedInFilter(prev => ({ ...prev, [originalIndex]: true }));
    setPendingDiff(prev => {
      const next = { ...prev };
      delete next[originalIndex];
      return next;
    });
    setToastMsg({ text: `Question moved to ${targetDiff.toUpperCase()} (${targetDiff === "easy" ? "100" : targetDiff === "medium" ? "200" : "500"} pts)!`, type: "success" });
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Cancel staged difficulty change
  const cancelDifficultyChange = (originalIndex: number) => {
    setPendingDiff(prev => {
      const next = { ...prev };
      delete next[originalIndex];
      return next;
    });
  };

  // ⚡ Apply all staged category changes across all questions at once (Common Apply)
  const applyAllStagedChanges = () => {
    const pendingKeys = Object.keys(pendingDiff).map(k => parseInt(k, 10));
    if (pendingKeys.length === 0) return;

    setQuestions(prev => prev.map((q, idx) => {
      const targetDiff = pendingDiff[idx];
      if (!targetDiff) return q;
      const cleanAliases = (q.accepted_aliases || []).filter(a => typeof a === "string" && !a.startsWith("diff:"));
      return {
        ...q,
        difficulty: targetDiff,
        accepted_aliases: [`diff:${targetDiff}`, ...cleanAliases]
      };
    }));

    // Retain questions in active filter so they do not disappear unexpectedly
    setRetainedInFilter(prev => {
      const updated = { ...prev };
      pendingKeys.forEach(k => { updated[k] = true; });
      return updated;
    });

    const count = pendingKeys.length;
    setPendingDiff({});
    setToastMsg({ text: `✓ Applied category changes to ${count} question(s)!`, type: "success" });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filter change helper: switches filter and clears retained items
  const handleFilterChange = (newFilter: "all" | QuestionDifficulty) => {
    setFilterDifficulty(newFilter);
    setRetainedInFilter({});
    setPendingDiff({});
  };

  // Bulk Selection Handlers
  const handleToggleSelectQuestion = (idx: number) => {
    setSelectedIndices(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSelectAllVisible = (visibleIndices: number[]) => {
    const allSelected = visibleIndices.length > 0 && visibleIndices.every(idx => selectedIndices[idx]);
    const updated = { ...selectedIndices };
    visibleIndices.forEach(idx => {
      updated[idx] = !allSelected;
    });
    setSelectedIndices(updated);
  };

  const handleDeselectAll = () => {
    setSelectedIndices({});
  };

  const handleBulkSetCategory = async (targetCategory: QuestionDifficulty) => {
    const indicesToUpdate = Object.keys(selectedIndices)
      .map(k => parseInt(k, 10))
      .filter(k => selectedIndices[k]);

    if (indicesToUpdate.length === 0) return;

    // Update in React state
    setQuestions(prev => prev.map((q, idx) => {
      if (!selectedIndices[idx]) return q;
      const cleanAliases = (q.accepted_aliases || []).filter(a => typeof a === "string" && !a.startsWith("diff:"));
      return {
        ...q,
        difficulty: targetCategory,
        accepted_aliases: [`diff:${targetCategory}`, ...cleanAliases]
      };
    }));

    // If quiz is saved in database, sync to Supabase right away
    if (quizId) {
      try {
        const updates = indicesToUpdate.map(async (origIdx) => {
          const q = questions[origIdx];
          if (!q?.id) return;
          const cleanAliases = (q.accepted_aliases || []).filter(a => typeof a === "string" && !a.startsWith("diff:"));
          await supabase
            .from("quiz_questions")
            .update({
              accepted_aliases: [`diff:${targetCategory}`, ...cleanAliases]
            })
            .eq("id", q.id);
        });
        await Promise.all(updates);
      } catch (err) {
        console.warn("Bulk update db sync note:", err);
      }
    }

    setToastMsg({ 
      text: `Updated ${indicesToUpdate.length} questions to ${targetCategory === "master" ? "Architecture Master (300 pts)" : "Popular (100 pts)"}!`, 
      type: "success" 
    });
    setSelectedIndices({});
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

  // 🔄 Update & Synchronize questions from Architectural Catalog Database
  const handleUpdateFromCatalog = async () => {
    setSyncingDatabase(true);
    try {
      // 1. Fetch latest catalog rows
      const { data: latestCatalog, error: catErr } = await supabase
        .from("architecture_catalog")
        .select("*");
      
      if (catErr || !latestCatalog || latestCatalog.length === 0) {
        throw new Error(catErr?.message || "No catalog data found in database");
      }

      setCatalogRows(latestCatalog);

      // Build lookup dictionaries
      const catalogByName = new Map<string, any>();
      const catalogByImage = new Map<string, any>();

      latestCatalog.forEach(row => {
        const d = row.data || {};
        if (d.building_name) catalogByName.set(d.building_name.toLowerCase().trim(), d);
        if (d.base_building_name) catalogByName.set(d.base_building_name.toLowerCase().trim(), d);
        if (d.display_name) catalogByName.set(d.display_name.toLowerCase().trim(), d);
        if (d.building_photo) catalogByImage.set(d.building_photo.toLowerCase().trim(), d);
      });

      let updatedDetailsCount = 0;
      let photoUpdatedCount = 0;

      // Update existing questions
      const updatedQuestions = questions.map((q) => {
        const cleanAnswer = (q.correct_answer || "").toLowerCase().trim();
        const cleanPhoto = (q.media_url || "").toLowerCase().trim();

        let match = catalogByName.get(cleanAnswer);
        if (!match) {
          for (const [key, val] of catalogByName.entries()) {
            if (cleanAnswer.includes(key) || key.includes(cleanAnswer)) {
              match = val;
              break;
            }
          }
        }
        if (!match && cleanPhoto) {
          match = catalogByImage.get(cleanPhoto);
        }

        if (match) {
          let wasChanged = false;
          let newMediaUrl = q.media_url;
          let newExplanation = q.explanation_clue;

          // If catalog has photo and current is different or missing
          if (match.building_photo && match.building_photo.trim() !== "" && match.building_photo !== q.media_url) {
            newMediaUrl = match.building_photo;
            photoUpdatedCount++;
            wasChanged = true;
          }

          // If catalog has richer clues
          if (match.puzzle_clues && (!q.explanation_clue || q.explanation_clue.length < 20)) {
            newExplanation = match.puzzle_clues;
            wasChanged = true;
          }

          // Sync category tag
          const resolvedDiff = (match.difficulty as QuestionDifficulty) || getQuestionDifficulty(q.correct_answer || q.question_text || "", q.accepted_aliases);
          const cleanAliases = (q.accepted_aliases || []).filter(a => typeof a === "string" && !a.startsWith("diff:"));
          
          if (wasChanged || q.difficulty !== resolvedDiff) {
            updatedDetailsCount++;
          }

          return {
            ...q,
            media_url: newMediaUrl,
            explanation_clue: newExplanation,
            difficulty: resolvedDiff,
            accepted_aliases: [`diff:${resolvedDiff}`, ...cleanAliases]
          };
        }

        // Even without catalog match, resolve latest difficulty
        const resolvedDiff = getQuestionDifficulty(q.correct_answer || q.question_text || "", q.accepted_aliases);
        const cleanAliases = (q.accepted_aliases || []).filter(a => typeof a === "string" && !a.startsWith("diff:"));
        return {
          ...q,
          difficulty: resolvedDiff,
          accepted_aliases: [`diff:${resolvedDiff}`, ...cleanAliases]
        };
      });

      // Check if there are new buildings in the catalog not currently in this quiz
      const existingAnswers = new Set(questions.map(q => (q.correct_answer || "").toLowerCase().trim()));
      const missingCatalogRows = latestCatalog.filter(row => {
        const bName = (row.data?.building_name || "").toLowerCase().trim();
        const baseName = (row.data?.base_building_name || "").toLowerCase().trim();
        return bName && !existingAnswers.has(bName) && !existingAnswers.has(baseName);
      });

      let finalQuestions = updatedQuestions;
      let newlyAddedCount = 0;

      if (missingCatalogRows.length > 0) {
        const shouldAdd = window.confirm(
          `Found ${missingCatalogRows.length} new building(s) in the Architectural Database not currently present in this quiz.\n\nWould you like to import them as new questions now?`
        );
        if (shouldAdd) {
          const allAnswerValues = Array.from(new Set(latestCatalog.map(r => r.data?.building_name).filter(Boolean)));
          const newQuestions: Question[] = missingCatalogRows.map((row, idx) => {
            const d = row.data || {};
            const targetAnswer = d.building_name || d.display_name || "Architectural Landmark";
            const distractors = allAnswerValues
              .filter(v => v !== targetAnswer)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3);
            const options = [targetAnswer, ...distractors].sort(() => Math.random() - 0.5);
            const diff = (d.difficulty as QuestionDifficulty) || getQuestionDifficulty(targetAnswer);

            return {
              order_index: updatedQuestions.length + idx + 1,
              question_type: "choose",
              question_text: "Identify this iconic architectural landmark from the photo:",
              media_type: d.building_photo ? "image" : "none",
              media_url: d.building_photo || "",
              options,
              correct_answer: targetAnswer,
              accepted_aliases: [`diff:${diff}`, targetAnswer],
              explanation_clue: d.puzzle_clues || `${targetAnswer} was designed by ${d.architect || "Master Architect"} (${d.opened_year || ""}).`,
              difficulty: diff
            };
          });

          finalQuestions = [...updatedQuestions, ...newQuestions];
          newlyAddedCount = newQuestions.length;
        }
      }

      setQuestions(finalQuestions);

      // If quiz already exists in Supabase, sync immediately to database
      if (quizId) {
        await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
        const questionsToInsert = finalQuestions.map((q, idx) => {
          const diffVal = q.difficulty || "medium";
          const cleanAliases = (q.accepted_aliases || []).filter(a => typeof a === "string" && !a.startsWith("diff:"));
          return {
            quiz_id: quizId,
            order_index: idx + 1,
            question_type: q.question_type,
            question_text: q.question_text.trim(),
            media_type: q.media_url ? "image" : "none",
            media_url: (q.media_url || "").trim(),
            options: q.options || [],
            correct_answer: (q.correct_answer || "").trim(),
            accepted_aliases: [`diff:${diffVal}`, ...cleanAliases],
            explanation_clue: (q.explanation_clue || "").trim()
          };
        });
        await supabase.from("quiz_questions").insert(questionsToInsert);
      }

      setToastMsg({
        text: `✓ Updated from Architectural Database: ${updatedDetailsCount} synced, ${photoUpdatedCount} photos refreshed${newlyAddedCount > 0 ? `, ${newlyAddedCount} new questions imported` : ""}!`,
        type: "success"
      });
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert("Error updating from architectural database: " + (err.message || String(err)));
    } finally {
      setSyncingDatabase(false);
    }
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
      // Auto-commit any pending category selections
      let activeQuestions = [...questions];
      const pendingKeys = Object.keys(pendingDiff).map(k => parseInt(k, 10));
      if (pendingKeys.length > 0) {
        activeQuestions = activeQuestions.map((q, idx) => {
          const targetDiff = pendingDiff[idx];
          if (!targetDiff) return q;
          const cleanAliases = (q.accepted_aliases || []).filter(a => typeof a === "string" && !a.startsWith("diff:"));
          return {
            ...q,
            difficulty: targetDiff,
            accepted_aliases: [`diff:${targetDiff}`, ...cleanAliases]
          };
        });
        setQuestions(activeQuestions);
        setPendingDiff({});
      }

      const pub = publishState !== undefined ? publishState : isPublished;
      const quizPayload = {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        category,
        cover_image: coverImage.trim() || activeQuestions[0]?.media_url || "",
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

        const questionsToInsert = activeQuestions.map((q, idx) => {
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

      setIsPublished(pub);
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

  // 2-Tier Difficulty counts (Popular & Iconic vs Deep Master)
  const countPopular = questions.filter(q => q.difficulty === "popular" || q.difficulty === "easy" || q.difficulty === "medium").length;
  const countMaster = questions.filter(q => q.difficulty === "master" || q.difficulty === "hard").length;

  const filteredQuestionsWithOriginalIndices = questions
    .map((q, idx) => ({ q, originalIndex: idx }))
    .filter(({ q, originalIndex }) => {
      // 1. Difficulty category filter
      if (filterDifficulty !== "all" && !retainedInFilter[originalIndex]) {
        const qTier = (q.difficulty === "master" || q.difficulty === "hard") ? "master" : "popular";
        if (qTier !== filterDifficulty) return false;
      }

      // 2. Question text, answer & options search query filter
      if (questionSearchQuery.trim()) {
        const term = questionSearchQuery.toLowerCase().trim();
        const text = (q.question_text || "").toLowerCase();
        const ans = (q.correct_answer || "").toLowerCase();
        const clue = (q.explanation_clue || "").toLowerCase();
        const opts = (q.options || []).join(" ").toLowerCase();
        const numStr = String(originalIndex + 1);
        const matches = text.includes(term) || ans.includes(term) || clue.includes(term) || opts.includes(term) || numStr === term;
        if (!matches) return false;
      }

      return true;
    });

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
          {isPublished ? (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Published
            </span>
          ) : (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              Draft Mode
            </span>
          )}

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

          {isPublished ? (
            <>
              <button 
                type="button"
                onClick={() => handleSaveQuiz(false)}
                disabled={saving}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition border border-amber-300 disabled:opacity-50"
                title="Unpublish this quiz and return it to draft"
              >
                Revert to Draft
              </button>
              <button 
                type="button"
                onClick={() => handleSaveQuiz(undefined)}
                disabled={saving}
                className="px-5 py-2 bg-black hover:bg-gray-800 text-white text-xs font-extrabold rounded-xl transition shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <>
              <button 
                type="button"
                onClick={() => handleSaveQuiz(false)}
                disabled={saving}
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition border border-gray-300 disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button 
                type="button"
                onClick={() => handleSaveQuiz(true)}
                disabled={saving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {saving ? "Publishing..." : "Publish Quiz Live"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ARCHITECTURAL CATALOG GENERATOR / SYNC BAR */}
      {(!quizId && questions.length === 0) ? (
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
                  Build question sets automatically from building photos, architects, and metadata.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={generateQuizFromDatabase}
              disabled={generating}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
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
      ) : (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-50/80 via-white to-gray-50 border border-blue-200/70 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              🏛️
            </span>
            <div>
              <p className="text-xs font-extrabold text-gray-900 flex items-center gap-2">
                <span>Architectural Catalog Database ({catalogRows.length} Buildings)</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full border border-emerald-300">
                  Ready to Sync
                </span>
              </p>
              <p className="text-[11px] text-gray-500">
                Update question photos, clues, and category points to match latest catalog edits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUpdateFromCatalog}
              disabled={syncingDatabase}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              title="Click to sync updated photos, trivia clues, and categories from the architectural database"
            >
              {syncingDatabase ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              <span>{syncingDatabase ? "Updating Database..." : "Update from Architectural Database"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowGeneratorAccordion(!showGeneratorAccordion)}
              className="px-3 py-2 text-xs font-bold text-gray-600 hover:text-black border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition flex items-center gap-1 cursor-pointer"
            >
              <span>{showGeneratorAccordion ? "Hide Generator" : "Advanced Generator"}</span>
              {showGeneratorAccordion ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>
      )}

      {showGeneratorAccordion && (quizId || questions.length > 0) && (
        <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-white rounded-3xl border border-blue-200 p-6 shadow-xs mb-8 animate-in fade-in">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                ⚡
              </span>
              <div>
                <h2 className="text-base font-black text-gray-900">
                  Auto-Generate Questions from Catalog ({catalogRows.length} Buildings)
                </h2>
                <p className="text-xs text-amber-800 font-medium">
                  ⚠️ Note: Generating new questions will replace your current {questions.length} questions.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm(`Are you sure you want to re-generate? This will replace the current ${questions.length} questions.`)) {
                  generateQuizFromDatabase();
                }
              }}
              disabled={generating}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
            >
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              Regenerate All Questions
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
      )}

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
        
        {/* STICKY Section Header with Difficulty Breakdown, Search, Controls & Common Apply */}
        <div className="sticky top-2 z-30 bg-white/95 backdrop-blur-md rounded-3xl border border-gray-200/90 p-4 sm:p-5 shadow-lg mb-5 transition-all">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            
            {/* Title & Question Count */}
            <div>
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                📝 Questions Management ({questions.length})
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Popular (100 pts) vs Architecture Master (300 pts)
              </p>
            </div>

            {/* Real-time Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions, landmarks, answers..."
                value={questionSearchQuery}
                onChange={e => setQuestionSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-2 text-xs font-medium border border-gray-200 bg-gray-50/80 rounded-xl focus:outline-none focus:border-black focus:bg-white transition"
              />
              {questionSearchQuery && (
                <button
                  type="button"
                  onClick={() => setQuestionSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Top Action Controls: DB Sync, Add, Quick Save */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleUpdateFromCatalog}
                disabled={syncingDatabase}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                title="Update building photos, trivia clues, and categories from database"
              >
                {syncingDatabase ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                <span className="hidden sm:inline">{syncingDatabase ? "Updating..." : "Update DB"}</span>
              </button>

              <button
                type="button"
                onClick={addBlankQuestion}
                className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus size={14} /> <span className="hidden sm:inline">Add Question</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveQuiz(undefined)}
                disabled={saving}
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-extrabold rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Save all changes to database"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Difficulty Breakdown Badges, Filter Tabs, Common Apply Button & View Mode */}
          <div className="mt-3.5 pt-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-gray-700">Filter:</span>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleFilterChange("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterDifficulty === "all" ? "bg-white text-black shadow-xs font-extrabold" : "text-gray-600 hover:text-black"
                  }`}
                >
                  All ({questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange("popular")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    filterDifficulty === "popular" ? "bg-amber-500 text-black shadow-xs font-black" : "text-gray-600 hover:text-amber-800"
                  }`}
                >
                  Popular • 100 pts ({countPopular})
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange("master")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    filterDifficulty === "master" ? "bg-blue-600 text-white shadow-xs font-extrabold" : "text-gray-600 hover:text-blue-800"
                  }`}
                >
                  Architecture Master • 300 pts ({countMaster})
                </button>
              </div>
            </div>

            {/* Right: View Mode Toggle AND Common Apply Button */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* ⚡ COMMON APPLY BUTTON (Appears when there are staged category selections) */}
              {Object.keys(pendingDiff).length > 0 && (
                <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    onClick={applyAllStagedChanges}
                    className="px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer ring-2 ring-amber-400/80 hover:scale-105 active:scale-95"
                    title="Apply all staged category changes"
                  >
                    <Check size={14} className="stroke-[3] text-emerald-400" />
                    <span>Apply All Changes ({Object.keys(pendingDiff).length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDiff({})}
                    className="px-2 py-1 text-xs text-gray-500 hover:text-red-600 rounded-lg transition font-bold cursor-pointer"
                    title="Cancel all staged category changes"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* View Mode Toggle: Detailed vs Compact */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500">View:</span>
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setQuestionViewMode("detailed")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      questionViewMode === "detailed" ? "bg-white text-black shadow-xs font-black" : "text-gray-500 hover:text-black"
                    }`}
                    title="Detailed View with all 4 multiple-choice options and clues"
                  >
                    <LayoutList size={13} />
                    <span>Detailed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionViewMode("compact")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      questionViewMode === "compact" ? "bg-white text-black shadow-xs font-black" : "text-gray-500 hover:text-black"
                    }`}
                    title="Compact Quick Review without option clutter"
                  >
                    <Grid size={13} />
                    <span>Compact</span>
                  </button>
                </div>
              </div>
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
        ) : questionViewMode === "compact" ? (
          /* COMPACT QUICK REVIEW VIEW (Image, Question, Correct Answer, Category) */
          <div className="space-y-2">
            {filteredQuestionsWithOriginalIndices.map(({ q, originalIndex }) => {
              const isSelected = Boolean(selectedIndices[originalIndex]);
              const isMaster = q.difficulty === "master" || q.difficulty === "hard";
              const stagedDiff = pendingDiff[originalIndex];
              const hasPending = stagedDiff !== undefined && stagedDiff !== q.difficulty;

              return (
                <div 
                  key={originalIndex}
                  className={`bg-white rounded-2xl border p-3 shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-sm ${
                    isSelected ? "ring-2 ring-black border-black/60 bg-amber-50/20" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center shrink-0">
                      {originalIndex + 1}
                    </span>
                    {q.media_url ? (
                      <div 
                        onClick={() => setZoomImageUrl({ url: q.media_url, title: q.correct_answer || q.question_text })}
                        className="w-12 h-12 rounded-xl border border-gray-200 overflow-hidden bg-gray-100 shrink-0 cursor-zoom-in relative group/th"
                        title="Click to preview photo"
                      >
                        <img src={q.media_url} alt="" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <ImageIcon size={16} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-800 truncate" title={q.question_text}>
                        {q.question_text}
                      </p>
                      <p className="text-xs text-gray-900 font-extrabold mt-0.5 truncate">
                        Ans: <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{q.correct_answer || "(No answer set)"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleSelectDifficulty(originalIndex, "popular")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          hasPending && (stagedDiff === "popular" || stagedDiff === "easy" || stagedDiff === "medium")
                            ? "bg-amber-500 text-black ring-2 ring-amber-600 font-black shadow-xs"
                            : !hasPending && (!isMaster)
                            ? "bg-amber-500 text-black shadow-xs font-black"
                            : "text-gray-500 hover:text-black hover:bg-white/70"
                        }`}
                      >
                        Popular (100)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectDifficulty(originalIndex, "master")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          hasPending && (stagedDiff === "master" || stagedDiff === "hard")
                            ? "bg-blue-600 text-white ring-2 ring-blue-700 font-black shadow-xs"
                            : !hasPending && (isMaster)
                            ? "bg-blue-600 text-white shadow-xs font-extrabold"
                            : "text-gray-500 hover:text-black hover:bg-white/70"
                        }`}
                      >
                        Master (300)
                      </button>
                    </div>

                    {hasPending && (
                      <div className="flex items-center gap-1 animate-in fade-in">
                        <button
                          type="button"
                          onClick={() => confirmDifficultyChange(originalIndex)}
                          className="px-2 py-1 rounded-lg bg-black hover:bg-gray-800 text-white text-[10px] font-black flex items-center gap-1 shadow-xs transition cursor-pointer"
                          title="Apply this change"
                        >
                          <Check size={11} className="stroke-[3] text-emerald-400" />
                          <span>Apply</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelDifficultyChange(originalIndex)}
                          className="p-1 text-gray-400 hover:text-black rounded transition cursor-pointer"
                          title="Cancel"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveQuestionUp(originalIndex)}
                        disabled={originalIndex === 0}
                        className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestionDown(originalIndex)}
                        disabled={originalIndex === questions.length - 1}
                        className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(originalIndex)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* DETAILED CARD VIEW */
          <div className="space-y-5">
            {filteredQuestionsWithOriginalIndices.map(({ q, originalIndex }) => {
              const currentDiff = q.difficulty || "medium";
              const stagedDiff = pendingDiff[originalIndex];
              const hasPending = stagedDiff !== undefined && stagedDiff !== currentDiff;
              const isRetained = filterDifficulty !== "all" && retainedInFilter[originalIndex] && currentDiff !== filterDifficulty;

              return (
                <div 
                  key={originalIndex} 
                  className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-xs transition duration-200 hover:shadow-md ${
                    hasPending
                      ? "ring-2 ring-black border-black/50 shadow-sm"
                      : isRetained
                      ? "border-amber-400 bg-amber-50/20"
                      : currentDiff === "easy" ? "border-emerald-200/80 hover:border-emerald-400" :
                      currentDiff === "hard" ? "border-red-200/80 hover:border-red-400" :
                      "border-amber-200/80 hover:border-amber-400"
                  }`}
                >
                  
                  {/* TOP ROW: Question #, Interactive Difficulty Selector & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="w-8 h-8 rounded-full bg-black text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                        {originalIndex + 1}
                      </span>

                      {/* MANUAL 2-TIER DIFFICULTY SELECTOR WITH TICK MARK CONFIRMATION */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/80">
                          <button
                            type="button"
                            onClick={() => handleSelectDifficulty(originalIndex, "popular")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              hasPending && (stagedDiff === "popular" || stagedDiff === "easy" || stagedDiff === "medium")
                                ? "bg-amber-500 text-black ring-2 ring-amber-600 ring-offset-1 font-black shadow-xs"
                                : !hasPending && (currentDiff === "popular" || currentDiff === "easy" || currentDiff === "medium")
                                ? "bg-amber-500 text-black shadow-xs font-black"
                                : "text-gray-600 hover:text-black hover:bg-white/70"
                            }`}
                            title="Select Popular & Iconic (100 points)"
                          >
                            Popular &amp; Iconic (100 pts)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectDifficulty(originalIndex, "master")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              hasPending && (stagedDiff === "master" || stagedDiff === "hard")
                                ? "bg-blue-600 text-white ring-2 ring-blue-700 ring-offset-1 font-black shadow-xs"
                                : !hasPending && (currentDiff === "master" || currentDiff === "hard")
                                ? "bg-blue-600 text-white shadow-xs font-extrabold"
                                : "text-gray-600 hover:text-black hover:bg-white/70"
                            }`}
                            title="Select Deep Master (300 points)"
                          >
                            Deep Master (300 pts)
                          </button>
                        </div>

                        {/* TICK MARK CONFIRMATION BUTTON (Appears upon selecting a different difficulty) */}
                        {hasPending && (
                          <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              type="button"
                              onClick={() => confirmDifficultyChange(originalIndex)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer hover:scale-105 active:scale-95"
                              title="Click tick mark to apply this difficulty change"
                            >
                              <Check size={14} className="stroke-[3] text-emerald-400" />
                              <span>Apply {stagedDiff === "master" ? "DEEP MASTER" : "POPULAR & ICONIC"} ✓</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelDifficultyChange(originalIndex)}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                              title="Cancel change"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        )}

                        {/* RETAINED NOTICE IF QUESTION WAS MOVED OUT OF CURRENT FILTER TAB */}
                        {isRetained && (
                          <span className="text-[11px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <span>✓ Moved to {currentDiff.toUpperCase()}</span>
                            <span className="text-gray-600 font-normal">(Kept in view so you don&apos;t lose it)</span>
                          </span>
                        )}
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
                          className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden border border-gray-200 bg-slate-950 group cursor-pointer shadow-xs hover:border-black transition flex items-center justify-center p-1.5"
                          title="Click to view full photo in original aspect ratio"
                        >
                          <img 
                            referrerPolicy="no-referrer"
                            src={q.media_url} 
                            alt="Clue preview" 
                            className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
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
            <p className="text-xs text-gray-500 mt-0.5 font-bold">
              <span className="text-amber-800">{countPopular} Popular &amp; Iconic</span> • <span className="text-blue-800">{countMaster} Deep Master</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isPublished ? (
              <>
                <button 
                  type="button"
                  onClick={() => handleSaveQuiz(false)}
                  disabled={saving}
                  className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition border border-amber-300"
                  title="Unpublish this quiz and return it to draft"
                >
                  Revert to Draft
                </button>
                <button 
                  type="button"
                  onClick={() => handleSaveQuiz(undefined)}
                  disabled={saving}
                  className="px-7 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-extrabold rounded-xl transition shadow-md flex items-center gap-2"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </>
            ) : (
              <>
                <button 
                  type="button"
                  onClick={() => handleSaveQuiz(false)}
                  disabled={saving}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition border border-gray-300"
                >
                  Save as Draft
                </button>
                <button 
                  type="button"
                  onClick={() => handleSaveQuiz(true)}
                  disabled={saving}
                  className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition shadow-md flex items-center gap-2"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  {saving ? "Publishing..." : "Publish Quiz Live"}
                </button>
              </>
            )}
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
