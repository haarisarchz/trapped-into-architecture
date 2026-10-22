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
      startDate = 'today';
    } else if (days === '1') {
      startDate = '1daysAgo';
    } else if (days === 'lifetime' || days === 'all') {
      startDate = '2015-08-14';
    }

    // Determine timestamp cutoff for database queries
    const now = new Date();
    let sinceDate: string | null = null;
    if (days === '1h') {
      sinceDate = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    } else if (days === '1') {
      sinceDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    } else if (days === '7') {
      sinceDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (days === '30') {
      sinceDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (days === '90') {
      sinceDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    } else if (days === '365') {
      sinceDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
    } else {
      sinceDate = null; // lifetime
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

    // 5B. Acquisition Channels (Direct, Organic Social, Organic Search, Referral)
    const channelsReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    }).catch(() => [{ rows: [] }]);

    // 5C. Referring Domains & Apps (WhatsApp, Instagram, LinkedIn, etc.)
    const referrersReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "pageReferrer" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 12,
    }).catch(() => [{ rows: [] }]);

    // 5D. Top Entry Doors (Landing Pages)
    const landingPagesReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "landingPagePlusQueryString" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }).catch(() => [{ rows: [] }]);

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
      return [{ rows: [] }];
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

    // 10. Supabase Real-Time Engagement (Shares & Saves strictly within the selected time window)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    
    let periodShares = 0;
    let periodSaves = 0;
    let adminSharesCount = 0;
    let candidateSharesCount = 0;
    let totalLifetimeShares = 0;
    let totalLifetimeSaves = 0;
    let topSharedJobs: any[] = [];
    let recentJobs: any[] = [];

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const sb = createClient(supabaseUrl, supabaseAnonKey);

        // A. Query timestamped shares from job_shares table
        let sharesQuery = sb.from("job_shares").select("id, job_id, user_id, user_name, user_role, platform, created_at");
        if (sinceDate) {
          sharesQuery = sharesQuery.gte("created_at", sinceDate);
        }
        const { data: sharesData, error: sharesErr } = await sharesQuery.order("created_at", { ascending: false });

        // B. Query timestamped saves from saved_jobs table
        let savesQuery = sb.from("saved_jobs").select("id, job_id, user_id, created_at");
        if (sinceDate) {
          savesQuery = savesQuery.gte("created_at", sinceDate);
        }
        const { data: savesData, error: savesErr } = await savesQuery.order("created_at", { ascending: false });

        // Group activity per job_id
        const jobActivityMap: Record<string, {
          shares: number;
          adminShares: number;
          candidateShares: number;
          saves: number;
          latestActivity: string;
          whoShared: string[];
          platforms: string[];
        }> = {};

        if (sharesData && sharesData.length > 0) {
          periodShares = sharesData.length;
          sharesData.forEach((s: any) => {
            const role = (s.user_role || "guest").toLowerCase().trim();
            const isAdmin = ["superadmin", "admin", "jobadmin", "ceo"].includes(role);
            if (isAdmin) {
              adminSharesCount++;
            } else {
              candidateSharesCount++;
            }

            if (!jobActivityMap[s.job_id]) {
              jobActivityMap[s.job_id] = {
                shares: 0,
                adminShares: 0,
                candidateShares: 0,
                saves: 0,
                latestActivity: s.created_at || new Date().toISOString(),
                whoShared: [],
                platforms: [],
              };
            }
            jobActivityMap[s.job_id].shares++;
            if (isAdmin) {
              jobActivityMap[s.job_id].adminShares++;
            } else {
              jobActivityMap[s.job_id].candidateShares++;
            }

            const shareLabel = isAdmin 
              ? `Admin (${s.user_name || "Admin"})` 
              : s.user_name ? `Candidate (${s.user_name})` : "Guest / Public";

            if (!jobActivityMap[s.job_id].whoShared.includes(shareLabel)) {
              jobActivityMap[s.job_id].whoShared.push(shareLabel);
            }
            if (s.platform && !jobActivityMap[s.job_id].platforms.includes(s.platform)) {
              jobActivityMap[s.job_id].platforms.push(s.platform);
            }
            if (s.created_at && (!jobActivityMap[s.job_id].latestActivity || new Date(s.created_at) > new Date(jobActivityMap[s.job_id].latestActivity))) {
              jobActivityMap[s.job_id].latestActivity = s.created_at;
            }
          });
        }

        if (savesData && savesData.length > 0) {
          periodSaves = savesData.length;
          savesData.forEach((sv: any) => {
            if (!jobActivityMap[sv.job_id]) {
              jobActivityMap[sv.job_id] = {
                shares: 0,
                adminShares: 0,
                candidateShares: 0,
                saves: 0,
                latestActivity: sv.created_at || new Date().toISOString(),
                whoShared: [],
                platforms: [],
              };
            }
            jobActivityMap[sv.job_id].saves++;
            if (sv.created_at && (!jobActivityMap[sv.job_id].latestActivity || new Date(sv.created_at) > new Date(jobActivityMap[sv.job_id].latestActivity))) {
              jobActivityMap[sv.job_id].latestActivity = sv.created_at;
            }
          });
        }

        // Fetch job metadata for active jobs
        const activeJobIds = Object.keys(jobActivityMap);
        if (activeJobIds.length > 0) {
          const { data: jobMeta } = await sb
            .from("jobs")
            .select("id, position, firm_name, city, state, share_count, save_count, posted_date")
            .in("id", activeJobIds);

          if (jobMeta) {
            const enriched = jobMeta.map(j => {
              const act = jobActivityMap[j.id] || { 
                shares: 0, adminShares: 0, candidateShares: 0, saves: 0, 
                latestActivity: j.posted_date || new Date().toISOString(), whoShared: [], platforms: [] 
              };
              return {
                ...j,
                period_shares: act.shares,
                admin_shares: act.adminShares,
                candidate_shares: act.candidateShares,
                period_saves: act.saves,
                latest_activity: act.latestActivity,
                who_shared: act.whoShared,
                platforms: act.platforms,
                location: [j.city, j.state].filter(Boolean).join(", ") || "Location not set",
              };
            });

            // Top Shared: sorted by period shares descending, then saves
            topSharedJobs = [...enriched].sort((a, b) => (b.period_shares - a.period_shares) || (b.period_saves - a.period_saves));

            // Recent Jobs: sorted by latest activity timestamp descending
            recentJobs = [...enriched].sort((a, b) => new Date(b.latest_activity).getTime() - new Date(a.latest_activity).getTime());
          }
        }

        // Fetch all-time published jobs baseline for fallback & total lifetime numbers
        const { data: allJobsStats } = await sb
          .from("jobs")
          .select("id, position, firm_name, city, state, share_count, save_count, posted_date")
          .eq("status", "published")
          .order("share_count", { ascending: false });

        if (allJobsStats && allJobsStats.length > 0) {
          totalLifetimeShares = allJobsStats.reduce((sum, j) => sum + (j.share_count || 0), 0);
          totalLifetimeSaves = allJobsStats.reduce((sum, j) => sum + (j.save_count || 0), 0);

          // If topSharedJobs has 0 entries (e.g. before any new shares were logged in the new table), fallback to historical shared jobs
          if (days === 'lifetime' || days === 'all' || topSharedJobs.length === 0) {
            const fallbackJobs = allJobsStats
              .filter(j => (j.share_count || 0) > 0 || (j.save_count || 0) > 0)
              .map(j => ({
                ...j,
                period_shares: j.share_count || 0,
                admin_shares: 0,
                candidate_shares: j.share_count || 0,
                period_saves: j.save_count || 0,
                latest_activity: j.posted_date || new Date().toISOString(),
                who_shared: ["Organic"],
                platforms: ["whatsapp"],
                location: [j.city, j.state].filter(Boolean).join(", ") || "Location not set",
              }));

            if (topSharedJobs.length === 0) {
              topSharedJobs = fallbackJobs;
              recentJobs = [...fallbackJobs].sort((a, b) => new Date(b.posted_date || 0).getTime() - new Date(a.posted_date || 0).getTime());
            }
          }
        }

        // B. Query On-Site Search Keywords & Zero-Result Searches from site_searches
        let sQuery = sb.from("site_searches").select("id, search_query, city, state, position, results_count, created_at");
        if (sinceDate) {
          sQuery = sQuery.gte("created_at", sinceDate);
        }
        const { data: sData } = await sQuery.order("created_at", { ascending: false }).limit(200);

        if (sData && sData.length > 0) {
          totalSearchesCount = sData.length;
          const kwMap: Record<string, { count: number; totalResults: number }> = {};
          const cityMap: Record<string, number> = {};
          const zeroMap: Record<string, { query: string; city: string; count: number; date: string }> = {};

          sData.forEach((row: any) => {
            const kw = (row.search_query || "").trim().toLowerCase();
            if (kw) {
              if (!kwMap[kw]) kwMap[kw] = { count: 0, totalResults: 0 };
              kwMap[kw].count++;
              kwMap[kw].totalResults += (row.results_count || 0);
            }

            const c = (row.city || "").trim();
            if (c) {
              cityMap[c] = (cityMap[c] || 0) + 1;
            }

            if ((row.results_count || 0) === 0 && (kw || c)) {
              const zeroKey = `${kw}__${c}`;
              if (!zeroMap[zeroKey]) {
                zeroMap[zeroKey] = { query: row.search_query || "Any Role", city: row.city || "All Cities", count: 0, date: row.created_at };
              }
              zeroMap[zeroKey].count++;
            }
          });

          topSearchKeywords = Object.entries(kwMap)
            .map(([keyword, stat]) => ({ keyword, count: stat.count, avgResults: Math.round(stat.totalResults / stat.count) }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

          topSearchedCities = Object.entries(cityMap)
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

          zeroResultSearches = Object.values(zeroMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);
        }
      } catch (sbErr) {
        console.warn("Supabase analytics stats error:", sbErr);
      }
    }

    // Execute GA queries
    const [overviewRes, countryRes, browserRes, pagesRes, sourcesRes, cityRes, deviceRes, realtimeRes, eventsRes, channelsRes, referrersRes, landingPagesRes] = await Promise.all([
      overviewReq, countryReq, browserReq, pagesReq, sourcesReq, cityReq, deviceReq, realtimeReq, eventsReq, channelsReq, referrersReq, landingPagesReq
    ]);

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

    // If lifetime selected, use total lifetime counts. Otherwise use period counts or GA events
    const finalShareCount = (days === 'lifetime' || days === 'all')
      ? totalLifetimeShares
      : (periodShares > 0 ? periodShares : (eventsMap["share_click"] || 0));

    const finalSaveCount = (days === 'lifetime' || days === 'all')
      ? totalLifetimeSaves
      : (periodSaves > 0 ? periodSaves : (eventsMap["save_click"] || 0));

    const conversions = {
      applyClicks: eventsMap["apply_click"] || 0,
      emailClicks: eventsMap["email_click"] || 0,
      contactClicks: eventsMap["contact_click"] || 0,
      shareClicks: finalShareCount,
      saveClicks: finalSaveCount,
      adminSharesCount,
      candidateSharesCount,
      totalLifetimeShares,
      totalLifetimeSaves,
      topSharedJobs,
      recentJobs,
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
      channels: parseRows(channelsRes, ["channel"], ["sessions"]),
      referrers: parseRows(referrersRes, ["referrer"], ["users"]),
      landingPages: parseRows(landingPagesRes, ["path"], ["sessions"]),
      searches: {
        topKeywords: topSearchKeywords,
        topCities: topSearchedCities,
        zeroResults: zeroResultSearches,
        totalCount: totalSearchesCount,
      },
      cities: parseRows(cityRes, ["city"], ["users"]),
      devices: parseRows(deviceRes, ["deviceCategory"], ["users"])
    });

  } catch (error: any) {
    console.error("GA API error:", error.message);
    return NextResponse.json({ error: "Google Analytics API Error: " + error.message }, { status: 500 });
  }
}
