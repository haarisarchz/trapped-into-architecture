"use client";
import React, { useEffect } from "react";
import { X, BookOpen, ShieldCheck, Trophy, Sparkles, Clock, Lock, CheckCircle2 } from "lucide-react";

interface QuizRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuizRulesModal({ isOpen, onClose }: QuizRulesModalProps) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-gray-200 max-w-2xl w-full max-h-[88vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-rules-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-start justify-between gap-4 bg-gradient-to-r from-gray-50 via-white to-amber-50/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 id="quiz-rules-title" className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                How to Play &amp; Scoring Rules
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Official tournament scoring, difficulty mechanics &amp; clue system
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer shrink-0"
            aria-label="Close rules"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-gray-700 leading-relaxed custom-scrollbar">
          
          {/* Section 1: Points Strictly by Game Difficulty */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-black text-[11px] flex items-center justify-center">1</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                Point Marking (Strictly Based on Game Difficulty)
              </h3>
            </div>
            <p className="text-gray-600 mb-3 text-[11px]">
              Every question in a round awards identical base points strictly tied to your selected Game Difficulty:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/70">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-950 text-xs">🟢 EASY</span>
                  <span className="font-black text-emerald-700 text-xs">150 PTS</span>
                </div>
                <ul className="mt-2 space-y-1 text-[11px] text-emerald-900/90 font-medium">
                  <li>• <strong>15s</strong> per question</li>
                  <li>• <strong>10 or 20</strong> questions</li>
                  <li>• <strong>100% Popular</strong> landmarks</li>
                  <li>• Choices <strong>NOT shuffled</strong></li>
                  <li>• Clue deduction: <strong>-50 pts</strong></li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/70">
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-950 text-xs">🟡 MEDIUM</span>
                  <span className="font-black text-amber-700 text-xs">300 PTS</span>
                </div>
                <ul className="mt-2 space-y-1 text-[11px] text-amber-900/90 font-medium">
                  <li>• <strong>10s</strong> per question</li>
                  <li>• <strong>20 or 50</strong> questions</li>
                  <li>• <strong>50-50</strong> + balanced mix</li>
                  <li>• Choices <strong>shuffled</strong></li>
                  <li>• Clue deduction: <strong>-100 pts</strong></li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl border border-purple-200 bg-purple-50/70">
                <div className="flex items-center justify-between">
                  <span className="font-black text-purple-950 text-xs">🔴 HARD</span>
                  <span className="font-black text-purple-700 text-xs">450 PTS</span>
                </div>
                <ul className="mt-2 space-y-1 text-[11px] text-purple-900/90 font-medium">
                  <li>• <strong>5s</strong> per question</li>
                  <li>• <strong>10, 20 or 50</strong> questions</li>
                  <li>• <strong>Master</strong> deep tier</li>
                  <li>• <strong>Sequential Clue Lock 🔒</strong></li>
                  <li>• Clue deduction: <strong>-150 pts</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Clue Deductions & Hard Mode Lock */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-black text-[11px] flex items-center justify-center">2</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                Clue System &amp; Sequential Locks
              </h3>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="text-base shrink-0">📍</span>
                <div>
                  <span className="font-bold text-gray-900">Clue 1 (Location):</span>
                  <span className="text-gray-600"> Reveals the landmark&apos;s city and country without exposing its direct name. Deducts exactly 1/3 of base points (-50 pts Easy, -100 pts Medium, -150 pts Hard).</span>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
                <span className="text-base shrink-0">🏛️</span>
                <div>
                  <span className="font-bold text-gray-900">Clue 2 (Architect / Movement):</span>
                  <span className="text-gray-600"> Reveals the visionary architect, firm, or design style. Deducts an additional 1/3 of base points.</span>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
                <span className="text-base shrink-0">🔒</span>
                <div>
                  <span className="font-bold text-gray-900">Hard Mode Strict Lock:</span>
                  <span className="text-gray-600"> On Hard mode, Clue 2 is locked until Clue 1 (Location) is revealed first to prevent giving away the architect directly. On Easy and Medium, clues can be unlocked freely in any order.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Question Difficulties Explained */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-black text-[11px] flex items-center justify-center">3</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                Architectural Catalog Tiers
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
              <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl">
                <p className="font-extrabold text-amber-950 flex items-center gap-1">
                  <span>🌟 Popular</span>
                </p>
                <p className="text-gray-600 mt-1">
                  Globally famous landmarks, viral pop-culture icons, and foundation architectural masterpieces (e.g. Fallingwater, Sydney Opera House, Sagrada Família).
                </p>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-200/80 rounded-xl">
                <p className="font-extrabold text-blue-950 flex items-center gap-1">
                  <span>⚖️ 50-50 (Intermediate)</span>
                </p>
                <p className="text-gray-600 mt-1">
                  Moderately recognizable landmarks and regional masterworks bridging mainstream fame and architectural canon.
                </p>
              </div>

              <div className="p-3 bg-purple-50/50 border border-purple-200/80 rounded-xl">
                <p className="font-extrabold text-purple-950 flex items-center gap-1">
                  <span>🏛️ Architecture Master</span>
                </p>
                <p className="text-gray-600 mt-1">
                  Advanced tectonic feats, deep syllabus monographs, structural innovations, and Pritzker Prize milestones (e.g. Therme Vals, Sendai Mediatheque).
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Game Modes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-black text-[11px] flex items-center justify-center">4</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                Challenge Mode vs Practice Mode
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl">
                <p className="font-black text-gray-950 flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-600" />
                  <span>Challenge Mode (Tournament)</span>
                </p>
                <p className="text-gray-600 mt-1">
                  Continuous countdown timer for the whole round. Speed bonus awarded for fast completions. Verified scores enter the official Global Leaderboard.
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl">
                <p className="font-black text-gray-950 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Practice Mode (Untimed)</span>
                </p>
                <p className="text-gray-600 mt-1">
                  Untimed, zero-pressure learning environment. Instant feedback on each answer with deep architectural trivia and historical context.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Fairness & Image Preloading */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] flex items-start gap-2.5">
            <span className="text-base shrink-0">⚡</span>
            <p className="text-slate-700">
              <strong>Fairness Guarantee:</strong> High-resolution photos are preloaded in the background. In Challenge Mode, the countdown timer pauses automatically while a photo finishes loading, ensuring network lag never hurts your score!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-gray-500 font-medium">
            Read anytime during pre-game or gameplay.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-extrabold transition shadow-xs cursor-pointer"
          >
            Got it, Let&apos;s Play!
          </button>
        </div>
      </div>
    </div>
  );
}
