import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

export async function GET(request: Request) {
  try {
    const propertyId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID; // or separate GA_PROPERTY_ID
    const credentialsBase64 = process.env.GA_SERVICE_ACCOUNT;

    if (!propertyId || !credentialsBase64) {
      return NextResponse.json({ error: "Analytics credentials not configured." }, { status: 400 });
    }

    // Decode credentials
    const credentialsJson = Buffer.from(credentialsBase64, "base64").toString("utf-8");
    const credentials = JSON.parse(credentialsJson);

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials,
    });

    // In a real app we need the Property ID (numeric), which is different from Measurement ID (G-XXXX).
    // Assuming propertyId is passed via env, else we try our best.
    const propertyToUse = process.env.GA_PROPERTY_ID || propertyId;

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyToUse}`,
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

    return NextResponse.json({
      users: activeUsers,
      sessions,
      pageViews,
    });
  } catch (error: any) {
    console.error("GA API error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

