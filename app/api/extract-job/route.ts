import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured in the server environment variables." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const formData = await req.formData();
    const mode = formData.get("mode") as string; // 'text' or 'image'
    
    let prompt = `Extract the following architecture job details into strict JSON format. 
Return ONLY valid JSON. No markdown backticks, no explanations.
Schema:
{
  "position": "string (job title)",
  "company": "string (company name)",
  "experience": "string (e.g., 1-2 years)",
  "city": "string",
  "state": "string",
  "description": "string (detailed description)",
  "employmentType": "string (Full-time, Part-time, Internship, Contract)",
  "workplaceType": "string (On-site, Remote, Hybrid)",
  "applicationEmail": "string (email if present)",
  "deadline": "string (YYYY-MM-DD if present)"
}`;

    let result;

    if (mode === "text") {
      const text = formData.get("text") as string;
      if (!text) throw new Error("No text provided");
      
      const fullPrompt = prompt + "\\n\\nText to extract:\\n" + text;
      result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt
      });
      
    } else if (mode === "image") {
      const imageFile = formData.get("image") as File;
      if (!imageFile) throw new Error("No image provided");
      
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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
    if (!responseText) throw new Error("No response from AI");

    // Clean up markdown if any
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```json")) cleanedText = cleanedText.substring(7);
    else if (cleanedText.startsWith("```")) cleanedText = cleanedText.substring(3);
    if (cleanedText.endsWith("```")) cleanedText = cleanedText.substring(0, cleanedText.length - 3);

    const json = JSON.parse(cleanedText.trim());
    return NextResponse.json(json);

  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to extract job details" },
      { status: 500 }
    );
  }
}