import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

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
- position (string)
- vacancies (string or number)
- experience (array of strings, e.g., ["0-2 years", "5+ years"])
- employment_type (string, e.g., "Full-time", "Part-time", "Contract", "Internship")
- min_salary (number)
- max_salary (number)
- software (array of strings, e.g., ["AutoCAD", "Revit", "SketchUp", "Rhino"])
- skills (array of strings, non-software skills like "Project Management", "Client Interaction")
- tags (array of strings, relevant keywords)
- application_deadline (string, YYYY-MM-DD or readable format)
- qualifications (array of strings)
- description (string, a brief summary of the role)`;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const mode = formData.get("mode") as string;

    const envKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    const availableKeys = envKey.split(",").map(k => k.trim()).filter(Boolean);
    
    if (availableKeys.length === 0) {
      throw new Error("No Gemini API key configured.");
    }

    // RANDOM KEY SELECTION (Quota Distribution)
    // By randomly picking ONE key per request, we mathematically distribute the API load across all your accounts.
    // This perfectly combines their quotas while completely avoiding the Vercel 10s timeout!
    const singleKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
    const ai = new GoogleGenAI({ apiKey: singleKey });

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
      const res = await ai.models.generateContent({ model: "gemini-1.5-flash-8b", contents: parts });
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
        throw new Error("This specific AI key is out of quota. Please click 'Smart Job Upload' again to automatically grab a fresh key from your list.");
      }
      
      throw err;
    }

  } catch (err: any) {
    console.error("Extraction error:", err);
    return NextResponse.json({ error: err.message || "Failed to extract" }, { status: 500 });
  }
}
