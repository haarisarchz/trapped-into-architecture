// scripts/post_news_update.js
// Utility script to automatically post a consolidated feature announcement to Supabase

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bcifyymjfktabtsmocnc.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function postUpdate({
  title,
  summary,
  category = "Feature Release",
  badge_color = "bg-emerald-100 text-emerald-800 border-emerald-300",
  feature_highlights = [],
  link_url = "/companies",
  link_text = "Explore Feature",
  author = "Platform Editorial",
  status = "draft" // Default to draft so admin must review & approve before public display
}) {
  console.log(`Staging draft announcement for admin approval: "${title}"...`);

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
    console.error("Failed to stage update:", error.message);
    return false;
  }

  console.log("Successfully staged draft announcement! Record ID:", data[0]?.id);
  return data[0];
}

module.exports = { postUpdate };

// Allow executing directly via node scripts/post_news_update.js
if (require.main === module) {
  const args = process.argv.slice(2);
  const title = args[0] || "New Platform Improvements Released";
  const summary = args[1] || "Performance enhancements, updated job directories, and refined UI components.";
  
  postUpdate({
    title,
    summary,
    feature_highlights: [
      { feature: "UI Refinements", desc: "Two-column responsive feed and quick directory access." }
    ]
  }).then(() => {
    // allow event loop to drain cleanly
  }).catch((err) => {
    console.error(err);
  });
}
