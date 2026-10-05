const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const decodeUuid = (shortId) => {
  try {
    let num = 0n;
    for (let i = 0; i < shortId.length; i++) {
      const char = shortId[i];
      const val = BASE62.indexOf(char);
      if (val === -1) return null;
      num = num * 62n + BigInt(val);
    }
    let hex = num.toString(16).padStart(32, "0");
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  } catch (e) {
    return null;
  }
};

async function test() {
    const uuid = decodeUuid("5MwG5JgdtcKyEasffASJhy");
    console.log("Decoded UUID:", uuid);
    const { data: job, error } = await supabase.from("jobs").select("*").eq("id", uuid).single();
    console.log("Job exists:", !!job);
    if (error) console.log("Error:", error);
}
test();
