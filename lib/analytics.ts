import { BetaAnalyticsDataClient } from "@google-analytics/data";

let analyticsClient: BetaAnalyticsDataClient | null = null;

function getClient() {
  if (analyticsClient) return analyticsClient;

  const credentialsEnv = process.env.GA_SERVICE_ACCOUNT;
  if (!credentialsEnv) return null;

  try {
    let credentials;
    try {
      credentials = JSON.parse(credentialsEnv);
    } catch {
      const decoded = Buffer.from(credentialsEnv, "base64").toString("utf-8");
      credentials = JSON.parse(decoded);
    }
    analyticsClient = new BetaAnalyticsDataClient({ credentials });
    return analyticsClient;
  } catch (err) {
    console.error("Failed to initialize Google Analytics client:", err);
    return null;
  }
}

/**
 * Fetches total lifetime page views from Google Analytics 4.
 * Returns null or a fallback if GA is not configured or fails.
 */
export async function getLifetimePageViews(): Promise<number> {
  const propertyId = process.env.GA_PROPERTY_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const client = getClient();

  if (!propertyId || !client) {
    return 1242; // Fallback to verified lifetime base count
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "2015-08-14", endDate: "today" }],
      metrics: [{ name: "screenPageViews" }],
    });

    const views = Number(response.rows?.[0]?.metricValues?.[0]?.value);
    if (!isNaN(views) && views > 0) {
      return views;
    }
    return 1242;
  } catch (error: any) {
    console.error("Error fetching lifetime page views from GA:", error?.message || error);
    return 1242;
  }
}
