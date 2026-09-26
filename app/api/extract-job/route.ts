import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    // SECURITY: The API key is securely loaded server-side.
    // It checks standard variable names.
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error("Gemini configuration is missing. Required environment variable: GEMINI_API_KEY");
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
  "company": "string (company name)",
  "city": "string",
  "state": "string",
  "description": "string (detailed general description about the company or all roles)",
  "employmentType": "string (normalized)",
  "workplaceType": "string (normalized)",
  "applicationEmail": "string (email if present)",
  "deadline": "string (YYYY-MM-DD if present)",
  "apply_link": "string (application link if present)",
  "positions": [
    {
      "position": "string (job title)",
      "experience": "string (e.g., 1-2 years)",
      "role": "string (e.g., Designer, Manager)",
      "salary": "string",
      "description": "string (details specific to this position)"
    }
  ]
}`;

    let result;
    let maxRetries = 2;
    let attempt = 0;
    
    while (attempt <= maxRetries) {
      try {
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
          
          const page = await fetch(url);
          const html = await page.text();
          const stripped = html.replace(/<script[\s\S]*?<\/script>/gmi, '')
                               .replace(/<style[\s\S]*?<\/style>/gmi, '')
                               .replace(/<[^>]+>/g, ' ');
          const fullPrompt = prompt + "\n\nWebsite Content to extract:\n" + stripped.substring(0, 15000);
          result = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: fullPrompt
          });
          
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
        
        // If it succeeds, break out of the retry loop
        break;
        
      } catch (err: any) {
        attempt++;
        const is503 = err.status === 503 || (err.message && err.message.includes('503')) || (err.message && err.message.includes('UNAVAILABLE'));
        if (is503 && attempt <= maxRetries) {
          console.log(`Gemini API 503 Error. Retrying attempt ${attempt}...`);
          await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1.5s
        } else {
          throw err; // throw standard error if it's not a 503 or we ran out of retries
        }
      }
    }

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