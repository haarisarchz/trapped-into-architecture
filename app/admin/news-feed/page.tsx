"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import { supabase } from "@/lib/supabase";
import {
  Sparkles,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  Layers,
  ArrowRight,
  Send,
  Edit2,
  X,
  AlertCircle
} from "lucide-react";

interface FeatureHighlight {
  feature: string;
  desc: string;
}

interface NewsFeedPost {
  id: string;
  title: string;
  summary: string;
  category: string;
  badge_color: string;
  feature_highlights: FeatureHighlight[];
  link_url: string;
  link_text: string;
  author: string;
  published_at: string;
  status: "draft" | "published";
}

export default function AdminNewsFeedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<NewsFeedPost[]>([]);
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsFeedPost | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("Feature Release");
  const [badgeColor, setBadgeColor] = useState("bg-emerald-100 text-emerald-800 border-emerald-300");
  const [linkUrl, setLinkUrl] = useState("/jobs");
  const [linkText, setLinkText] = useState("Learn More");
  const [author, setAuthor] = useState("Platform Editorial");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [featureHighlights, setFeatureHighlights] = useState<FeatureHighlight[]>([
    { feature: "", desc: "" },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) {
      router.push("/");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("username", currentUser.username)
      .single();

    const allowedRoles = ["superadmin", "admin", "ceo", "jobadmin"];
    const normalizedRole = (profile?.role || "").toLowerCase().replace(/[\s_]+/g, "");

    if (!profile || !allowedRoles.includes(normalizedRole)) {
      router.push("/");
      return;
    }

    await fetchPosts();
    setLoading(false);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("news_feed_posts")
      .select("*")
      .order("published_at", { ascending: false });

    if (!error && data) {
      setPosts(data as NewsFeedPost[]);
    }
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("news_feed_posts")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      fetchPosts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news feed announcement?")) return;
    const { error } = await supabase.from("news_feed_posts").delete().eq("id", id);
    if (!error) {
      fetchPosts();
    }
  };

  const openNewModal = () => {
    setEditingPost(null);
    setTitle("");
    setSummary("");
    setCategory("Feature Release");
    setBadgeColor("bg-emerald-100 text-emerald-800 border-emerald-300");
    setLinkUrl("/companies");
    setLinkText("Explore Feature");
    setAuthor("Platform Editorial");
    setStatus("published");
    setFeatureHighlights([{ feature: "", desc: "" }]);
    setShowModal(true);
  };

  const openEditModal = (p: NewsFeedPost) => {
    setEditingPost(p);
    setTitle(p.title);
    setSummary(p.summary);
    setCategory(p.category);
    setBadgeColor(p.badge_color || "bg-emerald-100 text-emerald-800 border-emerald-300");
    setLinkUrl(p.link_url || "");
    setLinkText(p.link_text || "Learn More");
    setAuthor(p.author || "Platform Editorial");
    setStatus(p.status || "published");
    setFeatureHighlights(
      p.feature_highlights && p.feature_highlights.length > 0
        ? p.feature_highlights
        : [{ feature: "", desc: "" }]
    );
    setShowModal(true);
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
      status,
      published_at: editingPost?.published_at || new Date().toISOString(),
    };

    if (editingPost) {
      await supabase.from("news_feed_posts").update(payload).eq("id", editingPost.id);
    } else {
      await supabase.from("news_feed_posts").insert([payload]);
    }

    setSaving(false);
    setShowModal(false);
    fetchPosts();
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

  const filteredPosts = posts.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  const pendingCount = posts.filter((p) => p.status === "draft").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm font-semibold text-gray-500 animate-pulse">Loading News Feed Management...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      <div>
        <Navbar />
        <AdminQuickMenu />

        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Admin Dashboard</span>
                </Link>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-950 flex items-center gap-2.5">
                <Sparkles size={24} className="text-amber-500" />
                <span>News Feed Management & Approvals</span>
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                Approve, curate, and review user-facing feature announcements before they go live on the public feed.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={openNewModal}
                className="inline-flex items-center gap-1.5 bg-gray-950 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition"
              >
                <Plus size={15} />
                <span>New Announcement</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
            {[
              { id: "all", label: "All Posts", count: posts.length },
              { id: "draft", label: "Pending Approval", count: pendingCount },
              { id: "published", label: "Published Live", count: posts.length - pendingCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-2 ${
                  filter === tab.id
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    filter === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <AlertCircle size={32} className="mx-auto text-gray-400 mb-3" />
              <h3 className="text-base font-bold text-gray-900">No Announcements Found</h3>
              <p className="text-xs text-gray-500 mt-1">
                {filter === "draft"
                  ? "There are no pending draft announcements waiting for approval."
                  : "Click 'New Announcement' to draft your first feature release."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white border border-gray-200/90 rounded-2xl p-5 md:p-6 shadow-xs hover:border-gray-300 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          post.badge_color || "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        {post.category}
                      </span>
                      {post.status === "draft" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock size={11} /> Pending Approval
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={11} /> Published Live
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {post.status === "draft" && (
                        <button
                          onClick={() => handleApprove(post.id)}
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-xs"
                        >
                          <CheckCircle2 size={13} />
                          <span>Approve & Publish</span>
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(post)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg transition"
                        title="Delete post"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-950 mb-2">{post.title}</h3>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">{post.summary}</p>

                  {post.feature_highlights && post.feature_highlights.length > 0 && (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-3 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                        <Layers size={11} />
                        <span>Feature Breakdown</span>
                      </div>
                      {post.feature_highlights.map((f, i) => (
                        <div key={i} className="text-xs text-gray-700">
                          <strong className="text-gray-900 font-semibold">{f.feature}: </strong>
                          <span>{f.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                    <span>Author: {post.author || "Platform Editorial"}</span>
                    <span>
                      {new Date(post.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
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
                <label className="block font-semibold text-gray-700 mb-1">Summary (User-Facing)</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Provide a concise summary explaining what users can now do..."
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
                    <option value="Platform Update">Platform Update</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-gray-900"
                  >
                    <option value="published">Publish Live Immediately</option>
                    <option value="draft">Save as Draft (Require Approval)</option>
                  </select>
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
                  <label className="block font-semibold text-gray-700 mb-1">Link Button Text</label>
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
                        placeholder="Description (e.g. Search by residential or interior)"
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
                  <span>{saving ? "Saving..." : editingPost ? "Update Announcement" : "Save Announcement"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
