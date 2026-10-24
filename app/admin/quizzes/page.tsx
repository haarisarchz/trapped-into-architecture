"use client";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import QuizEditor from "@/components/admin/QuizEditor";
import { 
  Plus, Play, Edit2, Trash2, Eye, EyeOff, Loader2, Sparkles, 
  HelpCircle, CheckCircle2, Trophy, Clock, Users, ArrowUpRight
} from "lucide-react";

const sqlSnippet = `-- 🏛️ Architecture Quizzes Schema Migration
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Architects',
  cover_image TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 1,
  question_type TEXT NOT NULL DEFAULT 'choose',
  question_text TEXT NOT NULL,
  media_type TEXT DEFAULT 'none',
  media_url TEXT,
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  accepted_aliases JSONB DEFAULT '[]'::jsonb,
  explanation_clue TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_session_id TEXT,
  display_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  time_taken_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published quizzes" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Admins can manage quizzes" ON quizzes FOR ALL USING (true);
CREATE POLICY "Public can view quiz questions" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY "Admins can manage quiz questions" ON quiz_questions FOR ALL USING (true);
CREATE POLICY "Anyone can insert quiz scores" ON quiz_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view quiz scores for leaderboards" ON quiz_scores FOR SELECT USING (true);`;

export default function AdminQuizzesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [copied, setCopied] = useState(false);

  const checkAccessAndDatabase = async () => {
    setLoading(true);
    const stored = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!stored) {
      router.push("/admin");
      return;
    }
    const lookupField = stored.username ? "username" : "email";
    const lookupValue = stored.username || stored.email;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq(lookupField, lookupValue)
      .maybeSingle();

    const normalizedRole = (profile?.role || stored.role || "").toLowerCase().replace(/[\s_]+/g, "");
    if (!normalizedRole || !["superadmin", "admin", "ceo"].includes(normalizedRole)) {
      router.push("/admin");
      return;
    }

    const { error } = await supabase.from("quizzes").select("id").limit(1);
    if (error && (error.code === "42P01" || error.code === "PGRST205")) {
      setSetupRequired(true);
      setLoading(false);
      return;
    }

    setSetupRequired(false);
    fetchQuizzes();
  };

  const fetchQuizzes = async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*, quiz_questions(count), quiz_scores(count)")
      .order("created_at", { ascending: false });

    if (data) setQuizzes(data);
    setLoading(false);
  };

  useEffect(() => {
    checkAccessAndDatabase();
  }, []);

  const togglePublish = async (quiz: any) => {
    const newState = !quiz.is_published;
    setQuizzes(quizzes.map(q => q.id === quiz.id ? { ...q, is_published: newState } : q));
    await supabase.from("quizzes").update({ is_published: newState }).eq("id", quiz.id);
  };

  const deleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz? All its questions and scores will be deleted.")) return;
    setQuizzes(quizzes.filter(q => q.id !== quizId));
    await supabase.from("quizzes").delete().eq("id", quizId);
  };

  const copySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // If in Editor Mode (creating or editing)
  if (isCreatingNew || editingQuizId) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-[80px]">
          <QuizEditor 
            quizId={editingQuizId || undefined} 
            onBack={() => {
              setIsCreatingNew(false);
              setEditingQuizId(null);
              fetchQuizzes();
            }} 
          />
        </div>
      </>
    );
  }

  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.quiz_questions?.[0]?.count || 0), 0);
  const totalPlays = quizzes.reduce((sum, q) => sum + (q.quiz_scores?.[0]?.count || 0), 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-[80px] pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🏛️ Architecture Quiz Manager
                <span className="text-xs bg-black text-white px-2.5 py-0.5 rounded-full font-bold uppercase">
                  Admin
                </span>
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Create multiple choice and fill-up quizzes directly linked with the Architecture Catalog.
              </p>
            </div>

            {!setupRequired && !loading && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsCreatingNew(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  <Plus size={16} /> Create New Quiz
                </button>
                <AdminQuickMenu />
              </div>
            )}
          </div>

          {/* SETUP REQUIRED SCREEN */}
          {setupRequired ? (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 max-w-3xl mx-auto mt-10">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Database Setup Required</h2>
              <p className="text-gray-600 mb-6 text-sm">
                The Architecture Quiz tables (<code className="font-mono text-xs bg-gray-100 p-1 rounded">quizzes</code>, <code className="font-mono text-xs bg-gray-100 p-1 rounded">quiz_questions</code>, <code className="font-mono text-xs bg-gray-100 p-1 rounded">quiz_scores</code>) do not exist yet. Please run this script in your Supabase SQL editor:
              </p>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-6 rounded-xl overflow-x-auto text-xs font-mono mb-6 max-h-96">
                  {sqlSnippet}
                </pre>
                <button
                  onClick={copySql}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  {copied ? <CheckCircle2 size={13} className="text-green-400" /> : null}
                  {copied ? "Copied!" : "Copy SQL"}
                </button>
              </div>
              <button 
                onClick={checkAccessAndDatabase} 
                className="w-full py-3.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition text-sm"
              >
                I have run the SQL script. Reload Quiz Manager.
              </button>
            </div>
          ) : loading ? (
            <div className="py-24 text-center text-gray-500 font-bold flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-black" size={24} />
              <span>Loading Quizzes...</span>
            </div>
          ) : (
            <>
              {/* STATS OVERVIEW CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Quizzes</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">{quizzes.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Published Live</p>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                    {quizzes.filter(q => q.is_published).length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Questions</p>
                  <p className="text-2xl font-extrabold text-blue-600 mt-1">{totalQuestions}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Plays</p>
                  <p className="text-2xl font-extrabold text-purple-600 mt-1">{totalPlays}</p>
                </div>
              </div>

              {/* QUIZZES LIST */}
              {quizzes.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-lg mx-auto my-8">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    🏛️
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No Quizzes Created Yet</h3>
                  <p className="text-xs text-gray-500 mb-6">
                    Create your first quiz! You can import questions, photos, and answers directly from the Architecture Catalog with 1 click.
                  </p>
                  <button 
                    onClick={() => setIsCreatingNew(true)}
                    className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
                  >
                    + Create First Quiz
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map((quiz) => {
                    const questionCount = quiz.quiz_questions?.[0]?.count || 0;
                    const playsCount = quiz.quiz_scores?.[0]?.count || 0;

                    return (
                      <div 
                        key={quiz.id}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
                      >
                        {/* Cover Image */}
                        <div className="h-40 bg-gray-100 relative overflow-hidden">
                          {quiz.cover_image ? (
                            <img 
                              src={quiz.cover_image} 
                              alt={quiz.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                              <span className="text-4xl mb-1">🏛️</span>
                              <span className="text-xs font-semibold">Architecture Quiz</span>
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className="absolute top-3 left-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                              quiz.is_published 
                                ? "bg-emerald-500 text-white" 
                                : "bg-gray-900/80 text-white backdrop-blur-xs"
                            }`}>
                              {quiz.is_published ? "Live" : "Draft"}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3">
                            <span className="bg-white/90 backdrop-blur-xs text-gray-800 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              {quiz.category}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="text-base font-bold text-gray-900 line-clamp-1 mb-1">
                            {quiz.title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">
                            {quiz.description || "No description provided."}
                          </p>

                          {/* Meta Counters */}
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 mb-4 font-medium">
                            <span className="flex items-center gap-1">
                              <HelpCircle size={13} className="text-blue-600" /> {questionCount} Questions
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={13} className="text-purple-600" /> {playsCount} Plays
                            </span>
                            <span className="text-gray-400 font-mono text-[11px]">
                              /{quiz.slug}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setEditingQuizId(quiz.id)}
                              className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1 border border-gray-200"
                            >
                              <Edit2 size={13} /> Edit
                            </button>

                            <a 
                              href={`/quizzes/${quiz.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition border border-gray-200"
                              title="Preview / Play Quiz"
                            >
                              <Eye size={15} />
                            </a>

                            <button 
                              onClick={() => togglePublish(quiz)}
                              className={`p-2 rounded-xl transition border ${
                                quiz.is_published 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                                  : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                              }`}
                              title={quiz.is_published ? "Unpublish to Draft" : "Publish to Live"}
                            >
                              {quiz.is_published ? <CheckCircle2 size={15} /> : <EyeOff size={15} />}
                            </button>

                            <button 
                              onClick={() => deleteQuiz(quiz.id)}
                              className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition border border-red-200"
                              title="Delete Quiz"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
