import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payload, userId } = body;

    if (!payload || !payload.position) {
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
    let isCompanyOwnerOrClaimant = false;
    if (payload.company_id) {
      const { data: comp } = await supabase
        .from("companies")
        .select("id, created_by, claimed_by, firm_name")
        .eq("id", payload.company_id)
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

    // 4. Safe Payload Insertion
    const cleanPayload = {
      ...payload,
      author_id: userId,
      status: isInternalAdmin && payload.status ? payload.status : "pending_review",
      posted_date: payload.posted_date || new Date().toISOString(),
    };

    const { data: newJob, error: insertError } = await supabase
      .from("jobs")
      .insert([cleanPayload])
      .select()
      .single();

    if (insertError) {
      console.error("Backend error inserting job:", insertError);
      return NextResponse.json(
        { error: insertError.message || "Failed to save job opening." },
        { status: 500 }
      );
    }

    // 5. Update user profile to recruiter status
    try {
      await supabase
        .from("profiles")
        .update({ is_recruiter: true, user_track: "recruiter" })
        .eq("id", userId);
    } catch (e) {
      console.warn("Could not set is_recruiter status on profile:", e);
    }

    return NextResponse.json({ success: true, data: newJob }, { status: 201 });
  } catch (err: any) {
    console.error("API error in /api/jobs/create:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
