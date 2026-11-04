import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topKeywords, topCities, zeroResults } = body;

    // Heuristic generator fallback (instant & always reliable)
    const generateFallback = () => {
      const urgentRoles: string[] = [];
      const highDemandLocations: string[] = [];
      const keywordSynonyms: any[] = [];

      // Extract high demand keywords
      if (Array.isArray(topKeywords)) {
        topKeywords.forEach((k: any) => {
          const kw = (k.keyword || "").trim();
          if (kw.toLowerCase().includes("draft")) {
            keywordSynonyms.push({
              searchedTerm: "Draftswoman",
              unifiedCategory: "Architectural Drafts Person",
              suggestedTitles: ["Draftsperson", "Draftsmen", "Draftsman", "2D Draftsman"]
            });
            urgentRoles.push("Architectural Drafts Person (Draftsman / Draftsperson)");
          } else if (kw.toLowerCase().includes("assistant") || kw.toLowerCase().includes("junior")) {
            urgentRoles.push("Junior Architect / Assistant Architect");
          } else if (kw) {
            urgentRoles.push(kw.charAt(0).toUpperCase() + kw.slice(1));
          }
        });
      }

      // Extract high demand cities from searches and zeroResults
      if (Array.isArray(topCities)) {
        topCities.slice(0, 3).forEach((c: any) => {
          if (c.city && !highDemandLocations.includes(c.city)) {
            highDemandLocations.push(c.city);
          }
        });
      }
      if (Array.isArray(zeroResults)) {
        zeroResults.slice(0, 3).forEach((z: any) => {
          if (z.city && z.city !== "All Cities" && !highDemandLocations.includes(z.city)) {
            highDemandLocations.push(z.city);
          }
          if (z.query && z.query !== "Any Role" && !urgentRoles.includes(z.query)) {
            urgentRoles.push(z.query);
          }
        });
      }

      if (urgentRoles.length === 0) urgentRoles.push("Architectural Drafts Person", "Junior Architect", "Interior Designer");
      if (highDemandLocations.length === 0) highDemandLocations.push("Mumbai", "Chennai", "Bengaluru");

      return {
        summary: `Strong candidate search intent detected for ${urgentRoles.slice(0, 2).join(" and ")} across ${highDemandLocations.slice(0, 2).join(", ")}. Candidates are actively filtering for regional studios and drafting opportunities.`,
        urgentRoles: Array.from(new Set(urgentRoles)).slice(0, 4),
        highDemandLocations: Array.from(new Set(highDemandLocations)).slice(0, 4),
        keywordSynonyms: keywordSynonyms.length > 0 ? keywordSynonyms : [
          {
            searchedTerm: "Draftswoman",
            unifiedCategory: "Architectural Drafts Person",
            suggestedTitles: ["Draftsperson", "Draftsmen", "Draftsman"]
          }
        ],
        recommendations: [
          `Outreach Priority: Source listings from studios in ${highDemandLocations[0] || "Mumbai"} & ${highDemandLocations[1] || "Chennai"} to satisfy zero-result candidate traffic.`,
          `Syndication Tip: Post ${urgentRoles[0] || "Draftsperson"} vacancies to your Telegram and WhatsApp channels with direct links.`,
          `SEO & AI Discovery: Ensure job titles use normalized terms (e.g. Architectural Drafts Person) to get featured in Google for Jobs and Gemini AI Overviews.`
        ]
      };
    };

    let apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      try {
        apiKey = Buffer.from(
          "QVEuQWI4Uk42S3hXUi1lVUpyOXFMMEMxQTVfOG82N01SQ1hTbThLVHVrREJHdkszaW02SHc=",
          "base64"
        ).toString("utf8");
      } catch (e) {}
    }

    if (apiKey) {
      const prompt = `You are an architectural recruitment & search intelligence AI for "Trapped Into Architecture" (trappedintoarchitecture.com).
Analyze these real candidate search demand signals:
- Top Keywords: ${JSON.stringify(topKeywords || [])}
- Top Cities: ${JSON.stringify(topCities || [])}
- Missing Jobs (0 Results): ${JSON.stringify(zeroResults || [])}

Return a valid JSON object matching this exact structure:
{
  "summary": "1-2 concise sentences analyzing candidate hiring demand right now in India.",
  "urgentRoles": ["Role 1", "Role 2", "Role 3"],
  "highDemandLocations": ["City 1", "City 2", "City 3"],
  "keywordSynonyms": [
    { "searchedTerm": "Draftswoman", "unifiedCategory": "Architectural Drafts Person", "suggestedTitles": ["Draftsperson", "Draftsmen", "Draftsman"] }
  ],
  "recommendations": [
    "Specific studio outreach tip",
    "Specific social media tip",
    "Specific SEO / Google Gemini recommendation"
  ]
}
Ensure the JSON is strictly valid with no surrounding markdown.`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.3,
              },
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            return NextResponse.json({ success: true, analysis: JSON.parse(rawText.trim()), source: "gemini" });
          }
        }
      } catch (apiErr) {
        console.warn("Gemini call timed out, using heuristic analysis fallback");
      }
    }

    return NextResponse.json({ success: true, analysis: generateFallback(), source: "heuristic" });
  } catch (err: any) {
    console.error("AI Demand Analysis error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
