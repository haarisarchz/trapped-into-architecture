import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payload, payloads, userId } = body;

    const itemsToProcess = Array.isArray(payloads) && payloads.length > 0 
      ? payloads 
      : (payload ? [payload] : []);

    if (itemsToProcess.length === 0 || !itemsToProcess[0]?.position) {
      return NextResponse.json(
        { error: "Missing required job details." },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to post a job." },
        { status: 401 }
      );
    }

    // 1. Fetch user profile from database to verify active role
    const { data: userProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, role, username, email, full_name")
      .eq("id", userId)
      .maybeSingle();

    if (profileErr || !userProfile) {
      return NextResponse.json(
        { error: "User profile not found. Please log in again." },
        { status: 401 }
      );
    }

    const userRole = (userProfile.role || "").toLowerCase().replace(/[\s_]+/g, "");
    const isInternalAdmin = ["superadmin", "admin", "ceo", "jobadmin"].includes(userRole);
    const isCompanyAdminRole = userRole === "companyadmin";

    // 2. Check if user owns or has claimed the associated studio/company
    const firstPayload = itemsToProcess[0];
    let isCompanyOwnerOrClaimant = false;
    if (firstPayload.company_id) {
      const { data: comp } = await supabase
        .from("companies")
        .select("id, created_by, claimed_by, firm_name")
        .eq("id", firstPayload.company_id)
        .maybeSingle();

      if (comp && (comp.created_by === userId || comp.claimed_by === userId)) {
        isCompanyOwnerOrClaimant = true;
      }
    }

    // 3. Strict Server-Side Validation: Internal Admin or Company Admin required
    if (!isInternalAdmin && !isCompanyAdminRole && !isCompanyOwnerOrClaimant) {
      return NextResponse.json(
        {
          error: "Company Admin Access Required. You must own or be registered as a Company Admin to post a job.",
        },
        { status: 403 }
      );
    }

    // 4. Expand items for multiple locations if specified as arrays or comma-delimited
    const expandedPayloads: any[] = [];
    const nowIso = new Date().toISOString();

    for (const item of itemsToProcess) {
      // Check if item contains multiple locations: e.g. locations array or comma string
      let locationPairs: Array<{ city: string | null; state: string | null; area: string | null }> = [];

      if (Array.isArray(item.locations) && item.locations.length > 0) {
        locationPairs = item.locations.map((loc: any) => ({
          city: loc.city ? String(loc.city).trim() : null,
          state: loc.state ? String(loc.state).trim() : null,
          area: loc.area ? String(loc.area).trim() : null,
        }));
      } else if (typeof item.city === "string" && (item.city.includes(",") || item.city.includes("/") || item.city.includes("&"))) {
        // e.g. "Chennai, Bengaluru" or "Chennai / Bengaluru"
        const cities = item.city.split(/[,/&]+/).map((c: string) => c.trim()).filter(Boolean);
        const states = typeof item.state === "string" 
          ? item.state.split(/[,/&]+/).map((s: string) => s.trim()).filter(Boolean)
          : [];

        if (cities.length > 1) {
          locationPairs = cities.map((c: string, idx: number) => ({
            city: c,
            state: states[idx] || states[0] || item.state || null,
            area: item.area || null,
          }));
        }
      }

      if (locationPairs.length > 1) {
        // Multi-location: Split into separate clean job records!
        for (const loc of locationPairs) {
          const locCopy = { ...item };
          delete locCopy.locations;
          locCopy.city = loc.city;
          locCopy.state = loc.state;
          if (loc.area) locCopy.area = loc.area;

          expandedPayloads.push({
            id: locCopy.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : undefined),
            ...locCopy,
            author_id: userId,
            status: locCopy.status === "draft" ? "draft" : (isInternalAdmin && locCopy.status ? locCopy.status : "pending_review"),
            posted_date: locCopy.posted_date || nowIso,
          });
        }
      } else {
        const itemCopy = { ...item };
        delete itemCopy.locations;
        expandedPayloads.push({
          id: itemCopy.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : undefined),
          ...itemCopy,
          author_id: userId,
          status: itemCopy.status === "draft" ? "draft" : (isInternalAdmin && itemCopy.status ? itemCopy.status : "pending_review"),
          posted_date: itemCopy.posted_date || nowIso,
        });
      }
    }

    // 5. Batch Insert clean job records
    const { data: createdJobs, error: insertError } = await supabase
      .from("jobs")
      .insert(expandedPayloads)
      .select();

    if (insertError) {
      console.error("Backend error inserting jobs:", insertError);
      return NextResponse.json(
        { error: insertError.message || "Failed to save job opening(s)." },
        { status: 500 }
      );
    }

    // 6. Update user profile to recruiter status
    try {
      await supabase
        .from("profiles")
        .update({ is_recruiter: true, user_track: "recruiter" })
        .eq("id", userId);
    } catch (e) {
      console.warn("Could not set is_recruiter status on profile:", e);
    }

    const firstJob = createdJobs && createdJobs.length > 0 ? createdJobs[0] : null;

    return NextResponse.json(
      {
        success: true,
        count: createdJobs?.length || 1,
        data: firstJob,
        jobs: createdJobs,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("API error in /api/jobs/create:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
