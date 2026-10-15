import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') || '30';
    
    let startDate = `${days}daysAgo`;
    if (days === '1h') {
      startDate = 'today'; // Fallback for standard report. Note: GA4 standard reports have latency.
    } else if (days === '1') {
      startDate = '1daysAgo';
    } else if (days === 'lifetime' || days === 'all') {
      startDate = '2015-08-14'; // Beginning of GA property lifetime
    }


    const propertyId = process.env.GA_PROPERTY_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const credentialsEnv = process.env.GA_SERVICE_ACCOUNT;

    if (!propertyId || !credentialsEnv) {
      return NextResponse.json({ error: "Analytics credentials not configured." }, { status: 400 });
    }

    let credentials;
    try {
      credentials = JSON.parse(credentialsEnv);
    } catch (e) {
      try {
        const decoded = Buffer.from(credentialsEnv, "base64").toString("utf-8");
        credentials = JSON.parse(decoded);
      } catch (err) {
        return NextResponse.json({ error: "GA_SERVICE_ACCOUNT is invalid." }, { status: 400 });
      }
    }

    const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
    const property = `properties/${propertyId}`;
    const dateRanges = [{ startDate, endDate: "today" }];

    // 1. Overview Metrics
    const overviewReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }, { name: "averageSessionDuration" }, { name: "bounceRate" }],
    });

    // 2. By Country
    const countryReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    });

    // 3. By Browser
    const browserReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "browser" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    });

    // 4. Top Pages
    const pagesReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "pageTitle" }, { name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: {
        notExpression: {
          filter: {
            fieldName: "pagePath",
            stringFilter: {
              matchType: "BEGINS_WITH",
              value: "/admin"
            }
          }
        }
      },
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 15,
    });
    
    // 5. Traffic Sources (Session Source/Medium)
    const sourcesReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    });

    // Execute all in parallel
    
    // 6. By City
    const cityReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "city" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    });

    // 7. By Device
    const deviceReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    });

    // 8. Realtime Users (Last 30 minutes)
    const realtimeReq = analyticsDataClient.runRealtimeReport({
      property,
      metrics: [{ name: "activeUsers" }],
    }).catch(err => {
      console.warn("Realtime API error:", err.message);
      return [{ rows: [] }]; // Fallback if realtime fails
    });

    // 9. Event Conversions (apply_click, email_click, contact_click, share_click, save_click)
    const eventsReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 30,
    }).catch(err => {
      console.warn("GA events error:", err.message);
      return [{ rows: [] }];
    });

    // 10. Supabase Engagement Stats (Shares, Saves, Top Engaged Jobs)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    let totalShares = 0;
    let totalSaves = 0;
    let topEngagedJobs: any[] = [];
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const sb = createClient(supabaseUrl, supabaseAnonKey);
        const { data: jobsStats } = await sb
          .from("jobs")
          .select("id, position, firm_name, share_count, save_count")
          .eq("status", "published")
          .order("share_count", { ascending: false })
          .limit(8);

        if (jobsStats) {
          totalShares = jobsStats.reduce((sum, j) => sum + (j.share_count || 0), 0);
          totalSaves = jobsStats.reduce((sum, j) => sum + (j.save_count || 0), 0);
          topEngagedJobs = jobsStats.filter(j => (j.share_count || 0) > 0 || (j.save_count || 0) > 0);
        }
      } catch (sbErr) {
        console.warn("Supabase analytics stats error:", sbErr);
      }
    }

    // Execute all in parallel
    const [overviewRes, countryRes, browserRes, pagesRes, sourcesRes, cityRes, deviceRes, realtimeRes, eventsRes] = await Promise.all([
      overviewReq, countryReq, browserReq, pagesReq, sourcesReq, cityReq, deviceReq, realtimeReq, eventsReq
    ]);

    // Parse Data
    const parseRows = (res: any, dimKeys: string[], metricKeys: string[]) => {
      return (res[0]?.rows || []).map((row: any) => {
        const obj: any = {};
        dimKeys.forEach((key, i) => { obj[key] = row.dimensionValues?.[i]?.value; });
        metricKeys.forEach((key, i) => { obj[key] = Number(row.metricValues?.[i]?.value || 0); });
        return obj;
      });
    };

    const rawEvents = parseRows(eventsRes, ["event"], ["count"]);
    const eventsMap: Record<string, number> = {};
    rawEvents.forEach((ev: any) => {
      eventsMap[ev.event] = ev.count;
    });

    const conversions = {
      applyClicks: eventsMap["apply_click"] || 0,
      emailClicks: eventsMap["email_click"] || 0,
      contactClicks: eventsMap["contact_click"] || 0,
      shareClicks: eventsMap["share_click"] || totalShares,
      saveClicks: eventsMap["save_click"] || totalSaves,
      totalShares,
      totalSaves,
      topEngagedJobs,
      rawEvents
    };

    const bounceVal = Number(overviewRes[0]?.rows?.[0]?.metricValues?.[4]?.value || 0);
    const bouncePercent = Math.round(bounceVal * 100);

    return NextResponse.json({
      overview: {
        realtimeUsers: realtimeRes[0]?.rows?.[0]?.metricValues?.[0]?.value || 0,
        activeUsers: overviewRes[0]?.rows?.[0]?.metricValues?.[0]?.value || 0,
        sessions: overviewRes[0]?.rows?.[0]?.metricValues?.[1]?.value || 0,
        pageViews: overviewRes[0]?.rows?.[0]?.metricValues?.[2]?.value || 0,
        avgSessionDuration: overviewRes[0]?.rows?.[0]?.metricValues?.[3]?.value || 0,
        bounceRate: bouncePercent ? `${bouncePercent}%` : "0%",
      },
      conversions,
      countries: parseRows(countryRes, ["country"], ["users"]),
      browsers: parseRows(browserRes, ["browser"], ["users"]),
      pages: parseRows(pagesRes, ["title", "path"], ["views"]),
      sources: parseRows(sourcesRes, ["source"], ["sessions"]),
      cities: parseRows(cityRes, ["city"], ["users"]),
      devices: parseRows(deviceRes, ["deviceCategory"], ["users"])
    });

  } catch (error: any) {
    console.error("GA API error:", error.message);
    return NextResponse.json({ error: "Google Analytics API Error: " + error.message }, { status: 500 });
  }
}
