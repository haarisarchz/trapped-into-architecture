import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const prompt = `You are an expert HR assistant analyzing a job posting. 
Extract the following information and return ONLY a strict JSON object. Do not include markdown formatting like \`\`\`json.
Fields to extract:
- company (string, exact name)
- organization_type (string, e.g., "Architecture Firm", "Interior Design Studio", "Construction Company", "Developer", "Consultancy", etc.)
- firm_name (string, exact name, same as company if applicable)
- principalArchitect (string, name of the principal architect or founder if mentioned, otherwise leave empty)
- employeeSize (string, e.g., "1-10", "11-50", "50-200", etc., if mentioned, otherwise leave empty)
- city (string)
- state (string)
- area (string, neighborhood or micro-market if mentioned)
- zip (string)
- contact_person (string)
- email (string)
- phone (string)
- website (string)
- whatsapp (string)
- facebook (string)
- instagram (string)
- linkedin (string)
- twitter (string)
- employment_type (string, e.g., "Full-time", "Part-time", "Contract", "Internship")
- tags (array of strings, relevant keywords)
- application_deadline (string, YYYY-MM-DD or readable format)

CRITICAL: A single job poster might advertise MULTIPLE distinct roles (e.g. "Architecture Intern" AND "Interior Designer"). 
You MUST extract them as an array of objects under the "positions" key. Do NOT merge them into one.
- positions (array of objects, one for each distinct role):
    - position (string, exact job title)
    - vacancies (string or number, default to 1 if unspecified)
    - experience (array of strings, e.g., ["0-2 years", "5+ years"])
    - salary (string, exact salary range like "15k - 25k Per Month" or "4 - 6 LPA" or number if single value)
    - software (array of strings, e.g., ["AutoCAD", "Revit", "SketchUp", "Rhino"])
    - skills (array of strings, non-software skills like "Project Management", "Client Interaction")
    - qualifications (array of strings, e.g. ["B.Arch", "M.Arch"])
    - description (string, a brief summary of the specific role responsibilities)`;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const mode = formData.get("mode") as string;

    
    let apiKeyToUse = "";
    const userHeader = req.headers.get("x-user-gemini-key");

    if (userHeader) {
       const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userHeader.trim());
       if (!isUUID) {
           // It's a raw personal key
           apiKeyToUse = userHeader.trim();
       } else {
           // It's a UUID from the database (Shared Server)
           const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
           const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
           const authHeader = req.headers.get("Authorization") || "";
           
           // If we have a service role key, use it. Otherwise, use the user's auth token to pass RLS.
           let supabase;
           if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
               supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
           } else {
               supabase = createClient(supabaseUrl, anonKey, {
                   global: { headers: { Authorization: authHeader } }
               });
           }
           
           const { data, error } = await supabase.from('api_keys').select('key_value').eq('id', userHeader.trim()).single();
           if (error || !data) {
               console.error("Key lookup failed:", error);
               throw new Error("Assigned Shared Server key could not be found or is blocked by security rules.");
           }
           apiKeyToUse = data.key_value;
       }
    }

    if (!apiKeyToUse) {
       // Global fallback
       const envKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
       apiKeyToUse = envKey.split(",")[0].trim();
    }

    if (!apiKeyToUse) {
      throw new Error("No Gemini API key configured.");
    }

    const ai = new GoogleGenAI({ apiKey: apiKeyToUse });

    let parts = [];

    if (mode === "text") {
      const text = formData.get("text") as string;
      if (!text) throw new Error("No text provided");
      parts.push({ text: prompt + "\n\nHere is the raw text to extract:\n" + text });
    } else if (mode === "image") {
      const file = formData.get("image") as File;
      if (!file) throw new Error("No image provided");
      
      const arrayBuffer = await file.arrayBuffer();
      const base64String = Buffer.from(arrayBuffer).toString('base64');
      
      parts.push({ text: prompt });
      parts.push({
        inlineData: {
          mimeType: file.type || "image/jpeg",
          data: base64String
        }
      });
    } else {
      throw new Error("Invalid mode");
    }

    try {
      const res = await ai.models.generateContent({ model: "gemini-flash-latest", contents: parts });
      const output = res.text || "";
      const cleanedText = output.replace(/\x60\x60\x60json/g, "").replace(/\x60\x60\x60/g, "").trim();
      
      try {
        const json = JSON.parse(cleanedText);
        return NextResponse.json(json);
      } catch(e) {
        throw new Error("Information could not be structured correctly. Please try again.");
      }
    } catch (err: any) {
      const is503 = err?.status === 503 || (err?.message && (err.message.includes('503') || err.message.includes('UNAVAILABLE') || err.message.includes('busy')));
      if (is503) {
        throw new Error("Google AI servers are currently very busy. Please try again in a few minutes.");
      }
      
      const isQuota = err?.status === 429 || (err?.message && err.message.toLowerCase().includes('quota'));
      if (isQuota) {
        throw new Error("This specific AI key is out of quota. Please change the 'Server' dropdown to use a fresh key.");
      }
      
      throw err;
    }

  } catch (err: any) {
    console.error("Extraction error:", err);
    return NextResponse.json({ error: err.message || "Failed to extract" }, { status: 500 });
  }
}
