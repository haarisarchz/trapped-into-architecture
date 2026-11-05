import { NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";
import { createClient } from "@supabase/supabase-js";
import { decodeUuid } from "@/utils/jobUrl";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days") || "30";
    const siteUrlParam = searchParams.get("siteUrl") || process.env.GSC_SITE_URL || "sc-domain:trappedintoarchitecture.com";

    const credentialsEnv = process.env.GA_SERVICE_ACCOUNT;
    if (!credentialsEnv) {
      return NextResponse.json({
        connected: false,
        error: "GA_SERVICE_ACCOUNT credentials are not configured in environment variables."
      });
    }

    let credentials: any;
    try {
      credentials = JSON.parse(credentialsEnv);
    } catch (e) {
      try {
        const decoded = Buffer.from(credentialsEnv, "base64").toString("utf-8");
        credentials = JSON.parse(decoded);
      } catch (err) {
        return NextResponse.json({
          connected: false,
          error: "GA_SERVICE_ACCOUNT format is invalid."
        });
      }
    }

    const clientEmail = credentials.client_email || "";
    const projectId = credentials.project_id || "";

    // Search Console has an official 2-3 day data indexing lag
    const now = new Date();
    const endDateObj = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const endDate = endDateObj.toISOString().split("T")[0];

    let numDays = parseInt(daysParam, 10);
    if (isNaN(numDays) || numDays <= 0 || daysParam === "lifetime" || daysParam === "all") {
      numDays = 90;
    }
    const startDateObj = new Date(endDateObj.getTime() - numDays * 24 * 60 * 60 * 1000);
    const startDate = startDateObj.toISOString().split("T")[0];

    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"]
    });

    const client = await auth.getClient();

    // Test candidate site URLs (domain property vs URL prefix)
    const siteCandidates = [
      siteUrlParam,
      "sc-domain:trappedintoarchitecture.com",
      "https://trappedintoarchitecture.com/",
      "https://trappedintoarchitecture.com",
      "https://www.trappedintoarchitecture.com/"
    ];
    const uniqueCandidates = Array.from(new Set(siteCandidates.filter(Boolean)));

    let queryRes: any = null;
    let successfulSiteUrl = "";
    let lastError = "";

    for (const testUrl of uniqueCandidates) {
      try {
        const encodedSite = encodeURIComponent(testUrl);
        const res: any = await client.request({
          url: `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`,
          method: "POST",
          data: {
            startDate,
            endDate,
            dimensions: ["query"],
            rowLimit: 100,
            searchType: "web"
          }
        });

        if (res && res.data) {
          queryRes = res.data;
          successfulSiteUrl = testUrl;
          break;
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    if (!queryRes) {
      const isPermissionErr = lastError.toLowerCase().includes("permission") || 
                             lastError.toLowerCase().includes("403") || 
                             lastError.toLowerCase().includes("not found") ||
                             lastError.toLowerCase().includes("forbidden");
      const isApiDisabled = lastError.toLowerCase().includes("has not been used in project") || 
                            lastError.toLowerCase().includes("disabled") ||
                            lastError.toLowerCase().includes("enable");

      return NextResponse.json({
        connected: false,
        clientEmail,
        projectId,
        error: lastError,
        isPermissionErr,
        isApiDisabled,
        siteUrl: siteUrlParam,
      });
    }

    // Also fetch top pages ranking in Google
    let pageRes: any = null;
    try {
      const encodedSite = encodeURIComponent(successfulSiteUrl);
      const res: any = await client.request({
        url: `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`,
        method: "POST",
        data: {
          startDate,
          endDate,
          dimensions: ["page"],
          rowLimit: 100,
          searchType: "web"
        }
      });
      pageRes = res.data;
    } catch (e) {}

    // Query Supabase for human-readable Job & Company titles
    const jobLookup = new Map<string, string>();
    const companyLookup = new Map<string, string>();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bcifyymjfktabtsmocnc.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y";

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const sb = createClient(supabaseUrl, supabaseAnonKey);
        const [jobsRes, companiesRes] = await Promise.all([
          sb.from("jobs").select("id, position, firm_name, city").limit(1000),
          sb.from("companies").select("slug, firm_name").limit(500),
        ]);

        if (jobsRes.data) {
          jobsRes.data.forEach((j: any) => {
            const title = [
              j.position || "Architecture Role",
              j.firm_name ? `at ${j.firm_name}` : "",
              j.city ? `(${j.city})` : ""
            ].filter(Boolean).join(" ");
            jobLookup.set(j.id, title);
          });
        }

        if (companiesRes.data) {
          companiesRes.data.forEach((c: any) => {
            if (c.slug) {
              const name = c.firm_name || c.slug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
              companyLookup.set(c.slug.toLowerCase(), `${name} (Company Profile)`);
            }
          });
        }
      } catch (err) {
        console.warn("Supabase lookup error in GSC route:", err);
      }
    }

    const resolvePageTitle = (rawUrl: string): string => {
      let path = rawUrl;
      try {
        const u = new URL(rawUrl);
        path = u.pathname;
      } catch (_) {}

      const cleanPath = (path || "").replace(/\/+$/, "") || "/";

      if (cleanPath === "/" || cleanPath === "") {
        return "Home Page (trappedintoarchitecture.com)";
      }
      if (cleanPath === "/jobs") {
        return "Jobs Board (All Architecture Jobs)";
      }
      if (cleanPath === "/internships") {
        return "Internships Board (Architecture Internships)";
      }
      if (cleanPath === "/post-job") {
        return "Post a Job";
      }
      if (cleanPath.startsWith("/admin")) {
        return "Admin Portal";
      }

      // Check /jobs/[id]
      if (cleanPath.startsWith("/jobs/")) {
        const seg = cleanPath.replace("/jobs/", "").split("/")[0].split("?")[0];
        const uuid = decodeUuid(seg) || seg;
        if (jobLookup.has(uuid)) {
          return jobLookup.get(uuid)!;
        }
        if (jobLookup.has(seg)) {
          return jobLookup.get(seg)!;
        }
        return `Job Post (${seg.length > 12 ? seg.slice(0, 10) + '…' : seg})`;
      }

      // Check /companies/[slug]
      if (cleanPath.startsWith("/companies/")) {
        const slug = cleanPath.replace("/companies/", "").split("/")[0].split("?")[0].toLowerCase();
        if (companyLookup.has(slug)) {
          return companyLookup.get(slug)!;
        }
        const formatted = slug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        return `${formatted} (Company Profile)`;
      }

      const formatted = cleanPath.replace(/^\//, "").split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      return formatted || rawUrl;
    };

    // Format keywords
    const keywords = (queryRes.rows || []).map((row: any) => ({
      query: row.keys?.[0] || "",
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: Math.round((row.ctr || 0) * 1000) / 10,
      position: Math.round((row.position || 0) * 10) / 10,
    }));

    // Format pages with resolved titles and paths
    const pages = (pageRes?.rows || []).map((row: any) => {
      const pageUrl = row.keys?.[0] || "";
      let path = pageUrl;
      try {
        const u = new URL(pageUrl);
        path = u.pathname;
      } catch (_) {}

      return {
        page: pageUrl,
        path: path || pageUrl,
        title: resolvePageTitle(pageUrl),
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: Math.round((row.ctr || 0) * 1000) / 10,
        position: Math.round((row.position || 0) * 10) / 10,
      };
    });

    // Totals
    const totalClicks = keywords.reduce((sum: number, k: any) => sum + k.clicks, 0);
    const totalImpressions = keywords.reduce((sum: number, k: any) => sum + k.impressions, 0);
    const avgCtr = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 1000) / 10 : 0;
    const avgPosition = keywords.length > 0 
      ? Math.round((keywords.reduce((sum: number, k: any) => sum + k.position, 0) / keywords.length) * 10) / 10 
      : 0;

    return NextResponse.json({
      connected: true,
      clientEmail,
      projectId,
      siteUrl: successfulSiteUrl,
      startDate,
      endDate,
      totals: {
        clicks: totalClicks,
        impressions: totalImpressions,
        ctr: `${avgCtr}%`,
        position: avgPosition,
      },
      keywords,
      pages,
    });

  } catch (error: any) {
    console.error("GSC API error:", error);
    return NextResponse.json({
      connected: false,
      error: error.message || "Failed to fetch Google Search Console data"
    }, { status: 500 });
  }
}
