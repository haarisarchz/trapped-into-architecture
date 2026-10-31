"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import NewsFeedCard, { FeedItem } from "./NewsFeedCard";
import {
  Sparkles,
  Plus,
  Clock,
  Layers,
  X,
  Send,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface FeatureHighlight {
  feature: string;
  desc: string;
}

interface NewsFeedClientViewProps {
  initialAnnouncements: FeedItem[];
}

export default function NewsFeedClientView({
  initialAnnouncements,
}: NewsFeedClientViewProps) {
  const [announcements, setAnnouncements] = useState<FeedItem[]>(initialAnnouncements);
  const [isPrivilegedAdmin, setIsPrivilegedAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<FeedItem | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("Feature Release");
  const [badgeColor, setBadgeColor] = useState("bg-emerald-100 text-emerald-800 border-emerald-300");
  const [linkUrl, setLinkUrl] = useState("/companies");
  const [linkText, setLinkText] = useState("Explore Feature");
  const [author, setAuthor] = useState("Platform Editorial");
  const [featureHighlights, setFeatureHighlights] = useState<FeatureHighlight[]>([
    { feature: "", desc: "" },
  ]);
  const [saving, setSaving] = useState(false);

  // Check role: strictly CEO & SuperAdmin only!
  useEffect(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
      if (currentUser && currentUser.role) {
        const normalized = currentUser.role.toLowerCase().replace(/[\s_]+/g, "");
        if (normalized === "ceo" || normalized === "superadmin") {
          setIsPrivilegedAdmin(true);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const refreshPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("news_feed_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setAnnouncements(data as FeedItem[]);
      }
    } catch {
      // Ignore
    }
  };

  const handleOpenNew = () => {
    setEditingPost(null);
    setTitle("");
    setSummary("");
    setCategory("Feature Release");
    setBadgeColor("bg-emerald-100 text-emerald-800 border-emerald-300");
    setLinkUrl("/companies");
    setLinkText("Explore Feature");
    setAuthor("Platform Editorial");
    setFeatureHighlights([{ feature: "", desc: "" }]);
    setShowModal(true);
  };

  const handleEdit = (item: FeedItem) => {
    setEditingPost(item);
    setTitle(item.title);
    setSummary(item.summary);
    setCategory(item.category);
    setBadgeColor(item.badge_color || "bg-emerald-100 text-emerald-800 border-emerald-300");
    setLinkUrl(item.link_url || "");
    setLinkText(item.link_text || "Explore");
    setAuthor(item.author || "Platform Editorial");
    setFeatureHighlights(
      item.feature_highlights && item.feature_highlights.length > 0
        ? item.feature_highlights
        : [{ feature: "", desc: "" }]
    );
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feature announcement?")) return;

    try {
      await supabase.from("news_feed_posts").delete().eq("id", id);
      setAnnouncements((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Error deleting post.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    setSaving(true);
    const validHighlights = featureHighlights.filter((f) => f.feature.trim() !== "");

    const payload = {
      title,
      summary,
      category,
      badge_color: badgeColor,
      feature_highlights: validHighlights,
      link_url: linkUrl || null,
      link_text: linkText || null,
      author,
      status: "published",
      published_at: editingPost?.published_at || new Date().toISOString(),
    };

    try {
      if (editingPost) {
        await supabase.from("news_feed_posts").update(payload).eq("id", editingPost.id);
      } else {
        await supabase.from("news_feed_posts").insert([payload]);
      }
      await refreshPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setShowModal(false);
    }
  };

  const addHighlightRow = () => {
    setFeatureHighlights([...featureHighlights, { feature: "", desc: "" }]);
  };

  const removeHighlightRow = (index: number) => {
    setFeatureHighlights(featureHighlights.filter((_, i) => i !== index));
  };

  const updateHighlight = (index: number, field: "feature" | "desc", value: string) => {
    const copy = [...featureHighlights];
    copy[index][field] = value;
    setFeatureHighlights(copy);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Row: Live Sync pill + CEO / SuperAdmin "+ Create Announcement" button */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Architecture Feature Feed</h4>
            <p className="text-[11px] text-gray-500">
              User-facing platform rollouts, studio directories, and verified hiring milestones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* PRIVILEGED CEO / SUPERADMIN ACTION */}
          {isPrivilegedAdmin && (
            <button
              onClick={handleOpenNew}
              className="inline-flex items-center gap-1.5 bg-gray-950 hover:bg-black text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition shadow-xs"
            >
              <Plus size={14} />
              <span>New Announcement</span>
            </button>
          )}

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>
      </div>

      {/* Feed Cards Stream */}
      <div className="space-y-6">
        {announcements.map((item) => (
          <NewsFeedCard
            key={item.id}
            item={item}
            isPrivilegedAdmin={isPrivilegedAdmin}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* INLINE EDIT / CREATE MODAL FOR CEO & SUPERADMIN */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-950">
                {editingPost ? "Edit Feature Announcement" : "Create New Feature Announcement"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-black transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. New Section: Architectural Studio Directory Live"
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Summary (User-Facing Only — No Dev/UI Details)
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Describe the new feature or milestone for architects and studios..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (e.target.value === "Feature Release") {
                        setBadgeColor("bg-emerald-100 text-emerald-800 border-emerald-300");
                      } else if (e.target.value === "Hiring & Careers") {
                        setBadgeColor("bg-blue-100 text-blue-800 border-blue-200");
                      } else {
                        setBadgeColor("bg-purple-100 text-purple-800 border-purple-200");
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-gray-900"
                  >
                    <option value="Feature Release">Feature Release</option>
                    <option value="Hiring & Careers">Hiring & Careers</option>
                    <option value="Studio Spotlight">Studio Spotlight</option>
                    <option value="Community Milestone">Community Milestone</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Link</label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="/companies or /jobs"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Explore Directory"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-gray-900"
                  />
                </div>
              </div>

              {/* Dynamic Feature Highlights */}
              <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">Feature Breakdown Points</span>
                  <button
                    type="button"
                    onClick={addHighlightRow}
                    className="text-[11px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Point
                  </button>
                </div>

                <div className="space-y-2">
                  {featureHighlights.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat.feature}
                        onChange={(e) => updateHighlight(idx, "feature", e.target.value)}
                        placeholder="Feature (e.g. Typology Filters)"
                        className="w-1/3 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-900"
                      />
                      <input
                        type="text"
                        value={feat.desc}
                        onChange={(e) => updateHighlight(idx, "desc", e.target.value)}
                        placeholder="Description (e.g. Search practices by typology)"
                        className="flex-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-900"
                      />
                      {featureHighlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHighlightRow(idx)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gray-950 hover:bg-black text-white px-5 py-2 rounded-xl font-semibold transition flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>{saving ? "Publishing..." : editingPost ? "Update Post" : "Publish to Feed"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
