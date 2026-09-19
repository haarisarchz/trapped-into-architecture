import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

export async function GET(request: Request) {
  try {
    const propertyId = process.env.GA_PROPERTY_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const credentialsEnv = process.env.GA_SERVICE_ACCOUNT;

    if (!propertyId || !credentialsEnv) {
      return NextResponse.json({ error: "Analytics credentials (GA_PROPERTY_ID or GA_SERVICE_ACCOUNT) not configured in Vercel." }, { status: 400 });
    }

    if (propertyId.startsWith("G-")) {
      return NextResponse.json({ error: "GA_PROPERTY_ID must be a numeric Property ID (e.g. 123456789), not a Measurement ID (G-XXXX)." }, { status: 400 });
    }

    let credentials;
    try {
      // Try parsing as raw JSON first
      credentials = JSON.parse(credentialsEnv);
    } catch (e) {
      // If that fails, try base64 decode
      try {
        const decoded = Buffer.from(credentialsEnv, "base64").toString("utf-8");
        credentials = JSON.parse(decoded);
      } catch (err) {
        return NextResponse.json({ error: "GA_SERVICE_ACCOUNT is neither valid JSON nor valid Base64." }, { status: 400 });
      }
    }

    const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" }
      ],
    });

    const activeUsers = response.rows?.[0]?.metricValues?.[0]?.value || 0;
    const sessions = response.rows?.[0]?.metricValues?.[1]?.value || 0;
    const pageViews = response.rows?.[0]?.metricValues?.[2]?.value || 0;

    return NextResponse.json({ users: activeUsers, sessions, pageViews });
  } catch (error: any) {
    console.error("GA API error:", error.message);
    return NextResponse.json({ error: "Google Analytics API Error: " + error.message }, { status: 500 });
  }
}
