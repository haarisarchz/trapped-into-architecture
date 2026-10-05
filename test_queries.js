const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const id = "be004c9f-37e1-4995-9bdd-6cab4f3aac64"; // Blend Designs (Architect / Designer in Chennai)
    const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single();
    if (!job) { console.log("Job not found"); return; }
    
    let cleanPos = job.position || "";
    const pLower = cleanPos.toLowerCase();
    if (pLower.includes("junior architect")) cleanPos = "Junior Architect";
    else if (pLower.includes("senior architect")) cleanPos = "Senior Architect";
    else if (pLower.includes("architect")) cleanPos = "Architect";
    else if (cleanPos.includes("/") || cleanPos.includes("-")) cleanPos = cleanPos.split(/[\/-]/)[0].trim();

    console.log("job.city:", job.city);
    console.log("cleanPos:", cleanPos);

    const [cityRes, posRes, recRes] = await Promise.all([
        supabase.from("jobs").select("*").eq("status", "published").eq("city", job.city || "").neq("id", id).order("created_at", { ascending: false }).limit(3),
        supabase.from("jobs").select("*").eq("status", "published").ilike("position", `%${cleanPos}%`).neq("id", id).order("created_at", { ascending: false }).limit(3),
        supabase.from("jobs").select("*").eq("status", "published").neq("id", id).order("created_at", { ascending: false }).limit(3)
    ]);
    
    console.log("cityJobs:", cityRes.data ? cityRes.data.length : null, cityRes.error);
    console.log("positionJobs:", posRes.data ? posRes.data.length : null, posRes.error);
    console.log("recentJobs:", recRes.data ? recRes.data.length : null, recRes.error);
}
test();
