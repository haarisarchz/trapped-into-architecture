import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bcifyymjfktabtsmocnc.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y";

// Use service_role key if configured on the server, otherwise fallback to anonKey
export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey || anonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);
