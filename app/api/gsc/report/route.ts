import { NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";

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
            rowLimit: 50,
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
          rowLimit: 25,
          searchType: "web"
        }
      });
      pageRes = res.data;
    } catch (e) {}

    // Format keywords
    const keywords = (queryRes.rows || []).map((row: any) => ({
      query: row.keys?.[0] || "",
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: Math.round((row.ctr || 0) * 1000) / 10,
      position: Math.round((row.position || 0) * 10) / 10,
    }));

    // Format pages
    const pages = (pageRes?.rows || []).map((row: any) => ({
      page: row.keys?.[0] || "",
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: Math.round((row.ctr || 0) * 1000) / 10,
      position: Math.round((row.position || 0) * 10) / 10,
    }));

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
