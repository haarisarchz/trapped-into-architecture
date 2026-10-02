// @ts-nocheck
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    // SECURITY: The API key is securely loaded server-side.
    // It checks standard variable names.
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

      let maxRetries = 1;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
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
          break; // break retry loop
        } catch (err: any) {
          lastError = err;
          const isQuota = err.status === 429 || err.status === 403 || (err.message && (err.message.toLowerCase().includes('quota') || err.message.toLowerCase().includes('429')));
          const is503 = err.status === 503 || (err.message && (err.message.includes('503') || err.message.includes('UNAVAILABLE')));
          
          if (isQuota) {
            console.log("Quota exceeded for key, switching to next key...");
            break; // Break inner retry loop, try next key
          } else if (is503 && attempt < maxRetries) {
            console.log(`503 High demand, retrying... (${attempt + 1})`);
            await new Promise(resolve => setTimeout(resolve, 1500));
          } else if (is503) {
            break; // exhausted retries, try next key just in case
          } else {
            throw err; // normal error, don't try other keys
          }
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
    
    let userMessage = "Failed to extract job details";
    
    try {
      if (error.message && error.message.includes('{')) {
        const parsed = JSON.parse(error.message);
        if (parsed.error && parsed.error.status === 'UNAVAILABLE') {
          userMessage = "AI extraction temporarily failed. Please try again.";
        } else if (parsed.error && parsed.error.message) {
          userMessage = "AI extraction temporarily failed. Please try again.";
        }
      } else if (error.message) {
        if (error.message.includes('fetch')) {
           userMessage = error.message;
        } else {
           userMessage = "AI extraction temporarily failed. Please try again.";
        }
      }
    } catch(e) {
      userMessage = error.message || "Failed to extract job details";
    }

    // Temporarily return the exact error message to debug the issue
    return NextResponse.json(
      { error: "Debug Error: " + (error.message || userMessage) },
      { status: 500 }
    );
  }
}
