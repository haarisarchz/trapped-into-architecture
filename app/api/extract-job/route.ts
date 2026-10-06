// @ts-nocheck
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    // SECURITY: The API key is securely loaded server-side.
    // It checks standard variable names.
    
    const formData = await req.formData();
    const mode = formData.get("mode") as string;
    
    const prompt = `You are an expert HR assistant analyzing a job posting. 
Extract the following information and return ONLY a strict JSON object. Do not include markdown formatting like \`\`\`json.
Fields to extract:
- company (string, exact name)
- organization_type (string, usually "Firm", "Company", "Studio")
- city (string)
- state (string)
- description (string, concise summary of the firm or overall role)
- employmentType (string, e.g., "Full Time", "Part Time", "Contract", "Internship")
- workplaceType (string, e.g., "Remote", "On-site", "Hybrid")
- positions (array of objects, each containing):
  - position (string, e.g., "Junior Architect", "Interior Designer")
  - role (string, brief 1-2 line summary of what this specific role entails)
  - description (string, detailed job description, responsibilities, and requirements for this specific role)
  - vacancies (string, the number of openings, e.g., "2", "3-5", leave empty if not specified)
  - experience (array of strings, e.g., ["1-2 Years", "Fresher"])
  - salary (string, e.g., "₹ 3,00,000 PA", "Based on experience")
  - qualifications (array of strings, e.g., ["B.Arch", "M.Arch"])
  - skills (array of strings, e.g., ["AutoCAD", "SketchUp", "Revit"])

If the text contains multiple roles (e.g. Hiring Junior Architect and 3D Visualizer), add each to the positions array.
If any field is missing, return an empty string or empty array as appropriate.`;

const envKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    const envKeys = envKey.split(",").map(k => k.trim()).filter(Boolean);
    
    const userKey = req.headers.get("x-user-gemini-key");
    const availableKeys = [];
    if (userKey) availableKeys.push(userKey);
    availableKeys.push(...envKeys);

    if (availableKeys.length === 0) {
      console.error("Gemini configuration is missing.");
      return NextResponse.json(
        { error: "AI extraction is not configured correctly. Please contact the administrator." },
        { status: 500 }
      );
    }

    let result;
    let lastError;
    let success = false;

    for (const apiKey of availableKeys) {
      if (success) break;
      const ai = new GoogleGenAI({ apiKey });

      try {
        if (mode === "text") {
          const text = formData.get("text") as string;
          if (!text) throw new Error("No text provided");
          const fullPrompt = prompt + "\n\nText to extract:\n" + text;
          result = await ai.models.generateContent({ model: "gemini-flash-latest", contents: fullPrompt });
        } else if (mode === "url") {
          const url = formData.get("url") as string;
          const res = await fetch(url);
          const html = await res.text();
          const stripped = html.replace(/<script[\s\S]*?<\/script>/gmi, '')
                               .replace(/<style[\s\S]*?<\/style>/gmi, '')
                               .replace(/<[^>]+>/g, ' ');
          const fullPrompt = prompt + "\n\nWebsite Content to extract:\n" + stripped.substring(0, 15000);
          result = await ai.models.generateContent({ model: "gemini-flash-latest", contents: fullPrompt });
        } else if (mode === "image") {
          const imageFile = formData.get("image") as File;
          const arrayBuffer = await imageFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          result = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: [
              prompt,
              { inlineData: { data: buffer.toString("base64"), mimeType: imageFile.type } }
            ]
          });
        } else {
          throw new Error("Invalid mode");
        }
        
        success = true;
      } catch (err: any) {
        lastError = err;
        const isQuota = err.status === 429 || err.status === 403 || (err.message && (err.message.toLowerCase().includes('quota') || err.message.toLowerCase().includes('429')));
        const is503 = err.status === 503 || (err.message && (err.message.includes('503') || err.message.includes('UNAVAILABLE') || err.message.includes('busy')));
        
        if (isQuota) {
          console.log("Quota exceeded for key, instantly switching to next key...");
          continue; // Instantly skip to the next API key
        } else if (is503) {
          // If Google is globally overloaded, switching keys will not help and will just hit Vercel's 10s timeout.
          throw new Error("Google AI servers are currently extremely busy. Please try again in 1 minute.");
        } else {
          throw err; // normal error, abort instantly
        }
      }
    }

    if (!success) throw lastError;

    const responseText = result.text;
    if (!responseText) throw new Error("AI extraction temporarily failed. Please try again.");

    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```json")) cleanedText = cleanedText.substring(7);
    else if (cleanedText.startsWith("```")) cleanedText = cleanedText.substring(3);
    if (cleanedText.endsWith("```")) cleanedText = cleanedText.substring(0, cleanedText.length - 3);

    try {
      const json = JSON.parse(cleanedText.trim());
      return NextResponse.json(json);
    } catch(e) {
      throw new Error("Information could not be structured correctly. Please try again.");
    }

    } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    
    let userMessage = error.message || "Failed to extract job details";
    
    try {
      if (error.message && error.message.includes('{')) {
        const parsed = JSON.parse(error.message);
        if (parsed.error && parsed.error.status === 'UNAVAILABLE') {
          userMessage = "Google AI servers are extremely busy. Please try again in 1 minute.";
        } else if (parsed.error && parsed.error.message) {
          userMessage = parsed.error.message;
        }
      }
    } catch(e) {
      // Ignored
    }

    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}
