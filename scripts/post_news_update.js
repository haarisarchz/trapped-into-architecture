// scripts/post_news_update.js
// Utility script following strict feature-only, same-day deduplication rules

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bcifyymjfktabtsmocnc.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function postOrUpdateFeature({
  title,
  summary,
  category = "Feature Release",
  badge_color = "bg-emerald-100 text-emerald-800 border-emerald-300",
  feature_highlights = [],
  link_url = "/companies",
  link_text = "Explore Feature",
  author = "Platform Editorial",
  status = "published"
}) {
  console.log(`Checking for same-day existing feature post matching: "${title}"...`);

  // Start of current day (UTC)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  // Search if a post exists today with similar category or title
  const { data: todayPosts, error: searchError } = await supabase
    .from("news_feed_posts")
    .select("*")
    .gte("published_at", todayStart.toISOString())
    .eq("status", "published");

  let existingPost = null;
  if (!searchError && todayPosts && todayPosts.length > 0) {
    existingPost = todayPosts.find((p) => {
      const pTitle = (p.title || "").toLowerCase();
      const newTitle = title.toLowerCase();
      return pTitle === newTitle || p.category === category;
    });
  }

  if (existingPost) {
    console.log(`Found same-day post (ID: ${existingPost.id}). Merging updates into existing post...`);

    // Merge feature highlights without duplicates
    const currentHighlights = existingPost.feature_highlights || [];
    const mergedHighlights = [...currentHighlights];

    feature_highlights.forEach((newH) => {
      const idx = mergedHighlights.findIndex((h) => h.feature.toLowerCase() === newH.feature.toLowerCase());
      if (idx >= 0) {
        mergedHighlights[idx] = newH;
      } else {
        mergedHighlights.push(newH);
      }
    });

    const { data: updated, error: updateError } = await supabase
      .from("news_feed_posts")
      .update({
        title,
        summary,
        feature_highlights: mergedHighlights,
        link_url: link_url || existingPost.link_url,
        link_text: link_text || existingPost.link_text,
        published_at: new Date().toISOString()
      })
      .eq("id", existingPost.id)
      .select();

    if (updateError) {
      console.error("Failed to update same-day post:", updateError.message);
      return false;
    }

    console.log("Successfully updated same-day post:", updated[0]?.id);
    return updated[0];
  }

  // Otherwise, create a clean new feature announcement
  console.log("No same-day feature match found. Creating new announcement...");
  const { data, error } = await supabase.from("news_feed_posts").insert([
    {
      title,
      summary,
      category,
      badge_color,
      feature_highlights,
      link_url,
      link_text,
      author,
      published_at: new Date().toISOString(),
      status
    }
  ]).select();

  if (error) {
    console.error("Failed to post feature:", error.message);
    return false;
  }

  console.log("Successfully posted feature! Record ID:", data[0]?.id);
  return data[0];
}

module.exports = { postOrUpdateFeature };
