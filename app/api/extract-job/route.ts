import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI extraction is not configured correctly. Please contact the administrator." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const formData = await req.formData();
    const mode = formData.get("mode") as string; // 'text', 'image', or 'url'
    
    let prompt = `Extract the following architecture job details into strict JSON format. 
Return ONLY valid JSON. No markdown backticks, no explanations. Do not fabricate or invent missing information. Use empty string "" if unavailable.

Normalize specific fields:
- Employment Type MUST be exactly one of: "Full-time", "Part-time", "Contract", "Temporary", "Freelance", "Internship". (Normalize "Full time", "fulltime" to "Full-time").
- Workplace Type MUST be exactly one of: "On-site", "Hybrid", "Remote / Work from Home". (Normalize "WFH", "Remote" to "Remote / Work from Home").

Schema:
{
  "position": "string (job title)",
  "company": "string (company name)",
  "experience": "string (e.g., 1-2 years)",
  "city": "string",
  "state": "string",
  "description": "string (detailed description)",
  "employmentType": "string (normalized)",
  "workplaceType": "string (normalized)",
  "applicationEmail": "string (email if present)",
  "deadline": "string (YYYY-MM-DD if present)",
  "apply_link": "string (application link if present)"
}`;

    let result;

    if (mode === "text") {
      const text = formData.get("text") as string;
      if (!text) throw new Error("No text provided");
      
      const fullPrompt = prompt + "\n\nText to extract:\n" + text;
      result = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: fullPrompt
      });
      
    } else if (mode === "url") {
      const url = formData.get("url") as string;
      if (!url) throw new Error("No URL provided");
      
      try {
        const page = await fetch(url);
        const html = await page.text();
        // Simple HTML strip to reduce tokens, preserving basic text
        const stripped = html.replace(/<script[\s\S]*?<\/script>/gmi, '')
                             .replace(/<style[\s\S]*?<\/style>/gmi, '')
                             .replace(/<[^>]+>/g, ' ');
        const fullPrompt = prompt + "\n\nWebsite Content to extract:\n" + stripped.substring(0, 15000); // Limit size
        result = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: fullPrompt
        });
      } catch (fetchError) {
        throw new Error("Could not fetch the URL. Please verify it is correct and publicly accessible.");
      }
      
    } else if (mode === "image") {
      const imageFile = formData.get("image") as File;
      if (!imageFile) throw new Error("Please upload a JPG, PNG, or supported image format.");
      
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      result = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          prompt,
          {
            inlineData: {
              data: buffer.toString("base64"),
              mimeType: imageFile.type,
            }
          }
        ]
      });
    } else {
      throw new Error("Invalid mode");
    }

    const responseText = result.text;
    if (!responseText) throw new Error("AI extraction temporarily failed. Please try again.");

    // Clean up markdown if any
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
    return NextResponse.json(
      { error: error.message || "Failed to extract job details" },
      { status: 500 }
    );
  }
}