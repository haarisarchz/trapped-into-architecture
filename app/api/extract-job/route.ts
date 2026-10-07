import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { extractPrompt } from "./prompt";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const mode = formData.get("mode") as string;

    const envKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    const envKeys = envKey.split(",").map(k => k.trim()).filter(Boolean);
    const userKey = req.headers.get("x-user-gemini-key");
    
    const availableKeys = [];
    if (userKey) availableKeys.push(userKey);
    availableKeys.push(...envKeys);

    if (availableKeys.length === 0) {
      throw new Error("No Gemini API key configured.");
    }

    // THE FIX: Pick exactly ONE random key per request. 
    // This distributes the quota perfectly, but prevents the dreaded Vercel 10-second timeout 
    // caused by testing 5 keys sequentially.
    const apiKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
    const ai = new GoogleGenAI({ apiKey });

    let parts = [];

    if (mode === "text") {
      const text = formData.get("text") as string;
      if (!text) throw new Error("No text provided");
      parts.push({ text: extractPrompt + "\n\nHere is the raw text to extract:\n" + text });
    } else if (mode === "image") {
      const file = formData.get("image") as File;
      if (!file) throw new Error("No image provided");
      
      const arrayBuffer = await file.arrayBuffer();
      const base64String = Buffer.from(arrayBuffer).toString('base64');
      
      parts.push({ text: extractPrompt });
      parts.push({
        inlineData: {
          mimeType: file.type || "image/jpeg",
          data: base64String
        }
      });
    } else {
      throw new Error("Invalid mode");
    }

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    try {
      const res = await model.generateContent(parts);
      const output = res.text;
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
        throw new Error("Google AI servers are currently very busy. Please click Extract again.");
      }
      
      const isQuota = err?.status === 429 || (err?.message && err.message.toLowerCase().includes('quota'));
      if (isQuota) {
        throw new Error("This specific AI key is out of quota. Please click Extract again to use a fresh key.");
      }
      
      throw err;
    }

  } catch (err: any) {
    console.error("Extraction error:", err);
    return NextResponse.json({ error: err.message || "Failed to extract" }, { status: 500 });
  }
}
