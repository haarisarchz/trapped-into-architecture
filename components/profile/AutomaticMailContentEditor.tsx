"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Lock,
  RotateCcw,
  Save,
  Check,
  ChevronDown,
  Info,
  HelpCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BadgeTier } from "@/utils/profileCompletion";
import {
  TEMPLATE_COMPONENTS,
  getDefaultSubject,
  getDefaultBody,
} from "@/utils/smartApply";

interface AutomaticMailContentEditorProps {
  user: any;
  isOwner: boolean;
  onUserUpdate: (updated: any) => void;
}

export default function AutomaticMailContentEditor({
  user,
  isOwner,
  onUserUpdate,
}: AutomaticMailContentEditorProps) {
  const userTier: BadgeTier = (user?.badge_tier as BadgeTier) || "bronze";
  const isGoldOrAbove = ["gold", "platinum", "diamond"].includes(userTier);

  const [subject, setSubject] = useState<string>(
    user?.custom_mail_subject || getDefaultSubject()
  );
  const [body, setBody] = useState<string>(
    user?.custom_mail_body || getDefaultBody()
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Autocomplete dropdown state triggered by "{{"
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState("");
  const [cursorIndex, setCursorIndex] = useState<number | null>(null);

  // Dropdown on toolbar
  const [showToolbarDropdown, setShowToolbarDropdown] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowToolbarDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Insert tag helper
  const insertTagAtCursor = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = body;

    // Check if replacing "{{"
    let newText = "";
    let newCursorPos = 0;

    const textBefore = text.slice(0, start);
    const textAfter = text.slice(end);

    const matchBraces = textBefore.match(/\{\{([a-zA-Z0-9_]*)$/);
    if (matchBraces) {
      const matchIndex = textBefore.lastIndexOf("{{");
      newText = text.slice(0, matchIndex) + tag + textAfter;
      newCursorPos = matchIndex + tag.length;
    } else {
      newText = textBefore + tag + textAfter;
      newCursorPos = start + tag.length;
    }

    setBody(newText);
    setShowAutocomplete(false);
    setShowToolbarDropdown(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  // Textarea input handler detecting "{{"
  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    setBody(val);

    const textBefore = val.slice(0, pos);
    const match = textBefore.match(/\{\{([a-zA-Z0-9_]*)$/);

    if (match) {
      setShowAutocomplete(true);
      setAutocompleteQuery(match[1].toLowerCase());
      setCursorIndex(pos);
    } else {
      setShowAutocomplete(false);
    }
  };

  // Filtered components for autocomplete
  const filteredComponents = TEMPLATE_COMPONENTS.filter(
    (c) =>
      c.tag.toLowerCase().includes(autocompleteQuery) ||
      c.label.toLowerCase().includes(autocompleteQuery)
  );

  const handleSave = async () => {
    if (!isGoldOrAbove) {
      alert("Customizing Automatic Mail Content is an exclusive perk for Gold, Platinum & Diamond members!");
      return;
    }

    setSaving(true);
    setSavedSuccess(false);

    try {
      const payload = {
        custom_mail_subject: subject.trim(),
        custom_mail_body: body.trim(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id);

      if (error) throw error;

      const updated = { ...user, ...payload };
      onUserUpdate(updated);

      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem("currentUser", JSON.stringify({ ...parsed, ...payload }));
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      alert(err.message || "Failed to save mail template");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    if (confirm("Reset template to the standard TI2A professional cover letter?")) {
      setSubject(getDefaultSubject());
      setBody(getDefaultBody());
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200/80 shadow-sm">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✍️</span>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              Automatic Mail Content
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
              Gold+ Customizer
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Customize the dynamic email sent when applying to architectural firms. Type <code className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold text-black">{`{{`}</code> to insert dynamic tags.
          </p>
        </div>

        {/* TIER LOCK BADGE / RESET ACTION */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isGoldOrAbove ? (
            <button
              onClick={handleResetDefault}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
              title="Reset to standard cover letter"
            >
              <RotateCcw size={13} />
              <span>Reset Default</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200">
              <Lock size={12} />
              <span>Unlock at Gold Tier (70%)</span>
            </div>
          )}
        </div>
      </div>

      {/* GOLD TIER UPGRADE PROMPT IF USER IS BRONZE OR SILVER */}
      {!isGoldOrAbove && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
          <Sparkles size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold">Gold & Platinum Privilege:</strong> Silver tier users enjoy the pre-configured standard human cover letter. Reach <strong>Gold Tier (70%)</strong> by filling your education, degrees, and COA details to unlock full custom cover letter editing, Blogger-style formatting, and dynamic components!
          </div>
        </div>
      )}

      {/* 1. SUBJECT LINE INPUT */}
      <div className="mb-4">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">
          Email Subject Line
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            disabled={!isGoldOrAbove}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="e.g. Application for the position of {{position}}"
          />
          {isGoldOrAbove && (
            <button
              type="button"
              onClick={() => {
                if (!subject.includes("{{position}}")) {
                  setSubject(subject ? `${subject} - {{position}}` : "Application for {{position}}");
                }
              }}
              className="text-xs font-bold px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition border border-gray-200 shrink-0"
              title="Insert job position tag"
            >
              + Tag
            </button>
          )}
        </div>
      </div>

      {/* 2. BLOGGER-STYLE TOOLBAR */}
      <div className="relative border border-gray-300 rounded-2xl overflow-hidden bg-white shadow-xs">
        <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Quick Insert Component Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              disabled={!isGoldOrAbove}
              onClick={() => setShowToolbarDropdown(!showToolbarDropdown)}
              className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white font-bold px-3 py-1.5 rounded-xl transition cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed shadow-xs"
            >
              <span>🧩 Insert Component</span>
              <ChevronDown size={14} />
            </button>

            {/* Dropdown Menu */}
            {showToolbarDropdown && (
              <div className="absolute left-0 top-full mt-1.5 w-64 max-h-72 overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-30 animate-in fade-in duration-150">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2.5 py-1">
                  Click to insert component
                </p>
                <div className="space-y-0.5">
                  {TEMPLATE_COMPONENTS.map((comp) => (
                    <button
                      key={comp.tag}
                      type="button"
                      onClick={() => insertTagAtCursor(comp.tag)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span>{comp.icon}</span>
                        <span>{comp.label}</span>
                      </span>
                      <code className="text-[10px] text-gray-400 font-mono">
                        {comp.tag}
                      </code>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Helper Tip */}
          <span className="text-[11px] text-gray-400 italic hidden sm:inline">
            Type <strong className="text-gray-700">{`{{`}</strong> in text to open autocomplete list
          </span>
        </div>

        {/* 3. TEXTAREA WITH SMART AUTOCOMPLETE */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={12}
            disabled={!isGoldOrAbove}
            value={body}
            onChange={handleBodyChange}
            placeholder="Type your application message..."
            className="w-full p-4 text-xs sm:text-sm font-sans leading-relaxed text-gray-800 bg-white focus:outline-none disabled:bg-gray-50/80 disabled:text-gray-600 resize-y"
          />

          {/* FLOATING DROPDOWN TRIGGERED BY {{{{ */}
          {showAutocomplete && isGoldOrAbove && (
            <div className="absolute left-6 top-16 w-72 max-h-60 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-30 animate-in fade-in duration-100">
              <div className="px-2.5 py-1 border-b border-gray-100 mb-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-gray-400">
                  Insert Component ({filteredComponents.length})
                </span>
                <span className="text-[9px] text-gray-400">Type to filter</span>
              </div>

              {filteredComponents.length === 0 ? (
                <div className="p-3 text-center text-xs text-gray-400 italic">
                  No matching tags found
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredComponents.map((comp) => (
                    <button
                      key={comp.tag}
                      type="button"
                      onClick={() => insertTagAtCursor(comp.tag)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-800 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span>{comp.icon}</span>
                        <span>{comp.label}</span>
                      </span>
                      <code className="text-[10px] text-blue-600 font-mono">
                        {comp.tag}
                      </code>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SAVE ACTIONS */}
      {isOwner && isGoldOrAbove && (
        <div className="mt-4 flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl">
              <Check size={14} />
              <span>Mail template saved successfully!</span>
            </span>
          ) : (
            <span className="text-xs text-gray-500">
              Auto-compiles dynamically when you click &quot;⚡ TI2A Smart Apply&quot; on job posts.
            </span>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
          >
            <Save size={14} />
            <span>{saving ? "Saving..." : "Save Template"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
