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
      limit: 50,
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

    // 9B. Hourly Activity (00 to 23)
    const hourlyReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "hour" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "hour" }, desc: false }],
      limit: 24,
    }).catch(err => {
      console.warn("GA hourly error:", err.message);
      return [{ rows: [] }];
    });

    // 9C. Day of Week Activity (Monday to Sunday)
    const dayOfWeekReq = analyticsDataClient.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "dayOfWeekName" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 7,
    }).catch(err => {
      console.warn("GA dayOfWeek error:", err.message);
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
    let topSearchKeywords: any[] = [];
    let topSearchedCities: any[] = [];
    let zeroResultSearches: any[] = [];
    let totalSearchesCount = 0;
    const jobInfoMap: Record<string, string> = {};

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
          allJobsStats.forEach((j: any) => {
            const parts = [
              j.position || "Architecture Job",
              j.city ? `in ${j.city}` : "",
              j.firm_name ? `at ${j.firm_name}` : ""
            ].filter(Boolean);
            jobInfoMap[j.id] = parts.join(" ");
          });
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
    const [overviewRes, countryRes, browserRes, pagesRes, sourcesRes, cityRes, deviceRes, realtimeRes, eventsRes, channelsRes, referrersRes, landingPagesRes, hourlyRes, dayOfWeekRes] = await Promise.all([
      overviewReq, countryReq, browserReq, pagesReq, sourcesReq, cityReq, deviceReq, realtimeReq, eventsReq, channelsReq, referrersReq, landingPagesReq, hourlyReq, dayOfWeekReq
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

    // Parse pages to build a path-to-title map for human-readable navigation labels
    const rawPages = parseRows(pagesRes, ["title", "path"], ["views"]);
    const pageTitleMap: Record<string, string> = {};
    rawPages.forEach((p: any) => {
      if (p.path && p.title && p.title !== "(not set)") {
        const clean = p.title
          .replace(/ \| Trapped Into Architecture/gi, "")
          .replace(/ - Trapped Into Architecture/gi, "")
          .trim();
        const normPath = (p.path || "").split("?")[0].replace(/\/+$/, "") || "/";
        if (clean && !pageTitleMap[normPath]) {
          pageTitleMap[normPath] = clean;
        }
      }
    });

    const resolveInsideLabel = (cleanPath: string): string => {
      const norm = cleanPath.replace(/\/+$/, "") || "/";

      // 1. Exact match in GA page titles (contains exact document title)
      if (pageTitleMap[norm]) {
        return pageTitleMap[norm];
      }

      // 2. Standard root pages
      if (norm === "/" || norm === "") return "Home Page";
      if (norm === "/jobs") return "Jobs Page";
      if (norm === "/companies") return "Companies Directory";
      if (norm === "/internships") return "Internships Page";
      if (norm === "/about") return "About Us";
      if (norm === "/contact") return "Contact Us";

      // 3. City & State filter routes
      if (norm.startsWith("/jobs/city/")) {
        const slug = norm.replace("/jobs/city/", "");
        const formatted = decodeURIComponent(slug).replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        return `Jobs in ${formatted}`;
      }
      if (norm.startsWith("/jobs/state/")) {
        const slug = norm.replace("/jobs/state/", "");
        const formatted = decodeURIComponent(slug).replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        return `Jobs in ${formatted}`;
      }

      // 4. Specific Job Details by ID (/jobs/[id])
      if (norm.startsWith("/jobs/")) {
        const jobId = norm.replace("/jobs/", "").trim();
        if (jobInfoMap[jobId]) {
          return jobInfoMap[jobId];
        }
        if (pageTitleMap[`/jobs/${jobId}`]) {
          return pageTitleMap[`/jobs/${jobId}`];
        }
        return `Job Listing (${jobId.slice(0, 8)}...)`;
      }

      // 5. Company Details by slug (/companies/[slug])
      if (norm.startsWith("/companies/")) {
        const slug = norm.replace("/companies/", "").trim();
        const formatted = decodeURIComponent(slug).replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        return `${formatted} Profile`;
      }

      return norm;
    };

    // Process referrers and classify into Outside vs Inside, strictly excluding /admin
    const rawReferrers = parseRows(referrersRes, ["referrer"], ["users"]);

    const isInternal = (url: string) => {
      if (!url) return false;
      const lower = url.toLowerCase();
      return lower.includes("trappedintoarchitecture.com") || lower.includes("localhost") || lower.startsWith("/");
    };

    const insideAggMap: Record<string, { label: string; path: string; users: number }> = {};
    const outsideAggMap: Record<string, { label: string; referrer: string; users: number; category: string }> = {};

    rawReferrers.forEach((r: any) => {
      const raw = (r.referrer || "").trim();
      const users = Number(r.users) || 0;
      const lower = raw.toLowerCase();

      // STRICT EXCLUSION: Never count any admin link or navigation
      if (lower.includes("/admin") || lower.includes("admin/") || lower.includes("add-job")) {
        return;
      }

      if (!raw || raw === "(direct)" || raw === "(empty)") {
        const key = "direct";
        if (!outsideAggMap[key]) {
          outsideAggMap[key] = {
            referrer: raw || "(direct)",
            label: "Direct / Bookmarks / Typed URL",
            users: 0,
            category: "direct",
          };
        }
        outsideAggMap[key].users += users;
        return;
      }

      if (isInternal(raw)) {
        // Internal page navigation
        let path = raw;
        try {
          if (raw.startsWith("http://") || raw.startsWith("https://")) {
            const u = new URL(raw);
            path = u.pathname;
          }
        } catch (_) {}

        // Secondary check to ensure admin paths are completely blocked
        if (path.toLowerCase().includes("admin")) return;

        const cleanPath = path.split("?")[0].replace(/\/+$/, "") || "/";
        const label = resolveInsideLabel(cleanPath);

        if (!insideAggMap[cleanPath]) {
          insideAggMap[cleanPath] = {
            label,
            path: cleanPath,
            users: 0,
          };
        }
        insideAggMap[cleanPath].users += users;
      } else {
        // External traffic source
        let cleanLabel = raw;
        let category = "website";

        if (lower.includes("whatsapp")) {
          category = "whatsapp";
          if (lower.includes("web.whatsapp")) {
            cleanLabel = "WhatsApp Web (Desktop)";
          } else {
            cleanLabel = "WhatsApp (Mobile App)";
          }
        } else if (lower.includes("facebook") || lower.includes("fb.me")) {
          category = "facebook";
          if (lower.includes("m.facebook") || lower.includes("lm.facebook")) {
            cleanLabel = "Facebook (Mobile App)";
          } else {
            cleanLabel = "Facebook (Desktop / Web)";
          }
        } else if (lower.includes("instagram")) {
          cleanLabel = "Instagram (Bio / Story Link)";
          category = "instagram";
        } else if (lower.includes("linkedin")) {
          category = "linkedin";
          if (lower.includes("android-app") || lower.includes("m.linkedin")) {
            cleanLabel = "LinkedIn (Mobile App)";
          } else {
            cleanLabel = "LinkedIn (Desktop / Web)";
          }
        } else if (lower.includes("google")) {
          cleanLabel = "Google Organic Search";
          category = "google";
        } else if (lower.includes("twitter") || lower.includes("t.co") || lower.includes("x.com")) {
          cleanLabel = "X / Twitter";
          category = "twitter";
        } else {
          try {
            if (raw.startsWith("http://") || raw.startsWith("https://")) {
              const u = new URL(raw);
              cleanLabel = u.hostname.replace(/^www\./, "");
            }
          } catch (_) {}
        }

        const key = cleanLabel.toLowerCase();
        if (!outsideAggMap[key]) {
          outsideAggMap[key] = {
            referrer: raw,
            label: cleanLabel,
            users: 0,
            category,
          };
        }
        outsideAggMap[key].users += users;
      }
    });

    // Enrich with session sources (especially catching utm_source=whatsapp or UTM-tagged campaigns)
    if (sourcesRes[0]?.rows && sourcesRes[0].rows.length > 0) {
      const rawSources = parseRows(sourcesRes, ["source"], ["sessions"]);
      rawSources.forEach((s: any) => {
        const src = (s.source || "").toLowerCase();
        if (src.includes("admin")) return;
        const sessions = Number(s.sessions) || 0;
        if (sessions <= 0) return;

        let label = s.source;
        let category = "website";
        if (src === "(direct)") {
          label = "Direct / Bookmarks / Typed URL";
          category = "direct";
        } else if (src.includes("google")) {
          label = "Google Organic Search";
          category = "google";
        } else if (src.includes("whatsapp")) {
          label = "WhatsApp (Shared Link)";
          category = "whatsapp";
        } else if (src.includes("facebook")) {
          label = "Facebook (Shared Link)";
          category = "facebook";
        } else if (src.includes("instagram")) {
          label = "Instagram (Bio / Story Link)";
          category = "instagram";
        } else if (src.includes("linkedin")) {
          label = "LinkedIn";
          category = "linkedin";
        }

        const key = label.toLowerCase();
        if (!outsideAggMap[key]) {
          outsideAggMap[key] = {
            referrer: s.source,
            label,
            users: sessions,
            category,
          };
        }
      });
    }

    const outsideReferrers = Object.values(outsideAggMap).sort((a, b) => b.users - a.users);
    const insideReferrers = Object.values(insideAggMap).sort((a, b) => b.users - a.users);

    const cleanLandingPages = parseRows(landingPagesRes, ["path"], ["sessions"]).filter(
      (p: any) => !p.path?.toLowerCase().includes("admin")
    );

    // Parse Hourly (00 to 23) and Day of Week
    const rawHourly = parseRows(hourlyRes, ["hour"], ["users"]);
    const rawDayOfWeek = parseRows(dayOfWeekRes, ["day"], ["users"]);

    // Calculate Best Day and Peak Posting Window
    const sortedHours = [...rawHourly].sort((a, b) => b.users - a.users);
    const maxHourObj = sortedHours[0];
    const peakHourInt = maxHourObj ? parseInt(maxHourObj.hour, 10) : null;
    let peakHourLabel = "Evening (7:00 PM – 10:00 PM)";
    if (peakHourInt !== null && !isNaN(peakHourInt)) {
      const ampm = peakHourInt >= 12 ? "PM" : "AM";
      const h12 = peakHourInt % 12 === 0 ? 12 : peakHourInt % 12;
      const nextH12 = (h12 % 12) + 1;
      const nextAmpm = (peakHourInt + 1) >= 12 && (peakHourInt + 1) < 24 ? "PM" : "AM";
      peakHourLabel = `${h12}:00 ${ampm} – ${nextH12}:00 ${nextAmpm}`;
    }

    const bestDay = rawDayOfWeek[0]?.day || "Weekdays";

    const peakTimes = {
      hourly: rawHourly,
      days: rawDayOfWeek,
      peakHour: peakHourLabel,
      bestDay,
    };

    // Calculate total candidate application clicks
    const totalApplications = (conversions.applyClicks || 0) + (conversions.emailClicks || 0) + (conversions.contactClicks || 0);
    const totalSessions = Number(overviewRes[0]?.rows?.[0]?.metricValues?.[1]?.value || 0);
    const conversionRate = totalSessions > 0 ? `${((totalApplications / totalSessions) * 100).toFixed(1)}%` : "0%";

    return NextResponse.json({
      overview: {
        realtimeUsers: realtimeRes[0]?.rows?.[0]?.metricValues?.[0]?.value || 0,
        activeUsers: overviewRes[0]?.rows?.[0]?.metricValues?.[0]?.value || 0,
        sessions: totalSessions,
        pageViews: overviewRes[0]?.rows?.[0]?.metricValues?.[2]?.value || 0,
        avgSessionDuration: overviewRes[0]?.rows?.[0]?.metricValues?.[3]?.value || 0,
        bounceRate: bouncePercent ? `${bouncePercent}%` : "0%",
        totalApplications,
        conversionRate,
      },
      conversions: {
        ...conversions,
        totalApplications,
        conversionRate,
      },
      peakTimes,
      countries: parseRows(countryRes, ["country"], ["users"]),
      browsers: parseRows(browserRes, ["browser"], ["users"]),
      pages: parseRows(pagesRes, ["title", "path"], ["views"]),
      sources: parseRows(sourcesRes, ["source"], ["sessions"]),
      channels: parseRows(channelsRes, ["channel"], ["sessions"]),
      referrers: outsideReferrers,
      outsideReferrers,
      insideReferrers,
      landingPages: cleanLandingPages,
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
