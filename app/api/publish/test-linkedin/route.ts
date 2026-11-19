import { NextResponse } from "next/server";

export async function GET() {
  const urn = process.env.LINKEDIN_ORGANIZATION_URN || process.env.LINKEDIN_PERSON_URN;
  const token = process.env.LINKEDIN_ACCESS_TOKEN;

  if (!urn || !token) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing credentials. Ensure LINKEDIN_ACCESS_TOKEN and LINKEDIN_ORGANIZATION_URN (or LINKEDIN_PERSON_URN) are set in Vercel / .env.local",
      },
      { status: 400 }
    );
  }

  // Normalize URN
  let cleanUrn = urn.trim();
  const isOrg = Boolean(process.env.LINKEDIN_ORGANIZATION_URN);
  const orgId = cleanUrn.replace(/^urn:li:organization:/, "").replace(/^urn:li:person:/, "");

  try {
    // 1. If organization, test fetching organization details or token validation
    let testUrl = isOrg
      ? `https://api.linkedin.com/v2/organizations/${orgId}`
      : `https://api.linkedin.com/v2/userinfo`;

    let res = await fetch(testUrl, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    if (res.status === 401) {
      return NextResponse.json({
        success: false,
        error: "LinkedIn Access Token Expired (401 Unauthorized). LinkedIn tokens expire every 60 days. Please generate a new access token in LinkedIn Developer Portal.",
      });
    }

    if (res.status === 403) {
      const errText = await res.text();
      return NextResponse.json({
        success: false,
        error: `Permission Denied (403 Forbidden): Your LinkedIn App lacks Community Management API access or the required 'w_organization_social' scope. Details: ${errText}`,
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({
        success: false,
        error: `LinkedIn API returned ${res.status}: ${errText}`,
      });
    }

    const data = await res.json();
    const name = data.localizedName || data.name || data.vanityName || "LinkedIn Page";

    return NextResponse.json({
      success: true,
      message: `Successfully connected to LinkedIn!`,
      name,
      urn: cleanUrn,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || "Failed to communicate with LinkedIn API",
    });
  }
}
