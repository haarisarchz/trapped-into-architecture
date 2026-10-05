const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const id = "cec7ff73-91e0-4ecf-941f-077bfd9691ad"; // Anagram Architects
    const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single();
    console.log("Has Image:", !!job.image);
    
    // Let's manually trigger the social publish to see what the exact Meta API error is!
    const res = await fetch("https://www.trappedintoarchitecture.com/api/publish/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: id })
    });
    const text = await res.text();
    console.log("Meta API Response:", text);
}
test();
